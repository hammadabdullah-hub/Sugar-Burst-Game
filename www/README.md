# Sugar Burst - build the Android app

Needs: Node 18+, Android Studio (with an Android SDK), a Google AdMob account.
Change appId in capacitor.config.json if you want a different package name (it cannot change after publishing).

## 1. One-time setup
    npm install
    npx cap add android

## 2. AdMob
1. admob.google.com > Apps > Add app (Android). Copy the App ID (ca-app-pub-XXXX~YYYY).
2. Create two ad units: Rewarded and Interstitial. Copy their IDs (ca-app-pub-XXXX/ZZZZ).
3. Open android/app/src/main/AndroidManifest.xml and inside <application> add:
       <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXX~YYYY"/>
4. In www/index.html set CONFIG.ads: androidAppId, prodUnits.rewarded, prodUnits.interstitial, and privacyPolicyUrl.
5. FIRST test with mode:'test' (Google test ads). Only switch to mode:'production' for the release build.

## 3. Firebase (optional, for analytics and crash reports)
Create a Firebase project, add the Android app with the same package name, download google-services.json into android/app/. Follow https://github.com/capawesome-team/capacitor-firebase for the Gradle lines.

## 4. Build and run
    npm run sync
    npm run open     (opens Android Studio; press Run with a phone connected)

Every time you change the game, copy the new file over www/index.html and run npm run sync.

## 5. Release
Android Studio > Build > Generate Signed App Bundle (.aab) > upload to Google Play Console.
Fill the Data safety form and the Families/target-audience questions before submitting.

## Before you build for Google Play (added by the pre-release audit)

1. **Target API 36 is required.** Google Play now requires new apps and updates to target Android 16 (API 36). Capacitor 6 does not; this project's `package.json` was moved to Capacitor 8 (`^8.5.0`; AdMob plugin `^8.2.0`, which asks for Capacitor 8.5+). Capacitor 8 needs Node 22+ and Android Studio Otter (2025.2.1) or newer. The other `@capacitor/*` and `@capacitor-firebase/*` plugins are set to `^8.0.0` by convention - this was NOT verified (no network for npm in the audit environment). Run `npm install`, then `npx cap add android` and `npx cap sync`; if a plugin has no Capacitor 8 release, remove it or pick a version that does. Confirm `targetSdkVersion = 36` in `android/variables.gradle`.
2. **Lock to portrait.** The board is unusable in landscape on a phone (board shrinks to ~60px). After `npx cap add android`, add `android:screenOrientation="portrait"` to the `<activity>` in `android/app/src/main/AndroidManifest.xml`.
3. **Check permissions in the built app.** The game itself needs only INTERNET. Local notifications add POST_NOTIFICATIONS; AdMob adds the advertising-ID permission. Check the merged manifest (Android Studio > AndroidManifest.xml > Merged Manifest) and remove anything you do not use, and answer the Play Console "Advertising ID" declaration to match.
4. **Fill the placeholders only with your own values:** `CONFIG.ads` IDs, `privacyPolicyUrl` (must be https and publicly reachable), remove-ads product id. Ads stay `mode:'off'` until you set them.
5. **16 KB page size:** from 1 Feb 2027 Play refuses uploads with native code lacking 16 KB page-size support - use current plugin/SDK versions.
