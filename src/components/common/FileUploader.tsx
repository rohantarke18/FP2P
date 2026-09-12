import React, { useState, useRef } from 'react';
import { EvidenceItem } from '../../types';
import { uploadService } from '../../services/uploadService';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Film,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FileUploaderProps {
  files: EvidenceItem[];
  onChange: (files: EvidenceItem[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  helperText?: string;
  className?: string;
}

interface UploadingState {
  id: string;
  name: string;
  progress: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onChange,
  maxFiles = 5,
  maxSizeBytes = 15 * 1024 * 1024, // 15MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'],
  helperText = 'Attach photographic evidence or documentation (JPG, PNG, MP4, PDF up to 15MB)',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingList, setUploadingList] = useState<UploadingState[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxFiles - files.length - uploadingList.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum of ${maxFiles} attachments permitted per submission.`);
      return;
    }

    const selectedFiles = Array.from(fileList).slice(0, availableSlots);

    for (const file of selectedFiles) {
      // Validate type
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.replace('/*', '');
          return file.type.startsWith(prefix);
        }
        return file.type === type;
      });

      if (!isAccepted && acceptedTypes.length > 0) {
        setErrorMessage(`File format "${file.name}" is not supported. Please attach JPG, PNG, MP4, or PDF.`);
        continue;
      }

      // Validate size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" (${uploadService.formatFileSize(file.size)}) exceeds the maximum allowed limit of ${uploadService.formatFileSize(maxSizeBytes)}.`
        );
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setUploadingList((prev) => [...prev, { id: tempId, name: file.name, progress: 10 }]);

      try {
        const uploadedItem = await uploadService.uploadFile(file, (progress) => {
          setUploadingList((prev) =>
            prev.map((item) => (item.id === tempId ? { ...item, progress } : item))
          );
        });

        // Add to main evidence list
        onChange([...files, uploadedItem]);
      } catch (err: any) {
        setErrorMessage(err.message || 'File upload failed. Please try again.');
      } finally {
        setUploadingList((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'video':
        return <Film className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Upload evidence files"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-slate-100 rounded-full text-slate-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium text-slate-800">
            <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
          </div>
          <p className="text-xs text-slate-500 max-w-sm">{helperText}</p>
          <div className="text-[11px] text-slate-400">
            Attached: {files.length} / {maxFiles} files
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-500 hover:text-rose-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Uploading progress items */}
      {uploadingList.length > 0 && (
        <div className="space-y-2">
          {uploadingList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2.5 truncate mr-3">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span className="truncate font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-slate-500 font-mono text-[11px]">{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-white rounded border border-slate-200 text-xs shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate mr-3">
                <div className="p-1.5 bg-slate-100 rounded shrink-0">{getFileIcon(file.type)}</div>
                <div className="truncate">
                  <span className="font-medium text-slate-800 truncate block">{file.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {uploadService.formatFileSize(file.size)} • {file.type.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <button
                  type="button"
                  onClick={() => handleRemove(file.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove attachment"
                  aria-label={`Remove attachment ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
