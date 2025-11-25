import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserCircle, Building2, Stethoscope } from 'lucide-react';

interface SignupPageProps {
  onSelectRole: (role: 'patient' | 'admin' | 'doctor') => void;
}

export function SignupPage({ onSelectRole }: SignupPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">MediConnect</h1>
          <p className="text-gray-600">Your Digital Health Platform</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole('patient')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle>Register as Patient</CardTitle>
              <CardDescription>
                Access your medical records, view reports, and mine Orion coins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => onSelectRole('patient')}>
                Continue as Patient
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole('doctor')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-purple-600" />
              </div>
              <CardTitle>Register as Doctor</CardTitle>
              <CardDescription>
                Manage patient records and provide medical care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => onSelectRole('doctor')}>
                Continue as Doctor
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole('admin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle>Register as Hospital Admin</CardTitle>
              <CardDescription>
                Manage patient records, doctors, and hospital operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => onSelectRole('admin')}>
                Continue as Administrator
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}