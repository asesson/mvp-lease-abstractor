import fs from 'fs/promises';

// Use require for CommonJS module
const pdfParse = require('pdf-parse');

async function extractPDFText(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);

  return pdfData.text;
}

/**
 * Intelligently truncate lease document text to fit within token limits
 * Prioritizes important sections like parties, property details, and key terms
 */
function smartTruncateLeaseText(text: string, maxChars: number = 80000): string {
  if (text.length <= maxChars) {
    return text;
  }

  // Try to identify key sections in the lease
  const sections = {
    intro: '',
    parties: '',
    premises: '',
    term: '',
    rent: '',
    options: '',
    dates: '',
    rest: ''
  };

  // Split by common lease section patterns
  const lines = text.split('\n');
  let currentSection = 'intro';
  let charCount = 0;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Identify section markers
    if (lowerLine.includes('parties') || lowerLine.includes('landlord') || lowerLine.includes('tenant')) {
      currentSection = 'parties';
    } else if (lowerLine.includes('premises') || lowerLine.includes('property') || lowerLine.includes('demised')) {
      currentSection = 'premises';
    } else if (lowerLine.includes('term') && !lowerLine.includes('termination')) {
      currentSection = 'term';
    } else if (lowerLine.includes('rent') || lowerLine.includes('payment')) {
      currentSection = 'rent';
    } else if (lowerLine.includes('option') || lowerLine.includes('renewal') || lowerLine.includes('extension')) {
      currentSection = 'options';
    } else if (lowerLine.includes('critical dates') || lowerLine.includes('commencement')) {
      currentSection = 'dates';
    }

    // Add line to appropriate section
    if (sections[currentSection as keyof typeof sections] !== undefined) {
      sections[currentSection as keyof typeof sections] += line + '\n';
    } else {
      sections.rest += line + '\n';
    }
  }

  // Priority order: intro, parties, premises, term, rent, dates, options, rest (truncated)
  let result = '';
  const prioritySections = ['intro', 'parties', 'premises', 'term', 'rent', 'dates', 'options'];

  for (const section of prioritySections) {
    const sectionText = sections[section as keyof typeof sections];
    if (result.length + sectionText.length <= maxChars * 0.9) {
      result += sectionText;
    } else {
      // Add as much as we can from this section
      const remaining = Math.floor(maxChars * 0.9) - result.length;
      if (remaining > 0) {
        result += sectionText.substring(0, remaining);
      }
      break;
    }
  }

  // If we have space, add some of the rest
  const remaining = maxChars - result.length;
  if (remaining > 1000 && sections.rest.length > 0) {
    result += '\n\n[Additional clauses truncated for length]\n\n';
    result += sections.rest.substring(0, remaining - 100);
  }

  return result;
}

/**
 * Extract and preprocess PDF text for lease abstraction
 * Handles large files by intelligently truncating while preserving key information
 */
export async function extractAndPreprocessPDF(
  filePath: string,
  maxChars: number = 80000
): Promise<string> {
  try {
    // Extract all text from PDF
    const rawText = await extractPDFText(filePath);

    // Clean up the text
    let cleanedText = rawText
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Restore paragraph breaks
      .replace(/\. /g, '.\n')
      // Remove common PDF artifacts
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();

    // Apply smart truncation if needed
    if (cleanedText.length > maxChars) {
      cleanedText = smartTruncateLeaseText(cleanedText, maxChars);
    }

    return cleanedText;
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
