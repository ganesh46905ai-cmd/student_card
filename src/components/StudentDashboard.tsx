import { useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Search,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import type { PageView, StudentApplication } from '../types';
import StudentIdCard from './StudentIdCard';
import StatusLabel from './StatusLabel';
import { downloadStudentIdPdf } from '../utils/generateIdPdf';

interface StudentDashboardProps {
  application: StudentApplication | null;
  justRegistered: boolean;
  onDismissSuccess: () => void;
  onLookup: (query: string) => Promise<boolean>;
  onNavigate: (view: PageView) => void;
}

export default function StudentDashboard({
  application,
  justRegistered,
  onDismissSuccess,
  onLookup,
  onNavigate,
}: StudentDashboardProps) {
  const [query, setQuery] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setLookupError('Enter a Registration Reference Number or Student Registration Number.');
      return;
    }
    setLookupError('');
    setIsLoading(true);
    const ok = await onLookup(trimmed);
    setIsLoading(false);
    if (!ok) {
      setLookupError('No matching student registration found.');
    }
  };

  const handleRefresh = async () => {
    if (!application) return;
    setIsLoading(true);
    await onLookup(application.referenceNumber);
    setIsLoading(false);
  };

  const handleCopyRef = async () => {
    if (!application) return;
    try {
      await navigator.clipboard.writeText(application.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleDownloadPdf = async () => {
    if (!application) return;
    setIsDownloading(true);
    try {
      await downloadStudentIdPdf(application);
    } finally {
      setIsDownloading(false);
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      {/* Header & Lookup Bar */}
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-700">
            Student Portal · Application & Digital ID
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            Student Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            View your submitted profile, application status, and download your official Student ID Card PDF.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lookup Ref No. or Reg No."
                aria-label="Lookup by Reference or Registration Number"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isLoading ? 'Searching...' : 'Find Record'}
            </button>
          </div>
          {lookupError && (
            <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
              {lookupError}
            </p>
          )}
        </form>
      </div>

      {/* Registration Success Confirmation Banner */}
      {application && justRegistered && (
        <div
          role="status"
          className="mt-6 flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="font-display text-sm font-bold text-emerald-900">
                Registration Submitted Successfully
              </h2>
              <p className="mt-1 text-sm text-emerald-800">
                Your application has been received and assigned Reference Number{' '}
                <span className="font-mono font-bold tabular-nums">
                  {application.referenceNumber}
                </span>
                . Save this number to track your approval status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissSuccess}
            className="self-start rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 whitespace-nowrap shrink-0 sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State when no student is loaded */}
      {!application ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Look Up Your Student ID Application
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
            Enter your Registration Reference Number or Student Registration Number above, or submit
            a new application to generate your digital Student ID card.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Student Registration</span>
            </button>
          </div>

          <div className="mx-auto mt-8 max-w-lg border-t border-slate-200 pt-6">
            <p className="text-xs font-medium text-slate-500">
              Quick Demo Lookups
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onLookup('REF-2026-842910')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                <span className="font-mono font-semibold">REF-2026-842910</span> · Approved Sample
              </button>
              <button
                type="button"
                onClick={() => onLookup('REF-2026-519304')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                <span className="font-mono font-semibold">REF-2026-519304</span> · Pending Sample
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Reference & Status Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  Registration Reference Number
                </span>
                <StatusLabel status={application.status} size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                  {application.referenceNumber}
                </p>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {formatDate(application.submittedAt)}
                <span className="mx-1.5" aria-hidden="true">·</span>
                Student ID: <span className="font-mono font-semibold text-slate-700">{application.studentIdNumber}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Generating PDF...' : 'Download ID Card as PDF'}</span>
              </button>
            </div>
          </div>

          {application.adminRemarks && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                application.status === 'Rejected'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-blue-200 bg-blue-50 text-blue-900'
              }`}
            >
              <span className="font-semibold">Registrar Remarks: </span>
              <span>{application.adminRemarks}</span>
            </div>
          )}

          {/* Main 2-Column Content */}
          <div className="grid items-start gap-8 lg:grid-cols-12">
            {/* Student Profile Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <img
                  src={application.photoDataUrl}
                  alt={application.fullName}
                  referrerPolicy="no-referrer"
                  className="h-16 w-14 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-bold text-slate-900">
                    {application.fullName}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {application.course} · {application.department}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Student Registration Number</dt>
                  <dd className="mt-1 font-mono font-semibold tabular-nums text-slate-900">
                    {application.regNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Student ID Number</dt>
                  <dd className="mt-1 font-mono font-semibold tabular-nums text-blue-800">
                    {application.studentIdNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">College Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">{application.collegeName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Department</dt>
                  <dd className="mt-1 font-medium text-slate-900">{application.department}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Year & Semester</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {application.yearOfStudy} · {application.semester}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Academic Year & Validity</dt>
                  <dd className="mt-1 font-mono font-medium tabular-nums text-slate-900">
                    {application.academicYear} (Valid Thru {application.validityDate})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Date of Birth</dt>
                  <dd className="mt-1 font-mono font-medium tabular-nums text-slate-900">
                    {application.dob}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Gender & Blood Group</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {application.gender}
                    {application.bloodGroup ? ` · ${application.bloodGroup}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Email Address</dt>
                  <dd className="mt-1 break-all font-medium text-slate-900">{application.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Mobile Number</dt>
                  <dd className="mt-1 font-mono font-medium tabular-nums text-slate-900">
                    {application.mobile}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Residential Address</dt>
                  <dd className="mt-1 leading-relaxed text-slate-800">{application.address}</dd>
                </div>
                <div className="sm:col-span-2 border-t border-slate-200 pt-4">
                  <dt className="text-xs font-medium text-slate-500">Submitted Admission Proof</dt>
                  <dd className="mt-1.5 flex items-center gap-2 text-slate-800">
                    <FileText className="h-4 w-4 text-blue-700" />
                    <span className="font-medium">{application.proofFileName}</span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Digital Student ID Card Column */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5">
              <h2 className="font-display text-base font-bold text-slate-900">
                Student ID Card Preview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Digital institutional card generated from your registration record.
              </p>

              <div className="mt-5 flex justify-center">
                <StudentIdCard
                  data={{
                    fullName: application.fullName,
                    studentIdNumber: application.studentIdNumber,
                    regNumber: application.regNumber,
                    department: application.department,
                    course: application.course,
                    academicYear: application.academicYear,
                    validityDate: application.validityDate,
                    collegeName: application.collegeName,
                    photoDataUrl: application.photoDataUrl,
                    bloodGroup: application.bloodGroup,
                    dob: application.dob,
                    mobile: application.mobile,
                    address: application.address,
                    referenceNumber: application.referenceNumber,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Preparing PDF...' : 'Download ID Card as PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
