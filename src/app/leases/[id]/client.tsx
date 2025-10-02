'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Download, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LeaseAbstract } from '@/lib/types';

interface Lease {
  id: string;
  filename: string;
  status: string;
  errorMessage: string | null;
  extractedData: any;
  uploadedAt: Date;
}

export function LeaseDetailClient({ lease }: { lease: Lease }) {
  const router = useRouter();
  const [formData, setFormData] = useState<LeaseAbstract | null>(
    lease.extractedData as LeaseAbstract | null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/leases/${lease.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedData: formData }),
      });

      if (!response.ok) throw new Error('Save failed');

      alert('Changes saved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${lease.filename}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/leases/${lease.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      router.push('/leases');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete lease');
      setDeleting(false);
    }
  };

  const updateField = (path: string[], value: any) => {
    if (!formData) return;

    const newData = JSON.parse(JSON.stringify(formData));
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setFormData(newData);
  };

  if (lease.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing Lease</h3>
          <p className="text-gray-600">AI is extracting data from your document...</p>
        </Card>
      </div>
    );
  }

  if (lease.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Extraction Failed</h3>
          <p className="text-gray-600 mb-4">{lease.errorMessage}</p>
          <Link href="/leases">
            <Button variant="outline">Back to Leases</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-gray-600">No data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo placeholder - replace src with actual logo path */}
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto"
                onError={(e) => {
                  // Hide logo if it doesn't exist
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Link href="/leases">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <div>
                  <h1 className="font-bold">{lease.filename}</h1>
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(lease.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/leases/${lease.id}/pdf`, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tenant</Label>
                <Input
                  value={formData.parties.tenant}
                  onChange={(e) => updateField(['parties', 'tenant'], e.target.value)}
                />
              </div>
              <div>
                <Label>Landlord</Label>
                <Input
                  value={formData.parties.landlord}
                  onChange={(e) => updateField(['parties', 'landlord'], e.target.value)}
                />
              </div>
              <div>
                <Label>Guarantor (Optional)</Label>
                <Input
                  value={formData.parties.guarantor || ''}
                  onChange={(e) => updateField(['parties', 'guarantor'], e.target.value || '')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property */}
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.property.address}
                  onChange={(e) => updateField(['property', 'address'], e.target.value)}
                />
              </div>
              <div>
                <Label>Premises (RSF)</Label>
                <Input
                  type="text"
                  value={formData.property.premises_rsf?.toLocaleString() || ''}
                  onChange={(e) => {
                    const numValue = Number(e.target.value.replace(/,/g, ''));
                    if (!isNaN(numValue)) updateField(['property', 'premises_rsf'], numValue);
                  }}
                />
              </div>
              <div>
                <Label>Building (RSF)</Label>
                <Input
                  type="text"
                  value={formData.property.building_rsf?.toLocaleString() || ''}
                  onChange={(e) => {
                    const numValue = Number(e.target.value.replace(/,/g, ''));
                    if (!isNaN(numValue)) updateField(['property', 'building_rsf'], numValue);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Term */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Term</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Commencement Date</Label>
                <Input
                  type="date"
                  value={formData.term.commencement_date}
                  onChange={(e) => updateField(['term', 'commencement_date'], e.target.value)}
                />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.term.expiration_date}
                  onChange={(e) => updateField(['term', 'expiration_date'], e.target.value)}
                />
              </div>
              <div>
                <Label>Length (Months)</Label>
                <Input
                  type="number"
                  value={formData.term.length_months}
                  onChange={(e) => updateField(['term', 'length_months'], Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Economics */}
          <Card>
            <CardHeader>
              <CardTitle>Economics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Security Deposit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="text"
                      className="pl-7"
                      value={formData.economics.security_deposit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || ''}
                      onChange={(e) => {
                        const numValue = Number(e.target.value.replace(/,/g, '').replace(/\$/g, ''));
                        if (!isNaN(numValue)) updateField(['economics', 'security_deposit'], numValue || undefined);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="block mb-3">Base Rent Schedule</Label>
                <div className="grid grid-cols-4 gap-2 mb-2 px-2">
                  <div className="text-xs font-semibold text-gray-600">Period</div>
                  <div className="text-xs font-semibold text-gray-600">$/SF Rate</div>
                  <div className="text-xs font-semibold text-gray-600">Monthly Rent</div>
                  <div className="text-xs font-semibold text-gray-600">Notes</div>
                </div>
                {formData.economics.base_rent_steps.map((step, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                    <Input
                      placeholder="Period"
                      value={step.period_label}
                      onChange={(e) => {
                        const newSteps = [...formData.economics.base_rent_steps];
                        newSteps[idx].period_label = e.target.value;
                        updateField(['economics', 'base_rent_steps'], newSteps);
                      }}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="text"
                        className="pl-7"
                        placeholder="0.00"
                        value={step.psf_rate?.toFixed(2) || ''}
                        onChange={(e) => {
                          const numValue = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                          if (!isNaN(numValue)) {
                            const newSteps = [...formData.economics.base_rent_steps];
                            newSteps[idx].psf_rate = numValue;
                            updateField(['economics', 'base_rent_steps'], newSteps);
                          }
                        }}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="text"
                        className="pl-7"
                        placeholder="0.00"
                        value={step.monthly_rent?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || ''}
                        onChange={(e) => {
                          const numValue = Number(e.target.value.replace(/,/g, ''));
                          if (!isNaN(numValue)) {
                            const newSteps = [...formData.economics.base_rent_steps];
                            newSteps[idx].monthly_rent = numValue;
                            updateField(['economics', 'base_rent_steps'], newSteps);
                          }
                        }}
                      />
                    </div>
                    <Input
                      placeholder="Notes"
                      value={step.notes || ''}
                      onChange={(e) => {
                        const newSteps = [...formData.economics.base_rent_steps];
                        newSteps[idx].notes = e.target.value;
                        updateField(['economics', 'base_rent_steps'], newSteps);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services & Use</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Permitted Use</Label>
                <Textarea
                  rows={3}
                  value={formData.services?.permitted_use || ''}
                  onChange={(e) => updateField(['services', 'permitted_use'], e.target.value)}
                  placeholder="Describe permitted use..."
                />
              </div>
              <div>
                <Label>Utilities</Label>
                <Textarea
                  rows={3}
                  value={formData.services?.utilities || ''}
                  onChange={(e) => updateField(['services', 'utilities'], e.target.value)}
                  placeholder="Describe utilities arrangement..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Obligations</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Environmental</Label>
                <Textarea
                  rows={3}
                  value={formData.legal?.environmental || ''}
                  onChange={(e) => updateField(['legal', 'environmental'], e.target.value)}
                  placeholder="Environmental obligations..."
                />
              </div>
              <div>
                <Label>Maintenance Obligations</Label>
                <Textarea
                  rows={3}
                  value={formData.legal?.maintenance_obligations || ''}
                  onChange={(e) => updateField(['legal', 'maintenance_obligations'], e.target.value)}
                  placeholder="Maintenance responsibilities..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Parking & Signage */}
          <Card>
            <CardHeader>
              <CardTitle>Parking & Signage</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Parking</Label>
                <Textarea
                  rows={3}
                  value={formData.parking_signage?.parking || ''}
                  onChange={(e) => updateField(['parking_signage', 'parking'], e.target.value)}
                  placeholder="Parking details..."
                />
              </div>
              <div>
                <Label>Signage</Label>
                <Textarea
                  rows={3}
                  value={formData.parking_signage?.signage || ''}
                  onChange={(e) => updateField(['parking_signage', 'signage'], e.target.value)}
                  placeholder="Signage rights and restrictions..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Critical Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Critical Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.critical_dates.length === 0 ? (
                <p className="text-gray-500 text-sm">No critical dates extracted</p>
              ) : (
                <div className="space-y-2">
                  {formData.critical_dates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 border rounded">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Label"
                          value={date.label}
                          onChange={(e) => {
                            const newDates = [...formData.critical_dates];
                            newDates[idx].label = e.target.value;
                            updateField(['critical_dates'], newDates);
                          }}
                        />
                        <Input
                          type="date"
                          value={date.date}
                          onChange={(e) => {
                            const newDates = [...formData.critical_dates];
                            newDates[idx].date = e.target.value;
                            updateField(['critical_dates'], newDates);
                          }}
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Notes"
                            value={date.notes || ''}
                            onChange={(e) => {
                              const newDates = [...formData.critical_dates];
                              newDates[idx].notes = e.target.value;
                              updateField(['critical_dates'], newDates);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/leases/${lease.id}/dates/${idx}/ics`, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={formData.comments || ''}
                onChange={(e) => updateField(['comments'], e.target.value || '')}
                placeholder="Add any additional notes or comments..."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
