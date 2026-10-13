'use client';

import React, { useState } from 'react';
import { Eye, X, ZoomIn } from 'lucide-react';
import { DriveImage } from './DriveImage';

interface MarkdownRendererProps {
  content: string;
  images?: string[];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  images = [],
}) => {
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  // Parse markdown images: ![alt](url)
  const renderFormattedContent = () => {
    if (!content) return null;

    // Regular expression to match ![alt](url)
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(content)) !== null) {
      // Text before image
      if (match.index > lastIndex) {
        const textChunk = content.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textChunk}
          </span>
        );
      }

      const altText = match[1] || 'Gambar Materi';
      const imgSrc = match[2];

      parts.push(
        <span
          key={`img-${match.index}`}
          className="my-3 block text-center"
        >
          <span
            onClick={() => setZoomImg(imgSrc)}
            className="inline-block relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 shadow-md hover:border-sky-500 transition-all max-w-full"
          >
            <img
              src={imgSrc}
              alt={altText}
              className="max-h-80 sm:max-h-96 object-contain rounded-xl mx-auto bg-slate-50"
            />
            <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 rounded-xl">
              <ZoomIn className="w-4 h-4" />
              <span>Klik untuk Perbesar</span>
            </span>
          </span>
          {altText && altText !== 'Gambar' && (
            <span className="block text-[11px] text-slate-500 italic mt-1.5">
              Ilustrasi: {altText}
            </span>
          )}
        </span>
      );

      lastIndex = imgRegex.lastIndex;
    }

    // Remaining text after last image
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-end`} className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* Main Content with parsed Markdown images */}
      <div className="leading-relaxed whitespace-pre-wrap font-sans text-slate-800 text-xs sm:text-sm">
        {renderFormattedContent()}
      </div>

      {/* Gallery Section if images array exists and not all embedded */}
      {images && images.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
            <span>Galeri Lampiran Foto & Ilustrasi ({images.length} Gambar)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setZoomImg(imgSrc)}
                className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-video flex items-center justify-center cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                <img
                  src={imgSrc}
                  alt={`Lampiran ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                  <ZoomIn className="w-4 h-4" />
                  <span>Lihat Full</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
          >
            <button
              onClick={() => setZoomImg(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/70 hover:bg-black text-white rounded-full shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImg}
              alt="Zoomed Illustration"
              className="max-h-[82vh] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
