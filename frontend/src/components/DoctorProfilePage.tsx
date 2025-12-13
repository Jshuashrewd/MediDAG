import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Mail, Phone, Award, GraduationCap, Briefcase, Users, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useState } from 'react';
import type { Doctor } from '../types';

interface DoctorProfilePageProps {
  doctor: Doctor;
  accessToken: string;
  onBack: () => void;
  onPatientSearch?: (patientId: string) => void;
}

export function DoctorProfilePage({ doctor, onBack, onPatientSearch }: DoctorProfilePageProps) {
  const [searchId, setSearchId] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPatientSearch && searchId) {
      onPatientSearch(searchId);
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
          <div>
            <h1 className="text-2xl">Doctor Profile</h1>
            <p className="text-sm text-gray-600">Detailed information</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Search Patient */}
        {onPatientSearch && (
          <Card>
            <CardHeader>
              <CardTitle>Search Patient</CardTitle>
              <CardDescription>Enter patient ID to view their records</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Enter patient ID (e.g., PT-XXXXX-XXXXX)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-3xl">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-3xl mb-2">{doctor.name}</h2>
                <p className="text-gray-600 mb-4">{doctor.specialization}</p>
                
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{doctor.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{doctor.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </div>

              <div className="text-center bg-blue-50 px-6 py-4 rounded-lg">
                <div className="text-3xl text-blue-600 mb-1">{doctor.patientsAttended}</div>
                <p className="text-sm text-gray-600">Patients Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{doctor.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{doctor.phone}</p>
            </CardContent>
          </Card>
        </div>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <h3>Qualifications</h3>
              </div>
              <p className="text-gray-700 ml-7">{doctor.qualifications}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h3>Specialization</h3>
              </div>
              <p className="text-gray-700 ml-7">{doctor.specialization}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-gray-600" />
                <h3>Years of Experience</h3>
              </div>
              <p className="text-gray-700 ml-7">{doctor.yearsOfExperience} years</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3>Department</h3>
              </div>
              <p className="text-gray-700 ml-7">{doctor.department}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>Doctor's performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-blue-600 mb-1">{doctor.patientsAttended}</div>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-green-600 mb-1">{doctor.yearsOfExperience}</div>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-purple-600 mb-1">1</div>
                <p className="text-sm text-gray-600">Department</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}