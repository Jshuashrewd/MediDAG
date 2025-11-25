import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Mail, Phone, Award } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { projectId } from '../utils/supabase/info';
import type { Doctor } from '../types';
import { DoctorProfilePage } from './DoctorProfilePage';

interface DoctorsPageProps {
  accessToken: string;
  onBack: () => void;
}

export function DoctorsPage({ accessToken, onBack }: DoctorsPageProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      // Fetch doctors
      const doctorsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/doctors`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const doctorsData = await doctorsResponse.json();
      setDoctors(doctorsData.doctors);

      // Fetch departments
      const deptResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/departments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const deptData = await deptResponse.json();
      setDepartments(deptData.departments);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (selectedDoctor) {
    return (
      <DoctorProfilePage
        doctor={selectedDoctor}
        accessToken={accessToken}
        onBack={() => setSelectedDoctor(null)}
      />
    );
  }

  const filteredDoctors = selectedDepartment === 'all' 
    ? doctors 
    : doctors.filter(d => d.department === selectedDepartment);

  // Group doctors by department
  const doctorsByDepartment = filteredDoctors.reduce((acc, doctor) => {
    if (!acc[doctor.department]) {
      acc[doctor.department] = [];
    }
    acc[doctor.department].push(doctor);
    return acc;
  }, {} as Record<string, Doctor[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl">Doctors Directory</h1>
            <p className="text-sm text-gray-600">View and manage hospital doctors</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Department Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDepartment === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepartment('all')}
              >
                All Departments
              </Button>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Doctors List by Department */}
        <div className="space-y-6">
          {Object.entries(doctorsByDepartment).map(([department, deptDoctors]) => (
            <Card key={department}>
              <CardHeader>
                <CardTitle>{department}</CardTitle>
                <CardDescription>{deptDoctors.length} doctor{deptDoctors.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {deptDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1">{doctor.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
                            
                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{doctor.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{doctor.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Award className="w-4 h-4" />
                                <span>{doctor.yearsOfExperience} years experience</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl text-blue-600">{doctor.patientsAttended}</div>
                            <p className="text-sm text-gray-500">Patients</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
