import { LogOut, Lock, User, Key, ShieldCheck, ArrowRight, Brain, Globe, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

interface LoginProps {
  setCurrentPage: (page: 'student_dashboard' | 'login' | 'admin' | 'course') => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setCurrentStudent: (student: any) => void;
  setCurrentScore: (score: number) => void;
  settingsConfig?: { logoUrl?: string };
}

export default function Login({ setCurrentPage, setIsAdmin, setCurrentStudent, setCurrentScore, settingsConfig }: LoginProps) {
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>('student');
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const logAccess = async (student: any) => {
    try {
      // Fetch client info from our API
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
      // Fallback log without server IP if API fails
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

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !password) {
      alert('Masukkan NIS dan Password');
      return;
    }

    if (nis !== password) {
      alert('Login gagal, periksa NIS dan Password Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('nis', '==', nis));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Siswa dengan NIS tersebut tidak ditemukan.');
        setIsLoading(false);
        // Do not sign out here if they weren't signed in, but it's safe
        auth.signOut();
        return;
      }

      const studentData = querySnapshot.docs[0].data();
      const studentObj = { id: querySnapshot.docs[0].id, ...studentData };
      
      // Sign in anonymously to allow Firestore writes
      try {
        await signInAnonymously(auth);
        // Log the access asynchronously
        logAccess(studentObj);
      } catch (authError) {
        console.error('Anonymous sign-in failed during student login:', authError);
        alert('Catatan: Fitur pencatatan otomatis dinonaktifkan karena konfigurasi server (Anonymous Auth). Siswa tetap dapat belajar.');
      }

      setCurrentScore(100);
      setCurrentStudent(studentObj);
      setIsAdmin(false);
      setCurrentPage('student_dashboard');
    } catch (error) {
      console.error('Error logging in student:', error);
      alert('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      alert('Masukkan Username dan Password Admin.');
      return;
    }

    const isValidUser = adminUsername.trim().toLowerCase() === 'ega';
    const isValidPass = adminPassword.trim().toLowerCase() === 'ega';

    if (!isValidUser || !isValidPass) {
      alert('Username atau Password Admin salah.');
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate with Firebase anonymously to grant database access
      try {
        await signInAnonymously(auth);
      } catch (authError) {
        console.error('Anonymous sign-in failed during admin login:', authError);
        // Continue if we have username/password bypass or if they are already authenticated
      }
      setCurrentScore(100);
      setIsAdmin(true);
      setCurrentPage('admin');
    } catch (err) {
      console.error('Admin login failed:', err);
      alert('Gagal masuk sebagai admin: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const allowedEmails = ['egawzc@gmail.com', 'ega.nugraha141@guru.smp.belajar.id'];
      if (user.email && allowedEmails.includes(user.email) && user.emailVerified) {
        setCurrentScore(100);
        setIsAdmin(true);
        setCurrentPage('admin');
      } else {
        alert('Maaf, akun Google Anda tidak terdaftar sebagai administrator.');
        await auth.signOut();
      }
    } catch (err) {
      console.error('Google auth failed:', err);
      alert('Authentication failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 flex items-center justify-center font-sans p-6 selection:bg-brand/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/20 overflow-hidden relative"
          >
            {settingsConfig?.logoUrl ? (
                <img src={settingsConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
                <Brain size={32} className="text-white" />
            )}
            <div className="absolute top-0 left-0 w-full h-1 bg-accent/80" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SMPN 1 Kawali</h1>
          <p className="text-slate-500 font-medium">Informatika</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 p-8 sm:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
              <button 
                onClick={() => setLoginMode('student')}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                  loginMode === 'student' ? "bg-white text-brand shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Siswa
              </button>
              <button 
                onClick={() => setLoginMode('admin')}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                  loginMode === 'admin' ? "bg-white text-brand shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Admin
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loginMode === 'student' ? (
                <motion.form 
                  key="student-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleStudentLogin} 
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NIS (Nomor Induk)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="Masukkan NIS" 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Key size={18} />
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (Gunakan NIS)" 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand hover:scale-[1.02] active:scale-[0.98] text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Masuk Ke Kelas
                        <ArrowRight size={18} className="text-accent" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="admin-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleAdminLogin}
                  className="space-y-4"
                >
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-xs font-semibold leading-relaxed flex items-center gap-3">
                    <ShieldCheck size={20} className="shrink-0 text-blue-600" />
                    <p>Khusus akses administrator. Masuk menggunakan akun admin Anda.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username Admin</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Username Admin" 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password Admin</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Key size={18} />
                      </div>
                      <input 
                        type="password" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Password Admin" 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand hover:scale-[1.02] active:scale-[0.98] text-white rounded-2xl font-bold text-base shadow-xl shadow-brand/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Masuk Sebagai Admin
                        <ArrowRight size={18} className="text-accent" />
                      </>
                    )}
                  </button>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="border-t border-slate-100 w-full"></div>
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">atau</span>
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin} 
                    className="w-full py-3.5 bg-white text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border border-slate-200"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    Login dengan Akun Google
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} SMPN 1 Kawali
        </p>
      </div>
    </div>
  );
}

