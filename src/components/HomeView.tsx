import { useState, type FormEvent } from 'react';
import { ArrowRight, Search, Building2 } from 'lucide-react';
import type { PageView } from '../types';
import StudentIdCard from './StudentIdCard';

interface HomeViewProps {
  onNavigate: (view: PageView) => void;
  onLookupSubmit: (query: string) => Promise<boolean>;
}

const STEPS = [
  {
    number: '01.',
    title: 'Complete Student Registration',
    description:
      'Enter your personal details, college registration number, academic department, course, and residential address in the online form.',
  },
  {
    number: '02.',
    title: 'Upload Photograph & Admission Proof',
    description:
      'Attach a passport-style JPG or PNG student photograph along with your official college admission letter or tuition receipt.',
  },
  {
    number: '03.',
    title: 'Receive Reference Number & Preview',
    description:
      'Get a unique registration reference number immediately upon submission and inspect your automatically generated digital student ID card.',
  },
  {
    number: '04.',
    title: 'Verification & PDF Download',
    description:
      'Track your application status in the Student Portal as the Registrar reviews your documents, and download your official ID card as a PDF.',
  },
];

export default function HomeView({ onNavigate, onLookupSubmit }: HomeViewProps) {
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = lookupQuery.trim();
    if (!trimmed) {
      setLookupError('Enter your registration reference number or student registration number.');
      return;
    }
    setLookupError('');
    setIsSearching(true);
    const found = await onLookupSubmit(trimmed);
    setIsSearching(false);
    if (!found) {
      setLookupError('No application found for that reference or registration number.');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-xs font-semibold tracking-wide text-blue-700">
                Academic Session 2026–2027 · Official Student Identification Desk
              </p>
              <h1
                className="mt-3 max-w-xl font-display font-bold tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.35rem)', lineHeight: 1.1, textWrap: 'balance' }}
              >
                Apply for Your Student ID Card
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Submit your enrollment details, upload your student photograph and college admission
                proof, and receive an instant digital student ID card preview with a downloadable PDF
                and live verification status.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('student')}
                  className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
                >
                  Open Student Portal
                </button>
              </div>

              {/* Quick Lookup Bar */}
              <div className="mt-10 border-t border-slate-200 pt-6">
                <p className="text-xs font-medium text-slate-600">
                  Already applied? Check your application status and download your ID card.
                </p>
                <form onSubmit={handleLookup} className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Enter Reference No. (e.g. REF-2026-842910) or Reg. No."
                      aria-label="Reference or Registration Number"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    {isSearching ? 'Checking...' : 'Check Status'}
                  </button>
                </form>
                {lookupError && (
                  <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                    {lookupError}
                  </p>
                )}
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5">
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src="/src/assets/images/hero_campus_portal_1795593559807.jpg"
                  alt="Students walking through modern university campus atrium"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
                    <Building2 className="h-4 w-4" />
                    <span>Campus Identity Services</span>
                  </div>
                  <p className="mt-1 font-display text-sm font-semibold text-white">
                    Valid across campus libraries, laboratories, transit, and examination halls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Four straightforward steps from online registration to your downloadable official
              student ID card.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col border-t-2 border-blue-700 bg-white p-6 rounded-xl border-x border-b border-x-slate-200 border-b-slate-200"
              >
                <span className="font-mono text-sm font-semibold tabular-nums text-blue-700">
                  {step.number}
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital ID Card Preview Showcase */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Standardized Digital & Printable ID Card
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Every approved registration generates a structured CR80 institutional card bearing
                your verified photograph, department, course, academic session, and validity date.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 pt-6 text-sm">
                <div>
                  <dt className="font-semibold text-slate-900">Verified Identity</dt>
                  <dd className="mt-1 text-slate-600">
                    College seal, student photo, and unique Student ID number.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Academic Details</dt>
                  <dd className="mt-1 text-slate-600">
                    Department, course degree, academic year, and validity date.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Live Status Tracking</dt>
                  <dd className="mt-1 text-slate-600">
                    Pending, Approved, or Rejected status updated by Registrar Admin.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Instant PDF Export</dt>
                  <dd className="mt-1 text-slate-600">
                    Download front and back card layout ready for printing or mobile use.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-center lg:col-span-6 lg:justify-end">
              <StudentIdCard
                data={{
                  fullName: 'Ananya Sharma',
                  studentIdNumber: 'SID-2026-4102',
                  regNumber: '2026CS0142',
                  department: 'Computer Science & Engineering',
                  course: 'B.Tech Computer Science',
                  academicYear: '2026–2027',
                  validityDate: 'May 2029',
                  collegeName: 'Westfield Institute of Technology',
                  photoDataUrl: '/src/assets/images/sample_student_one_1795593559151.jpg',
                  bloodGroup: 'O+',
                  dob: '2005-08-19',
                  mobile: '+1 555 234 8910',
                  address: '418 Oakwood Avenue, Apt 3B, Springfield, IL 62704',
                  referenceNumber: 'REF-2026-842910',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
