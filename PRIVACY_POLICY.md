# 🛰️ **SarsatJRX – Privacy Policy**

**Last updated:** November 12, 2025

This Privacy Policy describes how the mobile application **SarsatJRX** (“we”, “our”, or “us”) collects, uses, and protects information.  
SarsatJRX is developed and maintained by **[F4JRX]**.

---

## 📱 1. Overview

SarsatJRX is a mobile application designed to **display and decode COSPAS-SARSAT 406 MHz beacon frames** received from an external decoder connected via local Wi-Fi.  
The application does **not collect, store, or share any personal user information**.

---

## 🔒 2. Data Collected

The app **does not collect or transmit** any personal data.

Only local, technical information is processed:

| Data Type | Description | Storage |
|------------|-------------|----------|
| **Beacon frames** | Technical data received from the external decoder (hex ID, position, protocol, etc.) | Temporarily stored in device memory only |
| **Decoder IP address** | Used for local HTTP/SSE communication (`http://sarsatjrx.local` or custom IP) | Never transmitted externally |

None of these data are sent outside your device.

---

## 🌐 3. Network Communication

SarsatJRX communicates **only** with the local decoder device over Wi-Fi, for example at: http://sarsatjrx.local

The app does **not** connect to any external server or cloud service.  
All data exchanges remain on the **local network**.

---

## 📍 4. Location Data

The app may **display GPS coordinates** contained in received beacon frames.  
These coordinates:

- Represent the **beacon’s position**, not the user’s  
- Are **not used to track** the user’s location  
- Are **not stored or shared** outside the app

---

## 🔔 5. Notifications and Sounds

SarsatJRX may emit:
- short **audio tones** when a new frame is received, and  
- **vibrations** for countdown or alert feedback.

All notifications are **local** and processed on-device.

---

## ⚙️ 6. Permissions Used

| Permission | Purpose |
|-------------|----------|
| **Local Network / Wi-Fi access** | Communication with the external decoder |
| **Vibration** | Haptic alerts for frames or countdowns |
| **Audio** | Play local beep notifications |
| **Camera** | Scan a QR code to configure the decoder’s IP or URL |

The app does **not** request access to personal data, files, or location.

---

## 🧭 7. Security

All communications occur locally over Wi-Fi using plain HTTP.  
The app does **not** store or transmit any personal or sensitive data.

---

## 🗑️ 8. Data Deletion

All settings and cached information are stored locally on your device.  
To remove all data, simply **uninstall the application**.

---

## 🧑‍💻 9. Contact

If you have any questions about this Privacy Policy, please contact:

📧 **[Your contact email or GitHub issues link]**

---

## ⚖️ 10. GDPR and Data Protection Compliance

SarsatJRX complies with the principles of the **General Data Protection Regulation (GDPR)** and Google Play policies.  
Specifically:

- No personal data are collected or shared  
- No analytics, tracking, or advertising SDKs are used  
- All data remain local to the device

---

## ✅ 11. Changes to This Policy

This policy may be updated periodically.  
The latest version is always available on the official GitHub repository:

👉 **https://github.com/fredzo/SarsatJRXApp/blob/main/PRIVACY_POLICY.md**

