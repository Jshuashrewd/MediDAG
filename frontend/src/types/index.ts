export interface User {
  id: string;
  email: string;
  role: 'patient' | 'admin' | 'doctor';
  patientId?: string;
  kycData?: KYCData;
  orionCoins?: number;
  createdAt: string;
}

export interface KYCData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  genotype: string;
  height: string;
  weight: string;
  allergies: string;
  chronicConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  personalPhone: string;
  nearbyHospital: string;
  townOfResidence: string;
  medicalFileUrl?: string;
}

export interface MedicalReport {
  id: string;
  diagnosis: string;
  appointment?: string;
  bills?: BillItem[];
  date: string;
  hospital: string;
  doctorName?: string;
  doctorId?: string;
  verified: boolean;
  testResultsUrls?: string[];
}

export interface BillItem {
  description: string;
  amount: number;
}

export interface Hospital {
  id: string;
  email: string;
  role: 'admin';
  hospitalName: string;
  createdAt: string;
}

export interface HospitalStats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  patientsAttended: number;
  specialization: string;
  yearsOfExperience: number;
  qualifications: string;
  phone: string;
  email: string;
  userId?: string;
  assignedPatients?: string[];
}

export interface Task {
  id: string;
  title: string;
  coins: number;
  completed: boolean;
  description: string;
}

export interface Notification {
  id: string;
  type: 'verification' | 'report' | 'appointment';
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  action: string;
  reportData: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}