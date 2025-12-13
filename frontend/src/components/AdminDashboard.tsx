import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, UserCog, Building, LogOut, Stethoscope, Search } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { Hospital, HospitalStats } from '../types';
import { DoctorsPage } from './DoctorsPage';
import { PatientSearchPage } from './PatientSearchPage';

interface AdminDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function AdminDashboard({ accessToken, onLogout }: AdminDashboardProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'doctors' | 'search'>('dashboard');

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      // Fetch hospital profile
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const profileData = await profileResponse.json();
      setHospital(profileData.profile);

      // Fetch hospital stats
      const statsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/hospital/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const statsData = await statsResponse.json();
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
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

  if (currentView === 'doctors') {
    return <DoctorsPage accessToken={accessToken} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'search') {
    return <PatientSearchPage accessToken={accessToken} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl">{hospital?.hospitalName}</h1>
            <p className="text-sm text-gray-600">Hospital Administration Portal</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-[calc(100vh-73px)] shadow-sm">
          <nav className="p-4 space-y-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('dashboard')}
            >
              <Building className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'doctors' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('doctors')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Doctors
            </Button>
            <Button
              variant={currentView === 'search' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('search')}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Patient
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Hospital Analytics</h2>
              <p className="text-gray-600">Overview of hospital operations and statistics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Total Patients</CardTitle>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{stats?.totalPatients || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">Registered patients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Total Doctors</CardTitle>
                    <UserCog className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{stats?.totalDoctors || 5}</div>
                  <p className="text-sm text-gray-500 mt-1">Active staff</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Departments</CardTitle>
                    <Building className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{stats?.totalDepartments || 5}</div>
                  <p className="text-sm text-gray-500 mt-1">Active departments</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setCurrentView('doctors')}
                  >
                    <Stethoscope className="w-6 h-6" />
                    <span>Manage Doctors</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setCurrentView('search')}
                  >
                    <Search className="w-6 h-6" />
                    <span>Search Patient</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here once you start managing patient records</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
