import { User, Key, ArrowRight, Sun, Moon } from 'lucide-react';
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { getBackgroundPreset } from '../backgrounds';

interface LoginProps {
  setCurrentPage: (page: 'student_dashboard' | 'login' | 'admin' | 'course') => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setCurrentStudent: (student: any) => void;
  setCurrentScore: (score: number) => void;
  settingsConfig?: { logoUrl?: string; backgroundPreset?: string };
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Login({ setCurrentPage, setIsAdmin, setCurrentStudent, setCurrentScore, settingsConfig, isDarkMode = false, onToggleDarkMode }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const logAccess = async (student: any) => {
    try {
      const response = await fetch('/api/client-info');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const info = await response.json();
      
      await addDoc(collection(db, 'access_logs'), {
        studentId: student.id,
        studentName: student.nama,
        ip: info.ip || 'Unknown',
        device: info.userAgent || navigator.userAgent,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log access via API:', error);
      try {
        await addDoc(collection(db, 'access_logs'), {
          studentId: student.id,
          studentName: student.nama,
          ip: `Fallback (Error: ${error instanceof Error ? error.message : 'Unknown'})`,
          device: navigator.userAgent,
          timestamp: serverTimestamp()
        });
      } catch (innerError) {
        console.error('Total failure logging access:', innerError);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      alert('Masukkan NISN / Username dan Password.');
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Admin login
    if ((cleanId === 'ega' || cleanId === 'admin') && cleanPass === 'ega') {
      setIsLoading(true);
      setCurrentScore(100);
      setIsAdmin(true);
      setCurrentPage('admin');
      setIsLoading(false);
      return;
    }

    // 2. Check Student login by NISN
    setIsLoading(true);
    try {
      if (cleanPass !== identifier.trim()) {
        alert('Login gagal, periksa NISN dan Password Anda.');
        setIsLoading(false);
        return;
      }

      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('nis', '==', identifier.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Akun dengan NISN atau Username tersebut tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      const studentData = querySnapshot.docs[0].data();
      const studentObj = { id: querySnapshot.docs[0].id, ...studentData };
      
      logAccess(studentObj);
      setCurrentScore(100);
      setCurrentStudent(studentObj);
      setIsAdmin(false);
      setCurrentPage('student_dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgPreset = getBackgroundPreset(settingsConfig?.backgroundPreset);

  return (
    <div className={`min-h-screen w-full ${bgPreset.className} flex items-center justify-center font-sans p-6 selection:bg-brand/30 transition-colors duration-300 relative`}>
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          className="fixed top-4 right-4 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/85 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-sm backdrop-blur-md text-xs font-bold transition-all cursor-pointer"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          <span className="hidden sm:inline">{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-slate-400 dark:border-slate-700 overflow-hidden relative"
          >
            {settingsConfig?.logoUrl ? (
              <img src={settingsConfig.logoUrl} alt="Logo Sekolah" className="w-full h-full object-cover" />
            ) : (
              <img src="/images/labkom_nesaka_logo.jpg" alt="LABKOM Nesaka Logo" className="w-full h-full object-cover" />
            )}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">SMPN 1 Kawali</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Ruang Informatika • Pembelajaran Interaktif</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-100/95 dark:bg-slate-900/95 border border-slate-300 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-xl dark:shadow-slate-950/60 relative overflow-hidden backdrop-blur-md"
        >
          <div className="relative z-10">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Masuk ke Sistem</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Masukkan NISN Siswa atau Username Admin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">NISN / Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukan NISN" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                    <Key size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRight size={18} className="text-yellow-400" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} SMPN 1 Kawali
        </p>
      </div>
    </div>
  );
}
