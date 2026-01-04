# Problem
The legacy project was an e-commerce storefront, but Styra needs a corporate website focused on showcasing industrial kitchen equipment, services, and project delivery. The site must eliminate public ordering flows and instead capture qualified leads for consultation and quotations while keeping a managed product catalog and portfolio.

# Solution
The application is refactored into a corporate, Persian-first website with:
- A price-less product catalog and technical pages.
- Service and kitchen setup packages (Normal/VIP/CIP).
- Projects/portfolio, downloads, and FAQ pages.
- A lead-capture contact form stored in the database and visible in admin (optional email notification).
- A staff-only manual invoice/proforma template for internal use.

# Tech Stack
- Python 3.12
- Django 5.2
- SQLite (development), MySQL/MariaDB (production)
- Admin UI: `django-jazzmin`
- PDF generation: `reportlab`, `arabic-reshaper`, `python-bidi`
- Excel import: `openpyxl`
- Static handling: `whitenoise`, `brotli`

# Security Considerations
- Security headers are applied via middleware (CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options).
- Login endpoints are rate-limited via `auth_security` middleware and logged for admin review.
- Sensitive configuration (SECRET_KEY, SMTP, DB) is provided via environment variables.

# How to Run
1) Create a virtualenv and install dependencies:
   - `python -m venv venv`
   - Windows: `venv\Scripts\activate`
   - `pip install -r requirements.txt`

2) Create `.env` next to `manage.py`:
   - Copy `.env.example` to `.env`
   - Configure SMTP (optional) and database settings.

3) Apply migrations and create an admin user:
   - `python manage.py makemigrations`
   - `python manage.py migrate`
   - `python manage.py createsuperuser`

4) Run the server:
   - `python manage.py runserver`
   - Site: `http://127.0.0.1:8000/`
   - Admin: `http://127.0.0.1:8000/admin/`

# Site Structure
- `/` (Home)
- `/about/`
- `/services/`
- `/services/kitchen-setup/`
- `/services/kitchen-setup/normal/`
- `/services/kitchen-setup/vip/`
- `/services/kitchen-setup/cip/`
- `/projects/`
- `/projects/<slug>/`
- `/catalog/`
- `/catalog/<category-slug>/`
- `/catalog/<category-slug>/<product-slug>/`
- `/downloads/`
- `/contact/`
- `/faq/`
- `/privacy/`
- `/terms/`
- `/sitemap.xml`
- `/robots.txt`

# Route Audit (Legacy)
| Legacy URL | Purpose | Action | Replacement |
| --- | --- | --- | --- |
| `/` | Storefront landing | MODIFY | `/` (corporate home) |
| `/shop/` | Store listing | REDIRECT | `/catalog/` |
| `/shop/product/<id>/` | Product detail | REDIRECT | `/catalog/<category>/<product>/` |
| `/shop/cart/` | Cart | DELETE | - |
| `/shop/checkout/` | Checkout | DELETE | - |
| `/shop/payment/...` | Payments | DELETE | - |
| `/login/` | User login | REDIRECT | `/contact/` |
| `/signup/` | User signup | REDIRECT | `/contact/` |

# Admin Content
Manage the following in Django Admin:
- Products, Categories, Product Images, Product Features
- Projects (portfolio)
- Downloads
- Contact messages (leads)
- Site contact settings (PaymentSettings)

# Lead Notifications
If SMTP is configured in `.env`, contact form submissions are emailed to the company email and all superusers. If not configured, submissions are still stored in the database.

# Manual Invoice (Staff Only)
Manual invoice/proforma templates are available for staff at:
- `/catalog/invoice/manual/`
- `/shop/invoice/manual/` (legacy redirect)
