import Link from 'next/link';
import { UploadForm } from '@/components/upload-form';
import { FileText, Upload, Sparkles, Download, Clock, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lease Abstractor
            </h1>
          </div>
          <Link
            href="/leases"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            View All Leases
            <span className="text-blue-400">→</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Lease Analysis
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent leading-tight">
            Extract Lease Data in Seconds
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload your commercial lease documents and let AI instantly extract all key terms, dates,
            and obligations into a structured format ready for review.
          </p>
        </div>

        {/* Upload Form */}
        <UploadForm />

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Simple Upload</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Drag and drop your PDF or DOCX lease documents. Supports files up to 10MB.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fast Processing</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              AI analyzes and extracts key fields, dates, and terms in under 30 seconds.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Export Options</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Download formatted PDF abstracts or import critical dates to your calendar.
            </p>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-gray-600 text-sm">
            <Shield className="h-4 w-4" />
            <span>Your data is encrypted and secure. We never share your documents.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
