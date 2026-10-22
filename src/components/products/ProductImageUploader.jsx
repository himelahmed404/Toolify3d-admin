'use client';

import { useRef, useState } from 'react';

export default function ProductImageUploader({ value = [], onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const images = Array.isArray(value) ? value : [];

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await fetch('/api/upload/imagebb', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      onChange([...images, ...(json.urls || [])]);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const onDrop = (event) => {
    event.preventDefault();
    if (disabled || uploading) return;
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        disabled={disabled || uploading}
        className="upload-dashed flex w-full flex-col items-center justify-center gap-2 bg-surface-container-lowest px-6 py-10 text-center transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-3xl text-secondary">
          {uploading ? 'progress_activity' : 'add_photo_alternate'}
        </span>
        <span className="font-spec-label text-xs uppercase tracking-wider text-on-surface">
          {uploading ? 'Uploading to ImageBB...' : 'Click or drop images to upload'}
        </span>
        <span className="font-body-md text-xs text-secondary">
          Multiple images supported · First image is the primary
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error ? (
        <div className="border border-error/30 bg-error/10 px-4 py-2 font-spec-label text-xs text-error">
          {error}
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden border border-outline-variant bg-surface-container-lowest"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />

              {index === 0 ? (
                <span className="absolute left-1 top-1 bg-primary-container px-1.5 py-0.5 font-spec-label text-[10px] uppercase text-on-surface">
                  Primary
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move image left"
                    className="flex h-6 w-6 items-center justify-center text-white transition-colors hover:text-primary-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move image right"
                    className="flex h-6 w-6 items-center justify-center text-white transition-colors hover:text-primary-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Remove image"
                  className="flex h-6 w-6 items-center justify-center text-white transition-colors hover:text-error"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
