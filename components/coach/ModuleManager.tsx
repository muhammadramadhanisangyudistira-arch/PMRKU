'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DatabaseState, LearningModule } from '@/types/pmr';
import { compressImage } from '@/lib/drive-utils';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import {
  BookOpen,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  FileText,
  ExternalLink,
  Tag,
  ClipboardCopy,
  Image as ImageIcon,
  Upload,
  Check,
  ZoomIn,
  Sparkles,
  Info,
} from 'lucide-react';

interface ModuleManagerProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const ModuleManager: React.FC<ModuleManagerProps> = ({
  db,
  onUpdateDb,
}) => {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);

  // Active tab in edit modal: 'editor' vs 'preview'
  const [modalTab, setModalTab] = useState<'editor' | 'preview'>('editor');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<LearningModule>>({
    title: '',
    category: 'Pertolongan Pertama',
    summary: '',
    content: '',
    fileUrl: '',
    author: db.settings.coachName,
    images: [],
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto clear notification
  useEffect(() => {
    if (pasteNotice) {
      const timer = setTimeout(() => setPasteNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [pasteNotice]);

  const handleOpenAdd = () => {
    setEditingModule(null);
    setModalTab('editor');
    setFormData({
      title: '',
      category: 'Pertolongan Pertama',
      summary: '',
      content: '',
      fileUrl: '',
      author: db.settings.coachName,
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: LearningModule) => {
    setEditingModule(mod);
    setModalTab('editor');
    setFormData({
      ...mod,
      images: mod.images || [],
    });
    setIsModalOpen(true);
  };

  // Process an image file from clipboard or file picker
  const processImageFile = async (file: File) => {
    try {
      setPasteNotice('Mengompres dan memproses gambar...');
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.8);

      const currentImages = formData.images || [];
      const updatedImages = [...currentImages, compressedDataUrl];

      // Insert markdown image tag at cursor in textarea if focused
      let updatedContent = formData.content || '';
      const imgTag = `\n\n![${file.name || 'Ilustrasi Materi'}](${compressedDataUrl})\n\n`;

      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart ?? updatedContent.length;
        const end = textareaRef.current.selectionEnd ?? updatedContent.length;
        updatedContent =
          updatedContent.substring(0, start) +
          imgTag +
          updatedContent.substring(end);
      } else {
        updatedContent += imgTag;
      }

      setFormData((prev) => ({
        ...prev,
        content: updatedContent,
        images: updatedImages,
      }));

      setPasteNotice('✓ Gambar berhasil ditempel dan disisipkan ke materi!');
    } catch (err) {
      console.error('Failed to process pasted image:', err);
      setPasteNotice('Gagal memproses gambar. Pastikan format gambar valid.');
    }
  };

  // Handler onPaste untuk modal dan textarea
  const handlePasteEvent = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
        }
        return;
      }
    }
  };

  // Handler paste tombol clipboard API
  const handleClipboardButton = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const blob = await clipboardItem.getType(type);
              const file = new File([blob], 'pasted_image.png', { type });
              await processImageFile(file);
              return;
            }
          }
        }
        setPasteNotice('Tidak ada gambar di clipboard. Silakan copy gambar terlebih dahulu lalu tekan Ctrl + V.');
      } else {
        setPasteNotice('Silakan tekan tombol Ctrl + V pada keyboard untuk menempel gambar dari clipboard.');
      }
    } catch (err) {
      setPasteNotice('Silakan klik di area teks lalu tekan Ctrl + V untuk menempelkan gambar.');
    }
  };

  // Handler file upload
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      await processImageFile(files[i]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handler Drag and Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          await processImageFile(file);
        }
      }
    }
  };

  const handleInsertImageToContent = (imgUrl: string, idx: number) => {
    const imgTag = `\n\n![Gambar #${idx + 1}](${imgUrl})\n\n`;
    setFormData((prev) => ({
      ...prev,
      content: (prev.content || '') + imgTag,
    }));
    setPasteNotice(`✓ Gambar #${idx + 1} disisipkan ke teks materi`);
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== idxToRemove),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingModule) {
      const updated = db.modules.map((m) =>
        m.id === editingModule.id ? ({ ...m, ...formData } as LearningModule) : m
      );
      onUpdateDb({ ...db, modules: updated });
    } else {
      const newModule: LearningModule = {
        id: `MOD-${Date.now().toString().slice(-4)}`,
        title: formData.title || '',
        category: (formData.category as any) || 'Pertolongan Pertama',
        summary: formData.summary || '',
        content: formData.content || '',
        fileUrl: formData.fileUrl || '',
        author: formData.author || db.settings.coachName,
        uploadDate: new Date().toISOString().split('T')[0],
        images: formData.images || [],
      };
      onUpdateDb({ ...db, modules: [newModule, ...db.modules] });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus modul "${title}"?`)) {
      onUpdateDb({ ...db, modules: db.modules.filter((m) => m.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Materi & Modul Pelatihan PMR ({db.modules.length} Materi)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Panduan kurikulum 7 materi pokok PMI. Dilengkapi dukungan <strong>Copy-Paste Gambar Langsung (Ctrl+V)</strong> dari clipboard.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  {mod.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {mod.uploadDate}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                {mod.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {mod.summary || mod.content.slice(0, 150)}
              </p>

              {mod.images && mod.images.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-bold text-sky-700 bg-sky-50/70 px-2.5 py-1 rounded-lg border border-sky-200/60">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Memiliki {mod.images.length} Gambar / Ilustrasi</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                {mod.author}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedModule(mod)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Baca Modul</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(mod)}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                  title="Edit Modul"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(mod.id, mod.title)}
                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                  title="Hapus Modul"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal (Full View with Markdown and Lightbox) */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-sky-50 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase">
                  {selectedModule.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {selectedModule.title}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Penyusun: {selectedModule.author} • Diunggah {selectedModule.uploadDate}
                </span>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 hover:bg-sky-200/50 rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-slate-800">
              <MarkdownRenderer
                content={selectedModule.content}
                images={selectedModule.images}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal with Copy-Paste Image Support */}
      {isModalOpen && (
        <div
          onPaste={handlePasteEvent}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-600 text-white rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingModule ? 'Edit Materi PMR' : 'Tambah Materi Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bisa menempelkan screenshot/gambar langsung dengan <strong>Ctrl + V</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Tabs: Editor vs Preview */}
                <div className="inline-flex p-0.5 bg-slate-200 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setModalTab('editor')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      modalTab === 'editor'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Edit Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      modalTab === 'preview'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pratinjau Hasil
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Banner when Image is Pasted */}
            {pasteNotice && (
              <div className="p-2.5 px-4 bg-sky-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shrink-0">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{pasteNotice}</span>
                </span>
                <button
                  onClick={() => setPasteNotice(null)}
                  className="text-sky-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form Body */}
            {modalTab === 'editor' ? (
              <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Judul Materi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Contoh: Pertolongan Pertama Pada Luka & Pendarahan"
                  />
                </div>

                {/* Category & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kategori (7 Bidang Pokok PMI)
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as any })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Gerakan Kepalangmerahan">Gerakan Kepalangmerahan</option>
                      <option value="Pertolongan Pertama">Pertolongan Pertama</option>
                      <option value="Perawatan Keluarga">Perawatan Keluarga</option>
                      <option value="Remaja Sehat Peduli Sesama">Remaja Sehat Peduli Sesama</option>
                      <option value="Donor Darah">Donor Darah</option>
                      <option value="Kesiapsiagaan Bencana">Kesiapsiagaan Bencana</option>
                      <option value="Kepemimpinan">Kepemimpinan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Penyusun / Penulis
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ringkasan Singkat Modul
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ringkasan poin utama modul..."
                  />
                </div>

                {/* AREA PASTE GAMBAR INTERAKTIF (DROPZONE) */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="p-4 bg-sky-50/70 border-2 border-dashed border-sky-300 rounded-2xl text-center space-y-2 hover:border-sky-500 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2 text-sky-800 font-black text-xs">
                    <ClipboardCopy className="w-4 h-4 text-sky-600" />
                    <span>Area Tempel Gambar (Copy - Paste Gambar)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 max-w-md mx-auto">
                    Salin gambar apa saja (screenshot / internet / dokumen), lalu tekan tombol{' '}
                    <strong className="text-sky-700 font-mono bg-white px-1.5 py-0.5 rounded border border-sky-200">
                      Ctrl + V
                    </strong>{' '}
                    di halaman ini untuk menempelkan gambar secara otomatis.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleClipboardButton}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      <span>Tempel dari Clipboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pilih Berkas Foto</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* THUMBNAIL DAFTAR GAMBAR YANG DITEMPEL */}
                {formData.images && formData.images.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                        <span>Gambar Ditempel ({formData.images.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Klik tombol di bawah gambar untuk memasukkan ke naskah
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white p-1 flex flex-col justify-between"
                        >
                          <div className="aspect-video overflow-hidden rounded-lg bg-slate-100 relative">
                            <img
                              src={img}
                              alt={`Gambar ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors"
                              title="Hapus gambar ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInsertImageToContent(img, idx)}
                            className="mt-1 w-full py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            + Sisipkan ke Teks
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Isi / Konten Materi *
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Mendukung format Markdown & syntax gambar: <code>![nama](data:...)</code>
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    onPaste={handlePasteEvent}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-xs leading-relaxed"
                    placeholder="Tuliskan materi pedoman praktik...&#10;&#10;Tips: Anda dapat langsung menekan Ctrl + V saat kursor berada di sini untuk menyisipkan gambar!"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Simpan Modul
                  </button>
                </div>
              </form>
            ) : (
              // TAB PRATINJAU HASIL (PREVIEW)
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Ini adalah simulasi tampilan modul yang akan dibaca oleh siswa PMR di portal belajar mereka.
                  </span>
                </div>

                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold text-sky-700 uppercase">
                    {formData.category}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">
                    {formData.title || 'Judul Materi Belum Diisi'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    {formData.summary || 'Tidak ada ringkasan'}
                  </p>
                </div>

                <MarkdownRenderer
                  content={formData.content || '_Belum ada isi materi._'}
                  images={formData.images}
                />

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalTab('editor')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs"
                  >
                    Kembali ke Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
