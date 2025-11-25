import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { KYCData } from '../types';

interface PatientSettingsProps {
  accessToken: string;
  onBack: () => void;
}

export function PatientSettings({ accessToken, onBack }: PatientSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setKycData(data.profile.kycData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ kycData })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateKYC = (field: keyof KYCData, value: string) => {
    setKycData(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!kycData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl">Profile Settings</h1>
            <p className="text-sm text-gray-600">Update your personal and health information</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Keep your information up to date</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  Profile updated successfully!
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={kycData.fullName}
                    onChange={(e) => updateKYC('fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalPhone">Personal Phone</Label>
                  <Input
                    id="personalPhone"
                    value={kycData.personalPhone}
                    onChange={(e) => updateKYC('personalPhone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={kycData.height}
                    onChange={(e) => updateKYC('height', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={kycData.weight}
                    onChange={(e) => updateKYC('weight', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="townOfResidence">Town of Residence</Label>
                  <Input
                    id="townOfResidence"
                    value={kycData.townOfResidence}
                    onChange={(e) => updateKYC('townOfResidence', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nearbyHospital">Nearby Hospital</Label>
                  <Input
                    id="nearbyHospital"
                    value={kycData.nearbyHospital}
                    onChange={(e) => updateKYC('nearbyHospital', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={kycData.allergies}
                  onChange={(e) => updateKYC('allergies', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Textarea
                  id="chronicConditions"
                  value={kycData.chronicConditions}
                  onChange={(e) => updateKYC('chronicConditions', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={kycData.emergencyContact}
                    onChange={(e) => updateKYC('emergencyContact', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={kycData.emergencyPhone}
                    onChange={(e) => updateKYC('emergencyPhone', e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
