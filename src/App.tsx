import { useState, useEffect } from 'react';
import { SignupPage } from './components/SignupPage';
import { PatientSignupForm } from './components/PatientSignupForm';
import { AdminSignupForm } from './components/AdminSignupForm';
import { DoctorSignupForm } from './components/DoctorSignupForm';
import { PatientSuccessModal } from './components/PatientSuccessModal';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { createClient } from './utils/supabase/client';

type ViewState = 
  | { type: 'role-selection' }
  | { type: 'patient-signup' }
  | { type: 'admin-signup' }
  | { type: 'doctor-signup' }
  | { type: 'patient-success', patientId: string, accessToken: string }
  | { type: 'patient-dashboard', accessToken: string }
  | { type: 'admin-dashboard', accessToken: string }
  | { type: 'doctor-dashboard', accessToken: string };

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'role-selection' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const role = session.user.user_metadata?.role;
        if (role === 'patient') {
          setView({ type: 'patient-dashboard', accessToken: session.access_token });
        } else if (role === 'admin') {
          setView({ type: 'admin-dashboard', accessToken: session.access_token });
        } else if (role === 'doctor') {
          setView({ type: 'doctor-dashboard', accessToken: session.access_token });
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setView({ type: 'role-selection' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  switch (view.type) {
    case 'role-selection':
      return (
        <SignupPage
          onSelectRole={(role) => {
            if (role === 'patient') {
              setView({ type: 'patient-signup' });
            } else if (role === 'doctor') {
              setView({ type: 'doctor-signup' });
            } else {
              setView({ type: 'admin-signup' });
            }
          }}
        />
      );

    case 'patient-signup':
      return (
        <PatientSignupForm
          onSuccess={(patientId, accessToken) => {
            setView({ type: 'patient-success', patientId, accessToken });
          }}
          onBack={() => setView({ type: 'role-selection' })}
        />
      );

    case 'doctor-signup':
      return (
        <DoctorSignupForm
          onSuccess={(accessToken) => {
            setView({ type: 'doctor-dashboard', accessToken });
          }}
          onBack={() => setView({ type: 'role-selection' })}
        />
      );

    case 'admin-signup':
      return (
        <AdminSignupForm
          onSuccess={(accessToken) => {
            setView({ type: 'admin-dashboard', accessToken });
          }}
          onBack={() => setView({ type: 'role-selection' })}
        />
      );

    case 'patient-success':
      return (
        <PatientSuccessModal
          patientId={view.patientId}
          onContinue={() => {
            setView({ type: 'patient-dashboard', accessToken: view.accessToken });
          }}
        />
      );

    case 'patient-dashboard':
      return (
        <PatientDashboard
          accessToken={view.accessToken}
          onLogout={handleLogout}
        />
      );

    case 'doctor-dashboard':
      return (
        <DoctorDashboard
          accessToken={view.accessToken}
          onLogout={handleLogout}
        />
      );

    case 'admin-dashboard':
      return (
        <AdminDashboard
          accessToken={view.accessToken}
          onLogout={handleLogout}
        />
      );

    default:
      return null;
  }
}
