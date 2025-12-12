import secrets


def generate_otp_code(length: int = 4) -> str:
    # 4-digit numeric code (matches UI)
    return ''.join(str(secrets.randbelow(10)) for _ in range(length))
