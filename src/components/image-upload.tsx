'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizeMB = 10,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        setError(`ניתן להעלות עד ${maxFiles} תמונות`);
        return;
      }
      const toUpload = list.slice(0, remaining);
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        toUpload.forEach((file) => formData.append('file', file));
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ההעלאה נכשלה');
        const newUrls = [...value, ...(data.urls || [])].slice(0, maxFiles);
        onChange?.(newUrls);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'שגיאה בהעלאת תמונות');
      } finally {
        setUploading(false);
      }
    },
    [value.length, maxFiles, onChange]
  );

  const remove = useCallback(
    (index: number) => {
      const next = value.filter((_, i) => i !== index);
      onChange?.(next);
    },
    [value, onChange]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-4">
        {value.map((url, i) => (
          <div
            key={url}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary group"
          >
            <Image
              src={url}
              alt={`תמונה ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 400px) 50vw, 200px"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label="הסר תמונה"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {value.length < maxFiles && (
          <label
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
              'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors min-h-[120px]',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              uploading && 'pointer-events-none opacity-70'
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={onInputChange}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <span className="text-xs font-bold text-muted-foreground">
              {uploading ? 'מעלה...' : 'העלה תמונות'}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              עד {maxFiles} תמונות, עד {maxSizeMB}MB
            </span>
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
