'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';

interface Lease {
  id: string;
  filename: string;
  status: string;
  uploadedAt: Date;
  fileSize: number;
  extractedData: any;
}

export function LeaseRow({ lease }: { lease: Lease }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!confirm(`Are you sure you want to delete "${lease.filename}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/leases/${lease.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete lease');
      setDeleting(false);
    }
  };

  const tenantName = lease.extractedData?.parties?.tenant || '—';

  return (
    <>
      <TableCell className="font-semibold text-gray-900">{tenantName}</TableCell>
      <TableCell className="text-gray-700">{lease.filename}</TableCell>
      <TableCell className="text-gray-600">{new Date(lease.uploadedAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-gray-600">{(lease.fileSize / 1024 / 1024).toFixed(2)} MB</TableCell>
      <TableCell className="text-right space-x-2">
        <Link
          href={`/leases/${lease.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          View Details
          <span className="text-blue-400">→</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 ml-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
}
