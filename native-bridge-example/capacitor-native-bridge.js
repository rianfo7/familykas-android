// capacitor-native-bridge.js
// Letakkan file ini di project web Anda (FamilyKas, Dapur Uni, dll)
// Install dulu di project Capacitor: npm install @capacitor/camera @capacitor/geolocation @capacitor/filesystem
//
// Cara pakai di komponen React/Next.js Anda:
//   import { takePhoto, getCurrentLocation, saveFile } from './capacitor-native-bridge'

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Cek apakah jalan di native app (Capacitor) atau browser biasa
// Penting: pakai ini untuk fallback ke <input type="file"> kalau dibuka di browser desktop
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/**
 * Ambil foto dari kamera atau galeri.
 * Dipakai contoh: upload foto produk di Dapur Uni
 * @param {CameraSource} source - CameraSource.Camera atau CameraSource.Photos
 * @returns {Promise<string>} base64 data URL gambar
 */
export async function takePhoto(source = CameraSource.Camera) {
  if (!isNativeApp()) {
    throw new Error('takePhoto hanya tersedia di native app, gunakan <input type="file"> sebagai fallback di browser');
  }

  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source,
    quality: 80,
    allowEditing: false,
  });

  return photo.dataUrl; // langsung bisa dipakai sebagai src <img> atau di-upload ke Supabase Storage
}

/**
 * Ambil lokasi GPS saat ini.
 * Dipakai contoh: lokasi pengiriman pesanan
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export async function getCurrentLocation() {
  if (!isNativeApp()) {
    // Fallback browser pakai Geolocation Web API standar
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        reject
      );
    });
  }

  const coordinates = await Geolocation.getCurrentPosition();
  return {
    latitude: coordinates.coords.latitude,
    longitude: coordinates.coords.longitude,
    accuracy: coordinates.coords.accuracy,
  };
}

/**
 * Simpan file ke storage device (misal export laporan keuangan FamilyKas).
 * @param {string} fileName - nama file, misal "laporan-juni-2026.csv"
 * @param {string} data - konten file dalam bentuk string (CSV, JSON, base64, dll)
 */
export async function saveFile(fileName, data) {
  if (!isNativeApp()) {
    // Fallback browser: trigger download biasa
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Documents,
  });
}

/**
 * Baca file yang sudah disimpan sebelumnya.
 * @param {string} fileName
 * @returns {Promise<string>}
 */
export async function readFile(fileName) {
  const result = await Filesystem.readFile({
    path: fileName,
    directory: Directory.Documents,
  });
  return result.data;
}
