"""Safe public phone-number metadata lookup helpers.

Accepts phone numbers in virtually any format the user might type.
"""

from __future__ import annotations
import re

try:
    import phonenumbers
    from phonenumbers import carrier, geocoder
except ImportError as error:  # pragma: no cover
    raise RuntimeError(
        "The phonenumbers package is required. Install dependencies from requirements.txt."
    ) from error


class PhoneMetadataError(ValueError):
    """Raised when a supplied phone number cannot be safely interpreted."""


# ---------------------------------------------------------------------------
# All default-region fallbacks to try when no country code can be detected.
# Ordered by most likely users of this cybersecurity demo.
# ---------------------------------------------------------------------------
_FALLBACK_REGIONS = [
    "IN",   # India
    "US",   # United States / Canada (NANP)
    "GB",   # United Kingdom
    "AU",   # Australia
    "PK",   # Pakistan
    "BD",   # Bangladesh
    "NG",   # Nigeria
    "PH",   # Philippines
    "DE",   # Germany
    "FR",   # France
    "BR",   # Brazil
    "ZA",   # South Africa
    "SG",   # Singapore
    "MY",   # Malaysia
    "AE",   # UAE
]

# Chars that are valid separators / decorators in phone numbers
_SEPARATOR_RE = re.compile(r"[\s\-\.\(\)\[\]\/\\–—·∙•,]")

# Invisible / exotic whitespace
_INVISIBLE_RE = re.compile(r"[\u200b\u200c\u200d\u00a0\t\r\n\ufeff]")


def _strip_to_digits(text: str) -> str:
    """Return only the digit characters from *text*."""
    return re.sub(r"\D", "", text)


def _candidate_strings(raw: str) -> list[str]:
    """
    Generate a prioritised list of strings to try feeding into phonenumbers.parse().

    Strategy (tried in order):
      1. Clean the raw string and try as-is (handles E.164 + most int'l formats).
      2. Replace IDD prefix 00… → +…
      3. Replace 011… (US IDD) → +…
      4. Prepend + to bare digit strings ≥ 11 digits (likely has a country code).
      5. Use digits-only with common country-code lengths tried.
      6. Keep the original raw string as a last-ditch attempt.
    """
    # Step 0: basic cleanup
    clean = _INVISIBLE_RE.sub(" ", raw).strip()
    # Normalise separators but KEEP the leading + if present
    if clean.startswith("+"):
        clean = "+" + _SEPARATOR_RE.sub("", clean[1:])
    else:
        clean = _SEPARATOR_RE.sub("", clean)

    digits = _strip_to_digits(raw)
    candidates: list[str] = []

    # 1. As cleaned
    candidates.append(clean)

    # 2. IDD 00 → +
    if digits.startswith("00") and len(digits) >= 10:
        candidates.append("+" + digits[2:])

    # 3. IDD 011 (North America) → +
    if digits.startswith("011") and len(digits) >= 11:
        candidates.append("+" + digits[3:])

    # 4. Bare digits with + prepended (country code assumed present)
    if len(digits) >= 11:
        candidates.append("+" + digits)

    # 5. Common 1-digit country code + remaining digits
    if len(digits) >= 11:
        for cc_len in (1, 2, 3):
            candidates.append("+" + digits[:cc_len] + digits[cc_len:])

    # 6. Original raw as-is (last resort)
    candidates.append(raw.strip())

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for c in candidates:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return unique


def _try_parse(candidate: str, region: str | None) -> "phonenumbers.PhoneNumber | None":
    """Return a parsed PhoneNumber or None — never raises."""
    try:
        return phonenumbers.parse(candidate, region)
    except Exception:
        return None


def _is_usable(number: "phonenumbers.PhoneNumber") -> bool:
    return (
        phonenumbers.is_possible_number(number)
        and phonenumbers.is_valid_number(number)
    )


def lookup_phone_metadata(raw_phone: str) -> dict[str, str | bool | int | None]:
    """Return public numbering metadata for a phone number in *any* format.

    Accepted formats include (but are not limited to):
      +91 8248389588          – E.164 with space
      +918248389588           – E.164 no space
      +1-415-555-2671         – E.164 with dashes
      (415) 555-2671          – NANP with parens (region-aware)
      0091 9876543210         – IDD prefix 00
      011 44 20 7946 0958     – US IDD prefix 011
      91 9876543210           – country code without +
      9876543210              – bare 10-digit (India default)
      8248389588              – bare 10-digit (India default)
      +44.20.7946.0958        – dots as separators
      +49 30 12345678         – German landline
      +55 11 91234-5678       – Brazilian mobile
    """
    raw = (raw_phone or "").strip()

    if not raw:
        raise PhoneMetadataError("Please enter a phone number.")
    if len(raw) > 60:
        raise PhoneMetadataError("The input is too long to be a phone number.")

    digits = _strip_to_digits(raw)
    if len(digits) < 4:
        raise PhoneMetadataError("Too few digits — please enter a complete phone number.")

    candidates = _candidate_strings(raw)
    number: "phonenumbers.PhoneNumber | None" = None

    # --- Pass 1: try every candidate without a default region ---
    for candidate in candidates:
        parsed = _try_parse(candidate, None)
        if parsed and _is_usable(parsed):
            number = parsed
            break

    # --- Pass 2: try every candidate with each fallback region ---
    if number is None:
        for region in _FALLBACK_REGIONS:
            for candidate in candidates:
                parsed = _try_parse(candidate, region)
                if parsed and _is_usable(parsed):
                    number = parsed
                    break
            if number:
                break

    # --- Pass 3: accept a "possible" (not necessarily valid) number ---
    if number is None:
        for region in [None] + _FALLBACK_REGIONS:  # type: ignore[list-item]
            for candidate in candidates:
                parsed = _try_parse(candidate, region)
                if parsed and phonenumbers.is_possible_number(parsed):
                    number = parsed
                    break
            if number:
                break

    if number is None:
        raise PhoneMetadataError(
            "Could not recognise this phone number. "
            "Try entering just the 10-digit number (e.g. 8248389588) "
            "or include the country code (e.g. +91 98765 43210)."
        )

    # Final validity check (only warn, do not block, for "possible" numbers)
    is_valid = phonenumbers.is_valid_number(number)
    is_possible = phonenumbers.is_possible_number(number)

    number_type = phonenumbers.number_type(number)
    type_name = (
        phonenumbers.PhoneNumberType.to_string(number_type)
        .replace("_", " ")
        .title()
    )

    formatted_international = phonenumbers.format_number(
        number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
    )
    formatted_e164 = phonenumbers.format_number(
        number, phonenumbers.PhoneNumberFormat.E164
    )
    formatted_national = phonenumbers.format_number(
        number, phonenumbers.PhoneNumberFormat.NATIONAL
    )
    formatted_rfc3966 = phonenumbers.format_number(
        number, phonenumbers.PhoneNumberFormat.RFC3966
    )

    # Timezones
    try:
        from phonenumbers import timezone as tz_mod
        timezones = tz_mod.time_zones_for_number(number)
        timezone_str = ", ".join(timezones) if timezones else None
    except Exception:
        timezone_str = None

    # Country / region
    region_code = geocoder.region_code_for_number(number) or None
    geo_desc = geocoder.description_for_number(number, "en") or None
    carrier_name = carrier.name_for_number(number, "en") or None

    # Carrier in local language (Hindi for India)
    carrier_local = None
    if region_code == "IN":
        try:
            carrier_local = carrier.name_for_number(number, "hi") or None
        except Exception:
            pass

    # Number flags
    is_mobile = number_type in (
        phonenumbers.PhoneNumberType.MOBILE,
        phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE,
    )
    is_landline = number_type == phonenumbers.PhoneNumberType.FIXED_LINE
    is_tollfree = number_type == phonenumbers.PhoneNumberType.TOLL_FREE
    is_premium  = number_type == phonenumbers.PhoneNumberType.PREMIUM_RATE
    is_voip     = number_type == phonenumbers.PhoneNumberType.VOIP

    # National significant number & prefix
    nsn = phonenumbers.national_significant_number(number)
    prefix_4 = nsn[:4] if len(nsn) >= 4 else nsn

    # Indian telecom circle lookup (based on first 4 digits of 10-digit number)
    india_circle = None
    if region_code == "IN" and len(nsn) == 10:
        india_circle = _india_circle(nsn)

    return {
        # ── Validity ──────────────────────────────────────────
        "valid":           is_valid,
        "is_possible":     is_possible,

        # ── Formats ───────────────────────────────────────────
        "formatted_number":  formatted_international,
        "e164":              formatted_e164,
        "national_format":   formatted_national,
        "rfc3966":           formatted_rfc3966,

        # ── Number structure ──────────────────────────────────
        "country_code":              number.country_code,
        "national_significant_number": nsn,
        "number_prefix":             prefix_4,
        "extension":                 number.extension or None,

        # ── Geography ─────────────────────────────────────────
        "country_or_region":      region_code,
        "geographic_description": geo_desc,
        "timezone":               timezone_str,
        "india_telecom_circle":   india_circle,

        # ── Line type ─────────────────────────────────────────
        "number_type":  type_name,
        "is_mobile":    is_mobile,
        "is_landline":  is_landline,
        "is_tollfree":  is_tollfree,
        "is_premium":   is_premium,
        "is_voip":      is_voip,

        # ── Carrier ───────────────────────────────────────────
        "carrier":       carrier_name,
        "carrier_local": carrier_local,

        # ── Notice ────────────────────────────────────────────
        "notice": "Public numbering-plan metadata only — not live device location.",
    }


# ── Indian telecom circle table ───────────────────────────────────────────────
_INDIA_CIRCLES: dict[str, str] = {
    # Jio prefixes (98xx, 70xx, 71xx, 72xx, 73xx, 79xx, 62xx, 63xx, 64xx, 65xx)
    # We map by first-2 digits for broad coverage, refined by 4-digit where known
    "9400": "Kerala", "9447": "Kerala", "9446": "Kerala",
    "9448": "Karnataka", "9449": "Karnataka", "9880": "Karnataka",
    "9884": "Tamil Nadu", "9940": "Tamil Nadu", "9841": "Tamil Nadu",
    "9820": "Mumbai", "9821": "Mumbai", "9819": "Mumbai",
    "9810": "Delhi", "9811": "Delhi", "9818": "Delhi",
    "9830": "West Bengal", "9831": "West Bengal",
    "9850": "Maharashtra", "9890": "Maharashtra",
    "9860": "Maharashtra", "9970": "Maharashtra",
    "9413": "Rajasthan", "9414": "Rajasthan",
    "9415": "Uttar Pradesh (E)", "9839": "Uttar Pradesh (E)",
    "9918": "Uttar Pradesh (W)", "9412": "Uttar Pradesh (W)",
    "9876": "Punjab", "9779": "Punjab",
    "9878": "Punjab", "9872": "Punjab",
    "9426": "Gujarat", "9824": "Gujarat", "9974": "Gujarat",
    "9437": "Odisha", "9438": "Odisha",
    "9434": "North East", "9435": "Assam",
    "9431": "Bihar", "9430": "Bihar",
    "9334": "Bihar", "9308": "Bihar",
    "9471": "Jharkhand", "9431": "Bihar",
    "9868": "Delhi", "9999": "Delhi",
    "9891": "Delhi", "8800": "Delhi",
    "9500": "Tamil Nadu", "9600": "Tamil Nadu",
}

def _india_circle(nsn: str) -> str | None:
    """Best-effort Indian telecom circle from national significant number."""
    return (
        _INDIA_CIRCLES.get(nsn[:4])
        or _INDIA_CIRCLES.get(nsn[:3])
        or None
    )
