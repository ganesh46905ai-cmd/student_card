import { useState } from 'react';
import { RotateCw, User } from 'lucide-react';

export interface StudentCardData {
  fullName: string;
  studentIdNumber: string;
  regNumber: string;
  department: string;
  course: string;
  academicYear: string;
  validityDate: string;
  collegeName: string;
  photoDataUrl?: string;
  bloodGroup?: string;
  dob?: string;
  mobile?: string;
  address?: string;
  referenceNumber?: string;
}

interface StudentIdCardProps {
  data: StudentCardData;
  showFlipToggle?: boolean;
}

function CollegeCrest({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 4L8 10.5V22.5C8 33.1 14.8 41.9 24 44.5C33.2 41.9 40 33.1 40 22.5V10.5L24 4Z"
        fill="#FFFFFF"
        fillOpacity="0.16"
        stroke="#FFFFFF"
        strokeWidth="2.2"
      />
      <path
        d="M24 12L14 16.5L24 21L34 16.5L24 12Z"
        fill="#FFFFFF"
      />
      <path
        d="M17.5 20V26.5C17.5 29 20.4 31 24 31C27.6 31 30.5 29 30.5 26.5V20"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="34" cy="23.5" r="1.5" fill="#93C5FD" />
      <path d="M34 16.5V22.5" stroke="#93C5FD" strokeWidth="1.6" />
    </svg>
  );
}

function BarcodeStrip({ code }: { code: string }) {
  const clean = (code || 'SID-2026-0000').replace(/[^A-Z0-9]/gi, '');
  const bars = Array.from({ length: 34 }, (_, i) => {
    const charCode = clean.charCodeAt(i % Math.max(clean.length, 1)) || 65;
    const width = ((charCode + i * 7) % 3) + 1;
    const gap = ((charCode + i * 3) % 2) + 1;
    return { width, gap, x: i };
  });

  let cursor = 2;
  return (
    <svg viewBox="0 0 180 26" className="h-6 w-36" aria-hidden="true">
      {bars.map((bar, idx) => {
        const x = cursor;
        cursor += bar.width + bar.gap;
        if (x > 176) return null;
        return (
          <rect
            key={idx}
            x={x}
            y={2}
            width={bar.width}
            height={22}
            fill="#0F172A"
            rx="0.3"
          />
        );
      })}
    </svg>
  );
}

export default function StudentIdCard({ data, showFlipToggle = true }: StudentIdCardProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [imgError, setImgError] = useState(false);

  const collegeName = data.collegeName.trim() || 'Westfield Institute of Technology';
  const studentName = data.fullName.trim() || 'Student Full Name';
  const studentId = data.studentIdNumber.trim() || 'SID-2026-PENDING';
  const regNumber = data.regNumber.trim() || '2026REG0000';
  const department = data.department.trim() || 'Department';
  const course = data.course.trim() || 'Course / Degree';
  const academicYear = data.academicYear.trim() || '2026–2027';
  const validityDate = data.validityDate.trim() || 'May 2030';

  return (
    <div className="w-full max-w-[440px]">
      {side === 'front' ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          {/* Official College Blue Header */}
          <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 px-5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <CollegeCrest className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold tracking-tight text-white">
                  {collegeName}
                </p>
                <p className="text-[11px] font-medium tracking-wide text-blue-100">
                  Official Student Identity Card
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[11px] font-medium tabular-nums text-blue-100">
                  {academicYear}
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Student Portrait */}
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {data.photoDataUrl && !imgError ? (
                  <img
                    src={data.photoDataUrl}
                    alt={`${studentName} portrait`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <User className="h-8 w-8" />
                    <span className="mt-1 text-[10px] font-medium">Photo</span>
                  </div>
                )}
              </div>

              {/* Primary Credentials */}
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Student Name</p>
                  <p className="truncate font-display text-base font-bold text-slate-900">
                    {studentName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Student ID</p>
                    <p className="truncate font-mono text-xs font-semibold tabular-nums text-blue-800">
                      {studentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Reg. No.</p>
                    <p className="truncate font-mono text-xs font-semibold tabular-nums text-slate-800">
                      {regNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-500">Department</p>
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {department}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Metadata Grid */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3">
              <div className="col-span-2 min-w-0">
                <p className="text-[10px] font-medium text-slate-500">Course / Degree</p>
                <p className="truncate text-xs font-semibold text-slate-900">{course}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-slate-500">Valid Thru</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                  {validityDate}
                </p>
              </div>
            </div>
          </div>

          {/* Security Footer Strip */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5">
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span>Session {academicYear}</span>
              {data.bloodGroup && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-800">Blood: {data.bloodGroup}</span>
                </>
              )}
            </div>
            <BarcodeStrip code={studentId || regNumber} />
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="bg-slate-900 px-5 py-3 text-white">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold tracking-wide text-slate-100">
                Holder Information & Institutional Terms
              </p>
              <span className="font-mono text-[11px] tabular-nums text-slate-300">
                {data.referenceNumber || studentId}
              </span>
            </div>
          </div>

          <div className="space-y-3 px-5 py-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium text-slate-500">Date of Birth</p>
                <p className="font-mono font-medium tabular-nums text-slate-900">
                  {data.dob || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500">Emergency Contact</p>
                <p className="font-mono font-medium tabular-nums text-slate-900">
                  {data.mobile || 'Not specified'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-500">Residential Address</p>
              <p className="line-clamp-2 leading-relaxed text-slate-800">
                {data.address || 'Registered residential address on file with Registrar.'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-600">
              This card remains the property of {collegeName}. Present upon request on campus,
              library, and examination venues. Report lost cards immediately to the Registrar Office.
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5">
            <span className="text-[11px] font-medium text-slate-600">
              Authorized Registrar Seal
            </span>
            <span className="font-mono text-[11px] tabular-nums text-slate-500">
              Valid Thru {validityDate}
            </span>
          </div>
        </div>
      )}

      {showFlipToggle && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {side === 'front' ? 'Front' : 'Back'} of Card · CR80 Standard
          </span>
          <button
            type="button"
            onClick={() => setSide((prev) => (prev === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-800"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>View {side === 'front' ? 'Back' : 'Front'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
