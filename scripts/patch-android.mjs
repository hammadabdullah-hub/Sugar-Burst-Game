// Run AFTER `npx cap add android` (and safe to re-run).
//
// Fixes the launch crash: @capacitor-community/admob bundles the Google Mobile Ads SDK,
// whose MobileAdsInitProvider runs at process start. Without
// <meta-data com.google.android.gms.ads.APPLICATION_ID> in the manifest the SDK throws
// IllegalStateException ("The Google Mobile Ads SDK was initialized incorrectly") and the
// app dies right after the launch screen.
//
// App ID used: env ADMOB_APP_ID if set, otherwise Google's public SAMPLE app id
// (safe for testing; serves no real ads - the game keeps CONFIG.ads.mode = 'off').
// Set your real AdMob *app* id (ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY) before a Play release.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SAMPLE_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const appId = (process.env.ADMOB_APP_ID || SAMPLE_APP_ID).trim();
if (!/^ca-app-pub-\d{16}~\d{10}$/.test(appId)) {
  console.error(`ADMOB_APP_ID "${appId}" is not a valid AdMob app id (expected ca-app-pub-<16 digits>~<10 digits>).`);
  process.exit(1);
}

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const stringsPath = 'android/app/src/main/res/values/strings.xml';
for (const p of [manifestPath, stringsPath]) {
  if (!existsSync(p)) { console.error(`Missing ${p}. Run "npx cap add android" first.`); process.exit(1); }
}

// 1) strings.xml -> admob_app_id
let strings = readFileSync(stringsPath, 'utf8');
if (/<string name="admob_app_id">/.test(strings)) {
  strings = strings.replace(/(<string name="admob_app_id">)[^<]*(<\/string>)/, `$1${appId}$2`);
} else {
  strings = strings.replace('</resources>', `    <string name="admob_app_id">${appId}</string>\n</resources>`);
}
writeFileSync(stringsPath, strings);

// 2) AndroidManifest.xml -> <meta-data> inside <application>
let manifest = readFileSync(manifestPath, 'utf8');
if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  if (!manifest.includes('</application>')) { console.error('No </application> in manifest.'); process.exit(1); }
  manifest = manifest.replace(
    '</application>',
    '    <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="@string/admob_app_id" />\n    </application>'
  );
  writeFileSync(manifestPath, manifest);
}
console.log(`AdMob app id set (${appId === SAMPLE_APP_ID ? 'Google sample id' : 'custom id'}); manifest patched.`);
