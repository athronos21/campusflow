# 📱 CampusFlow Mobile Client (Flutter 3.x)

<p align="center">
  <strong>Native Cross-Platform Student Super-App for Ethiopian Higher Education</strong><br>
  <em>Piloted at Haramaya University Main Campus (Bate)</em>
</p>

---

## 📌 Overview

The **CampusFlow Mobile Application** is built with Flutter 3.x and Dart, delivering high performance, native Android and iOS experiences, offline resilience, and fluid interactions across campus life.

* **Architecture:** Service-oriented architecture with typed models, custom `ApiClient` using Dio with JWT interceptors, and local offline cache fallbacks (`SharedPreferences`).
* **Financial Precision:** Currency values are handled strictly in integer minor units (ETB cents) to prevent floating-point calculation errors.
* **Data Protection Compliance:** Compliant with Ethiopia's **Personal Data Protection Proclamation No. 1321/2024** (data minimization, privacy rights dialogue, and student opt-out).

---

## 🧭 Application Navigation & Services

The mobile app includes all 10 core CampusFlow services accessible via bottom tab navigation and the horizontal Quick-Launcher:

| Screen / Feature | Route / Class | Blueprint Domain | Capabilities |
| :--- | :--- | :--- | :--- |
| **Explore / Directory** | `ExploreScreen` | Service 01 & 03 | Verified campus businesses, categories (Food, Stationery, Tech), search, and live notices. |
| **Shop & Menu** | `ShopDetailScreen` | Service 03 & 04 | In-store catalog, product descriptions, stock status, and add-to-cart drawer. |
| **Bus Ticketing** | `TransportScreen` | Service 02 | Intercity shuttles to Harar, Dire Dawa, and Addis Ababa. Interactive seat grid & QR passes. |
| **Housing Viewings** | `HousingScreen` | Service 05 | Bate off-campus rooms. Amenity tags (water, electricity, WiFi) & in-person viewing scheduler. |
| **Events & Hackathons** | `EventsScreen` | Service 06 | Campus hackathons, guest lectures, and student festivals. 1-click RSVP pass generator. |
| **Academic Notes** | `LearningScreen` | Service 07 | Departmental study repository for past exams, lecture slides, and lab manuals. |
| **Local Appointments** | `BookingsScreen` | Service 09 | Thesis binding at Afras Stationery, laptop repairs at Campus Tech, and grooming bookings. |
| **Orders & Tracking** | `OrdersScreen` | Service 04 & 08 | Active order lifecycle (`pending` → `preparing` → `ready`), Telebirr USSD quick-dial code drawer. |
| **Student Profile** | `ProfileScreen` | Service 01 & 10 | Profile details, push alert toggles, Proclamation No. 1321/2024 privacy notice, and sign out. |
| **Authentication** | `LoginScreen` | Core | JWT-authenticated access for students, merchants, and administrators. |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Flutter SDK**: `^3.22.0` (Dart `^3.4.0`)
* **Android SDK**: API Level 34+
* **Java**: JDK 17 (Zulu / OpenJDK)

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Configure API Connection
API base endpoints are defined in `lib/core/api/api_endpoints.dart`:

```dart
// Default: Android Emulator alias to host machine localhost:4000
static const String baseUrl = 'http://10.0.2.2:4000/api/v1';

// For Physical Devices on Campus Wi-Fi / Local Hotspot:
// static const String baseUrl = 'http://192.168.1.XX:4000/api/v1';

// For Cloud Staging / Production:
// static const String baseUrl = 'https://api.campusflow.et/api/v1';
```

### 4. Run the Mobile App
```bash
# Run in debug mode on connected Android device or emulator
flutter run

# Run with custom entry point or target
flutter run -d chrome  # For quick web preview
```

---

## 🧪 Testing & Code Quality

```bash
# Run Flutter Static Analysis
flutter analyze

# Run Unit Tests (Formatters & Financial Precision)
flutter test
```

---

## 📦 Building Production Release APK

To generate an optimized Android APK for student distribution via Telegram:

```bash
flutter build apk --release
```
*Output Artifact:* `build/app/outputs/flutter-apk/app-release.apk`
