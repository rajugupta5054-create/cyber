TOPIC_DATA = {
  "suspicious-links": {
    "title": "Never Click Suspicious Links",
    "icon": "link",
    "desc": "Attackers often disguise malicious tracking links as delivery notifications, prize claims, or banking alerts.",
    "story": "In 2023, a 'smishing' (SMS phishing) campaign sent text messages about a 'failed parcel delivery' containing a shortened tracking link. Victims who clicked the link unknowingly shared their IP address and device information with a malicious server.",
    "steps": [
      {
        "title": "Verify the Sender",
        "desc": "Check if you were expecting a message from this entity. Is the phone number or email address legitimate?"
      },
      {
        "title": "Hover Before Clicking",
        "desc": "On a computer, hover your mouse over the link to see the real URL. If it looks strange, don't click it."
      },
      {
        "title": "Expand Short URLs",
        "desc": "If the link is a short URL (like bit.ly), use a free expansion tool like checkshorturl.com to see where it really leads."
      }
    ],
    "demoType": "url-scanner",
    "image_url": "/images/suspicious_links.png"
  },
  "deny-location": {
    "title": "Deny Location to Unknown Sites",
    "icon": "shield",
    "desc": "Your browser will always ask for permission before sharing precise GPS coordinates.",
    "story": "A popular online game requested location permissions. Users who clicked 'Allow' without thinking had their exact coordinates tracked and sold to third-party advertisers.",
    "steps": [
      {
        "title": "Stop and Think",
        "desc": "When a prompt appears, ask yourself: 'Does this website actually need my location to function?'"
      },
      {
        "title": "Click 'Block'",
        "desc": "If the answer is no, always click 'Block' or 'Never Allow'."
      },
      {
        "title": "Use 'Allow Once'",
        "desc": "If you must share your location (e.g., for a map service), use the 'Allow for this session only' option if your browser supports it."
      }
    ],
    "demoType": None,
    "image_url": "/images/deny_location.png"
  },
  "use-vpn": {
    "title": "Use a VPN",
    "icon": "globe",
    "desc": "A Virtual Private Network (VPN) encrypts your internet traffic and hides your real IP address.",
    "story": "Without a VPN, your Internet Service Provider (ISP) and any website you visit can see your IP address, which reveals your approximate physical location (city/region).",
    "steps": [
      {
        "title": "Choose a Reputable Provider",
        "desc": "Avoid free VPNs, as they often sell your data. Look for providers with a strict no-logs policy."
      },
      {
        "title": "Keep it On",
        "desc": "For maximum protection, leave your VPN on whenever you're connected to the internet, especially on public Wi-Fi."
      },
      {
        "title": "Verify Your IP",
        "desc": "After connecting, search 'What is my IP' to ensure your real location is hidden."
      }
    ],
    "demoType": "ip-demo",
    "image_url": "/images/use_vpn.png"
  },
  "private-browsing": {
    "title": "Use Private Browsing",
    "icon": "eye-off",
    "desc": "Private or Incognito mode prevents your browser from saving cookies, history, and form data.",
    "story": "While private browsing doesn't hide your IP address, it does clear tracking cookies when you close the window, making it harder for advertisers to build a long-term profile of you.",
    "steps": [
      {
        "title": "Open a Private Window",
        "desc": "Use Ctrl+Shift+N (Chrome/Edge) or Ctrl+Shift+P (Firefox) to open a private window."
      },
      {
        "title": "Don't Log In",
        "desc": "Avoid logging into your personal accounts (like Google or Facebook) in a private window, as this immediately identifies you."
      },
      {
        "title": "Close When Done",
        "desc": "Remember to close all private windows when you're finished to clear the session data."
      }
    ],
    "demoType": None,
    "image_url": "/images/private_browsing.png"
  },
  "app-permissions": {
    "title": "Review App Permissions",
    "icon": "smartphone",
    "desc": "Many mobile apps request permissions they don't actually need.",
    "story": "A flashlight app on the Google Play Store was found to be requesting GPS location and contact list permissions, completely unrelated to its function.",
    "steps": [
      {
        "title": "Check Settings",
        "desc": "Regularly review the permissions granted to your apps in your phone's settings (iOS: Privacy, Android: Privacy > Permission Manager)."
      },
      {
        "title": "Revoke Unnecessary Access",
        "desc": "If a calculator app asks for your location or camera, revoke that permission immediately."
      },
      {
        "title": "Use 'While Using App'",
        "desc": "Whenever possible, grant location access only 'While Using the App' rather than 'Always'."
      }
    ],
    "demoType": None,
    "image_url": "/images/app_permissions.png"
  },
  "https-only": {
    "title": "Enable HTTPS Only Mode",
    "icon": "lock",
    "desc": "HTTPS encrypts the data travelling between your browser and the website.",
    "story": "Modern browsers block sensitive APIs (like Geolocation) on unencrypted HTTP connections. Forcing HTTPS ensures your data cannot be intercepted on public Wi-Fi networks.",
    "steps": [
      {
        "title": "Enable in Settings",
        "desc": "Go to your browser settings and enable 'HTTPS-Only Mode' or 'Always use secure connections'."
      },
      {
        "title": "Look for the Lock",
        "desc": "Always check for the padlock icon in the address bar before entering sensitive information."
      },
      {
        "title": "Use Extensions",
        "desc": "If your browser doesn't have a built-in HTTPS-only mode, consider using an extension like HTTPS Everywhere."
      }
    ],
    "demoType": None,
    "image_url": "/images/https_only.png"
  }
}
