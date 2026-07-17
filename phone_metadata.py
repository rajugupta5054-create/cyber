"""Safe public phone-number metadata lookup helpers."""

from __future__ import annotations

try:
    import phonenumbers
    from phonenumbers import carrier, geocoder
except ImportError as error:  # pragma: no cover - depends on local installation
    raise RuntimeError(
        "The phonenumbers package is required. Install dependencies from requirements.txt."
    ) from error


class PhoneMetadataError(ValueError):
    """Raised when a supplied phone number cannot be safely interpreted."""


def lookup_phone_metadata(raw_phone: str) -> dict[str, str | bool | int | None]:
    """Return public numbering metadata without geocoding or live tracking."""

    phone = raw_phone.strip()
    if len(phone) > 40:
        raise PhoneMetadataError("Phone number is too long.")
    if not phone.startswith("+"):
        raise PhoneMetadataError("Use international E.164 format, beginning with +.")

    try:
        number = phonenumbers.parse(phone, None)
    except phonenumbers.NumberParseException as error:
        raise PhoneMetadataError("Enter a valid international phone number.") from error

    if not phonenumbers.is_possible_number(number):
        raise PhoneMetadataError("This number is not a possible phone number.")
    if not phonenumbers.is_valid_number(number):
        raise PhoneMetadataError("This number is not valid for its numbering plan.")

    number_type = phonenumbers.number_type(number)
    type_name = phonenumbers.PhoneNumberType.to_string(number_type).replace("_", " ").title()
    return {
        "valid": True,
        "country_code": number.country_code,
        "country_or_region": geocoder.region_code_for_number(number) or None,
        "number_type": type_name,
        "geographic_description": geocoder.description_for_number(number, "en") or None,
        "carrier": carrier.name_for_number(number, "en") or None,
        "notice": "This is public numbering-plan metadata, not live device location.",
    }
