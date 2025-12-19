# Problem
This project is a small e-commerce backend that must reliably handle user accounts, carts, checkout, and order/payment workflows. In production, authentication endpoints are a common target for brute-force and credential-stuffing attacks; without controls, attackers can degrade availability, enumerate accounts, and compromise users.

# Solution
The application is built on Django with a server-rendered storefront and an admin panel for operations. It includes OTP-based verification flows and an authentication security layer that:

- Enforces rate limiting on login endpoints per IP address and per user identifier (username/email).
- Temporarily blocks abusive IPs in a database-backed allow/deny store with an automatic cooldown-based unblock.
- Logs failed login attempts and block/unblock events to database tables that are queryable in Django Admin.
- Uses middleware for pre-auth throttling and Django’s `user_login_failed` signal for consistent failure logging across both `/login/` and `/admin/login/`.

# Tech Stack
- Python 3.12
- Django 5.2
- SQLite (development default)
- Admin UI: `django-jazzmin`
- OTP framework: `django-otp` (+ project OTP apps)
- PDF generation: `reportlab`, `arabic-reshaper`, `python-bidi`
- Excel import: `openpyxl`

# Security Considerations
- Brute-force and credential stuffing:
  - `auth_security.middleware.LoginProtectionMiddleware` enforces per-IP and per-identifier limits and returns `429` with `Retry-After` when exceeded.
  - `auth_security.models.AuthIPBlock` stores blocked IPs with timestamps; cooldown expiry auto-unblocks and is audited via events.
- Auditability and monitoring:
  - Failed attempts are stored in `auth_security.models.AuthLoginAttempt` with IP, identifier, timestamp, and reason.
  - Block/unblock events are stored in `auth_security.models.AuthIPEvent` and exposed as separate admin views via proxy models.
- Proxy/IP correctness:
  - Client IP extraction can trust `X-Forwarded-For` only when `AUTH_SECURITY_TRUST_X_FORWARDED_FOR=true` (do not enable unless your reverse proxy strips/sets this header).
- Secrets and credentials:
  - SMTP and other secrets must be provided via `.env` and are not hardcoded in Python files.

# How to Run
1) Create a virtualenv and install dependencies:
   - `python -m venv venv`
   - Windows: `venv\\Scripts\\activate`
   - `pip install -r requirements.txt`

2) Create `.env` next to `manage.py`:
   - Copy `.env.example` to `.env`
   - Configure SMTP (recommended for real emails):
     - `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
     - `EMAIL_HOST=smtp.gmail.com`
     - `EMAIL_PORT=587`
     - `EMAIL_USE_TLS=true`
     - `EMAIL_HOST_USER=your_email@gmail.com`
     - `EMAIL_HOST_PASSWORD=your_app_password`
     - `DEFAULT_FROM_EMAIL=Your App <your_email@gmail.com>`

3) Apply migrations and create an admin user:
   - `python manage.py migrate`
   - `python manage.py createsuperuser`

4) Run the server:
   - `python manage.py runserver`
   - Site: `http://127.0.0.1:8000/`
   - Admin: `http://127.0.0.1:8000/admin/`

5) Verify email sending (optional):
   - `python manage.py send_test_email --to your_email@gmail.com`

6) Authentication security tuning (optional):
   - `AUTH_SECURITY_LOGIN_IP_MAX_ATTEMPTS=10`
   - `AUTH_SECURITY_LOGIN_IP_WINDOW_SECONDS=600`
   - `AUTH_SECURITY_LOGIN_IP_BLOCK_AFTER_ATTEMPTS=10`
   - `AUTH_SECURITY_IP_BLOCK_SECONDS=1800`
   - `AUTH_SECURITY_LOGIN_IDENTIFIER_MAX_ATTEMPTS=5`
   - `AUTH_SECURITY_LOGIN_IDENTIFIER_WINDOW_SECONDS=600`

7) Run tests:
   - `python manage.py test`

