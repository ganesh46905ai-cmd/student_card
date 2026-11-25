import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import RegistrationForm from './components/RegistrationForm';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import type { PageView, StudentApplication } from './types';

const LAST_REF_KEY = 'student_portal_last_ref';

export default function App() {
  const [activeView, setActiveView] = useState<PageView>('home');
  const [currentStudent, setCurrentStudent] = useState<StudentApplication | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const navigateTo = (view: PageView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const lookupStudent = async (query: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/applications/lookup?query=${encodeURIComponent(query.trim())}`
      );
      if (!response.ok) return false;
      const data = (await response.json()) as { application?: StudentApplication };
      if (!data.application) return false;
      setCurrentStudent(data.application);
      setJustRegistered(false);
      localStorage.setItem(LAST_REF_KEY, data.application.referenceNumber);
      setActiveView('student');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const savedRef = localStorage.getItem(LAST_REF_KEY);
    if (!savedRef) return;
    fetch(`/api/applications/lookup?query=${encodeURIComponent(savedRef)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { application?: StudentApplication } | null) => {
        if (data?.application) {
          setCurrentStudent(data.application);
        }
      })
      .catch(() => {
        // Ignore initial restore failure
      });
  }, []);

  const handleRegistrationSuccess = (created: StudentApplication) => {
    setCurrentStudent(created);
    setJustRegistered(true);
    localStorage.setItem(LAST_REF_KEY, created.referenceNumber);
    navigateTo('student');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar activeView={activeView} onNavigate={navigateTo} />

      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView onNavigate={navigateTo} onLookupSubmit={lookupStudent} />
        )}
        {activeView === 'register' && (
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        )}
        {activeView === 'student' && (
          <StudentDashboard
            application={currentStudent}
            justRegistered={justRegistered}
            onDismissSuccess={() => setJustRegistered(false)}
            onLookup={lookupStudent}
            onNavigate={navigateTo}
          />
        )}
        {activeView === 'admin' && <AdminDashboard />}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
