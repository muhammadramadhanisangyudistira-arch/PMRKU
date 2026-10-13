'use client';

import React, { useState, useRef } from 'react';
import { compressImage } from '@/lib/drive-utils';
import { Camera, Upload, RefreshCw, X, Check } from 'lucide-react';

interface PhotoUploadProps {
  label: string;
  currentPhotoUrl?: string;
  onPhotoSelected: (dataUrl: string) => void;
  aspectRatio?: 'portrait' | 'square';
  allowCamera?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  label,
  currentPhotoUrl,
  onPhotoSelected,
  aspectRatio = 'portrait',
  allowCamera = true,
}) => {
  const [preview, setPreview] = useState<string>(currentPhotoUrl || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 800, 0.85);
      setPreview(compressed);
      onPhotoSelected(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if front camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    onPhotoSelected(dataUrl);
    stopCamera();
  };

  const clearPhoto = () => {
    setPreview('');
    onPhotoSelected('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">{label}</label>

      {/* Live Camera View */}
      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border border-slate-700 shadow-lg">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          {cameraError ? (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-red-400 text-xs font-semibold mb-3">{cameraError}</p>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs"
              >
                Tutup Kamera
              </button>
            </div>
          ) : (
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
              <button
                type="button"
                onClick={capturePhoto}
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg border-2 border-white transition-all transform active:scale-95"
                title="Ambil Foto"
              >
                <Camera className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                title="Batal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Photo Preview Thumbnail */}
          <div
            className={`relative rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-xs shrink-0 ${
              aspectRatio === 'portrait' ? 'w-24 h-32' : 'w-24 h-24'
            }`}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full"
                  title="Hapus foto"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium text-center p-1">
                Belum ada foto
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas</span>
            </button>

            {allowCamera && (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto Kamera Langsung</span>
              </button>
            )}
            <span className="text-[10px] text-slate-400">
              Format: JPG/PNG, ukuran otomatis dioptimasi.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
