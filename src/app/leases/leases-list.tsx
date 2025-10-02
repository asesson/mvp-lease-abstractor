'use client';

import { useState, useMemo } from 'react';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { LeaseRow } from './client';
import { SearchBar } from './search-bar';

interface Lease {
  id: string;
  filename: string;
  status: string;
  uploadedAt: Date;
  fileSize: number;
  extractedData: any;
}

interface LeasesListProps {
  leases: Lease[];
}

export function LeasesList({ leases }: LeasesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeases = useMemo(() => {
    if (!searchQuery.trim()) {
      return leases;
    }

    const query = searchQuery.toLowerCase();

    return leases.filter((lease) => {
      const tenant = lease.extractedData?.parties?.tenant?.toLowerCase() || '';
      const landlord = lease.extractedData?.parties?.landlord?.toLowerCase() || '';
      const address = lease.extractedData?.property?.address?.toLowerCase() || '';
      const filename = lease.filename.toLowerCase();

      return (
        tenant.includes(query) ||
        landlord.includes(query) ||
        address.includes(query) ||
        filename.includes(query)
      );
    });
  }, [leases, searchQuery]);

  if (leases.length === 0) {
    return (
      <Card className="p-16 text-center bg-white shadow-lg">
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No leases yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Upload your first lease document to get started with AI-powered abstraction
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Upload Lease
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by tenant, landlord, address, or filename..."
      />

      {filteredLeases.length === 0 ? (
        <Card className="p-12 text-center bg-white shadow-lg">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or{' '}
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              clear the search
            </button>
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700">Tenant Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Filename</TableHead>
                <TableHead className="font-semibold text-gray-700">Uploaded</TableHead>
                <TableHead className="font-semibold text-gray-700">Size</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeases.map((lease) => (
                <TableRow key={lease.id} className="hover:bg-gray-50 transition-colors">
                  <LeaseRow lease={lease} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
