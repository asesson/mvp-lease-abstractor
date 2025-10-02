import Link from 'next/link';
import { UploadForm } from '@/components/upload-form';
import { FileText, Upload, Sparkles, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">Tydal Lease Abstracts</h1>
          </div>
          <Link
            href="/leases"
            className="text-sm text-blue-600 hover:underline"
          >
            View All Leases
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Lease Abstraction
          </h2>
          <p className="text-lg text-gray-600">
            Upload your lease documents and extract structured data in seconds.
            Review, edit, and export to PDF or calendar events.
          </p>
        </div>

        <UploadForm />

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Upload</h3>
            <p className="text-sm text-gray-600">
              Drop your PDF or DOCX lease document
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Extract</h3>
            <p className="text-sm text-gray-600">
              AI analyzes and extracts key fields
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Export</h3>
            <p className="text-sm text-gray-600">
              Download PDF abstracts and ICS calendar files
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
