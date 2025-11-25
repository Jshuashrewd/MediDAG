import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Calendar, DollarSign, Plus, Trash2, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { projectId } from '../utils/supabase/info';
import type { User, MedicalReport, BillItem } from '../types';

interface PatientDetailPageProps {
  patient: User;
  reports: MedicalReport[];
  accessToken: string;
  onBack: () => void;
  onUpdate: (newReport: MedicalReport) => void;
}

export function PatientDetailPage({ patient, reports, accessToken, onBack, onUpdate }: PatientDetailPageProps) {
  const [showAddReport, setShowAddReport] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [appointment, setAppointment] = useState('');
  const [bills, setBills] = useState<BillItem[]>([]);
  const [newBillDescription, setNewBillDescription] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addBillItem = () => {
    if (!newBillDescription || !newBillAmount) return;
    
    setBills([...bills, {
      description: newBillDescription,
      amount: parseFloat(newBillAmount)
    }]);
    setNewBillDescription('');
    setNewBillAmount('');
  };

  const removeBillItem = (index: number) => {
    setBills(bills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/patients/${patient.patientId}/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            diagnosis,
            appointment: appointment || undefined,
            bills: bills.length > 0 ? bills : undefined,
            doctorName: 'Hospital Administrator',
            doctorId: 'admin'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update patient data');
      }

      if (data.requiresVerification) {
        alert('Verification request sent to patient. They must approve before the report is added.');
      }

      onUpdate(data.report);
      setShowAddReport(false);
      setDiagnosis('');
      setAppointment('');
      setBills([]);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">Patient Details</h1>
            <p className="text-sm text-gray-600">View and manage patient information</p>
          </div>
          {!showAddReport && (
            <Button onClick={() => setShowAddReport(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medical Report
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Patient Profile */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {patient.kycData?.fullName?.split(' ').map(n => n[0]).join('') || 'P'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p>{patient.kycData?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient ID</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{patient.patientId}</code>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p>{patient.kycData?.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="capitalize">{patient.kycData?.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Type</p>
                  <p>{patient.kycData?.bloodType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Height / Weight</p>
                  <p>{patient.kycData?.height}cm / {patient.kycData?.weight}kg</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Known Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{patient.kycData?.allergies || 'None reported'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chronic Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{patient.kycData?.chronicConditions || 'None reported'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p>{patient.kycData?.emergencyContact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p>{patient.kycData?.emergencyPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Medical Report Form */}
        {showAddReport && (
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Add Medical Report</CardTitle>
                  <CardDescription>Enter diagnosis, appointment, and billing information</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setShowAddReport(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter patient diagnosis and treatment details"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment">Next Appointment (Optional)</Label>
                  <Input
                    id="appointment"
                    type="datetime-local"
                    value={appointment}
                    onChange={(e) => setAppointment(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bill Items (Optional)</Label>
                  <div className="space-y-2">
                    {bills.map((bill, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <span className="flex-1">{bill.description}</span>
                        <span className="text-gray-600">${bill.amount.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBillItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Item description"
                      value={newBillDescription}
                      onChange={(e) => setNewBillDescription(e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={newBillAmount}
                      onChange={(e) => setNewBillAmount(e.target.value)}
                      className="w-32"
                    />
                    <Button type="button" onClick={addBillItem} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {bills.length > 0 && (
                    <div className="bg-blue-50 p-2 rounded flex justify-between">
                      <span>Total:</span>
                      <span>${bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Saving...' : 'Save Medical Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Patient's medical reports and diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No medical reports yet</p>
                <p className="text-sm">Add a report to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{report.hospital}</CardTitle>
                          <CardDescription>
                            {new Date(report.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Diagnosis:</p>
                        <p>{report.diagnosis}</p>
                      </div>

                      {report.appointment && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>Appointment: {new Date(report.appointment).toLocaleString()}</span>
                        </div>
                      )}

                      {report.bills && report.bills.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <p className="text-sm">Bill Breakdown:</p>
                          </div>
                          <div className="space-y-1">
                            {report.bills.map((bill, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{bill.description}</span>
                                <span>${bill.amount.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                              <span>Total:</span>
                              <span>${report.bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}