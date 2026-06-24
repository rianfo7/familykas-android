# Setup Signing Key untuk Release APK

APK debug (dari build-apk.yml) bisa langsung diinstal tapi Android kadang
membatasi atau memberi warning "unsigned/untrusted" pada beberapa device.
Untuk APK yang dipasang permanen di HP keluarga, sebaiknya pakai release APK
yang ter-sign dengan keystore sendiri.

## 1. Generate keystore (sekali saja, simpan baik-baik)

Jalankan di Termux (butuh `keytool`, biasanya ikut paket `openjdk-17`):

```bash
pkg install openjdk-17
keytool -genkeypair -v \
  -keystore release.keystore \
  -alias familyapp \
  -keyalg RSA -keysize 2048 -validity 10000
```

Anda akan diminta:
- Password keystore (INGAT baik-baik, tidak bisa di-reset)
- Nama, organisasi, dll (boleh asal-asalan untuk app pribadi)
- Password key alias (boleh sama dengan password keystore)

PENTING: simpan file `release.keystore` ini di tempat aman (misal Google Drive
pribadi yang terenkripsi, atau password manager). Kalau hilang, Anda tidak
bisa update APK yang sudah terinstal tanpa uninstall dulu - Android menolak
update APK kalau signing key-nya berbeda dari versi terinstal.

## 2. Convert keystore ke base64

GitHub Secrets hanya menerima text, jadi keystore (file binary) perlu di-encode:

```bash
base64 -w 0 release.keystore > release.keystore.base64.txt
cat release.keystore.base64.txt
```

Copy seluruh output (satu baris panjang).

## 3. Tambahkan ke GitHub Secrets

Di halaman repo GitHub Anda:
Settings > Secrets and variables > Actions > New repository secret

Buat 4 secrets ini:

| Name                       | Value                                      |
|-----------------------------|---------------------------------------------|
| ANDROID_KEYSTORE_BASE64     | isi dari release.keystore.base64.txt        |
| ANDROID_KEYSTORE_PASSWORD   | password keystore yang Anda buat di step 1  |
| ANDROID_KEY_ALIAS           | familyapp (atau alias yang Anda pakai)      |
| ANDROID_KEY_PASSWORD        | password key alias                          |

## 4. Trigger build release

Setelah secrets terpasang, buka tab Actions di GitHub repo Anda, pilih
workflow "Build Signed Release APK", klik "Run workflow" untuk trigger manual.

APK hasil build bisa didownload di halaman run tersebut, bagian "Artifacts".

## Catatan keamanan

- Jangan pernah commit file .keystore mentah ke git (sudah di-block via
  .gitignore, tapi tetap hati-hati)
- File release.keystore.base64.txt di HP Anda juga sebaiknya dihapus setelah
  disimpan ke GitHub Secrets, atau minimal jangan ikut ter-commit
- Keystore ini private untuk app keluarga Anda - tidak perlu dan tidak boleh
  dibagikan ke siapapun, beda dengan keystore untuk app Play Store yang biasa
  dikelola oleh Play App Signing
