import Link from 'next/link';
import { prisma } from '@/lib/db';
import { FileText, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { LeaseRow } from './client';

export const dynamic = 'force-dynamic';

async function getLeases() {
  return await prisma.lease.findMany({
    orderBy: { uploadedAt: 'desc' },
  });
}

export default async function LeasesPage() {
  const leases = await getLeases();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">Tydal Lease Abstracts</h1>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to Upload
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">All Leases</h2>
          <p className="text-gray-600">
            View and manage all uploaded lease documents
          </p>
        </div>

        {leases.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leases yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first lease document to get started
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Lease
            </Link>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant Name</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => (
                  <TableRow key={lease.id}>
                    <LeaseRow lease={lease} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}
