import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { extractedData } = body;

    const updatedLease = await prisma.lease.update({
      where: { id },
      data: {
        extractedData: extractedData as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update lease' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the lease to get the file path
    const lease = await prisma.lease.findUnique({
      where: { id },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    // Delete the physical file
    try {
      await unlink(lease.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue even if file deletion fails
    }

    // Delete the database record
    await prisma.lease.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lease' },
      { status: 500 }
    );
  }
}
