import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Search, User } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { User as UserType, MedicalReport } from '../types';
import { PatientDetailPage } from './PatientDetailPage';

interface PatientSearchPageProps {
  accessToken: string;
  onBack: () => void;
}

export function PatientSearchPage({ accessToken, onBack }: PatientSearchPageProps) {
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState<UserType | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError('');
    setPatient(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/patients/search/${searchId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Patient not found');
      }

      setPatient(data.patient);
      setReports(data.reports);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  if (patient) {
    return (
      <PatientDetailPage
        patient={patient}
        reports={reports}
        accessToken={accessToken}
        onBack={() => {
          setPatient(null);
          setReports([]);
          setSearchId('');
        }}
        onUpdate={(newReport) => {
          setReports([newReport, ...reports]);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl">Search Patient</h1>
            <p className="text-sm text-gray-600">Find patient by unique ID</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
            <CardDescription>
              Enter the patient's unique ID to view and manage their medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Enter patient ID (e.g., PT-XXXXX-XXXXX)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={searching}>
                  <Search className="w-4 h-4 mr-2" />
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <User className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="mb-2">How to search for a patient</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Each patient has a unique ID in the format PT-XXXXX-XXXXX</li>
                  <li>Patients receive this ID when they register on the platform</li>
                  <li>Enter the complete ID to view patient records and medical history</li>
                  <li>You can then add diagnoses, book appointments, and manage bills</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
