export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export type PageView = 'home' | 'register' | 'student' | 'admin';

export interface StudentApplication {
  id: string;
  referenceNumber: string;
  studentIdNumber: string;
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
  bloodGroup?: string;
  address: string;
  photoDataUrl: string;
  proofDataUrl: string;
  proofFileName: string;
  proofFileType: string;
  academicYear: string;
  validityDate: string;
  status: ApplicationStatus;
  adminRemarks?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface RegistrationPayload {
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
  bloodGroup?: string;
  address: string;
  photoDataUrl: string;
  proofDataUrl: string;
  proofFileName: string;
  proofFileType: string;
}
