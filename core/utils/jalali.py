from __future__ import annotations

from datetime import date, datetime

from django.utils import timezone

PERSIAN_DIGITS_TRANS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

PERSIAN_MONTH_NAMES = (
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
)


def gregorian_to_jalali(gy: int, gm: int, gd: int) -> tuple[int, int, int]:
    """Convert Gregorian year/month/day to Jalali year/month/day.

    Algorithm based on the well-known Jalali conversion implementation used in many
    open-source projects; returns (jy, jm, jd).
    """
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

    if gy > 1600:
        jy = 979
        gy -= 1600
    else:
        jy = 0
        gy -= 621

    gy2 = gy + 1 if gm > 2 else gy
    days = (
        365 * gy
        + (gy2 + 3) // 4
        - (gy2 + 99) // 100
        + (gy2 + 399) // 400
        - 80
        + gd
        + g_d_m[gm - 1]
    )

    jy += 33 * (days // 12053)
    days %= 12053

    jy += 4 * (days // 1461)
    days %= 1461

    if days > 365:
        jy += (days - 1) // 365
        days = (days - 1) % 365

    if days < 186:
        jm = 1 + days // 31
        jd = 1 + (days % 31)
    else:
        jm = 7 + (days - 186) // 30
        jd = 1 + ((days - 186) % 30)

    return jy, jm, jd


def _to_persian_digits(value: str) -> str:
    return value.translate(PERSIAN_DIGITS_TRANS)


def format_jalali(value, fmt: str = "Y/m/d", *, persian_digits: bool = True) -> str:
    """Format a date/datetime in Jalali calendar using a small Django-like format.

    Supported tokens (enough for this project):
      - Y: 4-digit year
      - m: 2-digit month
      - n: month without leading zero
      - d: 2-digit day
      - j: day without leading zero
      - F: full month name (Persian)
      - H: 2-digit hour (24h)
      - i: 2-digit minute
    """
    if value is None:
        return ""

    dt: datetime | None = None
    d: date | None = None

    if isinstance(value, datetime):
        dt = value
        if timezone.is_aware(dt):
            dt = timezone.localtime(dt)
        d = dt.date()
    elif isinstance(value, date):
        d = value
    else:
        return str(value)

    jy, jm, jd = gregorian_to_jalali(d.year, d.month, d.day)

    hour = dt.hour if dt else 0
    minute = dt.minute if dt else 0

    tokens = {
        "Y": f"{jy:04d}",
        "m": f"{jm:02d}",
        "n": f"{jm:d}",
        "d": f"{jd:02d}",
        "j": f"{jd:d}",
        "F": PERSIAN_MONTH_NAMES[jm - 1],
        "H": f"{hour:02d}",
        "i": f"{minute:02d}",
    }

    out_chars: list[str] = []
    for ch in fmt:
        out_chars.append(tokens.get(ch, ch))
    out = "".join(out_chars)
    return _to_persian_digits(out) if persian_digits else out

