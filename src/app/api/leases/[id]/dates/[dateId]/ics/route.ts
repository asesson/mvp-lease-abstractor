import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateICS } from '@/lib/ics-generator';
import { LeaseAbstract } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; dateId: string } }
) {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: params.id },
    });

    if (!lease || !lease.extractedData) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    const abstract = lease.extractedData as LeaseAbstract;
    const dateIndex = parseInt(params.dateId);

    if (
      isNaN(dateIndex) ||
      dateIndex < 0 ||
      dateIndex >= abstract.critical_dates.length
    ) {
      return NextResponse.json(
        { error: 'Critical date not found' },
        { status: 404 }
      );
    }

    const criticalDate = abstract.critical_dates[dateIndex];
    const icsContent = generateICS(
      criticalDate.label,
      criticalDate.date,
      criticalDate.notes
    );

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="lease-${params.id}-${criticalDate.label.replace(/\s+/g, '-')}.ics"`,
      },
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ICS file' },
      { status: 500 }
    );
  }
}
