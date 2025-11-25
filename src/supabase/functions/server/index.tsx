import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }
  const accessToken = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Unauthorized', user: null };
  }
  return { error: null, user };
}

function generatePatientID(): string {
  const prefix = 'PT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Initialize demo patients
async function initializeDemoPatients(hospitalId: string) {
  const demoPatients = [
    {
      patientId: 'PT-DEMO1-ALICE',
      kycData: {
        fullName: 'Alice Johnson',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        bloodType: 'A+',
        genotype: 'AA',
        height: '165',
        weight: '62',
        allergies: 'Penicillin',
        chronicConditions: 'Asthma',
        emergencyContact: 'Bob Johnson',
        emergencyPhone: '+1-555-1001',
        personalPhone: '+1-555-2001',
        nearbyHospital: 'City General Hospital',
        townOfResidence: 'Springfield'
      }
    },
    {
      patientId: 'PT-DEMO2-DAVID',
      kycData: {
        fullName: 'David Martinez',
        dateOfBirth: '1985-08-22',
        gender: 'male',
        bloodType: 'O+',
        genotype: 'AS',
        height: '178',
        weight: '80',
        allergies: 'None',
        chronicConditions: 'Type 2 Diabetes',
        emergencyContact: 'Maria Martinez',
        emergencyPhone: '+1-555-1002',
        personalPhone: '+1-555-2002',
        nearbyHospital: 'Springfield Medical Center',
        townOfResidence: 'Springfield'
      }
    },
    {
      patientId: 'PT-DEMO3-SARAH',
      kycData: {
        fullName: 'Sarah Williams',
        dateOfBirth: '1995-03-10',
        gender: 'female',
        bloodType: 'B+',
        genotype: 'AA',
        height: '160',
        weight: '55',
        allergies: 'Latex',
        chronicConditions: 'None',
        emergencyContact: 'Tom Williams',
        emergencyPhone: '+1-555-1003',
        personalPhone: '+1-555-2003',
        nearbyHospital: 'Federal Hospital',
        townOfResidence: 'Springfield'
      }
    }
  ];

  await kv.set(`demo-patients:${hospitalId}`, demoPatients);
  return demoPatients;
}

// User Signup Route
app.post('/make-server-140653bc/signup/user', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, kycData } = body;

    if (!email || !password || !kycData) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const patientId = generatePatientID();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: 'patient',
        patientId,
        fullName: kycData.fullName
      },
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user:', error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      role: 'patient',
      patientId,
      kycData,
      orionCoins: 100,
      createdAt: new Date().toISOString()
    });

    await kv.set(`medical-reports:${data.user.id}`, []);
    await kv.set(`notifications:${data.user.id}`, []);

    return c.json({ 
      success: true, 
      patientId,
      userId: data.user.id
    });
  } catch (error) {
    console.log('Error in user signup:', error);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

// Doctor Signup Route
app.post('/make-server-140653bc/signup/doctor', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, doctorData } = body;

    if (!email || !password || !doctorData) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: 'doctor',
        name: doctorData.name,
        department: doctorData.department
      },
      email_confirm: true
    });

    if (error) {
      console.log('Error creating doctor:', error);
      return c.json({ error: `Failed to create doctor: ${error.message}` }, 400);
    }

    await kv.set(`doctor:${data.user.id}`, {
      id: data.user.id,
      email,
      role: 'doctor',
      ...doctorData,
      userId: data.user.id,
      assignedPatients: [],
      patientsAttended: 0,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true,
      userId: data.user.id
    });
  } catch (error) {
    console.log('Error in doctor signup:', error);
    return c.json({ error: `Doctor signup failed: ${error.message}` }, 500);
  }
});

// Hospital Admin Signup Route
app.post('/make-server-140653bc/signup/admin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, hospitalName } = body;

    if (!email || !password || !hospitalName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: 'admin',
        hospitalName
      },
      email_confirm: true
    });

    if (error) {
      console.log('Error creating admin:', error);
      return c.json({ error: `Failed to create admin: ${error.message}` }, 400);
    }

    await kv.set(`hospital:${data.user.id}`, {
      id: data.user.id,
      email,
      role: 'admin',
      hospitalName,
      createdAt: new Date().toISOString()
    });

    await kv.set(`hospital-stats:${data.user.id}`, {
      totalPatients: 3,
      totalDoctors: 5,
      totalDepartments: 5
    });

    const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine'];
    await kv.set(`hospital-departments:${data.user.id}`, departments);

    const sampleDoctors = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        patientsAttended: 0,
        specialization: 'Interventional Cardiology',
        yearsOfExperience: 12,
        qualifications: 'MD, DM Cardiology',
        phone: '+1-555-0101',
        email: 'sarah.johnson@hospital.com',
        assignedPatients: []
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        department: 'Neurology',
        patientsAttended: 0,
        specialization: 'Stroke and Cerebrovascular Disease',
        yearsOfExperience: 15,
        qualifications: 'MD, DM Neurology',
        phone: '+1-555-0102',
        email: 'michael.chen@hospital.com',
        assignedPatients: []
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        department: 'Pediatrics',
        patientsAttended: 0,
        specialization: 'Pediatric Intensive Care',
        yearsOfExperience: 8,
        qualifications: 'MD, DCH',
        phone: '+1-555-0103',
        email: 'emily.rodriguez@hospital.com',
        assignedPatients: []
      },
      {
        id: '4',
        name: 'Dr. James Wilson',
        department: 'Orthopedics',
        patientsAttended: 0,
        specialization: 'Sports Medicine',
        yearsOfExperience: 10,
        qualifications: 'MD, MS Orthopedics',
        phone: '+1-555-0104',
        email: 'james.wilson@hospital.com',
        assignedPatients: []
      },
      {
        id: '5',
        name: 'Dr. Priya Patel',
        department: 'General Medicine',
        patientsAttended: 0,
        specialization: 'Internal Medicine',
        yearsOfExperience: 6,
        qualifications: 'MBBS, MD',
        phone: '+1-555-0105',
        email: 'priya.patel@hospital.com',
        assignedPatients: []
      }
    ];
    await kv.set(`hospital-doctors:${data.user.id}`, sampleDoctors);

    // Initialize demo patients
    await initializeDemoPatients(data.user.id);

    return c.json({ 
      success: true,
      userId: data.user.id
    });
  } catch (error) {
    console.log('Error in admin signup:', error);
    return c.json({ error: `Admin signup failed: ${error.message}` }, 500);
  }
});

// Get user profile
app.get('/make-server-140653bc/user/profile', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userData = await kv.get(`user:${user.id}`);
    return c.json({ profile: userData });
  } catch (err) {
    console.log('Error fetching user profile:', err);
    return c.json({ error: `Failed to fetch profile: ${err.message}` }, 500);
  }
});

// Update user profile
app.put('/make-server-140653bc/user/profile', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { kycData } = body;

    const userData = await kv.get(`user:${user.id}`);
    userData.kycData = { ...userData.kycData, ...kycData };

    await kv.set(`user:${user.id}`, userData);

    return c.json({ success: true, profile: userData });
  } catch (err) {
    console.log('Error updating user profile:', err);
    return c.json({ error: `Failed to update profile: ${err.message}` }, 500);
  }
});

// Get doctor profile
app.get('/make-server-140653bc/doctor/profile', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const doctorData = await kv.get(`doctor:${user.id}`);
    return c.json({ profile: doctorData });
  } catch (err) {
    console.log('Error fetching doctor profile:', err);
    return c.json({ error: `Failed to fetch profile: ${err.message}` }, 500);
  }
});

// Get hospital profile
app.get('/make-server-140653bc/hospital/profile', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const hospitalData = await kv.get(`hospital:${user.id}`);
    return c.json({ profile: hospitalData });
  } catch (err) {
    console.log('Error fetching hospital profile:', err);
    return c.json({ error: `Failed to fetch profile: ${err.message}` }, 500);
  }
});

// Get medical reports for user
app.get('/make-server-140653bc/user/reports', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const reports = await kv.get(`medical-reports:${user.id}`) || [];
    // Only return verified reports
    const verifiedReports = reports.filter((r: any) => r.verified);
    return c.json({ reports: verifiedReports });
  } catch (err) {
    console.log('Error fetching medical reports:', err);
    return c.json({ error: `Failed to fetch reports: ${err.message}` }, 500);
  }
});

// Get notifications
app.get('/make-server-140653bc/user/notifications', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const notifications = await kv.get(`notifications:${user.id}`) || [];
    return c.json({ notifications });
  } catch (err) {
    console.log('Error fetching notifications:', err);
    return c.json({ error: `Failed to fetch notifications: ${err.message}` }, 500);
  }
});

// Mark notification as read
app.put('/make-server-140653bc/user/notifications/:notificationId/read', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const notificationId = c.req.param('notificationId');
    const notifications = await kv.get(`notifications:${user.id}`) || [];
    
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, read: true } : n
    );

    await kv.set(`notifications:${user.id}`, updated);

    return c.json({ success: true });
  } catch (err) {
    console.log('Error marking notification as read:', err);
    return c.json({ error: `Failed to update notification: ${err.message}` }, 500);
  }
});

// Verify pending report
app.post('/make-server-140653bc/user/verify-report/:requestId', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    const { approved } = body;

    const notifications = await kv.get(`notifications:${user.id}`) || [];
    const notification = notifications.find((n: any) => n.id === requestId);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (approved) {
      // Add the report to the user's medical reports
      const reports = await kv.get(`medical-reports:${user.id}`) || [];
      const newReport = {
        ...notification.data.reportData,
        verified: true
      };
      reports.unshift(newReport);
      await kv.set(`medical-reports:${user.id}`, reports);

      // Update notification
      notification.read = true;
      notification.message = `✓ You approved the medical report from ${notification.data.doctorName}`;
    } else {
      notification.read = true;
      notification.message = `✗ You rejected the medical report from ${notification.data.doctorName}`;
    }

    await kv.set(`notifications:${user.id}`, notifications);

    return c.json({ success: true });
  } catch (err) {
    console.log('Error verifying report:', err);
    return c.json({ error: `Failed to verify report: ${err.message}` }, 500);
  }
});

// Get Orion coins tasks
app.get('/make-server-140653bc/user/tasks', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tasks = [
      { id: '1', title: 'Complete Health Survey', coins: 50, completed: false, description: 'Fill out a brief health survey' },
      { id: '2', title: 'Upload Medical Records', coins: 100, completed: false, description: 'Upload your previous medical records' },
      { id: '3', title: 'Book Annual Checkup', coins: 75, completed: false, description: 'Schedule your annual health checkup' },
      { id: '4', title: 'Refer a Friend', coins: 200, completed: false, description: 'Invite friends to join the platform' },
      { id: '5', title: 'Complete Medication Adherence', coins: 150, completed: false, description: 'Track your medications for 30 days' }
    ];

    return c.json({ tasks });
  } catch (err) {
    console.log('Error fetching tasks:', err);
    return c.json({ error: `Failed to fetch tasks: ${err.message}` }, 500);
  }
});

// Get hospital stats
app.get('/make-server-140653bc/hospital/stats', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const stats = await kv.get(`hospital-stats:${user.id}`);
    return c.json({ stats });
  } catch (err) {
    console.log('Error fetching hospital stats:', err);
    return c.json({ error: `Failed to fetch stats: ${err.message}` }, 500);
  }
});

// Get hospital doctors
app.get('/make-server-140653bc/hospital/doctors', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const doctors = await kv.get(`hospital-doctors:${user.id}`) || [];
    return c.json({ doctors });
  } catch (err) {
    console.log('Error fetching doctors:', err);
    return c.json({ error: `Failed to fetch doctors: ${err.message}` }, 500);
  }
});

// Delete doctor
app.delete('/make-server-140653bc/hospital/doctors/:doctorId', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const doctorId = c.req.param('doctorId');
    const doctors = await kv.get(`hospital-doctors:${user.id}`) || [];
    
    const doctor = doctors.find((d: any) => d.id === doctorId);
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }

    // Remove doctor from the list
    const updatedDoctors = doctors.filter((d: any) => d.id !== doctorId);
    await kv.set(`hospital-doctors:${user.id}`, updatedDoctors);

    // If doctor has a userId, delete their auth account
    if (doctor.userId) {
      const supabase = getSupabaseAdmin();
      await supabase.auth.admin.deleteUser(doctor.userId);
      await kv.del(`doctor:${doctor.userId}`);
    }

    // Update stats
    const stats = await kv.get(`hospital-stats:${user.id}`);
    stats.totalDoctors = updatedDoctors.length;
    await kv.set(`hospital-stats:${user.id}`, stats);

    return c.json({ success: true, assignedPatients: doctor.assignedPatients || [] });
  } catch (err) {
    console.log('Error deleting doctor:', err);
    return c.json({ error: `Failed to delete doctor: ${err.message}` }, 500);
  }
});

// Get doctor by ID
app.get('/make-server-140653bc/hospital/doctors/:doctorId', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const doctorId = c.req.param('doctorId');
    const doctors = await kv.get(`hospital-doctors:${user.id}`) || [];
    const doctor = doctors.find((d: any) => d.id === doctorId);
    
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }

    return c.json({ doctor });
  } catch (err) {
    console.log('Error fetching doctor:', err);
    return c.json({ error: `Failed to fetch doctor: ${err.message}` }, 500);
  }
});

// Get hospital departments
app.get('/make-server-140653bc/hospital/departments', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const departments = await kv.get(`hospital-departments:${user.id}`) || [];
    return c.json({ departments });
  } catch (err) {
    console.log('Error fetching departments:', err);
    return c.json({ error: `Failed to fetch departments: ${err.message}` }, 500);
  }
});

// Search patient by ID (includes demo patients)
app.get('/make-server-140653bc/hospital/patients/search/:patientId', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const patientId = c.req.param('patientId');
    
    // Check if it's a demo patient
    const demoPatients = await kv.get(`demo-patients:${user.id}`) || [];
    const demoPatient = demoPatients.find((p: any) => p.patientId === patientId);

    if (demoPatient) {
      return c.json({ 
        patient: {
          patientId: demoPatient.patientId,
          kycData: demoPatient.kycData,
          role: 'patient',
          isDemo: true
        },
        reports: []
      });
    }

    // Search for real user
    const allUsers = await kv.getByPrefix('user:');
    const patient = allUsers.find((u: any) => u.value?.patientId === patientId);
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    const reports = await kv.get(`medical-reports:${patient.value.id}`) || [];
    
    return c.json({ 
      patient: patient.value,
      reports
    });
  } catch (err) {
    console.log('Error searching patient:', err);
    return c.json({ error: `Failed to search patient: ${err.message}` }, 500);
  }
});

// Update patient medical data (requires verification)
app.post('/make-server-140653bc/hospital/patients/:patientId/update', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const patientIdParam = c.req.param('patientId');
    const body = await c.req.json();
    const { diagnosis, appointment, bills, doctorName, doctorId } = body;

    // Check if demo patient
    const demoPatients = await kv.get(`demo-patients:${user.id}`) || [];
    const isDemo = demoPatients.some((p: any) => p.patientId === patientIdParam);

    if (isDemo) {
      return c.json({ 
        success: true, 
        message: 'Demo patient - changes not persisted',
        requiresVerification: false 
      });
    }

    // Find real patient
    const allUsers = await kv.getByPrefix('user:');
    const patient = allUsers.find((u: any) => u.value?.patientId === patientIdParam);
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    const patientUserId = patient.value.id;
    const hospitalData = await kv.get(`hospital:${user.id}`);

    // Create pending report
    const pendingReport = {
      id: Date.now().toString(),
      diagnosis,
      appointment,
      bills,
      date: new Date().toISOString(),
      hospital: hospitalData?.hospitalName || 'Unknown Hospital',
      doctorName,
      doctorId,
      verified: false
    };

    // Create notification for patient
    const notifications = await kv.get(`notifications:${patientUserId}`) || [];
    const notification = {
      id: pendingReport.id,
      type: 'verification',
      message: `${doctorName || 'A doctor'} from ${hospitalData?.hospitalName} wants to update your medical record. Please verify.`,
      data: {
        reportData: pendingReport,
        doctorName: doctorName || 'Doctor',
        hospitalName: hospitalData?.hospitalName
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(notification);
    await kv.set(`notifications:${patientUserId}`, notifications);

    return c.json({ 
      success: true, 
      requiresVerification: true,
      message: 'Verification request sent to patient'
    });
  } catch (err) {
    console.log('Error updating patient data:', err);
    return c.json({ error: `Failed to update patient data: ${err.message}` }, 500);
  }
});

// Get doctor's assigned patients
app.get('/make-server-140653bc/doctor/patients', async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const doctorData = await kv.get(`doctor:${user.id}`);
    const assignedPatientIds = doctorData?.assignedPatients || [];

    // Get all users and filter by assigned patient IDs
    const allUsers = await kv.getByPrefix('user:');
    const patients = allUsers
      .filter((u: any) => assignedPatientIds.includes(u.value?.patientId))
      .map((u: any) => u.value);

    return c.json({ patients });
  } catch (err) {
    console.log('Error fetching doctor patients:', err);
    return c.json({ error: `Failed to fetch patients: ${err.message}` }, 500);
  }
});

Deno.serve(app.fetch);
