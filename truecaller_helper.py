"""Truecaller integration helper.

Wraps the unofficial truecallerpy package to provide:
  - login()       : send OTP to your phone number
  - verify()      : confirm OTP and save installationId
  - lookup_name() : search a number and return the name
  - is_setup()    : check if installationId is saved

The installationId is persisted to instance/truecaller_config.json.
"""
from __future__ import annotations

import json
from pathlib import Path

# ── storage ──────────────────────────────────────────────────────────────────
_BASE = Path(__file__).resolve().parent
_RENDER_DISK = Path("/opt/render/project/src/instance")
_INSTANCE = _RENDER_DISK if _RENDER_DISK.exists() else _BASE / "instance"
_CONFIG_FILE = _INSTANCE / "truecaller_config.json"


def _load_config() -> dict:
    try:
        return json.loads(_CONFIG_FILE.read_text())
    except Exception:
        return {}


def _save_config(cfg: dict) -> None:
    _INSTANCE.mkdir(exist_ok=True)
    _CONFIG_FILE.write_text(json.dumps(cfg, indent=2))


def get_installation_id() -> str | None:
    return _load_config().get("installation_id")


def is_setup() -> bool:
    return bool(get_installation_id())


# ── Truecaller actions ────────────────────────────────────────────────────────
def send_otp(phone: str) -> dict:
    """Initiate Truecaller login — sends OTP to `phone` (e.g. +919876543210)."""
    from truecallerpy import login  # imported here to avoid hard crash if not installed

    result = login(phone)
    # Save phone for later verify step
    cfg = _load_config()
    cfg["pending_phone"] = phone
    # truecallerpy login response may contain requestId
    if isinstance(result, dict):
        cfg["request_id"] = result.get("requestId") or result.get("request_id") or ""
    _save_config(cfg)
    return result if isinstance(result, dict) else {"raw": str(result)}


def verify_otp(otp: str) -> dict:
    """Verify OTP and persist the installationId."""
    from truecallerpy import verify_otp as tc_verify

    cfg = _load_config()
    phone = cfg.get("pending_phone", "")
    request_id = cfg.get("request_id", "")

    if not phone:
        raise ValueError("No pending login session. Please send OTP first.")

    result = tc_verify(phone, otp, request_id)

    # Extract installationId from response
    installation_id = None
    if isinstance(result, dict):
        installation_id = (
            result.get("installationId")
            or result.get("installation_id")
            or (result.get("data", {}) or {}).get("installationId")
        )

    if not installation_id:
        raise ValueError(f"OTP verification failed or no installationId returned. Response: {result}")

    cfg["installation_id"] = installation_id
    cfg.pop("pending_phone", None)
    cfg.pop("request_id", None)
    _save_config(cfg)
    return {"status": "ok", "installation_id": installation_id}


def lookup_name(phone: str) -> dict:
    """Look up a phone number and return name + other details from Truecaller."""
    from truecallerpy import search_phonenumber

    installation_id = get_installation_id()
    if not installation_id:
        raise RuntimeError("Truecaller not set up. Please login first.")

    # Detect country code from number (default IN)
    country = "IN"
    if phone.startswith("+1"):
        country = "US"
    elif phone.startswith("+44"):
        country = "GB"
    elif phone.startswith("+91") or len(phone.lstrip("+")) == 10:
        country = "IN"

    result = search_phonenumber(phone, country, installation_id)

    if not isinstance(result, dict):
        return {"name": None, "raw": str(result)}

    # Navigate the response tree
    data = result.get("data", {}) or {}
    if isinstance(data, list):
        data = data[0] if data else {}

    name = data.get("name") or None
    score = data.get("score") or None
    internet_address = data.get("internetAddresses") or []
    addresses = data.get("addresses") or []
    city = addresses[0].get("city") if addresses else None
    country_val = addresses[0].get("countryCode") if addresses else None

    return {
        "name": name,
        "score": score,
        "city": city,
        "country": country_val,
        "internet_addresses": internet_address,
        "raw": result,
    }
