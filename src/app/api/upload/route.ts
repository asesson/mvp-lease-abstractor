import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/db';
import { extractLeaseAbstractOpenAI } from '@/lib/extractor-openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Create database record with "processing" status
    const lease = await prisma.lease.create({
      data: {
        filename: file.name,
        fileSize: file.size,
        filePath: filepath,
        status: 'processing',
      },
    });

    // Start extraction process (synchronous for MVP)
    try {
      const extractedData = await extractLeaseAbstractOpenAI(filepath, file.name);

      // Update lease with extracted data
      await prisma.lease.update({
        where: { id: lease.id },
        data: {
          status: 'ready',
          extractedData: extractedData as any,
        },
      });
    } catch (error) {
      console.error('Extraction failed:', error);
      await prisma.lease.update({
        where: { id: lease.id },
        data: {
          status: 'error',
          errorMessage:
            error instanceof Error ? error.message : 'Extraction failed',
        },
      });
    }

    return NextResponse.json({ leaseId: lease.id, status: 'processing' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
