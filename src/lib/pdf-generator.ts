import puppeteer from 'puppeteer';
import { LeaseAbstract } from './types';

export async function generatePDF(abstract: LeaseAbstract): Promise<Buffer> {
  const html = generateHTML(abstract);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.75in',
      right: '0.6in',
      bottom: '0.75in',
      left: '0.6in',
    },
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
}

function generateHTML(a: LeaseAbstract): string {
  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 12pt; line-height: 1.6; }
    h1 { font-size: 24pt; margin-bottom: 24px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { font-size: 14pt; margin: 32px 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th, td { border: 1px solid #e5e7eb; padding: 12px 10px; text-align: left; vertical-align: top; line-height: 1.5; }
    th { background: #f8fafc; font-weight: 600; }
    .header-table { margin-bottom: 32px; }
    .header-table th { background: #dbeafe; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 9pt; color: #6b7280; }
    .confidence { display: inline-block; padding: 4px 8px; background: #fef3c7; border-radius: 4px; font-size: 9pt; }
  `;

  const rentRows = (a.economics.base_rent_steps || [])
    .map(
      (s) => `
      <tr>
        <td>${s.period_label}</td>
        <td>$${s.psf_rate.toFixed(2)}/SF</td>
        <td>$${s.monthly_rent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${s.notes || ''}</td>
      </tr>
    `
    )
    .join('');

  const criticalDateRows = (a.critical_dates || [])
    .map(
      (c) => `
      <tr>
        <td>${c.label}</td>
        <td>${c.date}</td>
        <td>${c.window_start || ''} ${c.window_end ? `– ${c.window_end}` : ''}</td>
        <td>${c.notes || ''}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${css}</style>
</head>
<body>
  <h1>COMMERCIAL LEASE ABSTRACT</h1>

  <table class="header-table">
    <tr>
      <th>Tenant</th>
      <td>${a.parties.tenant || 'N/A'}</td>
      <th>Landlord</th>
      <td>${a.parties.landlord || 'N/A'}</td>
    </tr>
    <tr>
      <th>Property Address</th>
      <td colspan="3">${a.property.address || 'N/A'}</td>
    </tr>
    <tr>
      <th>Premises (RSF)</th>
      <td>${a.property.premises_rsf ? a.property.premises_rsf.toLocaleString() : 'N/A'}</td>
      <th>Building (RSF)</th>
      <td>${a.property.building_rsf ? a.property.building_rsf.toLocaleString() : 'N/A'}</td>
    </tr>
  </table>

  <h2>Lease Term</h2>
  <table>
    <tr>
      <th>Commencement</th>
      <td>${a.term.commencement_date || 'N/A'}</td>
      <th>Expiration</th>
      <td>${a.term.expiration_date || 'N/A'}</td>
    </tr>
    <tr>
      <th>Length</th>
      <td>${a.term.length_months || 0} months</td>
      <th>Renewal Options</th>
      <td>${a.term.renewal_options?.count || 0} × ${a.term.renewal_options?.term_months_each || 0} months (${a.term.renewal_options?.rent_basis || 'N/A'})</td>
    </tr>
  </table>

  <h2>Base Rent Schedule</h2>
  ${
    rentRows
      ? `
  <table>
    <tr>
      <th>Period</th>
      <th>PSF Rate</th>
      <th>Monthly Rent</th>
      <th>Notes</th>
    </tr>
    ${rentRows}
  </table>
  `
      : '<p>No rent schedule provided</p>'
  }

  <h2>Economics</h2>
  <table>
    <tr>
      <th>Security Deposit</th>
      <td>$${a.economics.security_deposit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}</td>
      <th>Currency</th>
      <td>${a.economics.currency || 'USD'}</td>
    </tr>
  </table>

  <h2>Rights</h2>
  <table>
    <tr>
      <th>Expansion Rights</th>
      <td>${a.rights.expansion || 'None'}</td>
      <th>Termination Rights</th>
      <td>${a.rights.termination || 'N/A'}</td>
    </tr>
  </table>

  <h2>Services</h2>
  <table>
    <tr>
      <th>Permitted Use</th>
      <td>${a.services.permitted_use || 'N/A'}</td>
      <th>Utilities</th>
      <td>${a.services.utilities || 'N/A'}</td>
    </tr>
  </table>

  <h2>Parking & Signage</h2>
  <table>
    <tr>
      <th>Parking</th>
      <td>${a.parking_signage.parking || 'N/A'}</td>
      <th>Signage</th>
      <td>${a.parking_signage.signage || 'N/A'}</td>
    </tr>
  </table>

  <h2>Critical Dates</h2>
  ${
    criticalDateRows
      ? `
  <table>
    <tr>
      <th>Event</th>
      <th>Date</th>
      <th>Window</th>
      <th>Notes</th>
    </tr>
    ${criticalDateRows}
  </table>
  `
      : '<p>No critical dates identified</p>'
  }

  ${a.comments ? `<h2>Additional Comments</h2><p>${a.comments}</p>` : ''}

  <div class="footer">
    <p>
      <strong>Generated:</strong> ${a.meta.generated_on} &nbsp;|&nbsp;
      <strong>Document(s) Reviewed:</strong> ${a.meta.documents_reviewed.join(', ')} &nbsp;|&nbsp;
      <span class="confidence"><strong>AI Confidence:</strong> ${((a.meta.confidence_overall || 0) * 100).toFixed(0)}%</span>
    </p>
    <p style="margin-top: 12px; font-size: 8pt;">
      This abstract was generated using AI-assisted extraction. Please review all information for accuracy.
    </p>
  </div>
</body>
</html>
  `;
}
