import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePDF } from '@/lib/pdf-generator';
import { LeaseAbstract } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: params.id },
    });

    if (!lease || !lease.extractedData) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    const abstract = lease.extractedData as LeaseAbstract;
    const pdfBuffer = await generatePDF(abstract);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lease-abstract-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
