from __future__ import annotations

from pathlib import Path

from django.conf import settings


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def _media_url_for(path: Path) -> str:
    rel_path = path.relative_to(settings.MEDIA_ROOT)
    rel = str(rel_path).replace("\\", "/")
    return f"{settings.MEDIA_URL.rstrip('/')}/{rel}"


def list_product_media_images(product_id: int | str) -> list[str]:
    """Return media URLs for product images stored under media/products/."""
    if not getattr(settings, "MEDIA_ROOT", None):
        return []

    base_dir = Path(settings.MEDIA_ROOT) / "products"
    if not base_dir.exists():
        return []

    urls: list[str] = []
    pid = str(product_id)

    folder = base_dir / pid
    if folder.exists() and folder.is_dir():
        for file_path in sorted(folder.iterdir(), key=lambda p: p.name):
            if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                urls.append(_media_url_for(file_path))
        if urls:
            return urls

    patterns = (f"{pid}.*", f"{pid}-*.*", f"{pid}_*.*")
    seen: set[str] = set()
    for pattern in patterns:
        for file_path in sorted(base_dir.glob(pattern), key=lambda p: p.name):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            url = _media_url_for(file_path)
            if url in seen:
                continue
            seen.add(url)
            urls.append(url)

    return urls


def get_primary_image_url(product) -> str:
    images = list(getattr(product, "images", []).all())
    if images:
        for image in images:
            if image.is_primary:
                return image.image.url
        return images[0].image.url

    fallback = list_product_media_images(getattr(product, "id", ""))
    return fallback[0] if fallback else ""


def build_gallery_images(product) -> list[dict[str, str]]:
    images = list(getattr(product, "images", []).all())
    if images:
        return [
            {"url": img.image.url, "alt": (img.alt_text or getattr(product, "name", "") or "").strip()}
            for img in images
        ]

    fallback_urls = list_product_media_images(getattr(product, "id", ""))
    if not fallback_urls:
        return []

    alt = (getattr(product, "name", "") or "").strip()
    return [{"url": url, "alt": alt} for url in fallback_urls]
