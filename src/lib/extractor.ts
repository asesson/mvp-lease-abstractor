import Anthropic from '@anthropic-ai/sdk';
import { LeaseAbstract } from './types';
import fs from 'fs/promises';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractLeaseAbstract(
  filePath: string,
  filename: string
): Promise<LeaseAbstract> {
  // Read PDF file as base64
  const fileBuffer = await fs.readFile(filePath);
  const base64PDF = fileBuffer.toString('base64');

  // Create the extraction prompt
  const promptText = `You are a commercial real estate expert. Analyze this lease PDF document and extract structured data.

Please extract the following information and return it as valid JSON matching this exact structure:

{
  "meta": {
    "documents_reviewed": ["${filename}"],
    "generated_on": "${new Date().toISOString().slice(0, 10)}",
    "confidence_overall": 0.0 to 1.0
  },
  "parties": {
    "tenant": "string",
    "landlord": "string",
    "guarantor": "string or null"
  },
  "property": {
    "address": "string",
    "suites": ["array of strings"],
    "premises_rsf": number,
    "building_rsf": number or null,
    "tenant_share_pct": number or null
  },
  "term": {
    "commencement_date": "YYYY-MM-DD",
    "expiration_date": "YYYY-MM-DD",
    "length_months": number,
    "renewal_options": {
      "count": number,
      "term_months_each": number,
      "rent_basis": "FMV" | "Fixed % Increase" | "Other"
    }
  },
  "economics": {
    "currency": "USD",
    "security_deposit": number,
    "base_rent_steps": [{
      "period_label": "string",
      "psf_rate": number,
      "monthly_rent": number,
      "notes": "string"
    }]
  },
  "rights": {
    "expansion": "None" | "ROFR" | "ROFO" | "Must-Take" | "Other",
    "termination": "string"
  },
  "services": {
    "permitted_use": "string",
    "utilities": "string"
  },
  "legal": {
    "environmental": "string",
    "maintenance_obligations": "string"
  },
  "parking_signage": {
    "parking": "string",
    "signage": "string"
  },
  "critical_dates": [{
    "label": "string",
    "date": "YYYY-MM-DD",
    "notes": "string"
  }]
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting or code blocks
- Extract all information you can find
- Use null for missing optional fields
- Calculate length_months from commencement to expiration
- Include critical dates like rent commencement, option exercise deadlines, etc.
- Set confidence_overall based on how clear the document is`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64PDF,
              },
            },
            {
              type: 'text',
              text: promptText,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const responseText = content.text.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const extractedData = JSON.parse(jsonMatch[0]) as LeaseAbstract;
    return extractedData;
  } catch (error) {
    console.error('Extraction error:', error);

    // Return a minimal abstract on error
    const today = new Date().toISOString().slice(0, 10);
    return {
      meta: {
        documents_reviewed: [filename],
        generated_on: today,
        confidence_overall: 0.1,
      },
      parties: {
        tenant: 'Error extracting',
        landlord: 'Error extracting',
        guarantor: null,
      },
      property: {
        address: '',
        suites: [],
        premises_rsf: 0,
      },
      term: {
        commencement_date: today,
        expiration_date: today,
        length_months: 0,
      },
      economics: {
        base_rent_steps: [],
      },
      rights: {
        expansion: 'None',
        termination: '',
      },
      services: {},
      legal: {},
      parking_signage: {},
      critical_dates: [],
      comments: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
