import { useRef, useState, useCallback } from 'react';
import { UploadCloud, ImageIcon, X } from 'lucide-react';
import { validateImageFile, formatBytes } from '@/lib/config';

interface ImageUploadProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onClear: () => void;
  previewUrl: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelected,
  onClear,
  previewUrl,
  fileName,
  fileSize,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const v = validateImageFile(file);
      if (!v.ok) {
        setError(v.error ?? 'Invalid file.');
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    },
    [onImageSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  return (
    <div className="flex flex-col gap-3">
      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              inputRef.current?.click();
            }
          }}
          className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver
              ? 'border-brand-500 bg-brand-50'
              : 'border-brand-200 bg-white hover:border-brand-400 hover:bg-brand-50/50'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110">
            <UploadCloud className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-display text-lg font-700 text-brand-900">
              Drag &amp; drop an image
            </p>
            <p className="mt-1 text-sm text-brand-600">
              or <span className="font-600 text-brand-700">browse files</span>
            </p>
          </div>
          <p className="text-xs text-brand-500/80">
            JPG, PNG, or WebP · up to 10 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Selected"
              className="h-72 w-full object-cover"
            />
            <button
              onClick={onClear}
              disabled={disabled}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-soft backdrop-blur transition hover:bg-white disabled:opacity-50"
              aria-label="Remove image"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="flex items-center gap-3 border-t border-black/[0.05] px-5 py-3.5">
            <ImageIcon className="h-4.5 w-4.5 text-brand-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-600 text-brand-900">{fileName}</p>
              {fileSize != null && (
                <p className="text-xs text-brand-500">{formatBytes(fileSize)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-500 text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
