import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Users, LogOut, Search, FileText } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { Doctor, User } from '../types';
import { PatientDetailPage } from './PatientDetailPage';

interface DoctorDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function DoctorDashboard({ accessToken, onLogout }: DoctorDashboardProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ patient: User; reports: any[] } | null>(null);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/doctor/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const profileData = await profileResponse.json();
      setDoctor(profileData.profile);

      const patientsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/doctor/patients`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const patientsData = await patientsResponse.json();
      setPatients(patientsData.patients);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchError('');

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

      setSelectedPatient({ patient: data.patient, reports: data.reports });
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <PatientDetailPage
        patient={selectedPatient.patient}
        reports={selectedPatient.reports}
        accessToken={accessToken}
        onBack={() => setSelectedPatient(null)}
        onUpdate={(newReport) => {
          setSelectedPatient({
            ...selectedPatient,
            reports: [newReport, ...selectedPatient.reports]
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl">Doctor Portal</h1>
            <p className="text-sm text-gray-600">Welcome, {doctor?.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{doctor?.department}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{doctor?.specialization}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Patients Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{doctor?.patientsAttended || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Patient</CardTitle>
            <CardDescription>Enter patient ID to view and manage medical records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {searchError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {searchError}
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

        <Card>
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
            <CardDescription>Patients assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No assigned patients yet</p>
                <p className="text-sm">Use the search above to find and manage patients</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map((patient) => (
                  <Card key={patient.id} className="cursor-pointer hover:shadow-md" onClick={() => {
                    // Fetch patient details
                    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/patients/search/${patient.patientId}`, {
                      headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                      .then(res => res.json())
                      .then(data => setSelectedPatient({ patient: data.patient, reports: data.reports }));
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3>{patient.kycData?.fullName}</h3>
                          <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
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
