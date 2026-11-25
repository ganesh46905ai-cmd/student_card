import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImagePlus,
  Trash2,
  Upload,
} from 'lucide-react';
import type { RegistrationPayload, StudentApplication } from '../types';
import StudentIdCard from './StudentIdCard';

interface RegistrationFormProps {
  onSuccess: (application: StudentApplication) => void;
}

interface FormValues {
  fullName: string;
  regNumber: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
  collegeName: string;
  department: string;
  course: string;
  yearOfStudy: string;
  semester: string;
  bloodGroup: string;
  address: string;
  photoDataUrl: string;
  proofDataUrl: string;
  proofFileName: string;
  proofFileType: string;
}

type FormErrors = Partial<Record<keyof FormValues | 'submit', string>>;

const INITIAL_VALUES: FormValues = {
  fullName: '',
  regNumber: '',
  dob: '',
  gender: '',
  email: '',
  mobile: '',
  collegeName: '',
  department: '',
  course: '',
  yearOfStudy: '',
  semester: '',
  bloodGroup: '',
  address: '',
  photoDataUrl: '',
  proofDataUrl: '',
  proofFileName: '',
  proofFileType: '',
};

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Postgraduate Year 1',
  'Postgraduate Year 2',
];

const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function computePreviewValidity(yearOfStudy: string): string {
  const lower = yearOfStudy.toLowerCase();
  if (lower.includes('1st')) return 'May 2030';
  if (lower.includes('2nd')) return 'May 2029';
  if (lower.includes('3rd')) return 'May 2028';
  if (lower.includes('4th')) return 'May 2027';
  return 'May 2028';
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFileName, setPhotoFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    const lowerName = file.name.toLowerCase();
    const validExt =
      lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png');

    if (!validTypes.includes(file.type) && !validExt) {
      setErrors((prev) => ({
        ...prev,
        photoDataUrl: 'Only JPG, JPEG, and PNG image files are allowed.',
      }));
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photoDataUrl: 'Student photograph must be smaller than 5 MB.',
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoFileName(file.name);
        updateField('photoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProofUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const lowerName = file.name.toLowerCase();
    const allowedExt =
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.pdf');

    if (!allowedTypes.includes(file.type) && !allowedExt) {
      setErrors((prev) => ({
        ...prev,
        proofDataUrl: 'Admission proof must be a JPG, JPEG, PNG, or PDF file.',
      }));
      e.target.value = '';
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        proofDataUrl: 'Admission proof file must be smaller than 7 MB.',
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValues((prev) => ({
          ...prev,
          proofDataUrl: reader.result as string,
          proofFileName: file.name,
          proofFileType: file.type || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.proofDataUrl;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = 'Student full name is required.';
    if (!values.regNumber.trim()) {
      nextErrors.regNumber = 'Student registration number is required.';
    } else if (values.regNumber.trim().length < 4) {
      nextErrors.regNumber = 'Enter a valid registration number (at least 4 characters).';
    }
    if (!values.dob.trim()) nextErrors.dob = 'Date of birth is required.';
    if (!values.gender.trim()) nextErrors.gender = 'Please select your gender.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address (e.g. name@college.edu).';
    }

    const digits = values.mobile.replace(/\D/g, '');
    if (!values.mobile.trim()) {
      nextErrors.mobile = 'Mobile number is required.';
    } else if (digits.length < 10 || digits.length > 15) {
      nextErrors.mobile = 'Enter a valid mobile number (10 to 15 digits).';
    }

    if (!values.collegeName.trim()) nextErrors.collegeName = 'College name is required.';
    if (!values.department.trim()) nextErrors.department = 'Department is required.';
    if (!values.course.trim()) nextErrors.course = 'Course or degree is required.';
    if (!values.yearOfStudy.trim()) nextErrors.yearOfStudy = 'Select your year of study.';
    if (!values.semester.trim()) nextErrors.semester = 'Select your current semester.';
    if (!values.address.trim()) {
      nextErrors.address = 'Residential address is required.';
    } else if (values.address.trim().length < 10) {
      nextErrors.address = 'Please enter a complete residential address.';
    }

    if (!values.photoDataUrl) {
      nextErrors.photoDataUrl = 'Please upload a student photograph (JPG, JPEG, or PNG).';
    }
    if (!values.proofDataUrl) {
      nextErrors.proofDataUrl = 'Please upload your college admission proof.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: RegistrationPayload = {
        ...values,
        regNumber: values.regNumber.trim().toUpperCase(),
      };
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        application?: StudentApplication;
        error?: string;
      };

      if (!response.ok || !data.application) {
        setErrors({
          submit: data.error || 'Could not submit registration. Please verify all fields.',
        });
        setIsSubmitting(false);
        return;
      }

      onSuccess(data.application);
    } catch {
      setErrors({
        submit: 'Network error while submitting registration. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `mt-1.5 h-11 w-full rounded-lg border px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
      hasError
        ? 'border-red-400 bg-red-50/40 focus:border-red-600'
        : 'border-slate-300 bg-white focus:border-blue-700'
    }`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-blue-700">
          Academic Session 2026–2027 · Student Registration
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
          Student ID Card Registration Form
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Complete all required fields accurately. Fields marked with{' '}
          <span className="font-semibold text-red-600">*</span> are mandatory. Your digital ID card
          preview updates as you type.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7"
        >
          {errors.submit && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Section 1: Personal Information */}
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              01. Personal Information
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Enter your legal name and enrollment identifier exactly as printed on college records.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div id="field-fullName" className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                  Student Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={values.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Jordan Elizabeth Mercer"
                  className={inputClass(errors.fullName)}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div id="field-regNumber">
                <label htmlFor="regNumber" className="block text-xs font-semibold text-slate-700">
                  Student Registration Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="regNumber"
                  type="text"
                  value={values.regNumber}
                  onChange={(e) => updateField('regNumber', e.target.value)}
                  placeholder="e.g. 2026CS0194"
                  className={`${inputClass(errors.regNumber)} font-mono uppercase`}
                />
                {errors.regNumber && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.regNumber}</p>
                )}
              </div>

              <div id="field-dob">
                <label htmlFor="dob" className="block text-xs font-semibold text-slate-700">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  value={values.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                  className={inputClass(errors.dob)}
                />
                {errors.dob && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.dob}</p>
                )}
              </div>

              <div id="field-gender">
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-700">
                  Gender <span className="text-red-600">*</span>
                </label>
                <select
                  id="gender"
                  value={values.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={inputClass(errors.gender)}
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.gender}</p>
                )}
              </div>

              <div id="field-bloodGroup">
                <label htmlFor="bloodGroup" className="block text-xs font-semibold text-slate-700">
                  Blood Group <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <select
                  id="bloodGroup"
                  value={values.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                  className={inputClass()}
                >
                  <option value="">Not specified</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Residential Details */}
          <div className="mt-8 border-t border-slate-200 pt-7">
            <h2 className="font-display text-base font-bold text-slate-900">
              02. Contact & Residential Details
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Used for application status updates and emergency ID verification.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div id="field-email">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="student@college.edu"
                  className={inputClass(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>
                )}
              </div>

              <div id="field-mobile">
                <label htmlFor="mobile" className="block text-xs font-semibold text-slate-700">
                  Mobile Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={values.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  placeholder="+1 555 234 5678"
                  className={inputClass(errors.mobile)}
                />
                {errors.mobile && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.mobile}</p>
                )}
              </div>

              <div id="field-address" className="sm:col-span-2">
                <label htmlFor="address" className="block text-xs font-semibold text-slate-700">
                  Residential Address <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={values.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street address, apartment or hostel room, city, state, and postal code"
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.address
                      ? 'border-red-400 bg-red-50/40 focus:border-red-600'
                      : 'border-slate-300 bg-white focus:border-blue-700'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Academic Details */}
          <div className="mt-8 border-t border-slate-200 pt-7">
            <h2 className="font-display text-base font-bold text-slate-900">
              03. Academic Details
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              These fields appear directly on the front of your official student ID card.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div id="field-collegeName" className="sm:col-span-2">
                <label htmlFor="collegeName" className="block text-xs font-semibold text-slate-700">
                  College Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="collegeName"
                  type="text"
                  value={values.collegeName}
                  onChange={(e) => updateField('collegeName', e.target.value)}
                  placeholder="e.g. Westfield Institute of Technology"
                  className={inputClass(errors.collegeName)}
                />
                {errors.collegeName && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.collegeName}</p>
                )}
              </div>

              <div id="field-department">
                <label htmlFor="department" className="block text-xs font-semibold text-slate-700">
                  Department <span className="text-red-600">*</span>
                </label>
                <input
                  id="department"
                  type="text"
                  value={values.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className={inputClass(errors.department)}
                />
                {errors.department && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.department}</p>
                )}
              </div>

              <div id="field-course">
                <label htmlFor="course" className="block text-xs font-semibold text-slate-700">
                  Course / Degree <span className="text-red-600">*</span>
                </label>
                <input
                  id="course"
                  type="text"
                  value={values.course}
                  onChange={(e) => updateField('course', e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className={inputClass(errors.course)}
                />
                {errors.course && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.course}</p>
                )}
              </div>

              <div id="field-yearOfStudy">
                <label htmlFor="yearOfStudy" className="block text-xs font-semibold text-slate-700">
                  Year of Study <span className="text-red-600">*</span>
                </label>
                <select
                  id="yearOfStudy"
                  value={values.yearOfStudy}
                  onChange={(e) => updateField('yearOfStudy', e.target.value)}
                  className={inputClass(errors.yearOfStudy)}
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                {errors.yearOfStudy && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.yearOfStudy}</p>
                )}
              </div>

              <div id="field-semester">
                <label htmlFor="semester" className="block text-xs font-semibold text-slate-700">
                  Semester <span className="text-red-600">*</span>
                </label>
                <select
                  id="semester"
                  value={values.semester}
                  onChange={(e) => updateField('semester', e.target.value)}
                  className={inputClass(errors.semester)}
                >
                  <option value="">Select semester</option>
                  {SEMESTER_OPTIONS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.semester}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Document Uploads */}
          <div className="mt-8 border-t border-slate-200 pt-7">
            <h2 className="font-display text-base font-bold text-slate-900">
              04. Photograph & Admission Proof
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Student photograph accepts JPG, JPEG, or PNG format (up to 5 MB).
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {/* Photo Upload */}
              <div id="field-photoDataUrl">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload Student Photograph <span className="text-red-600">*</span>
                </label>

                {!values.photoDataUrl ? (
                  <label
                    htmlFor="photo-input"
                    className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                      errors.photoDataUrl
                        ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-600 hover:bg-blue-50/40'
                    }`}
                  >
                    <ImagePlus className="h-7 w-7 text-blue-700" />
                    <span className="mt-2 text-xs font-semibold text-slate-800">
                      Click to upload photo
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500">JPG, JPEG, or PNG</span>
                    <input
                      id="photo-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={values.photoDataUrl}
                      alt="Uploaded student preview"
                      className="h-16 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Photo Ready</span>
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-600">
                        {photoFileName || 'student_photo'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFileName('');
                          updateField('photoDataUrl', '');
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}

                {errors.photoDataUrl && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.photoDataUrl}</p>
                )}
              </div>

              {/* Admission Proof Upload */}
              <div id="field-proofDataUrl">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload College Admission Proof <span className="text-red-600">*</span>
                </label>

                {!values.proofDataUrl ? (
                  <label
                    htmlFor="proof-input"
                    className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                      errors.proofDataUrl
                        ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-600 hover:bg-blue-50/40'
                    }`}
                  >
                    <Upload className="h-7 w-7 text-blue-700" />
                    <span className="mt-2 text-xs font-semibold text-slate-800">
                      Click to upload proof
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500">
                      Admission letter or fee receipt (PDF, JPG, PNG)
                    </span>
                    <input
                      id="proof-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={handleProofUpload}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Document Attached</span>
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-600">
                        {values.proofFileName}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setValues((prev) => ({
                            ...prev,
                            proofDataUrl: '',
                            proofFileName: '',
                            proofFileType: '',
                          }));
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}

                {errors.proofDataUrl && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.proofDataUrl}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              A unique Registration Reference Number is generated on submission.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
            </button>
          </div>
        </form>

        {/* Live Preview Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">
              Live Student ID Card Preview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Preview updates automatically with your entered details and uploaded photo.
            </p>

            <div className="mt-5 flex justify-center">
              <StudentIdCard
                data={{
                  fullName: values.fullName,
                  studentIdNumber: 'SID-2026-AUTO',
                  regNumber: values.regNumber.toUpperCase(),
                  department: values.department,
                  course: values.course,
                  academicYear: '2026–2027',
                  validityDate: computePreviewValidity(values.yearOfStudy),
                  collegeName: values.collegeName,
                  photoDataUrl: values.photoDataUrl,
                  bloodGroup: values.bloodGroup,
                  dob: values.dob,
                  mobile: values.mobile,
                  address: values.address,
                }}
              />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-800">Photo Guidelines</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li>Use a recent front-facing portrait with a plain light background.</li>
                <li>Accepted formats: JPG, JPEG, or PNG only.</li>
                <li>Ensure admission proof shows your name and enrollment number clearly.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
