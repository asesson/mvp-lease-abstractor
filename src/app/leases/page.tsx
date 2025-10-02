import Link from 'next/link';
import { prisma } from '@/lib/db';
import { FileText, ArrowLeft, Plus } from 'lucide-react';
import { LeasesList } from './leases-list';

export const dynamic = 'force-dynamic';

async function getLeases() {
  return await prisma.lease.findMany({
    orderBy: { uploadedAt: 'desc' },
  });
}

export default async function LeasesPage() {
  const leases = await getLeases();

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
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Leases</h2>
            <p className="text-gray-600">
              View and manage all uploaded lease documents
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Lease
          </Link>
        </div>

        <LeasesList leases={leases} />
      </main>
    </div>
  );
}
