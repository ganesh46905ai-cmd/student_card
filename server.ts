import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { ApplicationStatus, StudentApplication } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@studentportal.edu';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const activeTokens = new Set<string>();

function createInitialSeedData(): StudentApplication[] {
  return [
    {
      id: 'app-seed-1',
      referenceNumber: 'REF-2026-842910',
      studentIdNumber: 'SID-2026-4102',
      fullName: 'Ananya Sharma',
      regNumber: '2026CS0142',
      dob: '2005-08-19',
      gender: 'Female',
      email: 'ananya.sharma@westfield.edu',
      mobile: '+1 555 234 8910',
      collegeName: 'Westfield Institute of Technology',
      department: 'Computer Science & Engineering',
      course: 'B.Tech Computer Science',
      yearOfStudy: '2nd Year',
      semester: 'Semester 4',
      bloodGroup: 'O+',
      address: '418 Oakwood Avenue, Apt 3B, Springfield, IL 62704',
      photoDataUrl: '/src/assets/images/sample_student_one_1795593559151.jpg',
      proofDataUrl: '',
      proofFileName: 'admission_letter_2026CS0142.pdf',
      proofFileType: 'application/pdf',
      academicYear: '2026–2027',
      validityDate: 'May 2029',
      status: 'Approved',
      adminRemarks: 'Admission letter verified with Registrar records.',
      submittedAt: '2026-11-18T10:24:00.000Z',
      reviewedAt: '2026-11-19T14:10:00.000Z',
    },
    {
      id: 'app-seed-2',
      referenceNumber: 'REF-2026-519304',
      studentIdNumber: 'SID-2026-4109',
      fullName: 'Daniel Chen',
      regNumber: '2026EE0288',
      dob: '2006-02-11',
      gender: 'Male',
      email: 'daniel.chen@westfield.edu',
      mobile: '+1 555 876 5432',
      collegeName: 'Westfield Institute of Technology',
      department: 'Electrical & Electronics Engineering',
      course: 'B.E. Electrical Engineering',
      yearOfStudy: '1st Year',
      semester: 'Semester 2',
      bloodGroup: 'A+',
      address: '72 Cedar Ridge Lane, Springfield, IL 62702',
      photoDataUrl: '/src/assets/images/sample_student_two_1795593559877.jpg',
      proofDataUrl: '',
      proofFileName: 'enrollment_receipt_2026EE0288.pdf',
      proofFileType: 'application/pdf',
      academicYear: '2026–2027',
      validityDate: 'May 2030',
      status: 'Pending',
      submittedAt: '2026-11-23T16:45:00.000Z',
    },
    {
      id: 'app-seed-3',
      referenceNumber: 'REF-2026-307412',
      studentIdNumber: 'SID-2025-1944',
      fullName: 'Priya Nair',
      regNumber: '2025ME0095',
      dob: '2004-11-04',
      gender: 'Female',
      email: 'priya.nair@westfield.edu',
      mobile: '+1 555 612 9043',
      collegeName: 'Westfield Institute of Technology',
      department: 'Mechanical Engineering',
      course: 'B.Tech Mechanical Engineering',
      yearOfStudy: '3rd Year',
      semester: 'Semester 5',
      bloodGroup: 'B+',
      address: '190 Maple Grove Court, Springfield, IL 62701',
      photoDataUrl: '/src/assets/images/sample_student_one_1795593559151.jpg',
      proofDataUrl: '',
      proofFileName: 'fee_receipt_cropped.jpg',
      proofFileType: 'image/jpeg',
      academicYear: '2026–2027',
      validityDate: 'May 2028',
      status: 'Rejected',
      adminRemarks: 'Uploaded admission proof image was partially cropped. Please submit a full-page receipt.',
      submittedAt: '2026-11-20T09:15:00.000Z',
      reviewedAt: '2026-11-21T11:30:00.000Z',
    },
  ];
}

function ensureDataFile(): StudentApplication[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seeded = createInitialSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StudentApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const seeded = createInitialSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

function writeApplications(apps: StudentApplication[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf-8');
}

function generateReferenceNumber(existing: StudentApplication[]): string {
  const existingRefs = new Set(existing.map((a) => a.referenceNumber));
  let candidate = '';
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    candidate = `REF-2026-${num}`;
  } while (existingRefs.has(candidate));
  return candidate;
}

function generateStudentIdNumber(existing: StudentApplication[]): string {
  const existingIds = new Set(existing.map((a) => a.studentIdNumber));
  let candidate = '';
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    candidate = `SID-2026-${num}`;
  } while (existingIds.has(candidate));
  return candidate;
}

function computeValidityDate(yearOfStudy: string): string {
  const currentYear = 2026;
  const lower = yearOfStudy.toLowerCase();
  if (lower.includes('1st')) return `May ${currentYear + 4}`;
  if (lower.includes('2nd')) return `May ${currentYear + 3}`;
  if (lower.includes('3rd')) return `May ${currentYear + 2}`;
  if (lower.includes('4th')) return `May ${currentYear + 1}`;
  return `May ${currentYear + 2}`;
}

function signToken(username: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${username}:${Date.now()}:${nonce}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Administrator authentication required.' });
    return;
  }
  const token = auth.slice('Bearer '.length).trim();
  if (!activeTokens.has(token)) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Ensure initial store exists
  ensureDataFile();

  // Admin Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const normalizedEmail = (email || '').trim().toLowerCase();
    const validEmail =
      normalizedEmail === ADMIN_EMAIL.toLowerCase() || normalizedEmail === 'admin';

    if (!validEmail || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = signToken(ADMIN_EMAIL);
    activeTokens.add(token);
    res.json({ token, email: ADMIN_EMAIL });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      activeTokens.delete(auth.slice('Bearer '.length).trim());
    }
    res.json({ ok: true });
  });

  app.get('/api/admin/verify', requireAdmin, (_req: Request, res: Response) => {
    res.json({ valid: true, email: ADMIN_EMAIL });
  });

  // Public Student Lookup by Reference Number or Registration Number
  app.get('/api/applications/lookup', (req: Request, res: Response) => {
    const query = String(req.query.query || '').trim().toLowerCase();
    if (!query) {
      res.status(400).json({ error: 'Please provide a reference or registration number.' });
      return;
    }
    const apps = ensureDataFile();
    const match = apps.find(
      (item) =>
        item.referenceNumber.toLowerCase() === query ||
        item.regNumber.toLowerCase() === query ||
        item.studentIdNumber.toLowerCase() === query
    );

    if (!match) {
      res.status(404).json({
        error: 'No student registration found matching that reference or registration number.',
      });
      return;
    }
    res.json({ application: match });
  });

  // Public Submit Registration
  app.post('/api/applications', (req: Request, res: Response) => {
    const body = req.body as Partial<StudentApplication>;
    const requiredFields: Array<[keyof StudentApplication, string]> = [
      ['fullName', 'Student Full Name'],
      ['regNumber', 'Student Registration Number'],
      ['dob', 'Date of Birth'],
      ['gender', 'Gender'],
      ['email', 'Email Address'],
      ['mobile', 'Mobile Number'],
      ['collegeName', 'College Name'],
      ['department', 'Department'],
      ['course', 'Course / Degree'],
      ['yearOfStudy', 'Year of Study'],
      ['semester', 'Semester'],
      ['address', 'Residential Address'],
      ['photoDataUrl', 'Student Photograph'],
      ['proofDataUrl', 'College Admission Proof'],
    ];

    for (const [key, label] of requiredFields) {
      const value = body[key];
      if (typeof value !== 'string' || value.trim().length === 0) {
        res.status(400).json({ error: `${label} is required.` });
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(body.email).trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const digitsOnly = String(body.mobile).replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      res.status(400).json({ error: 'Mobile number must contain 10 to 15 digits.' });
      return;
    }

    const photo = String(body.photoDataUrl);
    if (!photo.startsWith('data:image/jpeg;base64,') && !photo.startsWith('data:image/png;base64,')) {
      res.status(400).json({ error: 'Student photograph must be a JPG, JPEG, or PNG image.' });
      return;
    }

    const apps = ensureDataFile();
    const referenceNumber = generateReferenceNumber(apps);
    const studentIdNumber = generateStudentIdNumber(apps);
    const yearOfStudy = String(body.yearOfStudy).trim();

    const created: StudentApplication = {
      id: `app-${crypto.randomUUID()}`,
      referenceNumber,
      studentIdNumber,
      fullName: String(body.fullName).trim(),
      regNumber: String(body.regNumber).trim().toUpperCase(),
      dob: String(body.dob).trim(),
      gender: String(body.gender).trim(),
      email: String(body.email).trim().toLowerCase(),
      mobile: String(body.mobile).trim(),
      collegeName: String(body.collegeName).trim(),
      department: String(body.department).trim(),
      course: String(body.course).trim(),
      yearOfStudy,
      semester: String(body.semester).trim(),
      bloodGroup: body.bloodGroup ? String(body.bloodGroup).trim() : '',
      address: String(body.address).trim(),
      photoDataUrl: photo,
      proofDataUrl: String(body.proofDataUrl),
      proofFileName: String(body.proofFileName || 'admission_proof').trim(),
      proofFileType: String(body.proofFileType || 'application/octet-stream').trim(),
      academicYear: '2026–2027',
      validityDate: computeValidityDate(yearOfStudy),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    const updated = [created, ...apps];
    writeApplications(updated);
    res.status(201).json({ application: created });
  });

  // Admin: List & Search Applications
  app.get('/api/applications', requireAdmin, (req: Request, res: Response) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    const statusFilter = String(req.query.status || 'All').trim();
    const apps = ensureDataFile();

    const filtered = apps.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch =
        !search ||
        item.fullName.toLowerCase().includes(search) ||
        item.regNumber.toLowerCase().includes(search) ||
        item.referenceNumber.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });

    const summary = {
      total: apps.length,
      pending: apps.filter((a) => a.status === 'Pending').length,
      approved: apps.filter((a) => a.status === 'Approved').length,
      rejected: apps.filter((a) => a.status === 'Rejected').length,
    };

    res.json({ applications: filtered, summary });
  });

  // Admin: Update Status (Approve / Reject / Pending)
  app.patch('/api/applications/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminRemarks } = req.body as {
      status?: ApplicationStatus;
      adminRemarks?: string;
    };

    if (status !== 'Approved' && status !== 'Rejected' && status !== 'Pending') {
      res.status(400).json({ error: 'Invalid status. Must be Pending, Approved, or Rejected.' });
      return;
    }

    const apps = ensureDataFile();
    const index = apps.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Student application not found.' });
      return;
    }

    const updatedRecord: StudentApplication = {
      ...apps[index],
      status,
      adminRemarks: typeof adminRemarks === 'string' ? adminRemarks.trim() : apps[index].adminRemarks,
      reviewedAt: new Date().toISOString(),
    };

    apps[index] = updatedRecord;
    writeApplications(apps);
    res.json({ application: updatedRecord });
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student ID Card Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
