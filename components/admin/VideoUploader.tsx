'use client';

import * as React from 'react';
import { Upload, RefreshCw, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateVideoFile } from '@/lib/utils/validation';
import { adminApi } from '@/lib/api';
import type { VideoUploadResponse } from '@/lib/types';

export interface VideoUploaderProps {
  existingVideoUrl?: string;
  existingThumbnailUrl?: string;
  onUploadComplete: (response: VideoUploadResponse) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function VideoUploader({
  existingVideoUrl,
  existingThumbnailUrl,
  onUploadComplete,
}: VideoUploaderProps) {
  const [status, setStatus] = React.useState<UploadStatus>('idle');
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(
    existingThumbnailUrl ?? null
  );
  const [videoUrl, setVideoUrl] = React.useState<string | null>(
    existingVideoUrl ?? null
  );
  const [isDragOver, setIsDragOver] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = React.useCallback((file: File) => {
    setValidationError(null);
    setError(null);

    const validation = validateVideoFile(file.type, file.size);
    if (!validation.valid) {
      setValidationError(validation.error ?? 'File tidak valid');
      return;
    }

    setSelectedFile(file);
    startUpload(file);
  }, []);

  const startUpload = React.useCallback(async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      const response = await adminApi.uploadVideo(file, (percentage) => {
        setProgress(percentage);
      });

      setStatus('success');
      setThumbnailUrl(response.thumbnailUrl);
      setVideoUrl(response.videoUrl);
      onUploadComplete(response);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengunggah video. Silakan coba lagi.'
      );
    }
  }, [onUploadComplete]);

  const handleRetry = React.useCallback(() => {
    if (selectedFile) {
      startUpload(selectedFile);
    }
  }, [selectedFile, startUpload]);

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input value so same file can be re-selected
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const handleButtonClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleReplaceVideo = React.useCallback(() => {
    setStatus('idle');
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    setValidationError(null);
    fileInputRef.current?.click();
  }, []);

  const showExistingVideo = (existingVideoUrl || videoUrl) && status !== 'uploading';
  const showDropzone = !showExistingVideo || status === 'idle';

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Pilih file video"
      />

      {/* Success state: show thumbnail preview */}
      {status === 'success' && thumbnailUrl && (
        <div className="space-y-3">
          <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
            <img
              src={thumbnailUrl}
              alt="Thumbnail video"
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
              <p className="text-sm text-white truncate flex items-center gap-2">
                <Film className="h-4 w-4 shrink-0" />
                {videoUrl}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReplaceVideo}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4" />
            Ganti Video
          </Button>
        </div>
      )}

      {/* Existing video (before new upload) */}
      {existingVideoUrl && status === 'idle' && !validationError && (
        <div className="space-y-3">
          {existingThumbnailUrl && (
            <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
              <img
                src={existingThumbnailUrl}
                alt="Thumbnail video saat ini"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                <p className="text-sm text-white truncate flex items-center gap-2">
                  <Film className="h-4 w-4 shrink-0" />
                  {existingVideoUrl}
                </p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleReplaceVideo}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4" />
            Ganti Video
          </Button>
        </div>
      )}

      {/* Dropzone: shown when no existing video or during idle without existing */}
      {!existingVideoUrl && status === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Area drag-and-drop untuk upload video. Klik atau seret file ke sini."
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleButtonClick();
            }
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary-600 bg-primary-50'
              : 'border-border hover:border-primary-400 hover:bg-muted/50'
          }`}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Seret file video ke sini
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              atau klik untuk memilih file
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
          >
            Pilih File
          </Button>
          <p className="text-xs text-muted-foreground">
            Format: MP4, WebM • Maks: 500MB
          </p>
        </div>
      )}

      {/* Upload progress bar */}
      {status === 'uploading' && (
        <div className="space-y-2" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">Mengunggah...</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress upload video"
          >
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {selectedFile && (
            <p className="text-xs text-muted-foreground truncate">
              {selectedFile.name}
            </p>
          )}
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
          aria-live="assertive"
        >
          <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{validationError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleButtonClick}
            >
              Pilih File Lain
            </Button>
          </div>
        </div>
      )}

      {/* Upload error with retry */}
      {status === 'error' && error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
          aria-live="assertive"
        >
          <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleRetry}
            >
              <RefreshCw className="h-3 w-3" />
              Coba Lagi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
