import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { LeaseDetailClient } from './client';

export const dynamic = 'force-dynamic';

async function getLease(id: string) {
  return await prisma.lease.findUnique({
    where: { id },
  });
}

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  return <LeaseDetailClient lease={lease} />;
}
