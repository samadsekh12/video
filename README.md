Features
Calculator UI

Basic arithmetic: +, −, ×, ÷, %, decimal point

Clear (C) and Equals (=) buttons

Banner ad at the bottom (test IDs by default)

Hidden Vault

Trigger by long-pressing = or entering a secret PIN

Optional biometric unlock via AndroidX Biometric

Import/export files through Storage Access Framework

AES-256/GCM encryption with unique IV per file

Keys stored in Android Keystore

Encrypted Room database for metadata (filename, size, timestamp, full path)

Offline-First & Security

No server or cloud sync—data lives in filesDir

Configurable auto-lock after inactivity

Decrypted temp files wiped immediately

Permissions: SAF + biometric; internet disabled for vault operations

Google AdMob Integration

Banner ads on calculator screen

Interstitial ads on non-sensitive flows (vault exit, post-import/export)

No ads inside PIN entry, file browsing, encryption/decryption screens

Compliant with Google Play Ads Policy

Requirements
Android Studio Flamingo or later

Kotlin 1.8.0

Minimum SDK 23, Target SDK 33

Installation
Clone the repository

bash
git clone https://github.com/your-org/CalcVault.git
cd CalcVault/app
Open in Android Studio

Choose Open an existing Android Studio project

Select the app/ folder

Sync Gradle and build the project

Let Android Studio download all dependencies

Build and run on a device or emulator

Calculator screen appears with a test banner ad

Long-press = or enter PIN to unlock the vault

Configuration
All AdMob IDs in this project are Google’s sample IDs for testing. Replace them with your own before releasing to the Play Store.

App ID in AndroidManifest.xml

xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713"/>
Banner Ad Unit in res/layout/activity_main.xml

xml
ads:adUnitId="ca-app-pub-3940256099942544/6300978111"
Interstitial Ad Unit in VaultActivity.kt

kotlin
InterstitialAd.load(
  this,
  "ca-app-pub-3940256099942544/1033173712",
  AdRequest.Builder().build(),
  callback
)
After replacing, rebuild and verify real ads appear in release builds only.

Privacy Policy
A sample privacy policy (PrivacyPolicy.html) should be included in your Play Store listing. It must state:

Ads are served via Google AdMob

No user data is uploaded or shared

All vault data is encrypted locally and never leaves the device

If targeting EU or CA users, integrate a GDPR/CCPA consent flow before loading ads.

Testing
Unit tests

Calculator logic (computeResult)

Encryption/Decryption (EncryptionUtils.encryptUri & decryptFile)

Instrumentation tests

SAF import/export flows

Room database operations

Vault lock/unlock behavior

Run tests with:

bash
./gradlew testDebugUnitTest
./gradlew connectedDebugAndroidTest
Project Structure
Code
app/
├─ build.gradle
├─ proguard-rules.pro
└─ src/
   └─ main/
      ├─ AndroidManifest.xml
      ├─ java/com/example/calcvault/
      │  ├─ MainActivity.kt
      │  ├─ VaultActivity.kt
      │  ├─ utils/EncryptionUtils.kt
      │  └─ data/
      │     ├─ AppDatabase.kt
      │     ├─ FileMetadata.kt
      │     ├─ FileMetadataDao.kt
      │     └─ EncryptedConverter.kt
      └─ res/
         ├─ layout/
         │  ├─ activity_main.xml
         │  ├─ activity_vault.xml
         │  └─ item_file.xml
         └─ values/
            ├─ colors.xml
            ├─ strings.xml
            └─ themes.xml
Contributing
Contributions are welcome. Please:

Fork the repository

Create a feature branch (git checkout -b feature/YourFeature)

Commit your changes (git commit -m 'Add YourFeature')

Push to the branch (git push origin feature/YourFeature)

Open a pull request

License
This project is licensed under the MIT License. See LICENSE for details.
