"""Consent-based location sharing demo for a cyber-security project.

This application intentionally does not attempt to locate a phone number. Phone
numbers can provide public numbering-plan metadata only; precise location is
accepted solely from the device owner after a browser permission prompt.
"""

from __future__ import annotations

import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request, url_for, send_from_directory, send_file

from phone_metadata import PhoneMetadataError, lookup_phone_metadata

try:
    from topics import TOPIC_DATA
except ImportError:
    TOPIC_DATA = {}


try:
    import truecaller_helper as tc
    _TC_AVAILABLE = True
except Exception:
    _TC_AVAILABLE = False


BASE_DIR = Path(__file__).resolve().parent

# On Render, use the mounted persistent disk so the DB survives redeploys.
# Locally fall back to instance/ inside the project folder.
_RENDER_DISK = Path("/opt/render/project/src/instance")
INSTANCE_DIR = _RENDER_DISK if _RENDER_DISK.exists() else BASE_DIR / "instance"

DATABASE_PATH = INSTANCE_DIR / "location_shares.db"
SHARE_LIFETIME = timedelta(minutes=60)

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def isoformat(value: datetime) -> str:
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def database() -> sqlite3.Connection:
    INSTANCE_DIR.mkdir(exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialise_database() -> None:
    with database() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS location_shares (
                share_id TEXT PRIMARY KEY,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                accuracy REAL NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                revoked_at TEXT
            )
            """
        )


def clean_expired(connection: sqlite3.Connection) -> None:
    connection.execute(
        "DELETE FROM location_shares WHERE expires_at <= ?", (isoformat(utc_now()),)
    )


def json_body() -> dict[str, Any] | None:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def location_from(data: dict[str, Any]) -> tuple[float, float, float]:
    """Validate, and slightly reduce the precision of, browser coordinates."""

    values: list[float] = []
    for field in ("latitude", "longitude", "accuracy"):
        value = data.get(field)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{field} must be a number.")
        values.append(float(value))

    latitude, longitude, accuracy = values
    if not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90.")
    if not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180.")
    if not 0 <= accuracy <= 100_000:
        raise ValueError("accuracy must be between 0 and 100000 metres.")

    # Five decimal places is roughly metre-level precision. No IP address,
    # user-agent, or phone number is retained with the shared coordinate.
    return round(latitude, 5), round(longitude, 5), round(accuracy, 1)


def require_consent(data: dict[str, Any]) -> None:
    if data.get("consent") is not True:
        raise PermissionError("Explicit location-sharing consent is required.")


@app.after_request
def add_security_headers(response):
    response.headers["Cache-Control"] = "no-store"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = "geolocation=(self)"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://*.tile.openstreetmap.org https://lh3.googleusercontent.com; "
        "connect-src 'self' https://api.ipify.org; "
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    )
    return response


# Path to frontend folder (separate from Flask templates)
FRONTEND_DIR = BASE_DIR / "frontend"


@app.route("/")
def index():
    """Serve the new focused PhoneTrace frontend."""
    frontend_index = FRONTEND_DIR / "index.html"
    if frontend_index.exists():
        return send_file(frontend_index)
    return render_template("index.html")  # legacy fallback


@app.route("/frontend/<path:filename>")
def frontend_static(filename: str):
    """Serve frontend CSS, JS and other static assets."""
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/favicon.ico")
def favicon():
    return "", 204


@app.post("/api/phone-metadata")
def phone_metadata():
    data = json_body()
    phone = data.get("phone") if data else None
    if not isinstance(phone, str) or not phone.strip():
        return jsonify(error="Please enter a phone number, e.g. 8248389588 or +91 98765 43210."), 400

    try:
        meta = lookup_phone_metadata(phone)
    except PhoneMetadataError as error:
        return jsonify(error=str(error)), 400

    # Attempt Truecaller name lookup if set up
    tc_name = None
    tc_error = None
    if _TC_AVAILABLE and tc.is_setup():
        try:
            tc_result = tc.lookup_name(meta.get("e164") or phone)
            tc_name = tc_result.get("name")
        except Exception as e:
            tc_error = str(e)

    meta["truecaller_name"] = tc_name
    meta["truecaller_error"] = tc_error
    meta["truecaller_active"] = _TC_AVAILABLE and tc.is_setup()
    return jsonify(meta)


@app.post("/api/truecaller/login")
def truecaller_login():
    """Send OTP to the given phone number to set up Truecaller."""
    if not _TC_AVAILABLE:
        return jsonify(error="truecallerpy is not installed."), 500
    data = json_body()
    phone = (data or {}).get("phone", "").strip()
    if not phone:
        return jsonify(error="Phone number is required."), 400
    try:
        result = tc.send_otp(phone)
        return jsonify(status="otp_sent", detail=result)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.post("/api/truecaller/verify")
def truecaller_verify():
    """Verify OTP and save installationId."""
    if not _TC_AVAILABLE:
        return jsonify(error="truecallerpy is not installed."), 500
    data = json_body()
    otp = (data or {}).get("otp", "").strip()
    if not otp:
        return jsonify(error="OTP is required."), 400
    try:
        result = tc.verify_otp(otp)
        return jsonify(result)
    except Exception as e:
        return jsonify(error=str(e)), 400


@app.get("/api/truecaller/status")
def truecaller_status():
    """Check whether Truecaller has been set up."""
    if not _TC_AVAILABLE:
        return jsonify(available=False, setup=False)
    return jsonify(available=True, setup=tc.is_setup())


@app.delete("/api/truecaller/logout")
def truecaller_logout():
    """Remove saved installationId."""
    if _TC_AVAILABLE:
        from pathlib import Path
        import json as _json
        cfg_path = tc._CONFIG_FILE
        try:
            cfg = _json.loads(cfg_path.read_text())
            cfg.pop("installation_id", None)
            cfg_path.write_text(_json.dumps(cfg, indent=2))
        except Exception:
            pass
    return jsonify(status="logged_out")


@app.post("/api/location-shares")
def create_location_share():
    data = json_body()
    if data is None:
        return jsonify(error="A JSON request body is required."), 400

    try:
        require_consent(data)
        latitude, longitude, accuracy = location_from(data)
    except (ValueError, PermissionError) as error:
        return jsonify(error=str(error)), 400

    now = utc_now()
    expires_at = now + SHARE_LIFETIME
    share_id = secrets.token_urlsafe(24)

    with database() as connection:
        clean_expired(connection)
        connection.execute(
            """
            INSERT INTO location_shares
            (share_id, latitude, longitude, accuracy, created_at, updated_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                share_id,
                latitude,
                longitude,
                accuracy,
                isoformat(now),
                isoformat(now),
                isoformat(expires_at),
            ),
        )

    return jsonify(
        share_id=share_id,
        # Return a path rather than trusting a caller-controlled Host header.
        # The browser builds the same-origin absolute link before the user copies it.
        share_path=url_for("shared_location", share_id=share_id),
        expires_at=isoformat(expires_at),
    ), 201


@app.patch("/api/location-shares/<share_id>")
def update_location_share(share_id: str):
    data = json_body()
    if data is None:
        return jsonify(error="A JSON request body is required."), 400

    try:
        require_consent(data)
        latitude, longitude, accuracy = location_from(data)
    except (ValueError, PermissionError) as error:
        return jsonify(error=str(error)), 400

    now = isoformat(utc_now())
    with database() as connection:
        clean_expired(connection)
        result = connection.execute(
            """
            UPDATE location_shares
            SET latitude = ?, longitude = ?, accuracy = ?, updated_at = ?
            WHERE share_id = ? AND revoked_at IS NULL
            """,
            (latitude, longitude, accuracy, now, share_id),
        )

    if result.rowcount != 1:
        return jsonify(error="This share link is unavailable or has expired."), 404
    return jsonify(status="updated", updated_at=now)


@app.delete("/api/location-shares/<share_id>")
def revoke_location_share(share_id: str):
    with database() as connection:
        result = connection.execute(
            """
            UPDATE location_shares SET revoked_at = ?
            WHERE share_id = ? AND revoked_at IS NULL
            """,
            (isoformat(utc_now()), share_id),
        )

    if result.rowcount != 1:
        return jsonify(error="This share link is unavailable or has already been revoked."), 404
    return jsonify(status="revoked")


@app.get("/api/location-shares/<share_id>")
def get_location_share(share_id: str):
    with database() as connection:
        clean_expired(connection)
        row = connection.execute(
            """
            SELECT latitude, longitude, accuracy, updated_at, expires_at
            FROM location_shares
            WHERE share_id = ? AND revoked_at IS NULL
            """,
            (share_id,),
        ).fetchone()

    if row is None:
        return jsonify(error="This share link is unavailable, expired, or revoked."), 404
    return jsonify(dict(row))


@app.route("/shared/<share_id>")
def shared_location(share_id: str):
    return render_template("shared.html", share_id=share_id)


@app.route("/api/protect/<topic_id>")
def get_topic(topic_id: str):
    topic = TOPIC_DATA.get(topic_id)
    if topic is None:
        return jsonify(error="Topic not found"), 404
    return jsonify(topic)


initialise_database()


if __name__ == "__main__":
    # Browsers require HTTPS for geolocation outside localhost. Deploy behind
    # an HTTPS reverse proxy for demonstrations on other devices.
    app.run(host="127.0.0.1", port=5000, debug=False)
