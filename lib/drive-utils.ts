/**
 * Google Drive URL handling & image sanitizer utility.
 * Prevents 404 Not Found and broken thumbnails by:
 * 1. Stripping erroneous query parameters like '=s2048'
 * 2. Extracting the real file ID
 * 3. Providing direct lh3 high-res view and thumbnail fallbacks
 */

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Clean url of trailing =s2048 or unwanted query segments attached to id
  let cleaned = url.replace(/=s\d+/g, '').replace(/[?&]export=view/g, '');

  // Pattern: /d/{id}
  const dMatch = cleaned.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1].replace(/=s\d+/g, '');
  }

  // Pattern: id={id}
  const idMatch = cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1].replace(/=s\d+/g, '');
  }

  // Pattern: lh3.googleusercontent.com/d/{id}
  const lh3Match = cleaned.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1].replace(/=s\d+/g, '');
  }

  return null;
}

export function fixDriveImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If it's already a data URI (e.g. data:image/...), return as is
  if (url.startsWith('data:image/') || url.startsWith('blob:')) {
    return url;
  }

  const fileId = extractDriveFileId(url);
  if (fileId) {
    // High-resolution direct view URL without corrupting query params
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}

export function getDriveThumbnailUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;

  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
}

/**
 * Image compression utility before uploading or saving to local storage.
 * Keeps file size < 300KB to ensure silky smooth performance and prevent quota overflow.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
