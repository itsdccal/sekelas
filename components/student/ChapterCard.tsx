'use client';

import React from 'react';
import { Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getChapterVisualConfig } from '@/lib/utils/chapterStatus';
import { Button } from '@/components/ui/button';
import type { Chapter } from '@/lib/types/curriculum';
import type { ChapterStatus } from '@/lib/types/progress';

export interface ChapterCardProps {
  chapter: Chapter;
  status: ChapterStatus;
  onClick: (chapterId: string) => void;
}

function StatusIcon({ status }: { status: ChapterStatus }) {
  switch (status) {
    case 'LOCKED':
      return <Lock className="h-5 w-5 text-gray-400" aria-label="Chapter terkunci" />;
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-600" aria-label="Chapter selesai" />;
    case 'REMEDIATION_REQUIRED':
      return <AlertTriangle className="h-5 w-5 text-red-500" aria-label="Perlu tonton ulang video" />;
    case 'READY_FOR_RETAKE':
      return <RefreshCw className="h-5 w-5 text-yellow-600" aria-label="Siap kuis ulang" />;
    case 'UNLOCKED':
    default:
      return null;
  }
}

export function ChapterCard({ chapter, status, onClick }: ChapterCardProps) {
  const config = getChapterVisualConfig(status);

  const handleClick = () => {
    if (config.clickable && status !== 'READY_FOR_RETAKE') {
      onClick(chapter.id);
    }
  };

  const handleRetakeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(chapter.id);
  };

  return (
    <div
      role="button"
      tabIndex={config.clickable ? 0 : -1}
      aria-disabled={!config.clickable}
      aria-label={`${chapter.name}${!config.clickable ? ' (terkunci)' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && config.clickable && status !== 'READY_FOR_RETAKE') {
          e.preventDefault();
          onClick(chapter.id);
        }
      }}
      className={cn(
        'relative flex items-center gap-4 rounded-lg border p-4 transition-colors',
        config.className,
        config.clickable && status !== 'READY_FOR_RETAKE' && 'cursor-pointer hover:bg-accent/50',
        !config.clickable && 'cursor-not-allowed',
      )}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        <StatusIcon status={status} />
      </div>

      {/* Chapter info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {chapter.name}
        </p>

        {status === 'REMEDIATION_REQUIRED' && (
          <p className="mt-1 text-xs text-red-600">
            Tonton ulang video sebelum kuis ulang
          </p>
        )}
      </div>

      {/* Retake button for READY_FOR_RETAKE */}
      {status === 'READY_FOR_RETAKE' && (
        <Button
          size="sm"
          variant="default"
          onClick={handleRetakeClick}
          className="flex-shrink-0"
          aria-label="Kerjakan Kuis Kembali"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Kerjakan Kuis Kembali
        </Button>
      )}
    </div>
  );
}
