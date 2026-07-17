"""Safe public phone-number metadata lookup helpers."""

from __future__ import annotations
import re

try:
    import phonenumbers
    from phonenumbers import carrier, geocoder
except ImportError as error:  # pragma: no cover - depends on local installation
    raise RuntimeError(
        "The phonenumbers package is required. Install dependencies from requirements.txt."
    ) from error


class PhoneMetadataError(ValueError):
    """Raised when a supplied phone number cannot be safely interpreted."""


def _normalise(raw: str) -> str:
    """
    Try to produce a parse-ready string from whatever the user typed.

    Accepted formats (non-exhaustive):
      +91 98765 43210      – E.164 with spaces
      +1-415-555-2671      – E.164 with dashes
      0091 9876543210      – IDD prefix (00)
      008248389588         – IDD without country spaces
      91 9876543210        – country code without + (10–13 digits total)
      9876543210           – bare 10-digit (treated as IN)
      (415) 555-2671       – NANP with parens
      8248389588           – bare number
    """
    phone = raw.strip()

    # Remove invisible / exotic whitespace
    phone = re.sub(r"[\u200b\u00a0\t]", " ", phone)

    # Too long – reject early
    if len(phone) > 50:
        raise PhoneMetadataError("Phone number is too long.")

    # Strip common formatting characters to get digits-only view
    digits_only = re.sub(r"[\s\-().+]", "", phone)

    if not digits_only.isdigit():
        # Still has letters or weird chars → pass through as-is and let
        # phonenumbers raise a useful error
        return phone

    # IDD prefix 00 → +
    if digits_only.startswith("00") and len(digits_only) >= 10:
        return "+" + digits_only[2:]

    # Already has a leading +
    if phone.startswith("+"):
        return phone

    # Bare digits: if >= 11 digits assume country code is included
    if len(digits_only) >= 11:
        return "+" + digits_only

    # 10-digit bare number – default to India (largest user base here)
    if len(digits_only) == 10:
        return "+91" + digits_only

    # Fallback: prepend + and hope phonenumbers figures it out
    return "+" + digits_only


def lookup_phone_metadata(raw_phone: str) -> dict[str, str | bool | int | None]:
    """Return public numbering metadata without geocoding or live tracking.

    Accepts numbers in any common format:
      - International E.164:  +91 98765 43210
      - With dashes/parens:   +1-415-555-2671 / (415) 555-2671
      - IDD prefix:           0091 9876543210
      - Country code, no +:   91 9876543210
      - Bare 10-digit (IN):   9876543210
    """

    try:
        normalised = _normalise(raw_phone)
    except PhoneMetadataError:
        raise

    # First try strict parse (no default region)
    number = None
    try:
        number = phonenumbers.parse(normalised, None)
    except phonenumbers.NumberParseException:
        pass

    # If that failed, try with a default region of IN as fallback
    if number is None:
        try:
            number = phonenumbers.parse(raw_phone.strip(), "IN")
        except phonenumbers.NumberParseException as error:
            raise PhoneMetadataError(
                "Could not parse this number. Please include the country code, e.g. +91 98765 43210."
            ) from error

    if not phonenumbers.is_possible_number(number):
        raise PhoneMetadataError("This does not look like a valid phone number.")
    if not phonenumbers.is_valid_number(number):
        raise PhoneMetadataError(
            "The number is not valid for its country's numbering plan."
        )

    number_type = phonenumbers.number_type(number)
    type_name = phonenumbers.PhoneNumberType.to_string(number_type).replace("_", " ").title()

    # Format back to international for display
    formatted = phonenumbers.format_number(
        number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
    )

    return {
        "valid": True,
        "formatted_number": formatted,
        "country_code": number.country_code,
        "country_or_region": geocoder.region_code_for_number(number) or None,
        "number_type": type_name,
        "geographic_description": geocoder.description_for_number(number, "en") or None,
        "carrier": carrier.name_for_number(number, "en") or None,
        "notice": "This is public numbering-plan metadata, not live device location.",
    }
