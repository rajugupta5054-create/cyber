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

from flask import Flask, jsonify, render_template, request, url_for

from phone_metadata import PhoneMetadataError, lookup_phone_metadata


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
        "script-src 'self' https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://*.tile.openstreetmap.org; "
        "connect-src 'self' https://api.ipify.org; "
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    )
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/api/phone-metadata")
def phone_metadata():
    data = json_body()
    phone = data.get("phone") if data else None
    if not isinstance(phone, str) or not phone.strip():
        return jsonify(error="Please enter a phone number, e.g. 8248389588 or +91 98765 43210."), 400

    try:
        return jsonify(lookup_phone_metadata(phone))
    except PhoneMetadataError as error:
        return jsonify(error=str(error)), 400


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


initialise_database()


if __name__ == "__main__":
    # Browsers require HTTPS for geolocation outside localhost. Deploy behind
    # an HTTPS reverse proxy for demonstrations on other devices.
    app.run(host="127.0.0.1", port=5000, debug=False)
