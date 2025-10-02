'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <td className="font-medium">{tenantName}</td>
      <td className="font-medium">{lease.filename}</td>
      <td>
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            lease.status === 'ready'
              ? 'bg-green-100 text-green-800'
              : lease.status === 'processing'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {lease.status}
        </span>
      </td>
      <td>{new Date(lease.uploadedAt).toLocaleDateString()}</td>
      <td>{(lease.fileSize / 1024 / 1024).toFixed(2)} MB</td>
      <td className="text-right space-x-2">
        <Link
          href={`/leases/${lease.id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          View Details →
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </>
  );
}
