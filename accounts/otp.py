import secrets


def generate_otp_code(length: int = 6) -> str:
    # Numeric code (UI expects 6 digits by default)
    return ''.join(str(secrets.randbelow(10)) for _ in range(length))
