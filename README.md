# WebView App Starter (Capacitor)

Starter project untuk bungkus website (FamilyKas, Dapur Uni, dll) jadi APK
Android, dengan akses kamera/lokasi/file native. Dirancang untuk develop dari
HP via Termux - build APK dilakukan di GitHub Actions, bukan di HP.

## Setup pertama kali (di Termux)

```bash
# 1. Pastikan Node.js terpasang
pkg install nodejs git

# 2. Masuk ke folder project ini, install dependencies
npm install

# 3. Edit capacitor.config.json:
#    - appId: ganti sesuai app (com.rianfo.familykas / com.rianfo.dapuruni)
#    - appName: nama yang muncul di launcher
#    - server.url: URL website yang mau di-wrap

# 4. Generate folder android/ (struktur project native)
npx cap add android

# 5. Sync config ke project android/
npx cap sync android

# 6. Tambahkan permission yang dibutuhkan
#    Lihat ANDROID_PERMISSIONS.md, edit android/app/src/main/AndroidManifest.xml

# 7. Commit semuanya termasuk folder android/
git init
git add .
git commit -m "Initial Capacitor setup"
git remote add origin <url-repo-github-anda>
git push -u origin main
```

PENTING: folder `android/` HARUS di-commit ke git (jangan masukkan ke
.gitignore), karena GitHub Actions butuh folder ini untuk build. Yang
di-gitignore hanya hasil build-nya (`android/app/build/`), bukan source-nya.

## Build APK

Setelah push ke branch `main`, buka tab **Actions** di GitHub repo Anda:

- Workflow **"Build Android APK"** jalan otomatis setiap push, hasilnya
  debug APK (cukup untuk testing, tapi beberapa device perlu izin
  "install dari sumber tidak dikenal" + warning unsigned)
- Workflow **"Build Signed Release APK"** perlu setup keystore dulu
  (lihat `KEYSTORE_SETUP.md`), trigger manual lewat tombol "Run workflow"

Setelah build selesai (sekitar 3-5 menit), scroll ke bagian **Artifacts**
di halaman run tersebut, download file `.zip` yang isinya APK, lalu transfer
ke HP yang mau diinstal.

## Update app setelah ganti URL/config

Setiap kali ubah `capacitor.config.json` (misal ganti URL untuk app keluarga
yang berbeda):

```bash
npx cap sync android
git add .
git commit -m "Update config"
git push
```

Push ini otomatis trigger build APK baru lewat Actions.

## Menambahkan plugin native baru

Kalau butuh fitur native lain (misal notifikasi push, share, dll):

```bash
npm install @capacitor/nama-plugin
npx cap sync android
```

Lihat daftar plugin resmi: https://capacitorjs.com/docs/apis

## Memakai akses kamera/lokasi/file dari kode web Anda

Lihat `native-bridge-example/capacitor-native-bridge.js` - file ini berisi
fungsi siap pakai (`takePhoto`, `getCurrentLocation`, `saveFile`) yang Anda
copy ke project FamilyKas/Dapur Uni Anda. Functions ini otomatis fallback
ke Web API browser biasa kalau dibuka di luar app (misal browser desktop),
jadi kode yang sama tetap jalan di kedua tempat.

## Struktur folder

```
.
├── capacitor.config.json       # config utama: URL, nama app, package ID
├── package.json                  # dependencies Capacitor
├── www/                           # fallback offline page (jarang dipakai karena server.url override)
├── native-bridge-example/         # contoh kode untuk dicopy ke project web Anda
├── .github/workflows/
│   ├── build-apk.yml             # build debug APK otomatis tiap push
│   └── build-release-apk.yml     # build release APK ter-sign (manual trigger)
├── ANDROID_PERMISSIONS.md         # permission yang perlu ditambah manual
├── KEYSTORE_SETUP.md              # cara generate & setup signing key
└── android/                       # folder native, muncul setelah `npx cap add android`
```

## Catatan tentang pendekatan ini vs WebView native murni

Project ini sengaja TIDAK menambahkan fitur seperti fingerprint spoofing,
device lockdown/kiosk paksa, atau kontrol app lain - karena tidak relevan
untuk app pribadi/keluarga dan berisiko disalahgunakan kalau ditambahkan.
Kalau suatu saat butuh kiosk mode legit (misal app dipasang permanen di
tablet dapur untuk Dapur Uni), Android punya cara resmi untuk itu yaitu
Screen Pinning / Lock Task Mode - beda jauh dari Accessibility Service
yang dipakai pendekatan "Forced Run" pada umumnya.
