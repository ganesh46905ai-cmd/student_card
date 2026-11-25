import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Lock,
  LogOut,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import type { ApplicationStatus, StudentApplication } from '../types';
import StatusLabel from './StatusLabel';
import StudentIdCard from './StudentIdCard';
import { downloadStudentIdPdf } from '../utils/generateIdPdf';

interface SummaryCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const ADMIN_TOKEN_KEY = 'student_portal_admin_token';

export default function AdminDashboard() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [adminEmail, setAdminEmail] = useState('admin@studentportal.edu');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [summary, setSummary] = useState<SummaryCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchApplications = async (activeToken: string, search: string, status: string) => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'All') params.set('status', status);

      const response = await fetch(`/api/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (response.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken('');
        setIsLoadingData(false);
        return;
      }

      const data = (await response.json()) as {
        applications?: StudentApplication[];
        summary?: SummaryCounts;
        error?: string;
      };

      if (!response.ok) {
        setDataError(data.error || 'Failed to load student applications.');
      } else {
        setApplications(data.applications || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch {
      setDataError('Network error while loading applications.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      void fetchApplications(token, searchQuery, statusFilter);
    }, 150);
    return () => clearTimeout(timer);
  }, [token, searchQuery, statusFilter]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password }),
      });

      const data = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !data.token) {
        setLoginError(data.error || 'Invalid credentials.');
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword('');
    } catch {
      setLoginError('Unable to reach authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setSelectedApp(null);
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: ApplicationStatus,
    remarks?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, adminRemarks: remarks }),
      });

      if (response.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken('');
        return;
      }

      const data = (await response.json()) as {
        application?: StudentApplication;
        error?: string;
      };

      if (response.ok && data.application) {
        setSelectedApp((prev) => (prev && prev.id === id ? data.application! : prev));
        await fetchApplications(token, searchQuery, statusFilter);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  // Admin Login View
  if (!token) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            Admin Portal Sign In
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Sign in with your Registrar administrator credentials to review student registrations
            and manage ID approvals.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">Demo Registrar Credentials</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                  admin@studentportal.edu · admin123
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@studentportal.edu');
                  setPassword('admin123');
                  setLoginError('');
                }}
                className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
              >
                Fill Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Admin Top Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-700">
            Registrar Administration · Student Records
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 4-Column Summary Strip */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total Registrations</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {summary.total}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Pending Review</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-amber-700">
            {summary.pending}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Approved ID Cards</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-700">
            {summary.approved}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Rejected Applications</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-red-700">
            {summary.rejected}
          </p>
        </div>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or registration number..."
            aria-label="Search students by name or registration number"
            className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 overflow-x-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {dataError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {dataError}
        </div>
      )}

      {/* Registered Students Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3.5">Student</th>
                <th scope="col" className="px-4 py-3.5">Reg. / Reference No.</th>
                <th scope="col" className="px-4 py-3.5">College & Course</th>
                <th scope="col" className="px-4 py-3.5">Submitted</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoadingData && applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading registered students...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No student registrations match your current search or filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.photoDataUrl}
                          alt={app.fullName}
                          referrerPolicy="no-referrer"
                          className="h-10 w-9 shrink-0 rounded-md border border-slate-200 object-cover bg-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{app.fullName}</p>
                          <p className="truncate text-xs text-slate-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs tabular-nums">
                      <p className="font-semibold text-slate-900">{app.regNumber}</p>
                      <p className="text-slate-500">{app.referenceNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <p className="font-medium text-slate-900">{app.collegeName}</p>
                      <p className="text-slate-500">
                        {app.course} · {app.department}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-slate-600 whitespace-nowrap">
                      {formatDate(app.submittedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusLabel status={app.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setRemarksInput(app.adminRemarks || '');
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review</span>
                        </button>
                        {app.status !== 'Approved' && (
                          <button
                            type="button"
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusUpdate(app.id, 'Approved')}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 whitespace-nowrap shrink-0"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {app.status !== 'Rejected' && (
                          <button
                            type="button"
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 whitespace-nowrap shrink-0"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Inspection & Verification Modal */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 id="review-modal-title" className="font-display text-lg font-bold text-slate-900">
                  Review Application · {selectedApp.fullName}
                </h2>
                <StatusLabel status={selectedApp.status} size="md" />
              </div>
              <button
                type="button"
                aria-label="Close review modal"
                onClick={() => setSelectedApp(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-8 p-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Reference Number</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900">
                      {selectedApp.referenceNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Registration Number</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900">
                      {selectedApp.regNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">College Name</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{selectedApp.collegeName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Department</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{selectedApp.department}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Course & Year</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      {selectedApp.course} · {selectedApp.yearOfStudy} ({selectedApp.semester})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">DOB & Gender</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      <span className="font-mono tabular-nums">{selectedApp.dob}</span> ·{' '}
                      {selectedApp.gender}
                      {selectedApp.bloodGroup ? ` · ${selectedApp.bloodGroup}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Email</dt>
                    <dd className="mt-0.5 break-all font-medium text-slate-900">
                      {selectedApp.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Mobile</dt>
                    <dd className="mt-0.5 font-mono font-medium tabular-nums text-slate-900">
                      {selectedApp.mobile}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-slate-500">Residential Address</dt>
                    <dd className="mt-0.5 text-slate-800">{selectedApp.address}</dd>
                  </div>
                </dl>

                {/* Admission Proof Preview */}
                <div className="border-t border-slate-200 pt-5">
                  <p className="text-xs font-semibold text-slate-700">
                    Uploaded College Admission Proof
                  </p>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <FileText className="h-4 w-4 text-blue-700" />
                        <span>{selectedApp.proofFileName}</span>
                      </span>
                      {selectedApp.proofDataUrl && (
                        <a
                          href={selectedApp.proofDataUrl}
                          download={selectedApp.proofFileName}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                    {selectedApp.proofDataUrl &&
                      selectedApp.proofFileType.startsWith('image/') && (
                        <img
                          src={selectedApp.proofDataUrl}
                          alt="Admission proof"
                          className="mt-3 max-h-48 w-full rounded-lg border border-slate-200 object-contain bg-white"
                        />
                      )}
                  </div>
                </div>

                {/* Admin Decision & Remarks */}
                <div className="border-t border-slate-200 pt-5">
                  <label htmlFor="admin-remarks" className="block text-xs font-semibold text-slate-700">
                    Verification Remarks (optional)
                  </label>
                  <textarea
                    id="admin-remarks"
                    rows={2}
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    placeholder="Add a note for the student (e.g., document verified or reason for rejection)"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() =>
                        handleStatusUpdate(selectedApp.id, 'Approved', remarksInput)
                      }
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Application</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() =>
                        handleStatusUpdate(selectedApp.id, 'Rejected', remarksInput)
                      }
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Application</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Preview in Modal */}
              <div className="space-y-4 lg:col-span-5">
                <p className="text-xs font-semibold text-slate-700">Generated ID Card Preview</p>
                <StudentIdCard
                  data={{
                    fullName: selectedApp.fullName,
                    studentIdNumber: selectedApp.studentIdNumber,
                    regNumber: selectedApp.regNumber,
                    department: selectedApp.department,
                    course: selectedApp.course,
                    academicYear: selectedApp.academicYear,
                    validityDate: selectedApp.validityDate,
                    collegeName: selectedApp.collegeName,
                    photoDataUrl: selectedApp.photoDataUrl,
                    bloodGroup: selectedApp.bloodGroup,
                    dob: selectedApp.dob,
                    mobile: selectedApp.mobile,
                    address: selectedApp.address,
                    referenceNumber: selectedApp.referenceNumber,
                  }}
                />
                <button
                  type="button"
                  onClick={() => downloadStudentIdPdf(selectedApp)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Student ID PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
