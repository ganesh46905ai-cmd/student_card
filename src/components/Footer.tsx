import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import type { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-lg font-bold tracking-tight text-slate-900">
              Student ID Card Portal
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Official digital registration and identification desk for enrolled undergraduate,
              postgraduate, and research students across affiliated colleges.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Portal Links
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Apply for Student ID
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('student')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Registrar Admin Panel
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Contact Information
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <span>Office of the Registrar, Academic Block A, Room 104, Springfield, IL 62704</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-700" />
                <a
                  href="mailto:idcard-support@studentportal.edu"
                  className="hover:text-blue-700 transition-colors"
                >
                  idcard-support@studentportal.edu
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-700" />
                <span className="tabular-nums">+1 (800) 555-0194</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-blue-700" />
                <span>Monday – Friday · 9:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Student ID Card Portal · Office of Student Records</p>
          <p>Academic Session 2026–2027 · Official Student Identification Services</p>
        </div>
      </div>
    </footer>
  );
}
