# Permission yang perlu ditambahkan manual

Setelah jalankan `npx cap add android`, file ini akan muncul di:
android/app/src/main/AndroidManifest.xml

Tambahkan baris berikut di DALAM tag <manifest>, SEBELUM tag <application>:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

<uses-feature android:name="android.hardware.camera" android:required="false" />
```

Catatan:
- INTERNET wajib ada karena app ini load website live (server.url di capacitor.config.json)
- maxSdkVersion="32" pada storage permission karena Android 13+ (API 33+) pakai
  scoped storage, permission lama tidak diperlukan lagi di versi itu
- Jangan tambahkan permission yang tidak dipakai - setiap permission yang
  diminta akan ditanyakan ke user saat pertama buka app, semakin sedikit
  semakin baik untuk trust user

Hanya minta izin (CAMERA, ACCESS_FINE_LOCATION) yang benar-benar dipakai oleh
fitur app Anda. Kalau Dapur Uni butuh kamera tapi tidak butuh lokasi, hapus
baris ACCESS_FINE_LOCATION/ACCESS_COARSE_LOCATION.
