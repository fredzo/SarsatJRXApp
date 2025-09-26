# SarsatJRX Expo App

React Native (Expo, TypeScript, expo-router) app that connects to a 406 MHz beacon frame decoder over WiFi.

## Features
- Header with app name, time, battery state, 4 LEDs, and settings icon.
- Main screen displaying frame data with link to Google Maps/Waze for navigation to beacon position.
- Map screen showing last beacon coordinates with marker (native) or Google Maps link (web).
- Settings screen with WiFi info, decoder settings, display settings, system info.
- Bottom bar with countdown to next frame.
- SSE subscription to `http://sarsatjrx.local/sse`.
- Beep sound on frame reception (`assets/beep.wav`).

## Install & Run
```bash
yarn install
yarn run start
```
Open in Expo Go or web.

