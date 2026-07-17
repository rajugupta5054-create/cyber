"""Command-line phone metadata lookup used by the Flask application.

This reports public numbering-plan metadata only. It does not and cannot find
the live location of a phone or its owner.
"""

from phone_metadata import PhoneMetadataError, lookup_phone_metadata


def main() -> None:
    phone = input("Phone number in international format (for example +14155552671): ").strip()
    try:
        metadata = lookup_phone_metadata(phone)
    except PhoneMetadataError as error:
        print(f"Error: {error}")
        return

    print("\nPublic phone-number metadata (not device location):")
    for label, value in metadata.items():
        print(f"{label.replace('_', ' ').title()}: {value or 'Not available'}")


if __name__ == "__main__":
    main()
