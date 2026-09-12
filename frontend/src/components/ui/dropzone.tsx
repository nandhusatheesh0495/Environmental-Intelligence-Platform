import * as React from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, FileCheck, X, AlertCircle } from "lucide-react";

export interface DropZoneProps {
  label: string;
  description?: string;
  acceptedTypes?: string[];
  maxSizeMb?: number;
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
  error?: string;
  disabled?: boolean;
}

export function DropZone({
  label,
  description = "Supports GeoTIFF, PNG, or JPEG up to 25MB",
  acceptedTypes = ["image/png", "image/jpeg", "image/tiff", ".tif", ".tiff", ".geotiff"],
  maxSizeMb = 25,
  onFileSelect,
  selectedFile,
  error,
  disabled = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [internalError, setInternalError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setInternalError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setInternalError(`File size exceeds maximum threshold of ${maxSizeMb}MB.`);
      return;
    }
    onFileSelect?.(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    setInternalError(null);
    onFileSelect?.(null);
  };

  const displayError = error || internalError;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {selectedFile && (
          <span className="text-[11px] text-accent-800 font-medium">Ready for validation</span>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer text-center",
          isDragOver && "border-accent-700 bg-accent-50/50 ring-2 ring-accent-700/20",
          selectedFile && "border-accent-600 bg-accent-50/20",
          displayError && "border-red-400 bg-red-50/30",
          disabled && "cursor-not-allowed opacity-60 hover:bg-slate-50/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-label={label}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 w-full justify-between px-2">
            <div className="flex items-center gap-2.5 text-left truncate">
              <div className="h-8 w-8 rounded bg-accent-100 text-accent-800 flex items-center justify-center shrink-0">
                <FileCheck className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Click to upload or drag & drop
              </p>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium pt-0.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
}
