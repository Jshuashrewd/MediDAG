import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Coins, LogOut, Mail, Calendar, DollarSign, Settings, Bell } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { User, MedicalReport, Notification } from '../types';
import { OrionCoinsPage } from './OrionCoinsPage';
import { PatientSettings } from './PatientSettings';
import { NotificationsPage } from './NotificationsPage';

interface PatientDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function PatientDashboard({ accessToken, onLogout }: PatientDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'coins' | 'settings' | 'notifications'>('dashboard');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const profileData = await profileResponse.json();
      setUser(profileData.profile);

      const reportsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/reports`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const reportsData = await reportsResponse.json();
      setReports(reportsData.reports);

      const notificationsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/notifications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const notificationsData = await notificationsResponse.json();
      const unread = notificationsData.notifications.filter((n: Notification) => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  if (currentView === 'coins') {
    return <OrionCoinsPage accessToken={accessToken} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'settings') {
    return <PatientSettings accessToken={accessToken} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'notifications') {
    return <NotificationsPage accessToken={accessToken} onBack={() => {
      setCurrentView('dashboard');
      fetchUserData(); // Refresh data
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl">MediConnect</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.kycData?.fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setCurrentView('notifications')}>
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white min-h-[calc(100vh-73px)] shadow-sm">
          <nav className="p-4 space-y-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('dashboard')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Medical Reports
            </Button>
            <Button
              variant={currentView === 'coins' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('coins')}
            >
              <Coins className="w-4 h-4 mr-2" />
              Orion Coins
            </Button>
          </nav>

          <div className="p-4 mt-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Your Patient ID</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                  {user?.patientId}
                </code>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{reports.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Blood Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{user?.kycData?.bloodType || 'N/A'}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Medical Reports</CardTitle>
                <CardDescription>View your verified medical history and reports from hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No medical reports yet</p>
                    <p className="text-sm">Reports from hospitals will appear here once verified</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{report.hospital}</CardTitle>
                              {report.doctorName && (
                                <p className="text-sm text-gray-600">Dr. {report.doctorName}</p>
                              )}
                              <CardDescription>
                                {new Date(report.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </CardDescription>
                            </div>
                            <FileText className="w-5 h-5 text-blue-500" />
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
                              <span>Next Appointment: {new Date(report.appointment).toLocaleDateString()}</span>
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
          </div>
        </main>
      </div>
    </div>
  );
}
