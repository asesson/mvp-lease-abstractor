import OpenAI from 'openai';
import { LeaseAbstract } from './types';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractLeaseAbstractOpenAI(
  filePath: string,
  filename: string
): Promise<LeaseAbstract> {
  const promptText = `You are a commercial real estate expert. Analyze this lease document and extract structured data.

CRITICAL: You must return ONLY valid JSON with no additional text, explanations, or markdown formatting.

Extract the following information and return it as valid JSON matching this exact structure:

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
    // Upload PDF file to OpenAI
    console.log('Uploading PDF to OpenAI...');
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });
    console.log('PDF uploaded, file ID:', file.id);

    // Create an assistant with JSON response format (no file_search - it doesn't work with scanned PDFs)
    const assistant = await openai.beta.assistants.create({
      name: 'Lease Abstractor',
      instructions: promptText,
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
    });
    console.log('Assistant created:', assistant.id);

    // Create a thread and attach the file directly to the message
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: 'Please carefully read this lease document PDF and extract all lease information. Return as valid JSON only matching the structure provided in the instructions.',
          attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
        },
      ],
    });
    console.log('Thread created:', thread.id);

    // Run the assistant with JSON response format
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      response_format: { type: 'json_object' },
    });
    console.log('Run started:', run.id);

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    let attempts = 0;
    while (runStatus.status !== 'completed' && attempts < 60) {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
      console.log(`Run status: ${runStatus.status} (attempt ${attempts})`);
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Run timed out after 2 minutes');
    }

    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== 'text') {
      throw new Error('No valid response from assistant');
    }

    let content = assistantMessage.content[0].text.value;
    console.log('Raw assistant response length:', content.length);

    // Cleanup
    await openai.beta.assistants.del(assistant.id).catch(() => {});
    await openai.beta.threads.del(thread.id).catch(() => {});
    await openai.files.del(file.id).catch(() => {});

    // Strip any markdown if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    content = content.trim();

    // Validate JSON format
    if (!content.startsWith('{')) {
      throw new Error(`Invalid response format: ${content.substring(0, 100)}...`);
    }

    // Parse and validate
    let extractedData: LeaseAbstract;
    try {
      extractedData = JSON.parse(content) as LeaseAbstract;
    } catch (parseError) {
      console.error('Failed to parse JSON:', content.substring(0, 500));
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate required fields
    if (!extractedData.meta || !extractedData.parties || !extractedData.property) {
      throw new Error('Response missing required fields');
    }

    return extractedData;
  } catch (error) {
    console.error('Extraction error:', error);

    // Return minimal abstract on error
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
