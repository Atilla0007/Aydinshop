from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import redirect, render
from django.utils import timezone

from store.models import Order

from .forms import SignupForm
from .models import PhoneOTP, UserProfile
from .otp import generate_otp_code
from .sms import send_sms


OTP_TTL_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60


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
        return render(request, 'accounts/login.html', {'error': 'Invalid username or password.'})

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

    if request.method == 'POST':
        # Basic account updates
        request.user.first_name = (request.POST.get('first_name') or '').strip()
        request.user.last_name = (request.POST.get('last_name') or '').strip()
        request.user.email = (request.POST.get('email') or '').strip()

        new_phone = (request.POST.get('phone') or '').strip()
        if new_phone != profile.phone:
            profile.phone = new_phone
            profile.phone_verified = False
            profile.phone_verified_at = None
            profile.save(update_fields=['phone', 'phone_verified', 'phone_verified_at'])

        request.user.save(update_fields=['first_name', 'last_name', 'email'])
        return redirect('profile')

    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related('items', 'items__product')
        .order_by('-created_at')
    )

    context = {
        'profile': profile,
        'orders': orders,
    }
    return render(request, 'accounts/profile.html', context)


def _can_resend(otp: PhoneOTP) -> bool:
    if not otp.last_sent_at:
        return True
    return (timezone.now() - otp.last_sent_at).total_seconds() >= OTP_RESEND_COOLDOWN_SECONDS


def _send_phone_otp(profile: UserProfile) -> None:
    code = generate_otp_code(4)
    code_hash = make_password(code)

    otp, created = PhoneOTP.objects.get_or_create(profile=profile, defaults={'code_hash': code_hash})
    if not created and not _can_resend(otp):
        return

    otp.code_hash = code_hash
    otp.created_at = timezone.now()
    otp.last_sent_at = timezone.now()
    otp.resend_count = (otp.resend_count or 0) + 1
    otp.save(update_fields=['code_hash', 'created_at', 'last_sent_at', 'resend_count'])

    send_sms(profile.phone, f'Styra verification code: {code}')


@login_required
def verify_phone_view(request):
    profile = _get_profile(request.user)
    if not profile.phone:
        return redirect('profile')

    if request.GET.get('resend') == '1':
        _send_phone_otp(profile)
        return redirect('verify_phone')

    if request.method == 'POST':
        digits = [
            (request.POST.get('d1') or '').strip(),
            (request.POST.get('d2') or '').strip(),
            (request.POST.get('d3') or '').strip(),
            (request.POST.get('d4') or '').strip(),
        ]
        code = ''.join(digits)

        try:
            otp = profile.otp
        except PhoneOTP.DoesNotExist:
            otp = None

        if not otp:
            _send_phone_otp(profile)
            return render(request, 'accounts/verify_phone.html', {'error': 'Code expired. A new code was sent.'})

        if timezone.now() - otp.created_at > timedelta(minutes=OTP_TTL_MINUTES):
            _send_phone_otp(profile)
            return render(request, 'accounts/verify_phone.html', {'error': 'Code expired. A new code was sent.'})

        if len(code) != 4 or not code.isdigit() or not check_password(code, otp.code_hash):
            return render(request, 'accounts/verify_phone.html', {'error': 'Invalid code.'})

        profile.mark_phone_verified()
        otp.delete()
        return redirect('profile')

    # initial page: send code if none exists
    if not hasattr(profile, 'otp'):
        _send_phone_otp(profile)

    return render(request, 'accounts/verify_phone.html')
