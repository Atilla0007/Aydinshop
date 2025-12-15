from datetime import timedelta
from urllib.parse import urlencode

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme

from store.models import Order

from .forms import SignupForm
from .models import PhoneOTP, UserProfile
from .otp import generate_otp_code
from .sms import send_sms


OTP_TTL_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_CODE_LENGTH = 6


def _get_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username') or request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        return render(request, 'accounts/login.html', {'error': 'نام کاربری یا رمز عبور اشتباه است.'})

    return render(request, 'accounts/login.html')


def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
        return render(request, 'accounts/signup.html', {'form': form})

    form = SignupForm()
    return render(request, 'accounts/signup.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def profile_view(request):
    profile = _get_profile(request.user)
    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related('items', 'items__product')
        .order_by('-created_at')
    )
    return render(request, 'accounts/profile.html', {'profile': profile, 'orders': orders})


@login_required
def profile_edit_view(request):
    profile = _get_profile(request.user)

    def current_values():
        return {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
            'phone': profile.phone,
        }

    if request.method != 'POST':
        return render(request, 'accounts/profile_edit.html', {'values': current_values()})

    values = {
        'first_name': (request.POST.get('first_name') or '').strip(),
        'last_name': (request.POST.get('last_name') or '').strip(),
        'email': (request.POST.get('email') or '').strip(),
        'phone': (request.POST.get('phone') or '').strip(),
    }

    if request.POST.get('confirm') != '1':
        return render(request, 'accounts/profile_confirm.html', {'values': values})

    request.user.first_name = values['first_name']
    request.user.last_name = values['last_name']
    old_email = (request.user.email or '').strip()
    request.user.email = values['email']
    request.user.save(update_fields=['first_name', 'last_name', 'email'])

    email_changed = (values['email'] or '').strip() != old_email
    phone_changed = values['phone'] != profile.phone

    if email_changed:
        profile.email_verified = False
        profile.email_verified_at = None

    if phone_changed:
        profile.phone = values['phone']
        profile.phone_verified = False
        profile.phone_verified_at = None

    update_fields = []
    if email_changed:
        update_fields.extend(['email_verified', 'email_verified_at'])
    if phone_changed:
        update_fields.extend(['phone', 'phone_verified', 'phone_verified_at'])
    if update_fields:
        profile.save(update_fields=update_fields)

    return redirect('profile')


def _can_resend(otp: PhoneOTP) -> bool:
    if not otp.last_sent_at:
        return True
    return (timezone.now() - otp.last_sent_at).total_seconds() >= OTP_RESEND_COOLDOWN_SECONDS


def _send_phone_otp(profile: UserProfile) -> None:
    code = generate_otp_code(OTP_CODE_LENGTH)
    code_hash = make_password(code)

    otp, created = PhoneOTP.objects.get_or_create(profile=profile, defaults={'code_hash': code_hash})
    if not created and not _can_resend(otp):
        return

    otp.code_hash = code_hash
    otp.created_at = timezone.now()
    otp.last_sent_at = timezone.now()
    otp.resend_count = (otp.resend_count or 0) + 1
    otp.save(update_fields=['code_hash', 'created_at', 'last_sent_at', 'resend_count'])

    send_sms(profile.phone, f'کد تایید استیرا: {code}')


def _safe_next_url(request, next_url: str | None) -> str | None:
    if not next_url:
        return None
    if url_has_allowed_host_and_scheme(
        next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return next_url
    return None


@login_required
def verify_phone_view(request):
    profile = _get_profile(request.user)
    if not profile.phone:
        return redirect('profile')

    next_url = _safe_next_url(request, request.GET.get('next') or request.POST.get('next'))

    if request.GET.get('resend') == '1':
        _send_phone_otp(profile)
        if next_url:
            return redirect(f"{request.path}?{urlencode({'next': next_url})}")
        return redirect(request.path)

    if request.method == 'POST':
        digits = [(request.POST.get(f'd{i}') or '').strip() for i in range(1, OTP_CODE_LENGTH + 1)]
        code = ''.join(digits)

        try:
            otp = profile.otp
        except PhoneOTP.DoesNotExist:
            otp = None

        if not otp:
            _send_phone_otp(profile)
            return render(
                request,
                'accounts/verify_phone.html',
                {'profile': profile, 'error': 'کد منقضی شده بود. یک کد جدید ارسال شد.', 'next': next_url},
            )

        if timezone.now() - otp.created_at > timedelta(minutes=OTP_TTL_MINUTES):
            _send_phone_otp(profile)
            return render(
                request,
                'accounts/verify_phone.html',
                {'profile': profile, 'error': 'کد منقضی شده بود. یک کد جدید ارسال شد.', 'next': next_url},
            )

        if len(code) != OTP_CODE_LENGTH or not code.isdigit() or not check_password(code, otp.code_hash):
            return render(
                request,
                'accounts/verify_phone.html',
                {'profile': profile, 'error': 'کد وارد شده صحیح نیست.', 'next': next_url},
            )

        profile.mark_phone_verified()
        otp.delete()
        return redirect(next_url or 'profile')

    if not hasattr(profile, 'otp'):
        _send_phone_otp(profile)

    return render(request, 'accounts/verify_phone.html', {'profile': profile, 'next': next_url})
