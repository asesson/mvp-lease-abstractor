'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF or DOCX file');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      router.push(`/leases/${data.leaseId}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <Card
        className={`p-12 border-2 border-dashed transition-all duration-200 bg-white shadow-lg ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          {file ? (
            <>
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="border-gray-300"
                >
                  Remove
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting Data...
                    </>
                  ) : (
                    'Extract Lease Data'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-full">
                <Upload className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your lease document here
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  or click to browse your files
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Supports PDF and DOCX files • Max size 10MB
                </p>
              </div>
              <input
                type="file"
                id="file-input-upload"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleChange}
              />
              <label
                htmlFor="file-input-upload"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 h-9 py-2 text-white"
              >
                Choose File
              </label>
            </>
          )}
        </div>
      </Card>
    </form>
  );
}
