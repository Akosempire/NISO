'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface BulkImportProps {
  onClose: () => void;
  onImport: (file: File) => void;
}

export function BulkImportDialog({ onClose, onImport }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      onImport(file);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Bulk Import Readings</h2>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors mb-4"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drag and drop your CSV file here or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:underline font-medium"
            >
              browse
            </button>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {file && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-green-800">{file.name}</p>
            <p className="text-xs text-green-700">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm text-gray-600">
            Expected format: Equipment Code, Reading Hour, Field1, Field2, ...
          </Label>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
