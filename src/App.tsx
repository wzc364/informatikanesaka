/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  Menu, 
  X, 
  Info, 
  Settings, 
  Code, 
  Variable, 
  Database, 
  Plus, 
  Minus, 
  GitBranch, 
  Repeat, 
  Type, 
  ShieldCheck,
  Search,
  Home,
  Lock,
  LogOut,
  Brain,
  Lightbulb,
  User,
  TrendingUp,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  Users,
  UserCircle,
  Trash2,
  LayoutGrid,
  ArrowRight,
  History,
  Edit2,
  Maximize,
  Send,
  ExternalLink,
  Globe,
  Megaphone,
  Bell,
  Timer,
  Calendar,
  Activity,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Zap,
  Radio,
  Layers,
  Award,
  Flame,
  Gamepad2,
  Image as ImageIcon,
  Puzzle,
  Cpu,
  Calculator,
  MonitorPlay,
  ClipboardList,
  GraduationCap,
  Printer,
  Trophy,
  Palette,
  Check,
  Sun,
  Moon,
  FolderKanban,
  CalendarDays,
  Copy,
  Download,
  UserCheck,
  Target,
  FlaskConical
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { COURSES } from './constants';
import { Topic, SoalSet, SoalQuestion } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from './firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc, setDoc, query, where, onSnapshot, increment, serverTimestamp, arrayUnion, writeBatch } from 'firebase/firestore';                
import Login from './components/Login';
import AdminGames from './components/AdminGames';
import AdminSoal from './components/AdminSoal';
import AdminAdministrasi from './components/AdminAdministrasi';
import ImportAssessmentToNilaiModal from './components/ImportAssessmentToNilaiModal';
import StudentSoalRunner from './components/StudentSoalRunner';
import { AdminMaterialPrintModal } from './components/AdminMaterialPrintModal';
import { AdminQuestionAnalysis } from './components/AdminQuestionAnalysis';
import {
  AdministrasiSubTab,
  DEFAULT_JADWAL_SCHEDULE_SETTINGS,
  DEFAULT_SEMESTER,
  DEFAULT_TAHUN_PELAJARAN,
  DEFAULT_TAHUN_PELAJARAN_LIST,
  JadwalPelajaranItem,
  JadwalScheduleSettings,
  NilaiSubTab,
  NilaiSumatifItem,
  SemesterType,
  TujuanPembelajaranItem,
  buildScopedAssessmentDocId,
  buildScopedMaterialDocId,
  computeDayScheduleSlots,
  normalizeJadwalScheduleSettings,
  resolveCurrentScheduleStatus,
  slugifyTermPart,
} from './administrasiTypes';
import { resolveCourseImageUrl, getPublicFallbackImageUrl } from './courseImageMap';
import { APP_BACKGROUNDS, getBackgroundPreset } from './backgrounds';
import { dedupeHighestGameScores, formatScoreTimestamp, getScoreTimestampMs, isSoalAssessment, naturalCompareKelas } from './scoreUtils';
import { AsesmenHarianSoalLink, doesSoalSetMatchStudentClass, SoalSetTpLink } from './soalExportUtils';
import courseCoverSystemsFlat from './assets/images/course_cover_systems_flat_1795244678070.jpg';
import courseCoverCodingFlat from './assets/images/course_cover_coding_flat_1795244677820.jpg';
import courseCoverDataFlat from './assets/images/course_cover_data_flat_1795244677214.jpg';
import soalCoverChallengeFlat from './assets/images/soal_cover_challenge_flat_1795244677336.jpg';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Info,
  Settings,
  Code,
  Variable,
  Database,
  PlusMinus: (props: any) => (
    <div className="flex items-center">
      <Plus size={12} {...props} />
      <Minus size={12} {...props} />
    </div>
  ),
  GitBranch,
  Repeat,
  Type,
  ShieldCheck,
  Globe,
  Brain,
  Lightbulb,
  Cpu,
  Calculator,
  MonitorPlay
};

const parseCheatingDetail = (item: string) => {
  try {
    if (item.trim().startsWith('{')) {
      const parsed = JSON.parse(item);
      return `${parsed.desc} (${new Date(parsed.time).toLocaleTimeString('id-ID')})`;
    }
    return `Keluar dari layar penuh (${new Date(item).toLocaleTimeString('id-ID')})`;
  } catch(e) {
    return String(item);
  }
};

const COURSE_COVER_THEMES = [
  {
    image: courseCoverSystemsFlat,
    fallbackGradient: 'from-blue-600 via-blue-700 to-indigo-800',
    label: 'Sistem & Jaringan'
  },
  {
    image: courseCoverCodingFlat,
    fallbackGradient: 'from-teal-500 via-teal-600 to-emerald-700',
    label: 'Algoritma & Koding'
  },
  {
    image: courseCoverDataFlat,
    fallbackGradient: 'from-indigo-600 via-indigo-700 to-violet-800',
    label: 'Data & Informatika'
  }
];

const SOAL_COVER_THEMES = [
  {
    image: '' as string,
    fallbackGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    label: 'Evaluasi Pemahaman',
    isCustomSvg: true
  },
  {
    image: soalCoverChallengeFlat,
    fallbackGradient: 'from-purple-800 via-indigo-900 to-slate-900',
    label: 'Tantangan Logika',
    isCustomSvg: false
  },
  {
    image: courseCoverCodingFlat,
    fallbackGradient: 'from-teal-500 via-cyan-600 to-teal-700',
    label: 'Uji Algoritma',
    isCustomSvg: false
  },
  {
    image: courseCoverDataFlat,
    fallbackGradient: 'from-indigo-600 via-blue-700 to-indigo-800',
    label: 'Uji Konsep & Data',
    isCustomSvg: false
  }
];

function getCourseCoverArt(title: string, index: number) {
  const lower = (title || '').toLowerCase();
  if (/(sistem|komputer|hardware|perangkat|jaringan|internet|cpu|os|memori)/.test(lower)) {
    return COURSE_COVER_THEMES[0];
  }
  if (/(algo|koding|program|scratch|komputasi|logika|variabel|cabang|ulang|blok)/.test(lower)) {
    return COURSE_COVER_THEMES[1];
  }
  if (/(data|tik|excel|olah|angka|dampak|sosial|grafik|dokumen|presentasi)/.test(lower)) {
    return COURSE_COVER_THEMES[2];
  }
  return COURSE_COVER_THEMES[index % COURSE_COVER_THEMES.length];
}

function getSoalCoverArt(title: string, index: number) {
  const lower = (title || '').toLowerCase();
  if (/(algo|koding|program|scratch|komputasi|dekomposisi|abstraksi)/.test(lower)) {
    return SOAL_COVER_THEMES[1 + (index % 2)];
  }
  if (/(data|tik|excel|grafik|internet)/.test(lower)) {
    return SOAL_COVER_THEMES[3];
  }
  return SOAL_COVER_THEMES[index % SOAL_COVER_THEMES.length];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'admin' | 'course' | 'student_dashboard' | 'course_confirm' | 'soal' | 'soal_confirm'>(() => {
    // If admin, it could be in localStorage, otherwise we check sessionStorage
    const savedAdminPage = localStorage.getItem('currentPage');
    const savedStudentPage = sessionStorage.getItem('currentPage');
    
    if (localStorage.getItem('isAdmin') === 'true' && savedAdminPage) {
      return savedAdminPage as any;
    }
    return (savedStudentPage as any) || 'login';
  });
  const [activeCourseId, setActiveCourseId] = useState(() => {
    return localStorage.getItem('activeCourseId') || COURSES[0].id;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(() => {
    const saved = sessionStorage.getItem('currentStudent');
    return saved ? JSON.parse(saved) : null;
  });
  const [username, setUsername] = useState('');

  // Persist state
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('currentPage', currentPage);
      sessionStorage.removeItem('currentPage');
    } else {
      sessionStorage.setItem('currentPage', currentPage);
      localStorage.removeItem('currentPage');
    }
  }, [currentPage, isAdmin]);
  useEffect(() => {
    localStorage.setItem('activeCourseId', activeCourseId);
  }, [activeCourseId]);
  useEffect(() => {
    localStorage.setItem('isAdmin', String(isAdmin));
  }, [isAdmin]);
  useEffect(() => {
    if (currentStudent) {
      sessionStorage.setItem('currentStudent', JSON.stringify(currentStudent));
      localStorage.removeItem('currentStudent'); // clean up old version
    } else {
      sessionStorage.removeItem('currentStudent');
    }
  }, [currentStudent]);
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'administrasi' | 'student_management' | 'materials' | 'questions' | 'history' | 'assessments' | 'settings' | 'announcements' | 'games'>('dashboard');
  const [studentSubTab, setStudentSubTab] = useState<'students' | 'classes'>('classes');
  const [students, setStudents] = useState<{id: string, nis: string, nama: string, jenisKelamin: string, kelas: string, tahunPelajaran?: string}[]>([]);
  const [adminJadwalList, setAdminJadwalList] = useState<JadwalPelajaranItem[]>([]);
  const [realtimeNow, setRealtimeNow] = useState<Date>(() => new Date());
  const [legacyMaterialConfigs, setLegacyMaterialConfigs] = useState<Record<string, {
    isActive: boolean; 
    isGatekeepingEnabled?: boolean; 
    isFullScreen?: boolean;
    isScoreVisible?: boolean;
    topicTimers?: Record<string, number>;
    quizTimers?: Record<string, number>;
    quizAvailableAt?: Record<string, number>;
    totalCourseTimer?: number;
    defaultTopicTimer?: number;
    defaultQuizTimer?: number;
    defaultQuizAvailableAt?: number;
    useGlobalTimers?: boolean;
  }>>({});
  const [scopedMaterialConfigs, setScopedMaterialConfigs] = useState<Record<string, any>>({});
  const [settingsConfig, setSettingsConfig] = useState<{
    logoUrl: string;
    backgroundPreset?: string;
    activeTahunPelajaran?: string;
    activeSemester?: SemesterType;
    tahunPelajaranList?: string[];
    jadwalSettings?: JadwalScheduleSettings;
  }>({
    logoUrl: '',
    backgroundPreset: 'default',
    activeTahunPelajaran: DEFAULT_TAHUN_PELAJARAN,
    activeSemester: DEFAULT_SEMESTER,
    tahunPelajaranList: DEFAULT_TAHUN_PELAJARAN_LIST,
    jadwalSettings: DEFAULT_JADWAL_SCHEDULE_SETTINGS,
  });
  const [jadwalSettingsDraft, setJadwalSettingsDraft] = useState<JadwalScheduleSettings>(
    DEFAULT_JADWAL_SCHEDULE_SETTINGS
  );
  const [isSavingJadwalSettings, setIsSavingJadwalSettings] = useState(false);
  const [jadwalSettingsNotice, setJadwalSettingsNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newAcademicYearInput, setNewAcademicYearInput] = useState('');
  const [termSettingsNotice, setTermSettingsNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCopyStudentsModalOpen, setIsCopyStudentsModalOpen] = useState(false);
  const [copySourceTahunPelajaran, setCopySourceTahunPelajaran] = useState(DEFAULT_TAHUN_PELAJARAN);
  const [isCopyingStudents, setIsCopyingStudents] = useState(false);
  const [copyStudentsNotice, setCopyStudentsNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ruang_informatika_theme') === 'dark';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('ruang_informatika_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const [localMaterialConfig, setLocalMaterialConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [editingMaterialConfigId, setEditingMaterialConfigId] = useState<string | null>(null);
  const [printingMaterialCourseId, setPrintingMaterialCourseId] = useState<string | null>(null);
  const [materialSubTab, setMaterialSubTab] = useState<'list' | 'analisis_soal'>('list');
  const [hasPrintableQuestionAnalysis, setHasPrintableQuestionAnalysis] = useState<boolean>(false);

  // Automatically calculate total course timer based on topic/quiz timers
  useEffect(() => {
    if (localMaterialConfig && editingMaterialConfigId) {
      const course = COURSES.find(c => c.id === editingMaterialConfigId);
      if (course) {
        let total = 0;
        let minTotal = 0;
        let maxTotal = 0;
        
        course.topics.forEach(topic => {
          const wait = localMaterialConfig.useGlobalTimers ? (localMaterialConfig.defaultTopicTimer || 70) : (localMaterialConfig.topicTimers?.[topic.id] || 0);
          const quiz = localMaterialConfig.useGlobalTimers ? (localMaterialConfig.defaultQuizTimer || 60) : (localMaterialConfig.quizTimers?.[topic.id] || 0);
          const avail = localMaterialConfig.useGlobalTimers ? (localMaterialConfig.defaultQuizAvailableAt || 40) : (localMaterialConfig.quizAvailableAt?.[topic.id] || 0);
          
          total += (wait + quiz + avail);
          minTotal += (wait + avail);
          maxTotal += (wait + quiz + avail);
        });
        
        // Update values if they changed
        const updates: any = {};
        if (localMaterialConfig.totalCourseTimer !== total) updates.totalCourseTimer = total;
        if (localMaterialConfig.minCourseTimer !== minTotal) updates.minCourseTimer = minTotal;
        if (localMaterialConfig.maxCourseTimer !== maxTotal) updates.maxCourseTimer = maxTotal;
        
        if (Object.keys(updates).length > 0) {
          setLocalMaterialConfig(prev => ({ ...prev, ...updates }));
        }
      }
    }
  }, [
    localMaterialConfig?.topicTimers, 
    localMaterialConfig?.quizTimers, 
    localMaterialConfig?.quizAvailableAt, 
    localMaterialConfig?.defaultTopicTimer, 
    localMaterialConfig?.defaultQuizTimer, 
    localMaterialConfig?.defaultQuizAvailableAt,
    localMaterialConfig?.useGlobalTimers,
    editingMaterialConfigId
  ]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTargetType, setAnnouncementTargetType] = useState<'all' | 'class' | 'student'>('all');
  const [announcementTargetValue, setAnnouncementTargetValue] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [studentTab, setStudentTab] = useState<'materi' | 'soal' | 'games' | 'skor'>('materi');
  const [studentScoreFilter, setStudentScoreFilter] = useState<'all' | 'materi' | 'soal' | 'game'>('all');
  const [studentCatalogSearch, setStudentCatalogSearch] = useState('');
  const [studentCatalogFilter, setStudentCatalogFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [soalSets, setSoalSets] = useState<SoalSet[]>([]);
  const [soalQuestions, setSoalQuestions] = useState<SoalQuestion[]>([]);
  const [soalSetTpLinks, setSoalSetTpLinks] = useState<Record<string, SoalSetTpLink>>({});
  const [asesmenHarianSoalLinks, setAsesmenHarianSoalLinks] = useState<Record<string, AsesmenHarianSoalLink>>({});
  const [soalDbConfigured, setSoalDbConfigured] = useState<boolean>(true);
  const [soalDbError, setSoalDbError] = useState<string | null>(null);
  const [soalAdminToken, setSoalAdminToken] = useState<string | null>(null);
  const [activeSoalSetId, setActiveSoalSetId] = useState<string | null>(() => sessionStorage.getItem('activeSoalSetId'));
  const [isPreviewingSoal, setIsPreviewingSoal] = useState(false);
  const [messageTargetStudent, setMessageTargetStudent] = useState<any>(null);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [assessmentNav, setAssessmentNav] = useState<{ course: string | null; kelas: string | null }>({
    course: null,
    kelas: null
  });
  const [assessmentSort, setAssessmentSort] = useState<'name' | 'time' | 'score'>('name');
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [showIncompleteInAssessment, setShowIncompleteInAssessment] = useState(false);
  const [confirmDeleteGameScoreId, setConfirmDeleteGameScoreId] = useState<string | null>(null);
  const [importNilaiTarget, setImportNilaiTarget] = useState<{
    sourceType: 'materi' | 'soal';
    sourceTitle: string;
    kelas: string;
    entries: any[];
  } | null>(null);
  const [assessmentBannerNotice, setAssessmentBannerNotice] = useState<{
    message: string;
    targetSubTab: NilaiSubTab;
    targetKelas: string;
  } | null>(null);
  const [administrasiNavRequest, setAdministrasiNavRequest] = useState<{
    subTab?: AdministrasiSubTab;
    nilaiSubTab?: NilaiSubTab;
    kelas?: string;
    nonce: number;
  } | null>(null);
  const [dashboardClassFilter, setDashboardClassFilter] = useState<string>('all');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [onlineClassFilter, setOnlineClassFilter] = useState<string>('all');
  const [onlineSearch, setOnlineSearch] = useState<string>('');
  const [loggingOutStudentId, setLoggingOutStudentId] = useState<string | null>(null);
  const [isConfirmLogoutAllOnline, setIsConfirmLogoutAllOnline] = useState(false);
  const [forcingDashboardStudentId, setForcingDashboardStudentId] = useState<string | null>(null);
  const [isConfirmForceDashboardAll, setIsConfirmForceDashboardAll] = useState(false);
  const [adminOnlineActionFeedback, setAdminOnlineActionFeedback] = useState<string | null>(null);
  const [forcedLogoutNotice, setForcedLogoutNotice] = useState<string | null>(null);
  const [forcedDashboardNotice, setForcedDashboardNotice] = useState<string | null>(null);
  const lastHandledForceDashboardRef = useRef<number>(
    (() => {
      try {
        return Number(sessionStorage.getItem('lastHandledForceDashboard') || '0');
      } catch {
        return 0;
      }
    })()
  );
  const [gameScoresList, setGameScoresList] = useState<any[]>([]);
  const [assessmentCategory, setAssessmentCategory] = useState<'materi' | 'game' | 'soal'>('materi');

  const fetchSoalFromMysql = useCallback(async () => {
    try {
      const resp = await fetch('/api/soal', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await resp.json().catch(() => ({}));
      setSoalDbConfigured(data?.configured !== false);
      if (!resp.ok) {
        setSoalDbError(data?.error || `Gagal memuat data Kelola Soal dari MySQL (HTTP ${resp.status}).`);
        return;
      }
      if (data?.configured === false) {
        setSoalSets([]);
        setSoalQuestions([]);
        setSoalDbError(data?.error || null);
        return;
      }
      setSoalSets(Array.isArray(data?.sets) ? data.sets : []);
      setSoalQuestions(Array.isArray(data?.questions) ? data.questions : []);
      setSoalDbError(data?.error || null);
    } catch (err: any) {
      setSoalDbError(err?.message || 'Gagal menghubungi server API Kelola Soal.');
    }
  }, []);

  useEffect(() => {
    fetchSoalFromMysql();
  }, [fetchSoalFromMysql]);

  useEffect(() => {
    if (
      currentPage === 'student_dashboard' ||
      currentPage === 'admin' ||
      currentPage === 'soal_confirm' ||
      currentPage === 'soal'
    ) {
      fetchSoalFromMysql();
    }
  }, [currentPage, studentTab, adminTab, fetchSoalFromMysql]);

  useEffect(() => {
    if (currentPage !== 'student_dashboard' && currentPage !== 'admin') return;
    const handleRefreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchSoalFromMysql();
      }
    };
    window.addEventListener('focus', handleRefreshIfVisible);
    document.addEventListener('visibilitychange', handleRefreshIfVisible);
    const intervalId =
      currentPage === 'student_dashboard'
        ? window.setInterval(() => {
            if (document.visibilityState === 'visible') {
              fetchSoalFromMysql();
            }
          }, 15000)
        : null;
    return () => {
      window.removeEventListener('focus', handleRefreshIfVisible);
      document.removeEventListener('visibilitychange', handleRefreshIfVisible);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [currentPage, fetchSoalFromMysql]);

  const activeTahunPelajaran = settingsConfig?.activeTahunPelajaran || DEFAULT_TAHUN_PELAJARAN;
  const activeSemester: SemesterType = settingsConfig?.activeSemester === 'Genap' ? 'Genap' : 'Ganjil';
  const isDefaultTerm = activeTahunPelajaran === DEFAULT_TAHUN_PELAJARAN && activeSemester === DEFAULT_SEMESTER;

  const tahunPelajaranList = useMemo(() => {
    const raw = Array.isArray(settingsConfig?.tahunPelajaranList) ? settingsConfig.tahunPelajaranList : [];
    return Array.from(new Set([...DEFAULT_TAHUN_PELAJARAN_LIST, ...raw, activeTahunPelajaran])).sort();
  }, [settingsConfig?.tahunPelajaranList, activeTahunPelajaran]);

  const materialConfigs = useMemo(() => {
    const merged: Record<string, any> = {};
    COURSES.forEach(course => {
      const scopedId = buildScopedMaterialDocId(course.id, activeTahunPelajaran, activeSemester);
      if (scopedMaterialConfigs[scopedId]) {
        merged[course.id] = scopedMaterialConfigs[scopedId];
      } else if (isDefaultTerm && legacyMaterialConfigs[course.id]) {
        merged[course.id] = legacyMaterialConfigs[course.id];
      } else {
        merged[course.id] = {
          isActive: false,
          isGatekeepingEnabled: true,
          isFullScreen: false,
          isScoreVisible: true,
          topicTimers: {},
          quizTimers: {},
          quizAvailableAt: {},
        };
      }
    });
    return merged;
  }, [scopedMaterialConfigs, legacyMaterialConfigs, activeTahunPelajaran, activeSemester, isDefaultTerm]);

  const isCourseActive = (courseId: string) => {
    return materialConfigs[courseId]?.isActive ?? isDefaultTerm;
  };

  const scopedStudents = useMemo(() => {
    return students.filter(s => (s.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === activeTahunPelajaran);
  }, [students, activeTahunPelajaran]);

  useEffect(() => {
    if (!isAdmin) return;
    setRealtimeNow(new Date());
    const interval = setInterval(() => {
      setRealtimeNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const scopedAdminJadwalList = useMemo(() => {
    return adminJadwalList.filter(
      (j) => j.tahunPelajaran === activeTahunPelajaran && j.semester === activeSemester
    );
  }, [adminJadwalList, activeTahunPelajaran, activeSemester]);

  const realtimeScheduleStatus = useMemo(() => {
    return resolveCurrentScheduleStatus(
      scopedAdminJadwalList,
      settingsConfig?.jadwalSettings,
      realtimeNow
    );
  }, [scopedAdminJadwalList, settingsConfig?.jadwalSettings, realtimeNow]);

  const scopedAssessments = useMemo(() => {
    return assessments.filter(a => {
      const aYear = a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN;
      const aSem = a.semester || DEFAULT_SEMESTER;
      return aYear === activeTahunPelajaran && aSem === activeSemester;
    });
  }, [assessments, activeTahunPelajaran, activeSemester]);

  const groupedClasses = useMemo(() => {
    const classMap: Record<string, number> = {};
    scopedStudents.forEach(s => {
      classMap[s.kelas] = (classMap[s.kelas] || 0) + 1;
    });
    return classMap;
  }, [scopedStudents]);

  const adminClassOptions = useMemo(() => {
    return Object.keys(groupedClasses).sort((a, b) => naturalCompareKelas(a, b));
  }, [groupedClasses]);

  const enrichedSoalSets = useMemo(() => {
    return soalSets.map(s => ({
      ...s,
      soalType: soalSetTpLinks[s.id]?.soalType || s.soalType || 'biasa',
    }));
  }, [soalSets, soalSetTpLinks]);

  const scopedMateriAssessments = useMemo(
    () => scopedAssessments.filter(a => !isSoalAssessment(a)),
    [scopedAssessments]
  );

  const scopedSoalAssessments = useMemo(
    () => scopedAssessments.filter(a => isSoalAssessment(a)),
    [scopedAssessments]
  );

  const groupedAssessments = useMemo(() => {
    const data: Record<string, { title: string; classes: Record<string, { name: string; results: any[] }> }> = {};
    scopedMateriAssessments.forEach(a => {
      const title = a.courseTitle || 'Materi Pembelajaran';
      const kelasName = a.studentKelas || 'Tanpa Kelas';
      if (!data[title]) {
        data[title] = { title, classes: {} };
      }
      if (!data[title].classes[kelasName]) {
        data[title].classes[kelasName] = { name: kelasName, results: [] };
      }
      data[title].classes[kelasName].results.push(a);
    });
    return data;
  }, [scopedMateriAssessments]);

  const groupedSoalAssessments = useMemo(() => {
    const data: Record<string, { title: string; classes: Record<string, { name: string; results: any[] }> }> = {};
    scopedSoalAssessments.forEach(a => {
      const title = a.courseTitle || 'Paket Soal Ujian';
      const kelasName = a.studentKelas || 'Tanpa Kelas';
      if (!data[title]) {
        data[title] = { title, classes: {} };
      }
      if (!data[title].classes[kelasName]) {
        data[title].classes[kelasName] = { name: kelasName, results: [] };
      }
      data[title].classes[kelasName].results.push(a);
    });
    return data;
  }, [scopedSoalAssessments]);

  const bestAdminGameScores = useMemo(() => dedupeHighestGameScores(gameScoresList), [gameScoresList]);

  const groupedGameScores = useMemo(() => {
    const data: Record<string, { title: string; classes: Record<string, { name: string; results: any[] }> }> = {};
    bestAdminGameScores.forEach(s => {
      const title = s.gameTitle || s.gameId || 'Game Edukasi';
      const kelasName = s.kelas || s.studentKelas || 'Umum';
      if (!data[title]) {
        data[title] = { title, classes: {} };
      }
      if (!data[title].classes[kelasName]) {
        data[title].classes[kelasName] = { name: kelasName, results: [] };
      }
      data[title].classes[kelasName].results.push(s);
    });
    return data;
  }, [bestAdminGameScores]);

  useEffect(() => {
    const activeMap =
      assessmentCategory === 'materi'
        ? groupedAssessments
        : assessmentCategory === 'soal'
        ? groupedSoalAssessments
        : groupedGameScores;
    if (assessmentNav.course && !activeMap[assessmentNav.course]) {
      setAssessmentNav({ course: null, kelas: null });
    } else if (
      assessmentNav.course &&
      assessmentNav.kelas &&
      (!activeMap[assessmentNav.course] || !activeMap[assessmentNav.course].classes[assessmentNav.kelas])
    ) {
      setAssessmentNav(prev => ({ ...prev, kelas: null }));
    }
  }, [assessmentCategory, groupedAssessments, groupedSoalAssessments, groupedGameScores, assessmentNav]);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
  const [studentGameScores, setStudentGameScores] = useState<any[]>([]);
  const [studentNilaiSumatif, setStudentNilaiSumatif] = useState<NilaiSumatifItem[]>([]);
  const [studentTpList, setStudentTpList] = useState<TujuanPembelajaranItem[]>([]);
  const scopedStudentAssessments = useMemo(() => {
    return studentAssessments.filter(a => {
      const aYear = a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN;
      const aSem = a.semester || DEFAULT_SEMESTER;
      return aYear === activeTahunPelajaran && aSem === activeSemester;
    });
  }, [studentAssessments, activeTahunPelajaran, activeSemester]);
  const unreadNotifications = useMemo(() => notifications.filter(n => n.isRead !== true), [notifications]);
  const currentBgPreset = useMemo(() => getBackgroundPreset(settingsConfig?.backgroundPreset), [settingsConfig?.backgroundPreset]);
  const [currentScore, setCurrentScore] = useState(100);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'student' | 'assessment' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<'selected' | string | null>(null);
  const [deleteAssessmentInfo, setDeleteAssessmentInfo] = useState<{
    id?: string;
    studentName?: string;
    courseTitle?: string;
    score?: number;
    kelas?: string;
    isBulkClass?: boolean;
    isBulkCourse?: boolean;
  } | null>(null);
  const [isMaterialConfirmOpen, setIsMaterialConfirmOpen] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [materialToggleTarget, setMaterialToggleTarget] = useState<{id: string, title: string, nextStatus: boolean} | null>(null);
  
  const filteredStudents = useMemo(() => {
    return scopedStudents.filter(s => 
      s.nama.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.nis.includes(studentSearchQuery) ||
      s.kelas.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  }, [scopedStudents, studentSearchQuery]);

  const sortedFilteredStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => a.nama.localeCompare(b.nama));
  }, [filteredStudents]);

  const [studentDetail, setStudentDetail] = useState<{student: any, score: number} | null>(null);

  useEffect(() => {
    setSelectedStudentIds([]);
    setStudentDetail(null);
    setEditingStudentId(null);
  }, [activeTahunPelajaran]);
  
  const getStudentScore = (studentId: string) => {
    const items = scopedAssessments.filter(a => a.studentId === studentId);
    if (items.length === 0) return 0;
    const totalScore = items.reduce((sum, a) => sum + Number(a.score), 0);
    return Math.round(totalScore / items.length);
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const deleteSelectedStudents = async () => {
    setDeleteType('student');
    setDeleteTarget('selected');
    setDeleteAssessmentInfo(null);
    setIsDeleteModalOpen(true);
  };

  const deleteAssessment = (target: string | {
    id?: string;
    studentName?: string;
    courseTitle?: string;
    score?: number;
    kelas?: string;
    isBulkClass?: boolean;
    isBulkCourse?: boolean;
  }) => {
    setDeleteType('assessment');
    if (typeof target === 'string') {
      const found = assessments.find(a => a.id === target);
      setDeleteTarget(target);
      setDeleteAssessmentInfo(found ? {
        id: found.id,
        studentName: found.studentName,
        courseTitle: found.courseTitle,
        score: found.score,
        kelas: found.studentKelas
      } : { id: target });
    } else {
      setDeleteTarget(target.id || (target.isBulkClass ? 'class' : (target.isBulkCourse ? 'course' : null)));
      setDeleteAssessmentInfo(target);
    }
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteType === 'student') {
        if (deleteTarget === 'selected') {
          const promises = selectedStudentIds.map(id => deleteDoc(doc(db, 'students', id)));
          await Promise.all(promises);
          setSelectedStudentIds([]);
        } else if (typeof deleteTarget === 'string') {
          await deleteDoc(doc(db, 'students', deleteTarget));
        }
      } else if (deleteType === 'assessment') {
        if (deleteAssessmentInfo?.isBulkClass && deleteAssessmentInfo.kelas && deleteAssessmentInfo.courseTitle) {
          const targetAssessments = scopedAssessments.filter(
            a => a.studentKelas === deleteAssessmentInfo.kelas && a.courseTitle === deleteAssessmentInfo.courseTitle
          );
          const promises = targetAssessments.map(a => deleteDoc(doc(db, 'assessments', a.id)));
          await Promise.all(promises);
        } else if (deleteAssessmentInfo?.isBulkCourse && deleteAssessmentInfo.courseTitle) {
          const targetAssessments = scopedAssessments.filter(
            a => a.courseTitle === deleteAssessmentInfo.courseTitle
          );
          const promises = targetAssessments.map(a => deleteDoc(doc(db, 'assessments', a.id)));
          await Promise.all(promises);
        } else if (typeof deleteTarget === 'string' && deleteTarget && deleteTarget !== 'class' && deleteTarget !== 'course') {
          await deleteDoc(doc(db, 'assessments', deleteTarget));
        } else if (deleteAssessmentInfo?.id) {
          await deleteDoc(doc(db, 'assessments', deleteAssessmentInfo.id));
        }
      }
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteAssessmentInfo(null);
      setDeleteType(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `delete-${deleteType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{nis: string, nama: string, jenisKelamin: string, kelas: string}>({nis: '', nama: '', jenisKelamin: '', kelas: ''});  
  const [topicTimeRemaining, setTopicTimeRemaining] = useState<number | null>(null);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number | null>(null);
  const activeCourse = useMemo(() => COURSES.find(c => c.id === activeCourseId) || COURSES[0], [activeCourseId]);
  
  useEffect(() => {
    if (editingMaterialConfigId) {
      const config = materialConfigs[editingMaterialConfigId] || { 
        isActive: false, 
        isGatekeepingEnabled: true, 
        topicTimers: {}, 
        quizTimers: {} 
      };
      setLocalMaterialConfig({
        isActive: config.isActive ?? false,
        isGatekeepingEnabled: config.isGatekeepingEnabled ?? true,
        isFullScreen: config.isFullScreen ?? false,
        isScoreVisible: config.isScoreVisible ?? true,
        topicTimers: config.topicTimers ?? {},
        quizTimers: config.quizTimers ?? {},
        quizAvailableAt: config.quizAvailableAt ?? {},
        totalCourseTimer: config.totalCourseTimer ?? 0,
        defaultTopicTimer: config.defaultTopicTimer ?? 70,
        defaultQuizTimer: config.defaultQuizTimer ?? 60,
        defaultQuizAvailableAt: config.defaultQuizAvailableAt ?? 40,
        useGlobalTimers: config.useGlobalTimers ?? true
      });
    } else {
      setLocalMaterialConfig(null);
    }
  }, [editingMaterialConfigId, materialConfigs]);

  const saveMaterialConfig = async () => {
    if (!editingMaterialConfigId || !localMaterialConfig) return;
    setIsSavingConfig(true);
    const scopedId = buildScopedMaterialDocId(editingMaterialConfigId, activeTahunPelajaran, activeSemester);
    try {
      await setDoc(doc(db, 'scoped_material_configs', scopedId), {
        ...localMaterialConfig,
        courseId: editingMaterialConfigId,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEditingMaterialConfigId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `scoped_material_configs/${scopedId}`);
    } finally {
      setIsSavingConfig(false);
    }
  };
  
  const [activeTopicId, setActiveTopicId] = useState(activeCourse.topics[0].id);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalTab, setImportModalTab] = useState<'manual' | 'excel'>('manual');
  const [manualStudentNis, setManualStudentNis] = useState('');
  const [manualStudentNama, setManualStudentNama] = useState('');
  const [manualStudentJenisKelamin, setManualStudentJenisKelamin] = useState('L');
  const [manualStudentKelas, setManualStudentKelas] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  useEffect(() => {
    if (currentPage === 'course') {
      setIsSidebarOpen(window.innerWidth > 768);
    }
  }, [currentPage]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'material' | 'quiz'>('material');
  const [passedQuizzes, setPassedQuizzes] = useState<Record<string, boolean>>({});
  const [quizState, setQuizState] = useState<{
    currentQuestionIndex: number;
    selectedOption: number | null;
    isCorrect: boolean | null;
  }>({
    currentQuestionIndex: 0,
    selectedOption: null,
    isCorrect: null,
  });

  useEffect(() => {
    if (currentPage === 'course') {
      setCurrentScore(100);
      setLocalCheatingAttempts(0);
      setLocalCheatingDetails([]);
      setActiveTopicId(activeCourse.topics[0].id);
      setCourseCompleted(false);
      setStartTime(Date.now());
      setCompletionTime(null);
      setQuizState({ currentQuestionIndex: 0, selectedOption: null, isCorrect: null });
      setViewMode('material');
      setPassedQuizzes({});
      setTopicTimeRemaining(null);
      setQuizTimeRemaining(null);
    }
  }, [activeCourseId, currentPage, activeCourse]);

  useEffect(() => {
    // Reset timer when topic changes
    const config = materialConfigs[activeCourse.id];
    // Use global timer if enabled, otherwise use per-topic timer
    const timerValue = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
    
    // Only apply timer if user hasn't passed the topic yet and is on the course page
    if (currentPage === 'course' && timerValue > 0 && !passedQuizzes[activeTopicId] && !isAdmin) {
      setTopicTimeRemaining(timerValue);
    } else {
      setTopicTimeRemaining(null);
    }
  }, [activeTopicId, activeCourse.id, materialConfigs, passedQuizzes, isAdmin, currentPage]);

  useEffect(() => {
    let interval: any;
    if (topicTimeRemaining !== null && topicTimeRemaining > 0 && currentPage === 'course') {
      interval = setInterval(() => {
        setTopicTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (topicTimeRemaining === 0 && currentPage === 'course' && viewMode === 'material') {
      // Wait time finished - auto-advance to quiz
      setViewMode('quiz');
    }
    return () => clearInterval(interval);
  }, [topicTimeRemaining, isAdmin, activeTopicId, courseCompleted, currentPage]);

  useEffect(() => {
    let interval: any;
    if (viewMode === 'quiz' && quizTimeRemaining !== null && quizTimeRemaining > 0 && !isAdmin && !courseCompleted && quizState.selectedOption === null) {
      interval = setInterval(() => {
        setQuizTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (viewMode === 'quiz' && quizTimeRemaining === 0 && !isAdmin && !courseCompleted && quizState.selectedOption === null) {
      // Quiz timer ran out - force advance
      handleNextTopic(true);
    }
    return () => clearInterval(interval);
  }, [viewMode, quizTimeRemaining, isAdmin, courseCompleted, quizState.selectedOption]);

  useEffect(() => {
    if (viewMode === 'quiz') {
      const config = materialConfigs[activeCourse.id];
      const timerValue = config?.useGlobalTimers ? (config?.defaultQuizTimer || 60) : (config?.quizTimers?.[activeTopicId] || 0);
      setQuizTimeRemaining(timerValue);
    } else {
      setQuizTimeRemaining(null);
    }
  }, [viewMode, activeTopicId, materialConfigs, activeCourse.id]);

  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [localCheatingAttempts, setLocalCheatingAttempts] = useState(0);
  const [localCheatingDetails, setLocalCheatingDetails] = useState<string[]>([]);

  useEffect(() => {
    let pingInterval: any;
    if (currentPage === 'course' && currentStudent && !isAdmin) {
      updateSessionStatus(activeCourse.id, 'working');
      pingInterval = setInterval(() => {
        updateSessionStatus(activeCourse.id, 'working');
      }, 30000); // ping every 30s
    }
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [currentPage, activeCourse.id, currentStudent, isAdmin, currentScore]);

  useEffect(() => {
    let active = true;
    
    const logCheating = async (desc: string) => {
      if (!active) return;
      setLocalCheatingAttempts(prev => prev + 1);
      const logEntry = JSON.stringify({
        type: 'violation',
        time: new Date().toISOString(),
        desc: desc
      });
      setLocalCheatingDetails(prev => [...prev, logEntry]);
      try {
        const sessionRef = doc(db, 'active_sessions', `${currentStudent.id}_${activeCourse.id}`);
        await setDoc(sessionRef, {
          cheatingAttempts: increment(1),
          cheatingDetails: arrayUnion(logEntry)
        }, { merge: true });
      } catch (error) {
        console.error(error);
      }
    };

    const handleFullscreenChange = async () => {
      if (!active) return;
      const isFull = !!document.fullscreenElement;
      setIsFullscreenActive(isFull);
      if (!isFull && currentPage === 'course' && materialConfigs[activeCourse.id]?.isFullScreen && !isAdmin && currentStudent && !courseCompleted) {
        await logCheating("Keluar dari layar penuh");
      }
    };

    const handleBlur = async () => {
      if (!active) return;
      // If student switches tab or moves focus, log it as well
      if (currentPage === 'course' && materialConfigs[activeCourse.id]?.isFullScreen && !isAdmin && currentStudent && !courseCompleted) {
        await logCheating("Membuka tab/jendela lain");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      active = false;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentPage, activeCourse.id, materialConfigs, isAdmin, currentStudent, courseCompleted]);

  const activeTopic = useMemo(() => 
    activeCourse.topics.find(t => t.id === activeTopicId) || activeCourse.topics[0]
  , [activeTopicId, activeCourse]);

  const currentIndex = activeCourse.topics.findIndex(t => t.id === activeTopicId);
  const progressPercent = Math.round(((currentIndex + (passedQuizzes[activeTopicId] ? 1 : 0)) / activeCourse.topics.length) * 100);

  const filteredTopics = useMemo(() => 
    activeCourse.topics.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [searchQuery, activeCourse]);

  const handleNextTopic = (isForced: boolean = false) => {
    let nextScore = currentScore;
    if (isForced) {
      nextScore = Math.max(0, currentScore - 1);
      setCurrentScore(nextScore);
    }

    const nextTopic = activeCourse.topics[currentIndex + 1];
    if (nextTopic) {
      setActiveTopicId(nextTopic.id);
      setViewMode('material');
      setQuizState({ currentQuestionIndex: 0, selectedOption: null, isCorrect: null });
      setTopicTimeRemaining(null); // Force reset for next topic
    } else if (isForced) {
      handleCourseCompletion(nextScore);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === activeTopic.quiz[quizState.currentQuestionIndex].correctAnswer;
    setQuizState(prev => ({ ...prev, selectedOption: optionIndex, isCorrect }));

    if (isCorrect) {
      if (quizState.currentQuestionIndex === activeTopic.quiz.length - 1) {
        setPassedQuizzes(prev => ({ ...prev, [activeTopicId]: true }));
        
        // If this is the last topic and quiz is passed, complete course
        if (currentIndex === activeCourse.topics.length - 1) {
          handleCourseCompletion();
        }
      }
    } else {
      // Deduct 1 point if wrong
      setCurrentScore(prev => Math.max(0, prev - 1));
    }
  };

  const handleCourseCompletion = async (finalScore?: number) => {
    if (courseCompleted) return;
    
    // We allow retakes to update the score, but we should prevent multiple simultaneous calls
    const scoreToSave = finalScore ?? currentScore;
    const now = Date.now();
    setCompletionTime(now);
    
    // Show popup immediately for user feedback
    setShowCompletionPopup(true);
    setCourseCompleted(true);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }

    if (currentStudent && activeCourse) {
      try {
        const assessmentId = buildScopedAssessmentDocId(
          currentStudent.id,
          activeCourse.id,
          activeTahunPelajaran,
          activeSemester
        );
        const durationSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
        
        await setDoc(doc(db, 'assessments', assessmentId), {
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          studentKelas: currentStudent.kelas,
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
          tahunPelajaran: activeTahunPelajaran,
          semester: activeSemester,
          score: scoreToSave,
          durationSeconds: durationSeconds,
          cheatingAttempts: localCheatingAttempts,
          cheatingDetails: localCheatingDetails,
          completedAt: new Date().toISOString()
        });
        await updateSessionStatus(activeCourse.id, 'finished');
        
        // Create notification for admin
        await addDoc(collection(db, 'notifications'), {
          type: 'course_completion',
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
          tahunPelajaran: activeTahunPelajaran,
          semester: activeSemester,
          score: scoreToSave,
          isRead: false,
          timestamp: new Date().toISOString()
        });

        console.log("Assessment saved successfully for", assessmentId);
      } catch (error) {
        console.error("Error saving assessment:", error);
        handleFirestoreError(error, OperationType.WRITE, 'assessments');
      }
    }
  };

  const nextQuestion = () => {
    setQuizState(prev => ({
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      selectedOption: null,
      isCorrect: null,
    }));
  };

  const handleSendAnnouncement = async () => {
    if (!announcementContent) return;
    if (announcementTargetType !== 'all' && !announcementTargetValue) return;
    
    setIsSendingAnnouncement(true);
    try {
      if (editingAnnouncementId) {
        await updateDoc(doc(db, 'announcements', editingAnnouncementId), {
          targetType: announcementTargetType,
          targetValue: announcementTargetValue,
          content: announcementContent,
          link: announcementLink || '',
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          targetType: announcementTargetType,
          targetValue: announcementTargetValue,
          content: announcementContent,
          link: announcementLink || '',
          senderId: 'admin',
          isVisible: true,
          timestamp: serverTimestamp()
        });
      }
      setAnnouncementContent('');
      setAnnouncementLink('');
      setAnnouncementTargetValue('');
      setIsAnnouncementModalOpen(false);
      setEditingAnnouncementId(null);
    } catch (error) {
      console.error("Error sending announcement:", error);
      handleFirestoreError(error, editingAnnouncementId ? OperationType.UPDATE : OperationType.CREATE, 'announcements');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  const startEditAnnouncement = (ann: any) => {
    setEditingAnnouncementId(ann.id);
    setAnnouncementTargetType(ann.targetType);
    setAnnouncementTargetValue(ann.targetValue);
    setAnnouncementContent(ann.content);
    setAnnouncementLink(ann.link || '');
    setIsAnnouncementModalOpen(true);
  };

  const deleteAnnouncementAdmin = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const toggleAnnouncementVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        isVisible: !currentVisibility
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `announcements/${id}`);
    }
  };


  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // 1. Material Configs (Legacy + Scoped per Tahun Pelajaran & Semester)
    const unsubConfigs = onSnapshot(collection(db, 'material_configs'), (snapshot) => {
      const configs: any = {};
      snapshot.docs.forEach(doc => {
        configs[doc.id] = doc.data();
      });
      setLegacyMaterialConfigs(configs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'material_configs');
    });
    unsubscribes.push(unsubConfigs);

    const unsubScopedConfigs = onSnapshot(collection(db, 'scoped_material_configs'), (snapshot) => {
      const configs: Record<string, any> = {};
      snapshot.docs.forEach(d => {
        configs[d.id] = d.data();
      });
      setScopedMaterialConfigs(configs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scoped_material_configs');
    });
    unsubscribes.push(unsubScopedConfigs);

    const unsubSettings = onSnapshot(doc(db, 'app_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        const normalizedJadwal = normalizeJadwalScheduleSettings(data.jadwalSettings);
        setSettingsConfig({
          logoUrl: '',
          backgroundPreset: 'default',
          activeTahunPelajaran: DEFAULT_TAHUN_PELAJARAN,
          activeSemester: DEFAULT_SEMESTER,
          tahunPelajaranList: DEFAULT_TAHUN_PELAJARAN_LIST,
          ...data,
          jadwalSettings: normalizedJadwal,
        });
        setJadwalSettingsDraft(normalizedJadwal);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_settings/global');
    });
    unsubscribes.push(unsubSettings);

    // Announcements (Publicly readable now)
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });
    unsubscribes.push(unsubAnnouncements);

    // Soal Type & TP Links (needed by both admin & student views)
    const unsubSoalLinks = onSnapshot(doc(db, 'app_settings', 'soal_set_tp_links'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        setSoalSetTpLinks(data?.links && typeof data.links === 'object' ? data.links : {});
      } else {
        setSoalSetTpLinks({});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_settings/soal_set_tp_links');
    });
    unsubscribes.push(unsubSoalLinks);

    // Asesmen Harian Soal Links (class-level activation from Nilai Asesmen Harian)
    const unsubAsesmenSoalLinks = onSnapshot(doc(db, 'app_settings', 'asesmen_harian_soal_links'), (snapshot) => {
      if (snapshot.exists()) {
        setAsesmenHarianSoalLinks((snapshot.data() || {}) as Record<string, AsesmenHarianSoalLink>);
      } else {
        setAsesmenHarianSoalLinks({});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_settings/asesmen_harian_soal_links');
    });
    unsubscribes.push(unsubAsesmenSoalLinks);

    // Admin Data
    if (isAdmin) {
      // 2. All Assessments (Admin)
      const unsubAllAssessments = onSnapshot(collection(db, 'assessments'), (snapshot) => {
        setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assessments');
      });
      unsubscribes.push(unsubAllAssessments);

      // Game Scores (Admin)
      const unsubGameScores = onSnapshot(collection(db, 'game_scores'), (snapshot) => {
        setGameScoresList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'game_scores');
      });
      unsubscribes.push(unsubGameScores);

      // Active Sessions (Admin)
      const unsubActiveSessions = onSnapshot(collection(db, 'active_sessions'), (snapshot) => {
        setActiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'active_sessions');
      });
      unsubscribes.push(unsubActiveSessions);

      // Online Users (Admin)
      const unsubOnlineUsers = onSnapshot(collection(db, 'online_users'), (snapshot) => {
        setOnlineUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'online_users');
      });
      unsubscribes.push(unsubOnlineUsers);

      // Access Logs (Admin)
      const unsubAccessLogs = onSnapshot(collection(db, 'access_logs'), (snapshot) => {
        setAccessLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'access_logs');
      });
      unsubscribes.push(unsubAccessLogs);
      
      // 3. All Students (Admin)
      const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'students');
      });
      unsubscribes.push(unsubStudents);

      // Notifications (Admin)
      const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      });
      unsubscribes.push(unsubNotifications);

      // Jadwal Pelajaran (Admin Realtime Header)
      const unsubAdminJadwal = onSnapshot(collection(db, 'jadwal_pelajaran'), (snapshot) => {
        setAdminJadwalList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jadwal_pelajaran');
      });
      unsubscribes.push(unsubAdminJadwal);
    }

    // Student Data
    if (currentStudent) {
      // 4. Student Specific Assessments
      const qAssessments = query(collection(db, 'assessments'), where('studentId', '==', currentStudent.id));
      const unsubStudentAssessments = onSnapshot(qAssessments, (snapshot) => {
        setStudentAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assessments');
      });
      unsubscribes.push(unsubStudentAssessments);

      // 5. Student Specific Game Scores
      const qGameScores = query(collection(db, 'game_scores'), where('studentId', '==', currentStudent.id));
      const unsubStudentGameScores = onSnapshot(qGameScores, (snapshot) => {
        setStudentGameScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'game_scores');
      });
      unsubscribes.push(unsubStudentGameScores);
    } else {
      setStudentAssessments([]);
      setStudentGameScores([]);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isAdmin, currentStudent]);

  // Real-time listener for student's Nilai Sumatif TP & Sumatif Praktikum TP
  useEffect(() => {
    if (isAdmin || !currentStudent?.id) {
      setStudentNilaiSumatif([]);
      setStudentTpList([]);
      return;
    }

    const qSumatif = query(
      collection(db, 'nilai_sumatif'),
      where('tahunPelajaran', '==', activeTahunPelajaran)
    );
    const unsubSumatif = onSnapshot(
      qSumatif,
      (snapshot) => {
        setStudentNilaiSumatif(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as NilaiSumatifItem))
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'nilai_sumatif');
      }
    );

    const qTp = query(
      collection(db, 'tujuan_pembelajaran'),
      where('tahunPelajaran', '==', activeTahunPelajaran)
    );
    const unsubTp = onSnapshot(
      qTp,
      (snapshot) => {
        setStudentTpList(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as TujuanPembelajaranItem))
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tujuan_pembelajaran');
      }
    );

    return () => {
      unsubSumatif();
      unsubTp();
    };
  }, [isAdmin, currentStudent?.id, activeTahunPelajaran]);

  // Listen for remote admin force-logout and force-to-dashboard when a student is logged in
  useEffect(() => {
    if (isAdmin || !currentStudent?.id) return;

    const studentId = currentStudent.id;
    const localToken = currentStudent.sessionToken;
    const unsubPresence = onSnapshot(
      doc(db, 'online_users', studentId),
      async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as any;
        const tokenMatches = !localToken || !data?.sessionToken || data.sessionToken === localToken;
        if (!tokenMatches) return;

        if (data?.forceLogout === true) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          try {
            sessionStorage.removeItem('lastHandledForceDashboard');
          } catch {}
          lastHandledForceDashboardRef.current = 0;
          setForcedDashboardNotice(null);
          setForcedLogoutNotice('Sesi Anda telah dihentikan oleh Guru / Admin. Silakan login kembali.');
          setLocalCheatingAttempts(0);
          setLocalCheatingDetails([]);
          setCurrentStudent(null);
          setCurrentPage('login');
          try {
            for (const c of COURSES) {
              await deleteDoc(doc(db, 'active_sessions', `${studentId}_${c.id}`)).catch(() => {});
            }
            for (const s of soalSets) {
              await deleteDoc(doc(db, 'active_sessions', `${studentId}_soal_${s.id}`)).catch(() => {});
            }
            await deleteDoc(doc(db, 'online_users', studentId)).catch(() => {});
          } catch (e) {}
          return;
        }

        const incomingForceDashboardNonce = Number(data?.forceDashboardNonce || 0);
        if (incomingForceDashboardNonce > lastHandledForceDashboardRef.current) {
          lastHandledForceDashboardRef.current = incomingForceDashboardNonce;
          try {
            sessionStorage.setItem('lastHandledForceDashboard', String(incomingForceDashboardNonce));
          } catch {}

          // Kembalikan siswa ke Dashboard Siswa (keluar dari game, materi, dan soal)
          setIsPreviewingSoal(false);
          setShowCompletionPopup(false);
          setStudentTab('materi');
          setCurrentPage('student_dashboard');
          setForcedDashboardNotice('Anda telah diarahkan kembali ke Dashboard Siswa oleh Guru / Admin.');

          setTimeout(() => {
            try {
              (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.();
            } catch {}
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
          }, 80);

          try {
            for (const c of COURSES) {
              await deleteDoc(doc(db, 'active_sessions', `${studentId}_${c.id}`)).catch(() => {});
            }
            for (const s of soalSets) {
              await deleteDoc(doc(db, 'active_sessions', `${studentId}_soal_${s.id}`)).catch(() => {});
            }
          } catch (e) {}
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `online_users/${studentId}`);
      }
    );

    return () => {
      unsubPresence();
    };
  }, [isAdmin, currentStudent?.id, currentStudent?.sessionToken]);

  // Heartbeat & current activity sync for logged-in student
  useEffect(() => {
    if (isAdmin || !currentStudent?.id || currentPage === 'login') return;

    const getStudentActivityLabel = () => {
      if (currentPage === 'course' || currentPage === 'course_confirm') {
        const course = COURSES.find(c => c.id === activeCourseId);
        return `Materi: ${course?.title || 'Pembelajaran'}`;
      }
      if (currentPage === 'soal' || currentPage === 'soal_confirm') {
        const soalSet = soalSets.find(s => s.id === activeSoalSetId);
        return `Soal: ${soalSet?.title || 'Latihan / Ujian'}`;
      }
      if (studentTab === 'soal') return 'Dashboard · Daftar Soal';
      if (studentTab === 'games') return 'Dashboard · Game Edukasi';
      if (studentTab === 'skor') return 'Dashboard · Riwayat Nilai';
      return 'Dashboard Siswa';
    };

    const syncOnlinePresence = () => {
      setDoc(
        doc(db, 'online_users', currentStudent.id),
        {
          studentId: currentStudent.id,
          nis: currentStudent.nis || '',
          studentName: currentStudent.nama || '',
          kelas: currentStudent.student_management?.kelas || currentStudent.kelas || '',
          tahunPelajaran: currentStudent.tahunPelajaran || activeTahunPelajaran,
          currentPage,
          currentActivity: getStudentActivityLabel(),
          ...(currentStudent.sessionToken ? { sessionToken: currentStudent.sessionToken } : {}),
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      ).catch((error) => {
        handleFirestoreError(error, OperationType.WRITE, `online_users/${currentStudent.id}`);
      });
    };

    syncOnlinePresence();
    const intervalId = setInterval(syncOnlinePresence, 25000);
    return () => clearInterval(intervalId);
  }, [
    isAdmin,
    currentStudent?.id,
    currentStudent?.nis,
    currentStudent?.nama,
    currentStudent?.kelas,
    currentStudent?.tahunPelajaran,
    currentStudent?.sessionToken,
    currentPage,
    studentTab,
    activeCourseId,
    activeSoalSetId,
    activeTahunPelajaran,
    soalSets,
  ]);

  const handleNotificationClick = async (notif: any) => {
    try {
      // Find student
      const student = scopedStudents.find(s => s.id === notif.studentId) || students.find(s => s.id === notif.studentId);
      if (student) {
        const score = getStudentScore(student.id);
        setStudentDetail({ student, score });
      }
      
      // Delete notification
      await deleteDoc(doc(db, 'notifications', notif.id));
      setIsNotificationsOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications');
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications');
    }
  };

  const toggleMaterialActive = async (courseId: string) => {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;
    
    const currentStatus = isCourseActive(courseId);
    const newStatus = !currentStatus;
    
    setMaterialToggleTarget({ id: courseId, title: course.title, nextStatus: newStatus });
    setIsMaterialConfirmOpen(true);
  };

  const toggleMaterialFullScreen = async (courseId: string) => {
    try {
      const currentConfig = materialConfigs[courseId] || { isActive: isCourseActive(courseId) };
      const scopedId = buildScopedMaterialDocId(courseId, activeTahunPelajaran, activeSemester);
      await setDoc(doc(db, 'scoped_material_configs', scopedId), {
        ...currentConfig,
        courseId,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        isFullScreen: !(currentConfig.isFullScreen ?? false),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error toggling full screen:", error);
    }
  };

  const toggleMaterialScoreVisibility = async (courseId: string) => {
    try {
      const currentConfig = materialConfigs[courseId] || { isActive: isCourseActive(courseId) };
      const currentVal = currentConfig.isScoreVisible ?? true;
      const scopedId = buildScopedMaterialDocId(courseId, activeTahunPelajaran, activeSemester);
      await setDoc(doc(db, 'scoped_material_configs', scopedId), {
        ...currentConfig,
        courseId,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        isScoreVisible: !currentVal,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error toggling score visibility:", error);
    }
  };

  const updateSessionStatus = async (courseId: string, status: 'working' | 'finished') => {
    if (!currentStudent || isAdmin) return;
    try {
      const sessionRef = doc(db, 'active_sessions', `${currentStudent.id}_${courseId}`);
      if (status === 'finished') {
        await deleteDoc(sessionRef);
      } else {
        await setDoc(sessionRef, {
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          courseId: courseId,
          courseTitle: COURSES.find(c => c.id === courseId)?.title || '',
          status: status,
          currentScore: currentScore,
          kelas: currentStudent.kelas,
          lastActive: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmToggleMaterial = async () => {
    if (!materialToggleTarget) return;
    
    try {
      const { id, nextStatus } = materialToggleTarget;
      const scopedId = buildScopedMaterialDocId(id, activeTahunPelajaran, activeSemester);
      const currentConfig = materialConfigs[id] || {};
      await setDoc(doc(db, 'scoped_material_configs', scopedId), {
        ...currentConfig,
        courseId: id,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        isActive: nextStatus,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setIsMaterialConfirmOpen(false);
      setMaterialToggleTarget(null);
    } catch (error) {
      console.error("Error toggling material:", error);
    }
  };
  
  // Re-fetch helper if needed for setDoc (but it's better to just import it at top)

  const handleAddStudentManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentNis || !manualStudentNama || !manualStudentKelas) {
      alert('Mohon lengkapi semua data');
      return;
    }
    
    setIsAddingStudent(true);
    try {
      await addDoc(collection(db, 'students'), {
        nis: manualStudentNis,
        nama: manualStudentNama,
        jenisKelamin: manualStudentJenisKelamin,
        kelas: manualStudentKelas,
        tahunPelajaran: activeTahunPelajaran,
      });
      
      setManualStudentNis('');
      setManualStudentNama('');
      setManualStudentKelas('');
      setIsImportModalOpen(false);
      alert('Siswa berhasil ditambahkan');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataBuffer = evt.target?.result as ArrayBuffer;
      const wb = XLSX.read(dataBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const newStudents = data.slice(1).map((row: any[]) => ({
        nis: String(row[0] || ''),
        nama: String(row[1] || ''),
        jenisKelamin: String(row[2] || ''),
        kelas: String(row[3] || ''),
        tahunPelajaran: activeTahunPelajaran,
      })).filter(s => s.nis || s.nama);

      for (const student of newStudents) {
        try {
          await addDoc(collection(db, 'students'), student);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'students');
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const deleteStudent = async (id: string) => {
    setDeleteType('student');
    setDeleteTarget(id);
    setIsDeleteModalOpen(true);
  };

  const startEditStudent = (student: typeof students[0]) => {
    setEditingStudentId(student.id);
    setEditFormData({ nis: student.nis, nama: student.nama, jenisKelamin: student.jenisKelamin, kelas: student.kelas });
  };

  const saveEditStudent = async () => {
    try {
      await updateDoc(doc(db, 'students', editingStudentId!), {
        ...editFormData,
        tahunPelajaran: activeTahunPelajaran,
      });
      setEditingStudentId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${editingStudentId}`);
    }
  };

  const handleCopyStudentsFromYear = async () => {
    if (!copySourceTahunPelajaran || copySourceTahunPelajaran === activeTahunPelajaran) return;
    setIsCopyingStudents(true);
    setCopyStudentsNotice(null);
    try {
      const sourceList = students.filter(
        s => (s.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === copySourceTahunPelajaran
      );
      if (sourceList.length === 0) {
        setCopyStudentsNotice({
          type: 'error',
          message: `Tidak ada data siswa pada TA ${copySourceTahunPelajaran}.`,
        });
        return;
      }

      const existingKeys = new Set(
        scopedStudents.map(s =>
          s.nis
            ? `nis:${String(s.nis).trim()}`
            : `name:${String(s.nama || '').trim()}|${String(s.kelas || '').trim()}`
        )
      );

      const toCopy = sourceList.filter(s => {
        const key = s.nis
          ? `nis:${String(s.nis).trim()}`
          : `name:${String(s.nama || '').trim()}|${String(s.kelas || '').trim()}`;
        return !existingKeys.has(key);
      });

      if (toCopy.length === 0) {
        setCopyStudentsNotice({
          type: 'success',
          message: `Semua ${sourceList.length} siswa dari TA ${copySourceTahunPelajaran} sudah tersedia di TA ${activeTahunPelajaran}.`,
        });
        return;
      }

      const yearSlug = slugifyTermPart(activeTahunPelajaran).replace(/-/g, '_');
      let batch = writeBatch(db);
      let ops = 0;
      for (const s of toCopy) {
        const targetRef = doc(db, 'students', `ta_${yearSlug}_${s.id}`);
        batch.set(targetRef, {
          nis: String(s.nis || ''),
          nama: String(s.nama || ''),
          jenisKelamin: String(s.jenisKelamin || 'L'),
          kelas: String(s.kelas || ''),
          tahunPelajaran: activeTahunPelajaran,
        });
        ops++;
        if (ops === 450) {
          await batch.commit();
          batch = writeBatch(db);
          ops = 0;
        }
      }
      if (ops > 0) {
        await batch.commit();
      }

      setCopyStudentsNotice({
        type: 'success',
        message: `Berhasil menyalin ${toCopy.length} siswa & kelas dari TA ${copySourceTahunPelajaran} ke TA ${activeTahunPelajaran}.`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'students');
    } finally {
      setIsCopyingStudents(false);
    }
  };

  if (currentPage === 'login') {
    return (
      <Login 
        setCurrentPage={setCurrentPage} 
        setIsAdmin={setIsAdmin}
        setCurrentStudent={setCurrentStudent}
        setCurrentScore={setCurrentScore}
        forcedLogoutNotice={forcedLogoutNotice}
        onClearForcedLogoutNotice={() => {
          setForcedLogoutNotice(null);
          setForcedDashboardNotice(null);
          lastHandledForceDashboardRef.current = 0;
        }}
        settingsConfig={settingsConfig}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (currentPage === 'student_dashboard') {
    const activeCoursesList = COURSES.filter(c => isCourseActive(c.id));
    const studentKelas = (currentStudent?.student_management?.kelas || currentStudent?.kelas || '').trim();
    const activatedSetIdsForStudentClass = new Set(
      Object.values(asesmenHarianSoalLinks)
        .filter(l => {
          if (!l?.isActive || !l.setId) return false;
          if (!studentKelas || (l.kelas || '').trim().toLowerCase() !== studentKelas.toLowerCase()) return false;
          if (l.tahunPelajaran && l.tahunPelajaran !== activeTahunPelajaran) return false;
          if (l.semester && l.semester !== activeSemester) return false;
          return true;
        })
        .map(l => l.setId)
    );
    const activeSoalSets = enrichedSoalSets.filter(s => {
      const hasQuestions = soalQuestions.some(q => q.setId === s.id);
      if (!hasQuestions) return false;
      if (activatedSetIdsForStudentClass.has(s.id)) return true;
      if (s.soalType === 'sumatif') {
        return s.isActive && doesSoalSetMatchStudentClass(s.kelas, studentKelas);
      }
      // Soal Biasa menjadi Bank Soal (tampil ke siswa hanya saat dipanggil/aktifkan lewat Asesmen Harian)
      return false;
    });

    const filteredAnnouncements = announcements
      .filter(msg => {
        if (msg.isVisible === false) return false;
        if (msg.targetType === 'all') return true;
        if (msg.targetType === 'class' && msg.targetValue === currentStudent?.student_management?.kelas) return true;
        if (msg.targetType === 'class' && !currentStudent?.student_management?.kelas && msg.targetValue === currentStudent?.kelas) return true;
        if (msg.targetType === 'student' && msg.targetValue === currentStudent?.id) return true;
        return false;
      })
      .sort((a, b) => {
        const dateA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp?.seconds * 1000 || 0);
        const dateB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp?.seconds * 1000 || 0);
        return dateB - dateA;
      });

    const completedCourseCount = activeCoursesList.filter(c =>
      scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === c.id)
    ).length;

    const completedSoalCount = activeSoalSets.filter(s =>
      scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === `soal_${s.id}`)
    ).length;

    const myStudentScores = scopedStudentAssessments
      .filter(a => a.studentId === currentStudent?.id)
      .map(a => Number(a.score))
      .filter(n => !Number.isNaN(n));

    const avgStudentScore = myStudentScores.length > 0
      ? Math.round(myStudentScores.reduce((acc, s) => acc + s, 0) / myStudentScores.length)
      : null;

    const courseProgressPct = activeCoursesList.length > 0
      ? Math.round((completedCourseCount / activeCoursesList.length) * 100)
      : 0;

    const soalProgressPct = activeSoalSets.length > 0
      ? Math.round((completedSoalCount / activeSoalSets.length) * 100)
      : 0;

    const doesStudentClassMatchTp = (tpKelas?: string, targetClass?: string) => {
      const tpK = (tpKelas || '').trim().toUpperCase();
      const cls = (targetClass || '').trim().toUpperCase();
      if (!cls) return true;
      if (!tpK || tpK === 'SEMUA' || tpK === 'ALL') return true;
      if (tpK === cls) return true;
      if ((tpK === 'VII' || tpK === '7' || tpK === 'KELAS VII' || tpK === 'KELAS 7') && (cls.startsWith('7') || cls.startsWith('VII'))) {
        return true;
      }
      if ((tpK === 'VIII' || tpK === '8' || tpK === 'KELAS VIII' || tpK === 'KELAS 8') && (cls.startsWith('8') || cls.startsWith('VIII'))) {
        return true;
      }
      if ((tpK === 'IX' || tpK === '9' || tpK === 'KELAS IX' || tpK === 'KELAS 9') && (cls.startsWith('9') || cls.startsWith('IX'))) {
        return true;
      }
      return false;
    };

    const isSumatifAkhirRecord = (s: NilaiSumatifItem) =>
      s.jenis === 'Sumatif Akhir Semester' || s.jenis === 'Sumatif Tengah Semester';

    const studentScopedSumatifSaved = studentNilaiSumatif.filter(
      (s) =>
        s.tahunPelajaran === activeTahunPelajaran &&
        s.semester === activeSemester &&
        !isSumatifAkhirRecord(s) &&
        (!studentKelas || (s.kelas || '').trim().toLowerCase() === studentKelas.toLowerCase())
    );

    const savedSumatifIdSet = new Set(studentScopedSumatifSaved.map((s) => s.id));
    const autoSumatifForStudent: NilaiSumatifItem[] = [];

    studentTpList
      .filter((tp) => tp.tahunPelajaran === activeTahunPelajaran && doesStudentClassMatchTp(tp.kelas, studentKelas))
      .forEach((tp) => {
        if (tp.isSumatif) {
          const autoId = `auto_sumatif__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(studentKelas)}__${slugifyTermPart(tp.id)}`;
          const alreadyExists =
            savedSumatifIdSet.has(autoId) ||
            studentScopedSumatifSaved.some(
              (s) =>
                s.jenis !== 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!alreadyExists) {
            autoSumatifForStudent.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas: studentKelas,
              judul: tp.kodeTp,
              jenis: 'Sumatif Lingkup Materi',
              tanggal: '',
              tpId: tp.id,
              tpKode: tp.kodeTp,
              bobot: 1,
              scores: {},
              notes: {},
            });
          }
        }
        if (tp.isPraktikum) {
          const autoId = `auto_praktik__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(studentKelas)}__${slugifyTermPart(tp.id)}`;
          const alreadyExists =
            savedSumatifIdSet.has(autoId) ||
            studentScopedSumatifSaved.some(
              (s) =>
                s.jenis === 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!alreadyExists) {
            autoSumatifForStudent.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas: studentKelas,
              judul: tp.kodeTp,
              jenis: 'Praktik',
              tanggal: '',
              tpId: tp.id,
              tpKode: tp.kodeTp,
              bobot: 1,
              scores: {},
              notes: {},
            });
          }
        }
      });

    const combinedStudentSumatifItems = [...studentScopedSumatifSaved, ...autoSumatifForStudent].sort((a, b) => {
      const codeA = (a.tpKode || a.judul || '').toUpperCase();
      const codeB = (b.tpKode || b.judul || '').toUpperCase();
      if (codeA !== codeB) return codeA.localeCompare(codeB);
      return (a.jenis === 'Praktik' ? 1 : 0) - (b.jenis === 'Praktik' ? 1 : 0);
    });

    const mapStudentSumatifItem = (item: NilaiSumatifItem) => {
      const rawScore = item.scores?.[currentStudent?.id];
      const hasScore = rawScore !== undefined && rawScore !== null && !Number.isNaN(Number(rawScore));
      const scoreVal = hasScore ? Math.round(Number(rawScore)) : null;
      const linkedTp = studentTpList.find(
        (t) =>
          (item.tpId && t.id === item.tpId) ||
          (item.tpKode && t.kodeTp.trim().toUpperCase() === item.tpKode.trim().toUpperCase())
      );
      const kkm = Number(linkedTp?.kkm ?? 75) || 75;
      return {
        id: item.id,
        judul: item.judul,
        tpKode: item.tpKode || '',
        deskripsi: linkedTp?.deskripsi || '',
        bobot: Number(item.bobot || 1) || 1,
        score: scoreVal,
        kkm,
      };
    };

    const studentSumatifTpItems = combinedStudentSumatifItems
      .filter((s) => s.jenis !== 'Praktik')
      .map(mapStudentSumatifItem);

    const studentPraktikumTpItems = combinedStudentSumatifItems
      .filter((s) => s.jenis === 'Praktik')
      .map(mapStudentSumatifItem);

    const computeWeightedSumatifAvg = (items: typeof studentSumatifTpItems): number | null => {
      let weightedSum = 0;
      let totalWeight = 0;
      items.forEach((item) => {
        if (item.score !== null) {
          weightedSum += item.score * item.bobot;
          totalWeight += item.bobot;
        }
      });
      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
    };

    const avgStudentSumatifTp = computeWeightedSumatifAvg(studentSumatifTpItems);
    const avgStudentPraktikumTp = computeWeightedSumatifAvg(studentPraktikumTpItems);

    const studentInitials = (currentStudent?.nama || 'S')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() || '')
      .join('');

    const normalizedSearch = studentCatalogSearch.trim().toLowerCase();

    const displayedCourses = activeCoursesList.filter(course => {
      const done = scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === course.id);
      if (studentCatalogFilter === 'done' && !done) return false;
      if (studentCatalogFilter === 'todo' && done) return false;
      if (normalizedSearch && !course.title.toLowerCase().includes(normalizedSearch) && !course.level.toLowerCase().includes(normalizedSearch)) {
        return false;
      }
      return true;
    });

    const displayedSoalSets = activeSoalSets.filter(set => {
      const done = scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === `soal_${set.id}`);
      if (studentCatalogFilter === 'done' && !done) return false;
      if (studentCatalogFilter === 'todo' && done) return false;
      if (
        normalizedSearch &&
        !set.title.toLowerCase().includes(normalizedSearch) &&
        !(set.description || '').toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }
      return true;
    });

    const handleStudentLogout = async () => {
      if (currentStudent) {
        const studentId = currentStudent.id;
        setForcedLogoutNotice(null);
        setForcedDashboardNotice(null);
        lastHandledForceDashboardRef.current = 0;
        try {
          sessionStorage.removeItem('lastHandledForceDashboard');
        } catch {}
        setCurrentPage('login');
        setLocalCheatingAttempts(0);
        setLocalCheatingDetails([]);
        setCurrentStudent(null);
        try {
          for (const c of COURSES) {
            await deleteDoc(doc(db, 'active_sessions', `${studentId}_${c.id}`)).catch(() => {});
          }
          for (const s of soalSets) {
            await deleteDoc(doc(db, 'active_sessions', `${studentId}_soal_${s.id}`)).catch(() => {});
          }
          await deleteDoc(doc(db, 'online_users', studentId)).catch(() => {});
        } catch (e) {}
      } else {
        setCurrentStudent(null);
      }
    };

    return (
      <div className={cn("flex h-screen text-slate-900 dark:text-slate-100 flex-col overflow-hidden font-sans transition-colors duration-300", currentBgPreset.className)}>
        {/* Clean 3-Zone Top Bar */}
        <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 md:px-8 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 md:gap-8 z-20 shrink-0 transition-colors">
          {/* Zone 1: Single-line Brand Title + Active Term */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              IK
            </div>
            <span className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Ruang Informatika
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 text-[11px] font-bold text-brand dark:text-blue-300 tabular-nums whitespace-nowrap">
              <CalendarDays size={12} />
              TA {activeTahunPelajaran} · Sem {activeSemester}
            </span>
          </div>

          {/* Zone 3: Student Account, Theme Toggle & Logout */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-right mr-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[160px] truncate">
                {currentStudent?.nama}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                · {currentStudent?.kelas}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              aria-label={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={handleStudentLogout}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/70 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800/80 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Mobile Segmented Sub-Nav (kept compact within mobile sticky cap) */}
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2.5 py-1.5 flex items-center gap-1 shrink-0 transition-colors">
          <button
            onClick={() => setStudentTab('materi')}
            className={cn(
              "flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer transition-colors",
              studentTab === 'materi' ? "bg-brand text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <BookOpen size={13} />
            <span>Materi</span>
          </button>
          <button
            onClick={() => setStudentTab('soal')}
            className={cn(
              "flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer transition-colors tabular-nums",
              studentTab === 'soal' ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <ClipboardList size={13} />
            <span>{activeSoalSets.length > 0 ? `Soal (${activeSoalSets.length})` : 'Soal'}</span>
          </button>
          <button
            onClick={() => setStudentTab('games')}
            className={cn(
              "flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer transition-colors",
              studentTab === 'games' ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Gamepad2 size={13} />
            <span>Game</span>
          </button>
          <button
            onClick={() => setStudentTab('skor')}
            className={cn(
              "flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer transition-colors",
              studentTab === 'skor' ? "bg-amber-600 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Trophy size={13} />
            <span>Skor Saya</span>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 w-full max-w-[1600px] mx-auto custom-scrollbar">
          {forcedDashboardNotice && (
            <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <Home size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-xs font-bold leading-snug">{forcedDashboardNotice}</p>
              </div>
              <button
                type="button"
                onClick={() => setForcedDashboardNotice(null)}
                className="p-1 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 shrink-0 cursor-pointer"
                aria-label="Tutup pemberitahuan"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Side-by-side Bento Layout: Left Student Profile Card | Right Materi, Soal, Game, or Skor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Student Profile Card: Identity, Progress, Sumatif TP & Praktikum TP Scores, and Pengumuman Guru */}
            <section className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col gap-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shrink-0 shadow-xs",
                currentStudent?.jenisKelamin === 'P' ? "bg-rose-600" : "bg-brand"
              )}>
                {studentInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Selamat datang kembali
                </p>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {currentStudent?.nama}
                </h1>
                {/* Zero-pill metadata strip */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                  <span className="font-mono">NISN {currentStudent?.nis}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span>Kelas {currentStudent?.kelas}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{currentStudent?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-bold text-brand dark:text-blue-400">TA {activeTahunPelajaran} (Sem {activeSemester})</span>
                </div>
              </div>
            </div>

            {/* 3 Real Computed Progress Metrics */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 tabular-nums">
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Materi Selesai</div>
                <div className="text-lg md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {completedCourseCount}<span className="text-slate-400 dark:text-slate-500 text-sm font-semibold">/{activeCoursesList.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${courseProgressPct}%` }} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStudentTab('soal')}
                className="space-y-1.5 text-left group cursor-pointer rounded-xl -m-1.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                title="Buka tab Latihan Soal"
              >
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Paket Soal
                </div>
                <div className="text-lg md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {completedSoalCount}<span className="text-slate-400 dark:text-slate-500 text-sm font-semibold">/{activeSoalSets.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${soalProgressPct}%` }} />
                </div>
              </button>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rata-Rata Skor</div>
                <div className={cn(
                  "text-lg md:text-2xl font-extrabold font-mono",
                  avgStudentScore === null ? "text-slate-400 dark:text-slate-500" :
                  avgStudentScore >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                  avgStudentScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {avgStudentScore !== null ? avgStudentScore : '-'}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {avgStudentScore === null ? 'Belum ada nilai' :
                   avgStudentScore >= 80 ? 'Sangat Baik' :
                   avgStudentScore >= 60 ? 'Cukup Baik' : 'Perlu Latihan'}
                </div>
              </div>
            </div>

            {/* Nilai Sumatif TP & Sumatif Praktikum TP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 tabular-nums">
              {/* Nilai Sumatif TP */}
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Target size={14} className="text-brand dark:text-blue-400 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                      Nilai Sumatif TP
                    </span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-black font-mono shrink-0",
                    avgStudentSumatifTp === null
                      ? "bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      : avgStudentSumatifTp >= 75
                      ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                      : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                  )}>
                    {avgStudentSumatifTp !== null ? `Rata: ${avgStudentSumatifTp}` : 'Rata: -'}
                  </span>
                </div>

                {studentSumatifTpItems.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {studentSumatifTpItems.map((item) => {
                      const sameAsTp = item.tpKode && item.judul.trim().toUpperCase() === item.tpKode.trim().toUpperCase();
                      return (
                        <div
                          key={item.id}
                          title={item.deskripsi || item.judul}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700/70 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                              {item.judul}
                            </div>
                            {!sameAsTp && item.tpKode && (
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                                {item.tpKode}
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md font-extrabold font-mono text-xs shrink-0",
                            item.score === null
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                              : item.score >= item.kkm
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          )}>
                            {item.score !== null ? item.score : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1">
                    Belum ada penilaian Sumatif TP pada semester ini.
                  </p>
                )}
              </div>

              {/* Sumatif Praktikum TP */}
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FlaskConical size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                      Sumatif Praktikum TP
                    </span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-black font-mono shrink-0",
                    avgStudentPraktikumTp === null
                      ? "bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      : avgStudentPraktikumTp >= 75
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                  )}>
                    {avgStudentPraktikumTp !== null ? `Rata: ${avgStudentPraktikumTp}` : 'Rata: -'}
                  </span>
                </div>

                {studentPraktikumTpItems.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {studentPraktikumTpItems.map((item) => {
                      const sameAsTp = item.tpKode && item.judul.trim().toUpperCase() === item.tpKode.trim().toUpperCase();
                      return (
                        <div
                          key={item.id}
                          title={item.deskripsi || item.judul}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700/70 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                              {item.judul}
                            </div>
                            {!sameAsTp && item.tpKode && (
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                                {item.tpKode}
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md font-extrabold font-mono text-xs shrink-0",
                            item.score === null
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                              : item.score >= item.kkm
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          )}>
                            {item.score !== null ? item.score : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1">
                    Belum ada penilaian Praktikum TP pada semester ini.
                  </p>
                )}
              </div>
            </div>

            {/* Pengumuman Guru (inside Student Profile Card, below Nilai — tampil hanya jika ada pengumuman) */}
            {filteredAnnouncements.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone size={15} className="text-brand dark:text-blue-400 shrink-0" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Pengumuman Guru
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    {filteredAnnouncements.length} info
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 custom-scrollbar rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 px-3.5 py-2.5">
                  {filteredAnnouncements.map(msg => (
                    <div key={msg.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        <span className="text-brand dark:text-blue-400 font-bold">
                          {msg.targetType === 'all' ? 'Semua Siswa' : msg.targetType === 'class' ? `Kelas ${msg.targetValue}` : 'Pesan Pribadi'}
                        </span>
                        <span>
                          {msg.timestamp?.toDate()
                            ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(msg.timestamp.toDate())
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                        {msg.content}
                      </p>
                      {msg.link && (
                        <a
                          href={msg.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand dark:text-blue-400 hover:underline pt-0.5"
                        >
                          <span>Buka Tautan</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </section>

            {/* Right Column: Navigation + Main Tab Content (sejajar Kartu Profil) */}
            <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-4">
              {/* Desktop Tab Navigation placed directly above the content div */}
              <nav className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
                <button
                  onClick={() => setStudentTab('materi')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                    studentTab === 'materi'
                      ? "bg-brand text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <BookOpen size={14} />
                  <span>Materi</span>
                </button>
                <button
                  onClick={() => setStudentTab('soal')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer tabular-nums",
                    studentTab === 'soal'
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <ClipboardList size={14} />
                  <span>{activeSoalSets.length > 0 ? `Latihan Soal (${activeSoalSets.length})` : 'Latihan Soal'}</span>
                </button>
                <button
                  onClick={() => setStudentTab('games')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                    studentTab === 'games'
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Gamepad2 size={14} />
                  <span>Game Edukasi</span>
                </button>
                <button
                  onClick={() => setStudentTab('skor')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                    studentTab === 'skor'
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Trophy size={14} />
                  <span>Skor Saya</span>
                </button>
              </nav>

              {studentTab === 'games' ? (
            <AdminGames isAdmin={false} currentStudent={currentStudent} studentsList={scopedStudents} />
          ) : studentTab === 'skor' ? (() => {
            const isSoalItem = (a: any) => Boolean(a?.isSoal || String(a?.courseId || '').startsWith('soal_'));
            const materiScores = [...scopedStudentAssessments]
              .filter(a => !isSoalItem(a))
              .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
            const soalScores = [...scopedStudentAssessments]
              .filter(a => isSoalItem(a))
              .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
            const gameBestScores = dedupeHighestGameScores(studentGameScores);

            return (
              <section className="space-y-6 pb-8">
                {/* Skor Saya Header & Category Filter */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Skor Saya</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                        Rekap nilai Materi, Latihan Soal, dan Rekor Tertinggi Game Edukasi
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {([
                      { id: 'all', label: 'Semua' },
                      { id: 'materi', label: `Materi (${materiScores.length})` },
                      { id: 'soal', label: `Latihan Soal (${soalScores.length})` },
                      { id: 'game', label: `Game Edukasi (${gameBestScores.length})` },
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setStudentScoreFilter(tab.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer tabular-nums",
                          studentScoreFilter === tab.id
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Skor Materi */}
                {(studentScoreFilter === 'all' || studentScoreFilter === 'materi') && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-400 flex items-center justify-center shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm md:text-base">Skor Materi Pembelajaran</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">{materiScores.length} materi selesai</p>
                        </div>
                      </div>
                    </div>

                    {materiScores.length > 0 ? (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse tabular-nums">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                <th className="px-5 py-3">Judul Materi</th>
                                <th className="px-5 py-3 text-center">Skor</th>
                                <th className="px-5 py-3 text-right">Tanggal Selesai</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                              {materiScores.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">{a.courseTitle}</td>
                                  <td className="px-5 py-3.5 text-center">
                                    <span className={cn(
                                      "font-mono font-extrabold text-sm",
                                      a.score >= 80 ? "text-emerald-700 dark:text-emerald-400" : a.score >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                                    )}>
                                      {a.score}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 text-xs font-medium">
                                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {materiScores.map(a => (
                            <div key={a.id} className="p-4 flex items-center justify-between gap-3 tabular-nums">
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{a.courseTitle}</h4>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                  {a.completedAt ? new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                </p>
                              </div>
                              <span className={cn(
                                "font-mono font-extrabold text-base shrink-0",
                                a.score >= 80 ? "text-emerald-700 dark:text-emerald-400" : a.score >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                              )}>
                                {a.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium">
                        Belum ada skor materi pembelajaran yang tersimpan.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Skor Latihan Soal */}
                {(studentScoreFilter === 'all' || studentScoreFilter === 'soal') && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <ClipboardList size={16} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm md:text-base">Skor Latihan Soal & Ujian</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">{soalScores.length} paket soal dikerjakan</p>
                        </div>
                      </div>
                    </div>

                    {soalScores.length > 0 ? (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse tabular-nums">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                <th className="px-5 py-3">Judul Paket Soal</th>
                                <th className="px-5 py-3 text-center">Skor</th>
                                <th className="px-5 py-3 text-right">Tanggal Selesai</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                              {soalScores.map(a => {
                                const matchedSoal = soalSets.find(s => `soal_${s.id}` === a.courseId);
                                const showScore = matchedSoal?.isScoreVisible ?? true;
                                return (
                                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">{a.courseTitle}</td>
                                    <td className="px-5 py-3.5 text-center">
                                      {showScore ? (
                                        <span className={cn(
                                          "font-mono font-extrabold text-sm",
                                          a.score >= 80 ? "text-emerald-700 dark:text-emerald-400" : a.score >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                                        )}>
                                          {a.score}
                                        </span>
                                      ) : (
                                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Disembunyikan</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 text-xs font-medium">
                                      {a.completedAt ? new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {soalScores.map(a => {
                            const matchedSoal = soalSets.find(s => `soal_${s.id}` === a.courseId);
                            const showScore = matchedSoal?.isScoreVisible ?? true;
                            return (
                              <div key={a.id} className="p-4 flex items-center justify-between gap-3 tabular-nums">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{a.courseTitle}</h4>
                                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                  </p>
                                </div>
                                <span className={cn(
                                  "font-mono font-extrabold text-base shrink-0",
                                  !showScore ? "text-xs text-slate-400 dark:text-slate-500 font-sans" :
                                  a.score >= 80 ? "text-emerald-700 dark:text-emerald-400" : a.score >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                                )}>
                                  {showScore ? a.score : 'Tersimpan'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium">
                        Belum ada skor latihan soal yang tersimpan.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Skor Game Edukasi (Rekor Tertinggi per Game/Stage) */}
                {(studentScoreFilter === 'all' || studentScoreFilter === 'game') && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Gamepad2 size={16} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm md:text-base">Skor Tertinggi Game Edukasi</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                            Hanya mencatat skor tertinggi per game / stage ({gameBestScores.length} rekor)
                          </p>
                        </div>
                      </div>
                    </div>

                    {gameBestScores.length > 0 ? (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse tabular-nums">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                <th className="px-5 py-3">Nama Permainan & Stage</th>
                                <th className="px-5 py-3 text-center">Rekor Tertinggi</th>
                                <th className="px-5 py-3 text-right">Diperbarui</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                              {gameBestScores.map(g => (
                                <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Trophy size={14} className="text-amber-500 shrink-0" />
                                    <span>{g.gameTitle || g.gameId || 'Game Edukasi'}</span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    <span className="font-mono font-extrabold text-sm text-indigo-700 dark:text-indigo-400">
                                      {g.score} Poin
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 text-xs font-medium">
                                    {formatScoreTimestamp(g)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {gameBestScores.map(g => (
                            <div key={g.id} className="p-4 flex items-center justify-between gap-3 tabular-nums">
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{g.gameTitle || g.gameId || 'Game Edukasi'}</h4>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                  {formatScoreTimestamp(g)}
                                </p>
                              </div>
                              <span className="font-mono font-extrabold text-sm text-indigo-700 dark:text-indigo-400 shrink-0">
                                {g.score} Poin
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium">
                        Belum ada rekor game edukasi. Mainkan game untuk mencetak skor tertinggi!
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })() : (
            <>
              {/* Workspace Filter & Search Toolbar */}
              <section className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white",
                      studentTab === 'soal' ? "bg-emerald-600" : "bg-brand"
                    )}>
                      {studentTab === 'soal' ? <ClipboardList size={19} /> : <BookOpen size={19} />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                        {studentTab === 'soal' ? 'Latihan & Ujian Soal' : 'Materi Pembelajaran'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                        {studentTab === 'soal'
                          ? `${displayedSoalSets.length} dari ${activeSoalSets.length} paket soal ditampilkan`
                          : `${displayedCourses.length} dari ${activeCoursesList.length} materi ditampilkan`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 md:w-64 shrink-0">
                    <div className="relative w-full">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder={studentTab === 'soal' ? 'Cari paket soal...' : 'Cari materi...'}
                        value={studentCatalogSearch}
                        onChange={(e) => setStudentCatalogSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {([
                        { id: 'all', label: 'Semua' },
                        { id: 'todo', label: 'Belum' },
                        { id: 'done', label: 'Selesai' },
                      ] as const).map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setStudentCatalogFilter(opt.id)}
                          className={cn(
                            "flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-center",
                            studentCatalogFilter === opt.id
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid Content */}
                {studentTab === 'soal' ? (
                  displayedSoalSets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displayedSoalSets.map((set, index) => {
                        const courseKey = `soal_${set.id}`;
                        const studentAssessment = scopedStudentAssessments.find(a => a.studentId === currentStudent?.id && a.courseId === courseKey);
                        const hasCompleted = !!studentAssessment;
                        const activeQs = soalQuestions.filter(q => q.setId === set.id);
                        const coverArt = getSoalCoverArt(set.title, index);
                        const isSumatif = set.soalType === 'sumatif';
                        const isAsesmenHarianLinked = activatedSetIdsForStudentClass.has(set.id);
                        const targetDisplayLabel = isAsesmenHarianLinked && !doesSoalSetMatchStudentClass(set.kelas, studentKelas)
                          ? `Kelas ${studentKelas}`
                          : (set.kelas || 'Semua Kelas');
                        const timerText = set.timerMode === 'per_soal'
                          ? `${set.defaultQuestionTimerSeconds || 30} dtk / soal`
                          : set.titleTimerSeconds > 0
                          ? `${Math.ceil(set.titleTimerSeconds / 60)} Menit`
                          : 'Tanpa Batas';

                        return (
                          <motion.div
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.99 }}
                            key={set.id}
                            onClick={() => {
                              setActiveSoalSetId(set.id);
                              sessionStorage.setItem('activeSoalSetId', set.id);
                              setIsPreviewingSoal(false);
                              setCurrentPage('soal_confirm');
                            }}
                            className={cn(
                              "group bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer",
                              isSumatif
                                ? "border-amber-300/90 dark:border-amber-700/70 hover:border-amber-400 dark:hover:border-amber-500"
                                : "border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600"
                            )}
                          >
                            {/* Illustrated Cover Banner */}
                            <div className={cn("relative h-36 w-full overflow-hidden bg-gradient-to-br shrink-0", coverArt.fallbackGradient)}>
                              {coverArt.isCustomSvg ? (
                                <svg
                                  viewBox="0 0 320 144"
                                  aria-hidden="true"
                                  className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                >
                                  <rect width="320" height="144" fill="#10B981" />
                                  <circle cx="46" cy="36" r="14" fill="#FBBF24" />
                                  <circle cx="278" cy="112" r="20" fill="#34D399" />
                                  <rect x="78" y="20" width="84" height="104" rx="10" fill="#FFFFFF" />
                                  <rect x="92" y="38" width="56" height="7" rx="3.5" fill="#CBD5E1" />
                                  <rect x="92" y="54" width="44" height="7" rx="3.5" fill="#CBD5E1" />
                                  <rect x="92" y="70" width="52" height="7" rx="3.5" fill="#CBD5E1" />
                                  <rect x="92" y="86" width="36" height="7" rx="3.5" fill="#CBD5E1" />
                                  <circle cx="210" cy="68" r="34" fill="#FB7185" />
                                  <circle cx="210" cy="68" r="24" fill="#38BDF8" />
                                  <path d="M199 68l7 7 15-15" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                  <rect x="136" y="102" width="76" height="14" rx="7" fill="#FACC15" transform="rotate(-12 136 102)" />
                                  <rect x="136" y="102" width="22" height="14" rx="5" fill="#FB7185" transform="rotate(-12 136 102)" />
                                </svg>
                              ) : (
                                <>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-20 text-white pointer-events-none">
                                    <ClipboardList size={42} />
                                  </div>
                                  <img
                                    src={coverArt.image}
                                    alt={set.title}
                                    referrerPolicy="no-referrer"
                                    className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </>
                              )}
                              <div className="absolute inset-0 z-20 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/75" />

                              {/* Top unboxed kicker & status */}
                              <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[11px] font-mono font-bold tracking-wider text-white tabular-nums drop-shadow-xs">
                                    Paket {String(index + 1).padStart(2, '0')}
                                  </span>
                                  {isSumatif && (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
                                      SUMATIF
                                    </span>
                                  )}
                                </div>
                                {hasCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-200 text-xs font-extrabold whitespace-nowrap drop-shadow-xs">
                                    <CheckCircle size={14} /> Selesai
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-white/95 truncate max-w-[140px] drop-shadow-xs">
                                    {targetDisplayLabel}
                                  </span>
                                )}
                              </div>

                              {/* Bottom banner metadata */}
                              <div className="absolute bottom-3 left-4 right-4 z-30 flex items-end justify-between gap-2">
                                <p className="text-xs font-bold text-white truncate drop-shadow-xs">
                                  {isSumatif ? 'Evaluasi Sumatif' : coverArt.label}
                                </p>
                                <span className="text-[11px] font-mono font-semibold text-white/95 tabular-nums whitespace-nowrap shrink-0 drop-shadow-xs">
                                  {set.isFullScreen ? 'Mode Ujian' : 'Mode Latihan'}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col">
                              {isSumatif && (
                                <div className="mb-1.5 flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                    SUMATIF
                                  </span>
                                  {isAsesmenHarianLinked && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                                      Asesmen Harian
                                    </span>
                                  )}
                                </div>
                              )}
                              {!isSumatif && isAsesmenHarianLinked && (
                                <div className="mb-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                                    Asesmen Harian · Kelas {studentKelas}
                                  </span>
                                </div>
                              )}
                              <h3 className="font-extrabold text-sm md:text-[15px] text-slate-900 dark:text-slate-100 leading-snug mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {set.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3.5">
                                {set.description || 'Uji pemahaman materi dengan butir soal pilihan ganda terukur dan umpan balik otomatis.'}
                              </p>

                              {/* Clean unboxed specs strip */}
                              <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 py-2 mb-3.5 tabular-nums">
                                <div className="pr-1.5">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Butir</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{activeQs.length} PG</span>
                                </div>
                                <div className="px-2">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Durasi</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate block">{timerText}</span>
                                </div>
                                <div className="pl-2">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Target</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate block">{targetDisplayLabel}</span>
                                </div>
                              </div>

                              {/* Footer Action Row */}
                              <div className="mt-auto flex items-center justify-between gap-2">
                                {hasCompleted ? (
                                  <>
                                    {(set.isScoreVisible ?? true) ? (
                                      <span className={cn(
                                        "text-[11px] font-extrabold font-mono tabular-nums",
                                        (studentAssessment?.score ?? 0) >= 80 ? "text-emerald-700 dark:text-emerald-400" :
                                        (studentAssessment?.score ?? 0) >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                                      )}>
                                        Skor: {studentAssessment?.score}/100
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tersimpan</span>
                                    )}
                                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors">
                                      Detail <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">Siap dikerjakan</span>
                                    <span className={cn(
                                      "px-3 py-1.5 rounded-xl text-white text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs transition-colors",
                                      isSumatif ? "bg-amber-600 group-hover:bg-amber-700" : "bg-emerald-600 group-hover:bg-emerald-700"
                                    )}>
                                      Kerjakan <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 py-14 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 transition-colors">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                        <ClipboardList size={26} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                        {soalDbError
                          ? 'Gagal Memuat Paket Soal'
                          : activeSoalSets.length === 0
                          ? 'Belum Ada Paket Soal Aktif'
                          : 'Tidak Ada Paket Soal Cocok'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        {soalDbError
                          ? soalDbError
                          : activeSoalSets.length === 0
                          ? 'Paket soal akan tampil di sini setelah guru mengaktifkan kartu soal beserta butir soalnya.'
                          : 'Coba ubah kata kunci pencarian atau pilih filter "Semua".'}
                      </p>
                      {(soalDbError || activeSoalSets.length === 0) && (
                        <button
                          type="button"
                          onClick={() => fetchSoalFromMysql()}
                          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw size={13} />
                          Muat Ulang Soal
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  displayedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displayedCourses.map((course, index) => {
                        const studentAssessment = scopedStudentAssessments.find(a => a.studentId === currentStudent?.id && a.courseId === course.id);
                        const hasCompleted = !!studentAssessment;
                        const isFullScreenMode = materialConfigs[course.id]?.isFullScreen;
                        const coverArt = getCourseCoverArt(course.title, index);
                        const totalCourseQuiz = course.topics.reduce((sum, t) => sum + (t.quiz?.length || 0), 0);

                        return (
                          <motion.div
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.99 }}
                            key={course.id}
                            onClick={() => {
                              setActiveCourseId(course.id);
                              setCurrentPage('course_confirm');
                            }}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
                          >
                            {/* Illustrated Cover Banner */}
                            <div className={cn("relative h-36 w-full overflow-hidden bg-gradient-to-br shrink-0", coverArt.fallbackGradient)}>
                              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-white pointer-events-none">
                                <BookOpen size={42} />
                              </div>
                              <img
                                src={coverArt.image}
                                alt={course.title}
                                referrerPolicy="no-referrer"
                                className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 z-20 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/75" />

                              {/* Top unboxed kicker & status */}
                              <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono font-bold tracking-wider text-white tabular-nums drop-shadow-xs">
                                  Modul {String(index + 1).padStart(2, '0')}
                                </span>
                                {hasCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-200 text-xs font-extrabold whitespace-nowrap drop-shadow-xs">
                                    <CheckCircle size={14} /> Selesai
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-white/95 truncate max-w-[140px] drop-shadow-xs">
                                    {course.level}
                                  </span>
                                )}
                              </div>

                              {/* Bottom banner metadata */}
                              <div className="absolute bottom-3 left-4 right-4 z-30 flex items-end justify-between gap-2">
                                <p className="text-xs font-bold text-white truncate drop-shadow-xs">
                                  {coverArt.label}
                                </p>
                                <span className="text-[11px] font-mono font-semibold text-white/95 tabular-nums whitespace-nowrap shrink-0 drop-shadow-xs">
                                  {isFullScreenMode ? 'Mode Ujian' : 'Mandiri'}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-extrabold text-sm md:text-[15px] text-slate-900 dark:text-slate-100 leading-snug mb-1.5 group-hover:text-brand dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3.5">
                                {course.description || `Pelajari ${course.topics.length} topik terstruktur beserta evaluasi kuis interaktif.`}
                              </p>

                              {/* Clean unboxed specs strip */}
                              <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 py-2 mb-3.5 tabular-nums">
                                <div className="pr-1.5">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Topik</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{course.topics.length} Bagian</span>
                                </div>
                                <div className="px-2">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Evaluasi</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{totalCourseQuiz} Kuis</span>
                                </div>
                                <div className="pl-2">
                                  <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">Tingkat</span>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate block">{course.level}</span>
                                </div>
                              </div>

                              {/* Footer Action Row */}
                              <div className="mt-auto flex items-center justify-between gap-2">
                                {hasCompleted ? (
                                  <>
                                    <span className={cn(
                                      "text-[11px] font-extrabold font-mono tabular-nums",
                                      (studentAssessment?.score ?? 0) >= 80 ? "text-emerald-700 dark:text-emerald-400" :
                                      (studentAssessment?.score ?? 0) >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
                                    )}>
                                      Skor: {studentAssessment?.score}/100
                                    </span>
                                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-brand dark:group-hover:text-blue-300 text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors">
                                      Ulangi <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">Belum dimulai</span>
                                    <span className="px-3 py-1.5 rounded-xl bg-brand text-white group-hover:bg-blue-700 text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs transition-colors">
                                      Mulai <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 py-14 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 transition-colors">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                        <Lock size={26} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                        {activeCoursesList.length === 0 ? 'Belum Ada Materi Aktif' : 'Tidak Ada Materi Cocok'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        {activeCoursesList.length === 0
                          ? 'Materi akan muncul di sini setelah guru mengaktifkannya.'
                          : 'Coba ubah kata kunci pencarian atau pilih filter "Semua".'}
                      </p>
                      {activeCoursesList.length === 0 && activeSoalSets.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setStudentTab('soal')}
                          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ClipboardList size={14} />
                          Buka Latihan Soal ({activeSoalSets.length} Paket)
                        </button>
                      )}
                    </div>
                  )
                )}
              </section>
            </>
          )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'course_confirm') {
    const course = activeCourse;
    const hasCompleted = scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === course.id);
    const studentAssessment = scopedStudentAssessments.find(a => a.studentId === currentStudent?.id && a.courseId === course.id);
    const isFullScreen = materialConfigs[course.id]?.isFullScreen || false;
    const isScoreVisible = materialConfigs[course.id]?.isScoreVisible ?? true;

    return (
      <div className={cn("min-h-screen text-slate-900 dark:text-slate-100 flex flex-col p-4 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar font-sans transition-colors duration-300", currentBgPreset.className)}>
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-md my-4 md:my-auto transition-colors"
        >
          {/* Banner Header */}
          <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-7 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-brand/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shrink-0">
                  <BookOpen size={22} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-0.5">
                    Konfirmasi Pembelajaran
                  </span>
                  <h2 className="text-lg md:text-2xl font-extrabold text-white leading-snug">
                    {course.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('student_dashboard')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="Kembali ke Dashboard"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content Details */}
          <div className="p-6 md:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 tabular-nums">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Tingkat Kelas</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{course.level}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Jumlah Topik</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{course.topics.length} Topik Pembelajaran</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Mode Keamanan</span>
                <span className={cn("font-bold text-sm inline-flex items-center gap-1.5", isFullScreen ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400")}>
                  {isFullScreen ? <Maximize size={14} /> : <CheckCircle size={14} />}
                  {isFullScreen ? "Layar Penuh (Mode Ujian)" : "Mode Normal"}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Status Nilai</span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                  {isScoreVisible ? <Eye size={14} className="text-brand dark:text-blue-400" /> : <EyeOff size={14} className="text-slate-400" />}
                  {isScoreVisible ? "Terlihat Saat Belajar" : "Disembunyikan Saat Belajar"}
                </span>
              </div>
            </div>

            {hasCompleted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm mb-0.5">Materi Ini Sudah Selesai</h4>
                  <p className="text-xs md:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Anda telah memperoleh skor <span className="font-extrabold font-mono tabular-nums">{studentAssessment?.score ?? 100}</span>. Anda dapat membuka kembali materi ini kapan saja.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 p-4 rounded-xl flex items-start gap-3">
                <Info size={20} className="text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mb-0.5">Siap Memulai?</h4>
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Pelajari setiap topik secara berurutan dan selesaikan kuis evaluasi pada <span className="font-bold text-brand dark:text-blue-400">{course.title}</span>.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentPage('student_dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs md:text-sm whitespace-nowrap cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentPage('course');
                  updateSessionStatus(course.id, 'working').catch(console.error);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold transition-colors flex items-center justify-center gap-2 text-xs md:text-sm whitespace-nowrap cursor-pointer"
              >
                <CheckCircle size={17} />
                {hasCompleted ? "Buka Materi Kembali" : "Ya, Mulai Pembelajaran"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentPage === 'soal_confirm') {
    const selectedSoalSet = enrichedSoalSets.find(s => s.id === activeSoalSetId);
    if (!selectedSoalSet) {
      return (
        <div className={cn("min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-300", currentBgPreset.className)}>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full shadow-md">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Paket Soal Tidak Ditemukan</h3>
            <button
              onClick={() => setCurrentPage(isAdmin ? 'admin' : 'student_dashboard')}
              className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      );
    }

    const activeQs = soalQuestions.filter(q => q.setId === selectedSoalSet.id);
    const courseKey = `soal_${selectedSoalSet.id}`;
    const hasCompleted = scopedStudentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === courseKey);
    const studentAssessment = scopedStudentAssessments.find(a => a.studentId === currentStudent?.id && a.courseId === courseKey);
    const isFullScreen = selectedSoalSet.isFullScreen || false;
    const isScoreVisible = selectedSoalSet.isScoreVisible ?? true;
    const isSumatif = selectedSoalSet.soalType === 'sumatif';

    return (
      <div className={cn("min-h-screen text-slate-900 dark:text-slate-100 flex flex-col p-4 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar font-sans transition-colors duration-300", currentBgPreset.className)}>
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-md my-4 md:my-auto transition-colors"
        >
          <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-7 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
                  isSumatif
                    ? "bg-amber-500/25 border-amber-400/40 text-amber-300"
                    : "bg-emerald-500/25 border-emerald-400/40 text-emerald-300"
                )}>
                  <ClipboardList size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Konfirmasi Pengerjaan Soal
                    </span>
                    {isSumatif && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        SUMATIF
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg md:text-2xl font-extrabold text-white leading-snug">
                    {selectedSoalSet.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('student_dashboard')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 tabular-nums">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Target Kelas</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedSoalSet.kelas || 'Semua Kelas'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Jumlah Soal PG</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeQs.length} Butir Soal (4 Opsi)</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Pengaturan Timer</span>
                <span className="font-bold text-sm text-amber-700 dark:text-amber-400 inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {selectedSoalSet.timerMode === 'per_soal'
                    ? `Per Soal (${selectedSoalSet.defaultQuestionTimerSeconds || 30}d default)`
                    : selectedSoalSet.titleTimerSeconds > 0
                    ? `Per Judul (${Math.floor(selectedSoalSet.titleTimerSeconds / 60)}m ${selectedSoalSet.titleTimerSeconds % 60}d)`
                    : 'Tanpa Batas Waktu'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Mode Keamanan</span>
                <span className={cn("font-bold text-sm inline-flex items-center gap-1.5", isFullScreen ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400")}>
                  {isFullScreen ? <Maximize size={14} /> : <CheckCircle size={14} />}
                  {isFullScreen ? "Fullscreen (Terpantau)" : "Mode Normal"}
                </span>
              </div>
            </div>

            {hasCompleted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm mb-0.5">Paket Soal Ini Sudah Dikerjakan</h4>
                  <p className="text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
                    {isScoreVisible
                      ? <>Skor terakhir Anda: <span className="font-extrabold font-mono tabular-nums">{studentAssessment?.score ?? 0}</span>. Anda dapat mengerjakan ulang jika diizinkan guru.</>
                      : 'Jawaban Anda telah tersimpan di sistem guru.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 p-4 rounded-xl flex items-start gap-3">
                <Info size={20} className="text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mb-0.5">Siap Mengerjakan?</h4>
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
                    Pastikan koneksi internet stabil. {isFullScreen && 'Dilarang keluar dari layar penuh atau membuka tab lain selama ujian berlangsung.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentPage('student_dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs md:text-sm whitespace-nowrap cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={() => setCurrentPage('soal')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 text-xs md:text-sm whitespace-nowrap cursor-pointer transition-colors"
              >
                <CheckCircle size={17} />
                {hasCompleted ? "Kerjakan Ulang Soal" : "Mulai Kerjakan Soal"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentPage === 'soal') {
    const selectedSoalSet = enrichedSoalSets.find(s => s.id === activeSoalSetId);
    if (!selectedSoalSet) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full shadow-xl">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">Paket Soal Tidak Tersedia</h3>
            <button
              onClick={() => setCurrentPage(isAdmin ? 'admin' : 'student_dashboard')}
              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      );
    }

    const setQuestions = soalQuestions.filter(q => q.setId === selectedSoalSet.id);
    return (
      <StudentSoalRunner
        soalSet={selectedSoalSet}
        questions={setQuestions}
        currentStudent={currentStudent}
        activeTahunPelajaran={activeTahunPelajaran}
        activeSemester={activeSemester}
        isAdminPreview={isAdmin || isPreviewingSoal}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onExit={() => {
          setIsPreviewingSoal(false);
          if (isAdmin) {
            setAdminTab('questions');
            setCurrentPage('admin');
          } else {
            setCurrentPage('student_dashboard');
          }
        }}
        onFirestoreError={(err, op, path) =>
          handleFirestoreError(err, op === 'delete' ? OperationType.DELETE : OperationType.WRITE, path)
        }
      />
    );
  }

  if (currentPage === 'admin') {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'bg-brand/10 text-brand' },
      { id: 'administrasi', label: 'Kelola Administrasi', icon: FolderKanban, color: 'bg-brand/10 text-brand' },
      { id: 'materials', label: 'Kelola Materi', icon: GraduationCap, color: 'bg-brand/10 text-brand' },
      { id: 'games', label: 'Kelola Game', icon: Gamepad2, color: 'bg-brand/10 text-brand' },
      { id: 'questions', label: 'Kelola Soal', icon: ClipboardList, color: 'bg-brand/10 text-brand' },
      { id: 'assessments', label: 'Hasil Asesmen', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
      { id: 'student_management', label: 'Siswa & Kelas', icon: Users, color: 'bg-brand/10 text-brand' },
      { id: 'announcements', label: 'Pengumuman', icon: Megaphone, color: 'bg-brand/10 text-brand' },
      { id: 'history', label: 'Riwayat Akses', icon: GitBranch, color: 'bg-brand/10 text-brand' },
      { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'bg-brand/10 text-brand' },
    ] as const;

    return (
      <div className={cn(
        "relative flex h-screen text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300",
        currentBgPreset.className,
        (printingMaterialCourseId || (adminTab === 'materials' && materialSubTab === 'analisis_soal' && hasPrintableQuestionAnalysis)) && "print:hidden"
      )}>
        {/* Mobile Header */}
        <div className="md:hidden fixed top-2 left-2 right-2 h-12 admin-glass-header rounded-xl z-40 flex items-center justify-between px-3 transition-colors duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-slate-100 dark:bg-slate-800 w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden relative border border-slate-200/80 dark:border-slate-700 shrink-0">
              <img src={settingsConfig?.logoUrl || "/images/labkom_nesaka_logo.jpg"} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap truncate">SMPN 1 Kawali</h2>
              <p className="text-[10px] font-bold text-brand dark:text-blue-400 tabular-nums whitespace-nowrap truncate">
                {realtimeScheduleStatus.state === 'active' && realtimeScheduleStatus.kelas
                  ? `Kelas ${realtimeScheduleStatus.kelas} · ${realtimeScheduleStatus.timeHHMM}`
                  : realtimeScheduleStatus.state === 'break'
                  ? `Istirahat · ${realtimeScheduleStatus.timeHHMM}`
                  : `${realtimeScheduleStatus.hariLabel} · ${realtimeScheduleStatus.timeHHMM}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              aria-label={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setIsAdminSidebarOpen(true)}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>

        {/* Sidebar Backdrop (Mobile) — ultra-light tint so content behind glass sidebar remains clearly visible */}
        <AnimatePresence>
          {isAdminSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/8 dark:bg-black/20 z-40 md:hidden"
              onClick={() => setIsAdminSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation (Clear Frosted Glass) */}
        <aside className={cn(
          "admin-glass-sidebar fixed inset-y-3 left-3 z-40 w-72 rounded-3xl overflow-hidden transition-transform duration-200 transform md:relative md:inset-auto md:z-20 md:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:translate-x-0",
          isAdminSidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+1.5rem)]"
        )}>
          <div className="relative z-10 p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/35 dark:border-white/12">
              <div className="flex items-center gap-3">
                <div className="bg-white/25 dark:bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden relative border border-white/55 dark:border-white/18">
                  <img src={settingsConfig?.logoUrl || "/images/labkom_nesaka_logo.jpg"} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight uppercase tracking-tight">SMPN 1 KAWALI</h2>
                  <p className="text-[10px] font-bold text-brand dark:text-blue-400 uppercase tracking-widest mt-0.5">Informatika</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminSidebarOpen(false)}
                className="md:hidden p-1.5 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {menuItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    if (item.id === 'student_management') {
                      setStudentSubTab('classes');
                    }
                    setIsAdminSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors duration-200 font-bold text-sm group relative",
                    adminTab === item.id 
                      ? "bg-gradient-to-r from-brand/85 to-blue-600/80 text-white shadow-md shadow-brand/20 border border-white/35" 
                      : "text-slate-900 dark:text-slate-100 border border-transparent hover:bg-white/25 dark:hover:bg-white/10 hover:border-white/45 dark:hover:border-white/18 hover:text-brand dark:hover:text-blue-300"
                  )}
                >
                  {adminTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-xs" />}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0",
                    adminTab === item.id ? "bg-white/20 text-white" : "bg-white/20 dark:bg-white/8 border border-white/45 dark:border-white/12 text-slate-800 dark:text-slate-200 group-hover:bg-brand/15 dark:group-hover:bg-blue-500/20 group-hover:text-brand dark:group-hover:text-blue-300"
                  )}>
                    <item.icon size={16} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="pt-4 mt-4 border-t border-white/35 dark:border-white/12">
              <button 
                onClick={() => { setSoalAdminToken(null); setIsAdmin(false); setCurrentPage('login'); }} 
                className="w-full flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-500/12 dark:hover:bg-rose-500/18 border border-transparent hover:border-rose-300/55 dark:hover:border-rose-500/30 p-3 rounded-2xl transition-colors duration-200 font-bold text-sm group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/12 border border-rose-200/50 dark:border-rose-500/20 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors duration-200">
                  <LogOut size={16} />
                </div>
                Logout Admin
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-3 md:p-5 lg:p-6 pt-16 md:pt-4 overflow-y-auto w-full custom-scrollbar">
          <header className="sticky top-0 z-30 admin-glass-header rounded-2xl px-3.5 py-2 md:px-4 md:py-2 flex items-center justify-between gap-3 mb-4 transition-colors duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border border-brand/15 dark:border-blue-500/25 shrink-0",
                menuItems.find(i => i.id === adminTab)?.color
              )}>
                {(() => {
                  const Icon = menuItems.find(i => i.id === adminTab)?.icon;
                  return Icon ? <Icon size={16} /> : null;
                })()}
              </div>
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {adminTab === 'administrasi' ? 'Kelola Administrasi' :
                   adminTab === 'history' ? 'Aktivitas' : adminTab === 'student_management' ? 'Siswa & Kelas' : 
                   adminTab === 'materials' ? 'Kelola Materi' : adminTab === 'questions' ? 'Kelola Soal' : adminTab === 'assessments' ? 'Hasil Asesmen' :
                   adminTab === 'games' ? 'Kelola Game' :
                   adminTab === 'announcements' ? 'Pengumuman' : adminTab === 'settings' ? 'Pengaturan' : 'Dashboard'}
                </h1>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-xs font-medium whitespace-nowrap">
                  · Admin Panel
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Realtime Jadwal Kelas Saat Ini */}
              <button
                type="button"
                onClick={() => setAdminTab('administrasi')}
                title={
                  realtimeScheduleStatus.state === 'active'
                    ? `Sedang mengajar Kelas ${realtimeScheduleStatus.kelas} (${realtimeScheduleStatus.mataPelajaran} · Jam ${realtimeScheduleStatus.jamKe}, ${realtimeScheduleStatus.waktuRange})`
                    : realtimeScheduleStatus.state === 'break'
                    ? `Jam Istirahat (${realtimeScheduleStatus.waktuRange})${realtimeScheduleStatus.nextKelas ? ` · Berikutnya Kelas ${realtimeScheduleStatus.nextKelas} (${realtimeScheduleStatus.nextWaktuMulai})` : ''}`
                    : realtimeScheduleStatus.state === 'upcoming'
                    ? `Jadwal berikutnya: Kelas ${realtimeScheduleStatus.nextKelas} pukul ${realtimeScheduleStatus.nextWaktuMulai}`
                    : `${realtimeScheduleStatus.hariLabel}, ${realtimeScheduleStatus.timeHHMMSS} · Tidak ada jadwal mengajar saat ini`
                }
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer tabular-nums whitespace-nowrap",
                  realtimeScheduleStatus.state === 'active'
                    ? "bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-200/90 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300"
                    : realtimeScheduleStatus.state === 'break'
                    ? "bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border-amber-200/90 dark:border-amber-800/80 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                )}
              >
                {realtimeScheduleStatus.state === 'active' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <Clock size={13} className="shrink-0 hidden sm:inline" />
                    <span>Kelas {realtimeScheduleStatus.kelas}</span>
                    <span className="hidden lg:inline font-bold opacity-85">
                      · Jam {realtimeScheduleStatus.jamKe} ({realtimeScheduleStatus.waktuRange})
                    </span>
                    <span className="hidden md:inline text-[11px] font-bold opacity-75">
                      · {realtimeScheduleStatus.timeHHMMSS}
                    </span>
                  </>
                ) : realtimeScheduleStatus.state === 'break' ? (
                  <>
                    <Clock size={13} className="shrink-0" />
                    <span>Istirahat</span>
                    {realtimeScheduleStatus.nextKelas && (
                      <span className="hidden lg:inline font-bold opacity-85">
                        · Next Kelas {realtimeScheduleStatus.nextKelas} ({realtimeScheduleStatus.nextWaktuMulai})
                      </span>
                    )}
                    <span className="hidden sm:inline text-[11px] font-bold opacity-75">
                      · {realtimeScheduleStatus.timeHHMMSS}
                    </span>
                  </>
                ) : realtimeScheduleStatus.state === 'upcoming' ? (
                  <>
                    <Clock size={13} className="shrink-0" />
                    <span className="sm:hidden">Next: {realtimeScheduleStatus.nextKelas}</span>
                    <span className="hidden sm:inline">
                      Berikutnya: Kelas {realtimeScheduleStatus.nextKelas} ({realtimeScheduleStatus.nextWaktuMulai})
                    </span>
                    <span className="hidden md:inline text-[11px] font-bold opacity-75">
                      · {realtimeScheduleStatus.timeHHMMSS}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="shrink-0" />
                    <span className="sm:hidden">{realtimeScheduleStatus.timeHHMM}</span>
                    <span className="hidden sm:inline">
                      {realtimeScheduleStatus.hariLabel}, {realtimeScheduleStatus.timeHHMMSS} · Di luar jam jadwal
                    </span>
                  </>
                )}
              </button>

              {/* Active Tahun Pelajaran & Semester Badge */}
              <button
                type="button"
                onClick={() => setAdminTab('settings')}
                title="Klik untuk mengatur Tahun Pelajaran & Semester aktif"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/70 text-xs font-extrabold text-brand dark:text-blue-300 transition-colors cursor-pointer tabular-nums"
              >
                <CalendarDays size={14} className="shrink-0" />
                <span>TA {activeTahunPelajaran} · Sem {activeSemester}</span>
              </button>

              {/* Theme Toggle (Desktop & Quick Access) */}
              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
                aria-label={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
                className="w-8 h-8 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-amber-300 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => {
                    const opening = !isNotificationsOpen;
                    setIsNotificationsOpen(opening);
                    if (opening && unreadNotifications.length > 0) {
                      Promise.all(
                        unreadNotifications.map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true }))
                      ).catch(error => {
                        handleFirestoreError(error, OperationType.UPDATE, 'notifications');
                      });
                    }
                  }}
                  className="w-8 h-8 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs transition-all duration-200 relative group cursor-pointer"
                >
                  <Bell size={16} className="group-hover:rotate-12 transition-transform duration-200 text-brand dark:text-blue-400" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white dark:border-slate-900 px-1 tabular-nums">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-900/25 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] md:translate-x-0 md:translate-y-0 md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 z-50 overflow-hidden origin-center md:origin-top-right"
                      >
                        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-800/80">
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-sm md:text-base">Notifikasi</h3>
                          <span className="text-[10px] font-bold bg-brand/10 dark:bg-blue-950/70 text-brand dark:text-blue-400 px-2.5 py-1 rounded-lg uppercase tracking-wider tabular-nums">
                            {unreadNotifications.length > 0 ? `${unreadNotifications.length} Baru` : `${notifications.length} Dibaca`}
                          </span>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {[...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => (
                                <div 
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={cn(
                                    "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors duration-200 cursor-pointer group relative",
                                    notif.isRead !== true && "bg-blue-50/40 dark:bg-blue-950/30"
                                  )}
                                >
                                  <div className="flex gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                      <TrendingUp size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{notif.studentName}</p>
                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                                          {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2">
                                        Baru saja menyelesaikan <span className="text-slate-900 dark:text-white font-semibold">{notif.courseTitle}</span> dengan skor <span className="text-emerald-600 dark:text-emerald-400 font-bold underline tabular-nums">{notif.score}</span>
                                      </p>
                                    </div>
                                    <button 
                                      onClick={(e) => deleteNotification(notif.id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 dark:text-slate-500 hover:text-rose-500 transition-all duration-200 shrink-0"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-12 text-center">
                              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-3">
                                <Bell size={28} />
                              </div>
                              <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm italic">Belum ada notifikasi baru.</p>
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 bg-slate-50/90 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                            <button 
                              onClick={async () => {
                                if (!confirm("Hapus semua notifikasi?")) return;
                                try {
                                  const promises = notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)));
                                  await Promise.all(promises);
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.DELETE, 'notifications');
                                }
                              }}
                              className="w-full py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200 uppercase tracking-widest rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            >
                              Bersihkan Semua
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {adminTab === 'student_management' && studentSubTab === 'students' && (
                <div className="flex gap-2">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-xs shadow-xs active:scale-95 transition-all whitespace-nowrap"
                >
                  <Plus size={15} /> <span className="hidden sm:inline">Tambah Siswa</span>
                </button>
                {selectedStudentIds.length > 0 && (
                  <button 
                    onClick={() => { setDeleteType('student'); setDeleteTarget('selected'); setIsDeleteModalOpen(true); }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/70 rounded-lg font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all whitespace-nowrap"
                  >
                    <Trash2 size={15} /> <span className="hidden sm:inline">Hapus ({selectedStudentIds.length})</span>
                  </button>
                )}
              </div>
            )}
          </header>
          
          <div className="admin-glass-shell relative overflow-hidden rounded-3xl p-4 md:p-6">
            <div>
            {adminTab === 'dashboard' && (() => {
              const activeSessionList = activeSessions.filter(s => {
                if (!s.lastActive) return true;
                const lastActiveTime = s.lastActive?.toMillis ? s.lastActive.toMillis() : (s.lastActive.seconds * 1000);
                return (Date.now() - lastActiveTime) < 120000;
              });

              const cheatingSessionsList = activeSessions.filter(session => (session.cheatingAttempts || 0) > 0);
              const workingStudentsCount = activeSessionList.filter(s => s.courseTitle || s.status === 'working').length;
              const activeCourseCount = COURSES.filter(c => isCourseActive(c.id)).length;
              
              const distinctClasses = Array.from(new Set(activeSessionList.map(s => s.kelas))).filter(Boolean).sort();
              const filteredClasses = dashboardClassFilter === 'all' 
                ? distinctClasses 
                : distinctClasses.filter(c => c === dashboardClassFilter);

              const onlineUsersList = onlineUsers
                .filter(u => {
                  if (u.forceLogout === true) return false;
                  if (u.tahunPelajaran && u.tahunPelajaran !== activeTahunPelajaran) return false;
                  if (u.lastSeen) {
                    const lastSeenMs = u.lastSeen?.toMillis ? u.lastSeen.toMillis() : (u.lastSeen.seconds * 1000);
                    return (realtimeNow.getTime() - lastSeenMs) < 120000;
                  }
                  if (u.loginAt) {
                    const loginAtMs = u.loginAt?.toMillis ? u.loginAt.toMillis() : (u.loginAt.seconds * 1000);
                    return (realtimeNow.getTime() - loginAtMs) < 120000;
                  }
                  return true;
                })
                .sort((a, b) => {
                  const cmpCls = naturalCompareKelas(a.kelas || '', b.kelas || '');
                  if (cmpCls !== 0) return cmpCls;
                  return (a.studentName || '').localeCompare(b.studentName || '', 'id-ID');
                });

              const onlineDistinctClasses = Array.from(
                new Set(onlineUsersList.map(u => (u.kelas || '').trim()).filter(Boolean))
              ).sort((a, b) => naturalCompareKelas(a, b));

              const filteredOnlineUsers = onlineUsersList.filter(u => {
                if (onlineClassFilter !== 'all' && (u.kelas || '').trim() !== onlineClassFilter) {
                  return false;
                }
                const q = onlineSearch.trim().toLowerCase();
                if (q) {
                  const nameMatch = (u.studentName || '').toLowerCase().includes(q);
                  const nisMatch = (u.nis || '').toLowerCase().includes(q);
                  const classMatch = (u.kelas || '').toLowerCase().includes(q);
                  if (!nameMatch && !nisMatch && !classMatch) return false;
                }
                return true;
              });

              const handleAdminForceLogoutStudent = async (onlineUser: any) => {
                const targetId = onlineUser.studentId || onlineUser.id;
                if (!targetId) return;
                setLoggingOutStudentId(targetId);
                try {
                  await setDoc(
                    doc(db, 'online_users', targetId),
                    {
                      forceLogout: true,
                      loggedOutAt: serverTimestamp(),
                    },
                    { merge: true }
                  );
                  const relatedSessions = activeSessions.filter(s => s.studentId === targetId);
                  for (const sess of relatedSessions) {
                    await deleteDoc(doc(db, 'active_sessions', sess.id)).catch(() => {});
                  }
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, `online_users/${targetId}`);
                } finally {
                  setLoggingOutStudentId(null);
                }
              };

              const handleAdminForceLogoutAll = async () => {
                if (filteredOnlineUsers.length === 0) {
                  setIsConfirmLogoutAllOnline(false);
                  return;
                }
                setLoggingOutStudentId('ALL');
                try {
                  await Promise.all(
                    filteredOnlineUsers.map(async (u) => {
                      const targetId = u.studentId || u.id;
                      if (!targetId) return;
                      await setDoc(
                        doc(db, 'online_users', targetId),
                        {
                          forceLogout: true,
                          loggedOutAt: serverTimestamp(),
                        },
                        { merge: true }
                      );
                      const relatedSessions = activeSessions.filter(s => s.studentId === targetId);
                      for (const sess of relatedSessions) {
                        await deleteDoc(doc(db, 'active_sessions', sess.id)).catch(() => {});
                      }
                    })
                  );
                  setIsConfirmLogoutAllOnline(false);
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, 'online_users');
                } finally {
                  setLoggingOutStudentId(null);
                }
              };

              const handleAdminForceToDashboardStudent = async (onlineUser: any) => {
                const targetId = onlineUser.studentId || onlineUser.id;
                if (!targetId) return;
                setForcingDashboardStudentId(targetId);
                try {
                  const nonce = Date.now();
                  await setDoc(
                    doc(db, 'online_users', targetId),
                    {
                      forceDashboardNonce: nonce,
                      forcedDashboardAt: serverTimestamp(),
                    },
                    { merge: true }
                  );
                  const relatedSessions = activeSessions.filter(s => s.studentId === targetId);
                  for (const sess of relatedSessions) {
                    await deleteDoc(doc(db, 'active_sessions', sess.id)).catch(() => {});
                  }
                  setAdminOnlineActionFeedback(`${onlineUser.studentName || 'Siswa'} diarahkan ke Dashboard Siswa.`);
                  setTimeout(() => setAdminOnlineActionFeedback(null), 4000);
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, `online_users/${targetId}`);
                } finally {
                  setForcingDashboardStudentId(null);
                }
              };

              const handleAdminForceAllToDashboard = async () => {
                if (filteredOnlineUsers.length === 0) {
                  setIsConfirmForceDashboardAll(false);
                  return;
                }
                setForcingDashboardStudentId('ALL');
                try {
                  const nonce = Date.now();
                  await Promise.all(
                    filteredOnlineUsers.map(async (u) => {
                      const targetId = u.studentId || u.id;
                      if (!targetId) return;
                      await setDoc(
                        doc(db, 'online_users', targetId),
                        {
                          forceDashboardNonce: nonce,
                          forcedDashboardAt: serverTimestamp(),
                        },
                        { merge: true }
                      );
                      const relatedSessions = activeSessions.filter(s => s.studentId === targetId);
                      for (const sess of relatedSessions) {
                        await deleteDoc(doc(db, 'active_sessions', sess.id)).catch(() => {});
                      }
                    })
                  );
                  setIsConfirmForceDashboardAll(false);
                  setAdminOnlineActionFeedback(`${filteredOnlineUsers.length} siswa diarahkan ke Dashboard Siswa.`);
                  setTimeout(() => setAdminOnlineActionFeedback(null), 4000);
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, 'online_users');
                } finally {
                  setForcingDashboardStudentId(null);
                }
              };

              return (
                <div className="space-y-6">
                  {/* Kartu Kelola Administrasi, Kelola Game, Kelola Materi & Kelola Soal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                    <div className="bg-blue-600/85 hover:bg-blue-600/95 border border-white/40 shadow-[0_10px_22px_-10px_rgba(37,99,235,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.45)] text-white rounded-2xl p-3.5 transition-colors duration-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                          <FolderKanban size={20} className="text-sky-200" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-white truncate">Kelola Administrasi</h3>
                          <p className="text-xs font-medium text-blue-100 tabular-nums truncate">TA {activeTahunPelajaran} · Sem {activeSemester}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdminTab('administrasi')}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-blue-950 text-xs font-black rounded-lg shadow-2xs active:scale-95 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>Kelola</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="bg-indigo-600/85 hover:bg-indigo-600/95 border border-white/40 shadow-[0_10px_22px_-10px_rgba(79,70,229,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.45)] text-white rounded-2xl p-3.5 transition-colors duration-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                          <Gamepad2 size={20} className="text-amber-300" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-white truncate">Kelola Game</h3>
                          <p className="text-xs font-medium text-indigo-100 tabular-nums">7 Game Edukasi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdminTab('games')}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-indigo-900 text-xs font-black rounded-lg shadow-2xs active:scale-95 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>Kelola</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="bg-emerald-600/85 hover:bg-emerald-600/95 border border-white/40 shadow-[0_10px_22px_-10px_rgba(5,150,105,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.45)] text-white rounded-2xl p-3.5 transition-colors duration-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                          <GraduationCap size={20} className="text-yellow-300" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-white truncate">Kelola Materi</h3>
                          <p className="text-xs font-medium text-emerald-100 tabular-nums">{activeCourseCount} Modul Siap</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdminTab('materials')}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-emerald-950 text-xs font-black rounded-lg shadow-2xs active:scale-95 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>Kelola</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="bg-amber-600/85 hover:bg-amber-600/95 border border-white/40 shadow-[0_10px_22px_-10px_rgba(217,119,6,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.45)] text-white rounded-2xl p-3.5 transition-colors duration-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                          <ClipboardList size={20} className="text-yellow-200" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-white truncate">Kelola Soal</h3>
                          <p className="text-xs font-medium text-amber-100 tabular-nums">{soalSets.filter(s => s.isActive).length} Paket Aktif</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdminTab('questions')}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-amber-950 text-xs font-black rounded-lg shadow-2xs active:scale-95 transition-all flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>Kelola</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Top Modern KPI Highlights Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <div className="admin-glass-card relative overflow-hidden rounded-2xl p-6 transition-shadow duration-200 group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-600 text-white flex items-center justify-center shadow-md shadow-brand/20">
                          <Radio size={22} className="text-yellow-300" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-yellow-400/35" />
                          Live Real-time
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{activeSessionList.length}</h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Total Siswa Aktif</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Terhubung ke sistem</span>
                        <span className="font-bold text-brand dark:text-blue-400 tabular-nums">{activeSessionList.length > 0 ? `${activeSessionList.length} Online` : 'Standby'}</span>
                      </div>
                    </div>

                    <div className="admin-glass-card relative overflow-hidden rounded-2xl p-6 transition-shadow duration-200 group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-600 text-white flex items-center justify-center shadow-md shadow-brand/20">
                          <Activity size={22} className="text-yellow-300" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70">
                          <Zap size={12} className="text-amber-500" />
                          Progres
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{workingStudentsCount}</h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Sedang Mengerjakan</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Aktif di materi/kuis</span>
                        <span className="font-bold text-brand dark:text-blue-400 tabular-nums">{workingStudentsCount} Siswa</span>
                      </div>
                    </div>

                    {/* Card 3: Monitoring Kecurangan */}
                    <div className="admin-glass-card relative overflow-hidden rounded-2xl p-6 transition-shadow duration-200 group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md transition-colors duration-200",
                          cheatingSessionsList.length > 0 
                            ? "bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-500/20" 
                            : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20"
                        )}>
                          {cheatingSessionsList.length > 0 ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
                        </div>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase border",
                          cheatingSessionsList.length > 0
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/70"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/70"
                        )}>
                          {cheatingSessionsList.length > 0 ? '⚠️ Peringatan' : '🛡️ Aman'}
                        </span>
                      </div>
                      <h4 className={cn("text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums", cheatingSessionsList.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100")}>
                        {cheatingSessionsList.length}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Monitoring Kecurangan</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Keluar fullscreen / tab</span>
                        <span className={cn("font-bold tabular-nums", cheatingSessionsList.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400")}>
                          {cheatingSessionsList.length > 0 ? `${cheatingSessionsList.length} Terdeteksi` : 'Tertib'}
                        </span>
                      </div>
                    </div>

                    <div className="admin-glass-card relative overflow-hidden rounded-2xl p-6 transition-shadow duration-200 group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-600 text-white flex items-center justify-center shadow-md shadow-brand/20">
                          <Layers size={22} className="text-yellow-300" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70">
                          <Sparkles size={12} className="text-amber-500" />
                          Materi
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{activeCourseCount} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">/ {COURSES.length}</span></h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Status Materi Aktif</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Modul terbuka</span>
                        <span className="font-bold text-brand dark:text-blue-400 tabular-nums">{activeCourseCount} Siap Diakses</span>
                      </div>
                    </div>
                  </div>


                  
                  {/* TOP SECTION: KARTU PARTICIPANT, USER ONLINE & MONITORING KECURANGAN SEJAJAR DI ATAS */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT COLUMN: KARTU PARTICIPANT */}
                    <div className="xl:col-span-4 admin-glass-card rounded-3xl overflow-hidden flex flex-col">
                      {/* Vibrant Gradient Header */}
                      <div className="bg-gradient-to-r from-blue-700/85 via-blue-600/80 to-indigo-600/85 border-b border-white/25 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0">
                            <Users size={22} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white truncate">Kartu Participant</h3>
                              <span className="w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-yellow-400/35 shrink-0" />
                            </div>
                            <p className="text-white/85 text-[11px] font-medium mt-0.5 truncate">Aktivitas pengerjaan materi &amp; soal</p>
                          </div>
                        </div>

                        {/* Total Aktif Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-white/15 px-3 py-1.5 rounded-xl border border-white/25 shadow-xs shrink-0">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
                          <span className="text-xs font-extrabold text-white tracking-wide tabular-nums">
                            Aktif: <span className="text-yellow-300 font-black">{activeSessionList.length}</span>
                          </span>
                        </div>
                      </div>

                      {/* Class Quick Filter Tabs */}
                      {distinctClasses.length > 0 && (
                        <div className="px-5 py-3 bg-white/15 dark:bg-white/5 border-b border-white/35 dark:border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 mr-1">Filter Kelas:</span>
                          <button
                            onClick={() => setDashboardClassFilter('all')}
                            className={cn(
                              "px-3 py-1 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 tabular-nums",
                              dashboardClassFilter === 'all' 
                                ? "bg-brand text-white shadow-sm shadow-brand/30" 
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300"
                            )}
                          >
                            Semua ({activeSessionList.length})
                          </button>
                          {distinctClasses.map(c => {
                            const countInClass = activeSessionList.filter(s => s.kelas === c).length;
                            return (
                              <button
                                key={c}
                                onClick={() => setDashboardClassFilter(c)}
                                className={cn(
                                  "px-3 py-1 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 flex items-center gap-1.5 tabular-nums",
                                  dashboardClassFilter === c 
                                    ? "bg-brand text-white shadow-sm shadow-indigo-600/30" 
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300"
                                )}
                              >
                                Kelas {c}
                                <span className={cn(
                                  "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                                  dashboardClassFilter === c ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200"
                                )}>
                                  {countInClass}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Participant Cards Container */}
                      <div className="p-5 space-y-5 max-h-[560px] overflow-y-auto custom-scrollbar">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((className, idx) => {
                            const workingInClass = activeSessionList
                              .filter(s => s.kelas === className)
                              .sort((a, b) => a.studentName.localeCompare(b.studentName));

                            const classThemes = [
                              { bg: "bg-blue-500/10 dark:bg-blue-950/30", border: "border-white/50 dark:border-blue-800/50", header: "text-blue-900 dark:text-blue-200", badge: "bg-blue-600 text-white", icon: "text-brand" },
                              { bg: "bg-indigo-500/10 dark:bg-indigo-950/30", border: "border-white/50 dark:border-indigo-800/50", header: "text-indigo-900 dark:text-indigo-200", badge: "bg-indigo-600 text-white", icon: "text-brand" },
                              { bg: "bg-sky-500/10 dark:bg-sky-950/30", border: "border-white/50 dark:border-sky-800/50", header: "text-sky-900 dark:text-sky-200", badge: "bg-sky-600 text-white", icon: "text-sky-600" },
                              { bg: "bg-emerald-500/10 dark:bg-emerald-950/30", border: "border-white/50 dark:border-emerald-800/50", header: "text-emerald-900 dark:text-emerald-200", badge: "bg-emerald-600 text-white", icon: "text-emerald-600" },
                              { bg: "bg-amber-500/10 dark:bg-amber-950/30", border: "border-white/50 dark:border-amber-800/50", header: "text-amber-900 dark:text-amber-200", badge: "bg-amber-500 text-white", icon: "text-amber-600" },
                              { bg: "bg-rose-500/10 dark:bg-rose-950/30", border: "border-white/50 dark:border-rose-800/50", header: "text-rose-900 dark:text-rose-200", badge: "bg-rose-600 text-white", icon: "text-rose-600" },
                            ];
                            const theme = classThemes[idx % classThemes.length];

                            return (
                              <div key={className} className={cn("rounded-2xl border p-4 shadow-xs", theme.bg, theme.border)}>
                                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-xs", theme.badge)}>
                                      Kelas {className}
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                                      {workingInClass.length} Siswa Sedang Aktif
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
                                  {workingInClass.map(s => {
                                    const initials = (s.studentName || 'S')
                                      .split(' ')
                                      .slice(0, 2)
                                      .map((n: string) => n[0])
                                      .join('')
                                      .toUpperCase();

                                    return (
                                      <div 
                                        key={s.id} 
                                        className="admin-glass-card hover:border-brand/40 dark:hover:border-blue-500/50 p-3.5 rounded-xl transition-colors duration-200 flex flex-col gap-2.5 group"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs shadow-brand/20">
                                              {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs truncate group-hover:text-brand dark:group-hover:text-blue-400 transition-colors" title={s.studentName}>
                                                {s.studentName}
                                              </p>
                                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                Kelas {s.kelas}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          {/* Score Tag */}
                                          <span className="px-2.5 py-1 rounded-lg font-extrabold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/70 shrink-0 tabular-nums">
                                            Skor: {s.currentScore ?? 100}
                                          </span>
                                        </div>

                                        {/* Course and Activity Tag */}
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700">
                                            <BookOpen size={13} className="text-brand dark:text-blue-400 shrink-0" />
                                            <span className="truncate font-semibold text-[11px]" title={s.courseTitle || 'Di Halaman Siswa'}>
                                              {s.courseTitle || 'Di Halaman Siswa'}
                                            </span>
                                          </div>

                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/70 shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Aktif
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center text-brand dark:text-blue-400 mb-4 border border-blue-100 dark:border-blue-800/60 shadow-inner relative">
                              <Users size={34} />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Belum Ada Siswa yang Aktif</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                              Ketika siswa login dan membuka materi pembelajaran, kartu aktivitas siswa akan otomatis tampil di sini secara real-time.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MIDDLE COLUMN: USER ONLINE */}
                    <div className="xl:col-span-4 admin-glass-card rounded-3xl overflow-hidden flex flex-col">
                      {/* Vibrant Emerald-Teal Gradient Header */}
                      <div className="bg-gradient-to-r from-emerald-600/90 via-teal-600/85 to-cyan-600/85 border-b border-white/25 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0">
                            <UserCheck size={22} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white truncate">User Online</h3>
                              <span className="w-2 h-2 rounded-full bg-lime-300 ring-2 ring-lime-300/40 shrink-0" />
                            </div>
                            <p className="text-white/85 text-[11px] font-medium mt-0.5 truncate">Siswa yang sedang login ke sistem</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl border border-white/25 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-lime-300 shadow-lg shadow-lime-300/50" />
                            <span className="text-xs font-extrabold text-white tracking-wide tabular-nums">
                              Online: <span className="text-lime-200 font-black">{onlineUsersList.length}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Search, Class Filter, Paksa ke Dashboard & Logout Semua Bar */}
                      {onlineUsersList.length > 0 && (
                        <div className="px-5 py-3 bg-white/15 dark:bg-white/5 border-b border-white/35 dark:border-white/10 space-y-2.5">
                          <div className="relative w-full">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={onlineSearch}
                              onChange={(e) => setOnlineSearch(e.target.value)}
                              placeholder="Cari nama / NISN siswa online..."
                              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!isConfirmForceDashboardAll ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsConfirmLogoutAllOnline(false);
                                  setIsConfirmForceDashboardAll(true);
                                }}
                                disabled={filteredOnlineUsers.length === 0 || forcingDashboardStudentId !== null || loggingOutStudentId !== null}
                                className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                                title="Paksa semua siswa keluar dari game, materi, atau soal ke Dashboard Siswa"
                              >
                                <Home size={12} />
                                <span>Semua ke Dashboard</span>
                              </button>
                            ) : (
                              <div className="flex-1 min-w-[140px] flex items-center justify-between gap-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-1">
                                <button
                                  type="button"
                                  onClick={handleAdminForceAllToDashboard}
                                  disabled={forcingDashboardStudentId === 'ALL'}
                                  className="flex-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold cursor-pointer disabled:opacity-50"
                                >
                                  {forcingDashboardStudentId === 'ALL' ? 'Memproses...' : `Ya, Dashboard (${filteredOnlineUsers.length})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsConfirmForceDashboardAll(false)}
                                  className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            )}

                            {!isConfirmLogoutAllOnline ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsConfirmForceDashboardAll(false);
                                  setIsConfirmLogoutAllOnline(true);
                                }}
                                disabled={filteredOnlineUsers.length === 0 || loggingOutStudentId !== null || forcingDashboardStudentId !== null}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-40"
                                title="Logoutkan semua siswa yang tampil"
                              >
                                <LogOut size={12} />
                                <span>Logout Semua</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={handleAdminForceLogoutAll}
                                  disabled={loggingOutStudentId === 'ALL'}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold cursor-pointer disabled:opacity-50"
                                >
                                  {loggingOutStudentId === 'ALL' ? 'Memproses...' : `Ya (${filteredOnlineUsers.length})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsConfirmLogoutAllOnline(false)}
                                  className="px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            )}
                          </div>

                          {adminOnlineActionFeedback && (
                            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 text-[11px] font-bold flex items-center gap-1.5">
                              <CheckCircle size={12} className="shrink-0" />
                              <span>{adminOnlineActionFeedback}</span>
                            </div>
                          )}

                          {onlineDistinctClasses.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                              <button
                                type="button"
                                onClick={() => setOnlineClassFilter('all')}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors tabular-nums",
                                  onlineClassFilter === 'all'
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                )}
                              >
                                Semua ({onlineUsersList.length})
                              </button>
                              {onlineDistinctClasses.map((cls) => {
                                const clsCount = onlineUsersList.filter(u => (u.kelas || '').trim() === cls).length;
                                return (
                                  <button
                                    key={cls}
                                    type="button"
                                    onClick={() => setOnlineClassFilter(cls)}
                                    className={cn(
                                      "px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors tabular-nums",
                                      onlineClassFilter === cls
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    )}
                                  >
                                    {cls} ({clsCount})
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Online Users List */}
                      <div className="p-5 space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar flex-1">
                        {filteredOnlineUsers.length > 0 ? (
                          filteredOnlineUsers.map((u) => {
                            const targetId = u.studentId || u.id;
                            const initials = (u.studentName || 'S')
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase();
                            const loginTimeMs = u.loginAt?.toMillis
                              ? u.loginAt.toMillis()
                              : u.loginAt?.seconds
                              ? u.loginAt.seconds * 1000
                              : null;
                            const loginClock = loginTimeMs
                              ? new Date(loginTimeMs).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : null;
                            const isLoggingOut = loggingOutStudentId === targetId || loggingOutStudentId === 'ALL';
                            const isForcingDashboard = forcingDashboardStudentId === targetId || forcingDashboardStudentId === 'ALL';

                            return (
                              <div
                                key={u.id}
                                className="admin-glass-card hover:border-emerald-400/60 dark:hover:border-emerald-500/50 p-3.5 rounded-2xl transition-colors duration-200 flex flex-col gap-2.5"
                              >
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="relative shrink-0">
                                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                                        {initials}
                                      </div>
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="font-extrabold text-slate-900 dark:text-slate-100 text-xs truncate"
                                        title={u.studentName}
                                      >
                                        {u.studentName || 'Siswa'}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                        <span>Kelas {u.kelas || '-'}</span>
                                        {u.nis && (
                                          <>
                                            <span>·</span>
                                            <span className="font-mono">{u.nis}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      disabled={isForcingDashboard || isLoggingOut}
                                      onClick={() => handleAdminForceToDashboardStudent(u)}
                                      className="px-2 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                                      title={`Arahkan ${u.studentName} kembali ke Dashboard Siswa (keluar dari game/materi/soal)`}
                                    >
                                      <Home size={12} />
                                      <span className="hidden sm:inline">{isForcingDashboard ? 'Proses...' : 'Dashboard'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isLoggingOut || isForcingDashboard}
                                      onClick={() => handleAdminForceLogoutStudent(u)}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white border border-rose-200 dark:border-rose-800 text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                                      title={`Keluarkan / logoutkan ${u.studentName} dari sistem`}
                                    >
                                      <LogOut size={12} />
                                      <span>{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                                  <span
                                    className="truncate font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700 max-w-[70%]"
                                    title={u.currentActivity || 'Dashboard Siswa'}
                                  >
                                    {u.currentActivity || 'Dashboard Siswa'}
                                  </span>
                                  {loginClock && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                                      <Clock size={10} />
                                      {loginClock}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-100 dark:border-emerald-800/60 shadow-inner">
                              <UserCheck size={34} />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                              {onlineUsersList.length > 0 ? 'Siswa Tidak Ditemukan' : 'Belum Ada User Online'}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                              {onlineUsersList.length > 0
                                ? 'Coba ubah kata kunci pencarian atau filter kelas di atas.'
                                : 'Siswa yang sedang login akan muncul di sini secara real-time dan dapat di-logout oleh admin.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: MONITORING KECURANGAN */}
                    <div className="xl:col-span-4 admin-glass-card rounded-3xl overflow-hidden flex flex-col">
                      {/* Vibrant Red Gradient Header */}
                      <div className="bg-gradient-to-r from-rose-600/85 via-red-600/80 to-orange-500/85 border-b border-white/25 p-5 text-white flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0">
                            <ShieldAlert size={22} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white truncate">Monitoring Kecurangan</h3>
                            </div>
                            <p className="text-white/85 text-[11px] font-medium mt-0.5 truncate">Deteksi keluar layar penuh &amp; tab ujian</p>
                          </div>
                        </div>

                        {cheatingSessionsList.length > 0 && (
                          <button
                            onClick={async () => {
                              if (!confirm("Bersihkan semua log kecurangan?")) return;
                              for (const session of cheatingSessionsList) {
                                try {
                                  await updateDoc(doc(db, 'active_sessions', session.id), {
                                    cheatingAttempts: 0,
                                    cheatingDetails: []
                                  });
                                } catch (err) {}
                              }
                            }}
                            className="px-3.5 py-2 bg-white/20 hover:bg-white text-white hover:text-rose-600 rounded-xl font-extrabold text-xs transition-colors duration-200 flex items-center gap-1.5 border border-white/30 shadow-xs active:scale-95"
                          >
                            <Trash2 size={13} />
                            <span>Bersihkan Semua</span>
                          </button>
                        )}
                      </div>

                      {/* Monitoring Body */}
                      <div className="p-6 space-y-4 max-h-[580px] overflow-y-auto custom-scrollbar flex-1">
                        {cheatingSessionsList.length > 0 ? (
                          cheatingSessionsList.map(session => (
                            <div 
                              key={session.id} 
                              className="p-4 bg-rose-50/70 dark:bg-rose-950/35 border border-rose-200/80 dark:border-rose-800/60 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-rose-950 dark:text-rose-200 text-sm">{session.studentName}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800">
                                      Kelas {session.kelas}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-0.5 flex items-center gap-1">
                                    <BookOpen size={12} className="text-rose-500" />
                                    {session.courseTitle || 'Materi'}
                                  </p>
                                </div>

                                <div className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shrink-0 shadow-xs shadow-rose-500/20 tabular-nums">
                                  <AlertTriangle size={12} />
                                  {session.cheatingAttempts}x Pelanggaran
                                </div>
                              </div>

                              {/* Details breakdown */}
                              {session.cheatingDetails && session.cheatingDetails.length > 0 && (
                                <div className="bg-white/90 dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-800/60 rounded-xl p-3 space-y-1 text-xs">
                                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">Rincian Log Waktu:</p>
                                  <ul className="text-xs text-rose-900 dark:text-rose-200 font-medium space-y-1">
                                    {session.cheatingDetails.map((detail: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-rose-500 font-black">•</span>
                                        <span>{parseCheatingDetail(detail)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, 'active_sessions', session.id), {
                                        cheatingAttempts: 0,
                                        cheatingDetails: []
                                      });
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.UPDATE, 'active_sessions');
                                    }
                                  }}
                                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 text-rose-600 dark:text-rose-300 bg-white dark:bg-slate-900 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800 rounded-xl transition-all duration-300 font-bold active:scale-95 shadow-xs"
                                >
                                  <Trash2 size={13} />
                                  Hapus Log Siswa
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-inner">
                              <ShieldCheck size={34} />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Ruang Ujian Aman & Tertib</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                              Tidak ada aktivitas mencurigakan atau upaya keluar dari layar penuh yang terdeteksi pada siswa saat ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTION: STATUS AKTIVASI MATERI (MODERN COLORFUL SWITCHBOARD) */}
                  <div className="admin-glass-card p-6 md:p-8 rounded-3xl transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Status Aktivasi & Keamanan Materi</h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-0.5">Buka akses materi dan aktifkan proteksi mode layar penuh untuk ujian</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70 tabular-nums">
                          TA {activeTahunPelajaran} · Sem {activeSemester}
                        </span>
                        <span className="px-4 py-2 rounded-xl text-xs font-extrabold tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 tabular-nums">
                          {activeCourseCount} Dari {COURSES.length} Materi Terbuka
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {COURSES.map((course, index) => {
                        const isActive = isCourseActive(course.id);
                        const isFullScreen = materialConfigs[course.id]?.isFullScreen || false;
                        const isScoreVisible = materialConfigs[course.id]?.isScoreVisible ?? true;

                        const courseColors = [
                          { bg: "hover:border-blue-300 dark:hover:border-blue-600", banner: "from-blue-600 to-indigo-600", tag: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60", icon: "text-brand dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60" },
                          { bg: "hover:border-emerald-300 dark:hover:border-emerald-600", banner: "from-emerald-600 to-teal-600", tag: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60" },
                          { bg: "hover:border-purple-300 dark:hover:border-purple-600", banner: "from-purple-600 to-violet-600", tag: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60", icon: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60" },
                          { bg: "hover:border-rose-300 dark:hover:border-rose-600", banner: "from-rose-600 to-pink-600", tag: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60", icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/60" },
                          { bg: "hover:border-amber-300 dark:hover:border-amber-600", banner: "from-amber-500 to-yellow-600", tag: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60", icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60" },
                          { bg: "hover:border-indigo-300 dark:hover:border-indigo-600", banner: "from-indigo-600 to-blue-700", tag: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60", icon: "text-brand dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60" },
                          { bg: "hover:border-cyan-300 dark:hover:border-cyan-600", banner: "from-cyan-600 to-blue-600", tag: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60", icon: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800/60" },
                          { bg: "hover:border-orange-300 dark:hover:border-orange-600", banner: "from-orange-600 to-red-600", tag: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60", icon: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-800/60" }
                        ];
                        const theme = courseColors[index % courseColors.length];

                        return (
                          <div 
                            key={course.id} 
                            className={cn(
                              "admin-glass-card rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors duration-200",
                              theme.bg
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs", theme.icon)}>
                                  <BookOpen size={20} />
                                </div>
                                <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border", theme.tag)}>
                                  {course.level}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2" title={course.title}>
                                {course.title}
                              </h4>
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                                {course.topics.length} Topik Pembelajaran
                              </p>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                              {/* Toggle 1: Akses Materi */}
                              <div className="flex items-center justify-between bg-white/30 dark:bg-white/5 p-2.5 rounded-xl border border-white/50 dark:border-white/12 shadow-2xs">
                                <div>
                                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">Akses Siswa</span>
                                  <span className={cn("text-xs font-bold", isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")}>
                                    {isActive ? "✓ Terbuka" : "✕ Terkunci"}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => toggleMaterialActive(course.id)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    isActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
                                  )}
                                >
                                  <span 
                                    className={cn(
                                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
                                      isActive ? "translate-x-5" : "translate-x-0"
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Toggle 2: Wajib Fullscreen */}
                              <div className="flex items-center justify-between bg-white/30 dark:bg-white/5 p-2.5 rounded-xl border border-white/50 dark:border-white/12 shadow-2xs">
                                <div>
                                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">Mode Ujian</span>
                                  <span className={cn("text-xs font-bold", isFullScreen ? "text-brand dark:text-blue-400" : "text-slate-400 dark:text-slate-500")}>
                                    {isFullScreen ? "🔒 Fullscreen" : "🔓 Bebas"}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => toggleMaterialFullScreen(course.id)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    isFullScreen ? "bg-brand" : "bg-slate-300 dark:bg-slate-600"
                                  )}
                                >
                                  <span 
                                    className={cn(
                                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
                                      isFullScreen ? "translate-x-5" : "translate-x-0"
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Toggle 3: Poin Nilai */}
                              <div className="flex items-center justify-between bg-white/30 dark:bg-white/5 p-2.5 rounded-xl border border-white/50 dark:border-white/12 shadow-2xs">
                                <div>
                                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">Poin Nilai</span>
                                  <span className={cn("text-xs font-bold", isScoreVisible ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")}>
                                    {isScoreVisible ? "👁️ Terlihat" : "👁️‍🗨️ Tersembunyi"}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => toggleMaterialScoreVisibility(course.id)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    isScoreVisible ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
                                  )}
                                  title={isScoreVisible ? "Poin nilai terlihat saat pembelajaran & kuis" : "Poin nilai disembunyikan saat pembelajaran & kuis"}
                                >
                                  <span 
                                    className={cn(
                                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                      isScoreVisible ? "translate-x-5" : "translate-x-0"
                                    )}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
            {adminTab === 'student_management' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex bg-white/30 dark:bg-white/5 p-1.5 rounded-2xl border border-white/50 dark:border-white/12 shadow-xs w-fit">
                    <button
                      onClick={() => setStudentSubTab('classes')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2",
                        studentSubTab === 'classes' ? "bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/20" : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <LayoutGrid size={18} />
                      Daftar Kelas
                    </button>
                    <button
                      onClick={() => setStudentSubTab('students')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2",
                        studentSubTab === 'students' ? "bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/20" : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Users size={18} />
                      Daftar Siswa
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 text-xs font-extrabold text-brand dark:text-blue-300 tabular-nums">
                      <CalendarDays size={14} />
                      Tahun Pelajaran Aktif: {activeTahunPelajaran} ({scopedStudents.length} Siswa)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const available = tahunPelajaranList.filter(yr => yr !== activeTahunPelajaran);
                        if (available.length > 0 && (copySourceTahunPelajaran === activeTahunPelajaran || !available.includes(copySourceTahunPelajaran))) {
                          setCopySourceTahunPelajaran(available[0]);
                        }
                        setCopyStudentsNotice(null);
                        setIsCopyStudentsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Copy size={14} />
                      Salin dari TA Lain
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      Tambah Siswa
                    </button>
                  </div>
                </div>

                {copyStudentsNotice && (
                  <div className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between gap-2",
                    copyStudentsNotice.type === 'success'
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  )}>
                    <span>{copyStudentsNotice.message}</span>
                    <button type="button" onClick={() => setCopyStudentsNotice(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {isCopyStudentsModalOpen && (
                  <div className="admin-glass-card rounded-2xl p-5 border border-blue-200/80 dark:border-blue-800/60 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Copy size={16} className="text-brand dark:text-blue-400" />
                          Salin Data Siswa & Kelas ke TA {activeTahunPelajaran}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Menyalin seluruh siswa dan kelas dari tahun pelajaran sumber tanpa menghapus data asli dan menghindari duplikasi NISN.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCopyStudentsModalOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1 space-y-1.5">
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Tahun Pelajaran Sumber
                        </label>
                        <select
                          value={copySourceTahunPelajaran}
                          onChange={(e) => setCopySourceTahunPelajaran(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100"
                        >
                          {tahunPelajaranList.filter(yr => yr !== activeTahunPelajaran).map(yr => {
                            const count = students.filter(s => (s.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === yr).length;
                            return (
                              <option key={yr} value={yr}>
                                TA {yr} ({count} siswa)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCopyStudentsModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Tutup
                        </button>
                        <button
                          type="button"
                          disabled={isCopyingStudents}
                          onClick={handleCopyStudentsFromYear}
                          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy size={14} />
                          {isCopyingStudents ? 'Menyalin...' : `Salin ke TA ${activeTahunPelajaran}`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {studentSubTab === 'classes' && (
                  Object.keys(groupedClasses).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {Object.entries(groupedClasses).sort((a, b) => a[0].localeCompare(b[0])).map(([className, studentCount], idx) => {
                      const colors = [
                        { bg: "bg-blue-500/10 dark:bg-blue-950/30", border: "border-white/55 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-400", icon: "bg-blue-500/15 dark:bg-blue-900/50", hover: "hover:border-blue-300 dark:hover:border-blue-600" },
                        { bg: "bg-purple-500/10 dark:bg-purple-950/30", border: "border-white/55 dark:border-purple-800/50", text: "text-purple-700 dark:text-purple-400", icon: "bg-purple-500/15 dark:bg-purple-900/50", hover: "hover:border-purple-300 dark:hover:border-purple-600" },
                        { bg: "bg-emerald-500/10 dark:bg-emerald-950/30", border: "border-white/55 dark:border-emerald-800/50", text: "text-emerald-700 dark:text-emerald-400", icon: "bg-emerald-500/15 dark:bg-emerald-900/50", hover: "hover:border-emerald-300 dark:hover:border-emerald-600" },
                        { bg: "bg-amber-500/10 dark:bg-amber-950/30", border: "border-white/55 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-400", icon: "bg-amber-500/15 dark:bg-amber-900/50", hover: "hover:border-amber-300 dark:hover:border-amber-600" },
                        { bg: "bg-rose-500/10 dark:bg-rose-950/30", border: "border-white/55 dark:border-rose-800/50", text: "text-rose-700 dark:text-rose-400", icon: "bg-rose-500/15 dark:bg-rose-900/50", hover: "hover:border-rose-300 dark:hover:border-rose-600" },
                        { bg: "bg-indigo-500/10 dark:bg-indigo-950/30", border: "border-white/55 dark:border-indigo-800/50", text: "text-indigo-700 dark:text-indigo-400", icon: "bg-indigo-500/15 dark:bg-indigo-900/50", hover: "hover:border-indigo-300 dark:hover:border-indigo-600" },
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <motion.button 
                          whileHover={{ y: -4 }}
                          key={className}
                          className={cn(
                            "admin-glass-card p-6 rounded-2xl border transition-all duration-300 text-left flex flex-col gap-4 group relative overflow-hidden hover:shadow-md",
                            color.bg, color.border, color.hover
                          )}
                          onClick={() => {
                            setStudentSubTab('students');
                            setStudentSearchQuery(className);
                          }}
                        >
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs", color.icon, color.text)}>
                            <Users size={28} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Kelas {className}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("w-2 h-2 rounded-full", color.text.replace('text', 'bg'))}></span>
                              <p className={cn("font-bold text-sm tabular-nums", color.text)}>{studentCount} Siswa Terdaftar</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-brand dark:group-hover:text-blue-400 transition-colors duration-300">
                            Lihat Detail <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity dark:text-white">
                            <Users size={120} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  ) : (
                    <div className="admin-glass-card rounded-3xl border-2 border-dashed p-12 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Users size={30} />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Belum Ada Siswa & Kelas di Tahun Pelajaran {activeTahunPelajaran}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                        Data siswa dari tahun pelajaran sebelumnya tetap tersimpan aman. Tambahkan siswa baru, impor Excel, atau salin dari tahun pelajaran lain.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const available = tahunPelajaranList.filter(yr => yr !== activeTahunPelajaran);
                            if (available.length > 0 && (copySourceTahunPelajaran === activeTahunPelajaran || !available.includes(copySourceTahunPelajaran))) {
                              setCopySourceTahunPelajaran(available[0]);
                            }
                            setCopyStudentsNotice(null);
                            setIsCopyStudentsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <Copy size={15} />
                          Salin dari TA Lain
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsImportModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <Plus size={15} />
                          Tambah / Impor Siswa
                        </button>
                      </div>
                    </div>
                  )
                )}

                {studentSubTab === 'students' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Cari NISN, Nama, atau Kelas..." 
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-sm shadow-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedStudentIds.length > 0 && (
                          <button 
                            onClick={deleteSelectedStudents}
                            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm border border-rose-200/80 dark:border-rose-800/70 shadow-xs"
                          >
                            <Trash2 size={18} />
                            Hapus ({selectedStudentIds.length})
                          </button>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm shadow-md shadow-brand/20 hover:-translate-y-0.5">
                          <Plus size={18} />
                          Impor dari Excel
                          <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={handleExcelUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl admin-glass-card mb-4">
                      <div className="min-w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-white/25 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-widest font-extrabold">
                            <th className="px-6 py-4 w-10">
                              <input 
                                type="checkbox" 
                                checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                onChange={toggleSelectAll}
                                className="rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand cursor-pointer w-4 h-4"
                              />
                            </th>
                            <th className="px-6 py-4">№</th>
                            <th className="px-6 py-4">NISN</th>
                            <th className="px-6 py-4">Identitas Siswa</th>
                            <th className="px-6 py-4">Bio</th>
                            <th className="px-6 py-4">Kelas</th>
                            <th className="px-6 py-4 text-right">Manajemen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sortedFilteredStudents.length > 0 ? sortedFilteredStudents.map((s, index) => (
                            <tr key={s.id} className={cn(
                              "hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors duration-200 group",
                              selectedStudentIds.includes(s.id) && "bg-brand/[0.03] dark:bg-blue-950/30"
                            )}>
                              <td className="px-6 py-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedStudentIds.includes(s.id)}
                                  onChange={() => toggleSelectStudent(s.id)}
                                  className="rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand cursor-pointer w-4 h-4"
                                />
                              </td>
                              <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs tabular-nums">{index + 1}</td>
                              {editingStudentId === s.id ? (
                                <>
                                  <td className="p-2"><input value={editFormData.nis} onChange={e => setEditFormData({...editFormData, nis: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-sm font-mono" /></td>
                                  <td className="p-2"><input value={editFormData.nama} onChange={e => setEditFormData({...editFormData, nama: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-sm font-bold" /></td>
                                  <td className="p-2">
                                    <select value={editFormData.jenisKelamin} onChange={e => setEditFormData({...editFormData, jenisKelamin: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-sm">
                                      <option value="L">Laki-laki (L)</option>
                                      <option value="P">Perempuan (P)</option>
                                    </select>
                                  </td>
                                  <td className="p-2"><input value={editFormData.kelas} onChange={e => setEditFormData({...editFormData, kelas: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-sm uppercase" /></td>
                                  <td className="p-2 text-right whitespace-nowrap">
                                    <button onClick={saveEditStudent} className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all">Simpan</button>
                                    <button onClick={() => setEditingStudentId(null)} className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all ml-2">Batal</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-sm tracking-tight tabular-nums">{s.nis}</td>
                                  <td className="px-6 py-4">
                                    <button 
                                      onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                      className="text-left group/name"
                                    >
                                      <div className={cn("font-extrabold text-sm transition-colors", s.jenisKelamin === 'P' ? 'text-rose-600 dark:text-rose-400 group-hover/name:text-rose-700 dark:group-hover/name:text-rose-300' : 'text-slate-900 dark:text-slate-100 group-hover/name:text-brand dark:group-hover/name:text-blue-400')}>
                                        {s.nama}
                                      </div>
                                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", s.jenisKelamin === 'L' ? 'bg-blue-400' : 'bg-rose-400')}></div>
                                        {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                      </div>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider", 
                                      s.jenisKelamin === 'L' ? 'bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 border border-blue-100 dark:border-blue-800/60' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/60'
                                    )}>
                                      {s.jenisKelamin}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold border border-slate-200/80 dark:border-slate-700">
                                        {s.kelas.substring(0, 2)}
                                      </div>
                                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm tracking-tight">{s.kelas}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-x-2 group-hover:translate-x-0">
                                      <button 
                                        onClick={() => startEditStudent(s)} 
                                        className="p-2 text-slate-400 hover:text-brand dark:hover:text-blue-400 hover:bg-brand/10 dark:hover:bg-blue-950/50 rounded-xl transition-all"
                                        title="Edit Siswa"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => deleteStudent(s.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                                        title="Hapus Siswa"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                        className="p-2 text-slate-400 hover:text-brand dark:hover:text-blue-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all"
                                        title="Lihat Profil"
                                      >
                                        <User size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center gap-4">
                                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <Users size={40} />
                                  </div>
                                  <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">Tidak ada siswa yang ditemukan</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">Coba kata kunci pencarian lain atau impor data baru.</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Responsive Card View (All Data Visible Without Horizontal Scroll) */}
                  <div className="md:hidden space-y-2.5 mb-6">
                    <div className="admin-glass-card rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                      <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand w-4 h-4"
                        />
                        <span>Pilih Semua</span>
                      </label>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {sortedFilteredStudents.length} Siswa
                      </span>
                    </div>

                    {sortedFilteredStudents.length > 0 ? sortedFilteredStudents.map((s, index) => (
                      <div
                        key={s.id}
                        className={cn(
                          "admin-glass-card rounded-2xl p-3.5 space-y-2.5",
                          selectedStudentIds.includes(s.id) && "ring-2 ring-brand/30 border-brand/50"
                        )}
                      >
                        {editingStudentId === s.id ? (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">NISN</label>
                                <input
                                  value={editFormData.nis}
                                  onChange={e => setEditFormData({...editFormData, nis: e.target.value})}
                                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Kelas</label>
                                <input
                                  value={editFormData.kelas}
                                  onChange={e => setEditFormData({...editFormData, kelas: e.target.value})}
                                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-xs uppercase font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nama Lengkap</label>
                              <input
                                value={editFormData.nama}
                                onChange={e => setEditFormData({...editFormData, nama: e.target.value})}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Jenis Kelamin</label>
                              <select
                                value={editFormData.jenisKelamin}
                                onChange={e => setEditFormData({...editFormData, jenisKelamin: e.target.value})}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2 rounded-lg w-full outline-brand text-xs"
                              >
                                <option value="L">Laki-laki (L)</option>
                                <option value="P">Perempuan (P)</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                Batal
                              </button>
                              <button
                                onClick={saveEditStudent}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(s.id)}
                                  onChange={() => toggleSelectStudent(s.id)}
                                  className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand w-4 h-4 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                                    <span>#{index + 1}</span>
                                    <span>·</span>
                                    <span>NISN {s.nis || '-'}</span>
                                  </div>
                                  <button
                                    onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                    className="text-left block w-full"
                                  >
                                    <h4 className={cn(
                                      "font-extrabold text-sm leading-snug break-words",
                                      s.jenisKelamin === 'P' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                                    )}>
                                      {s.nama}
                                    </h4>
                                  </button>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-extrabold text-slate-800 dark:text-slate-200 shrink-0">
                                {s.kelas}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className={cn(
                                "text-[11px] font-bold px-2.5 py-0.5 rounded-lg border",
                                s.jenisKelamin === 'L' ? "bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 border-blue-100 dark:border-blue-800/60" : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-800/60"
                              )}>
                                {s.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditStudent(s)}
                                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-brand/10 text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-blue-400 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                                >
                                  <Edit2 size={12} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                  className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800/60"
                                >
                                  <User size={12} />
                                  Profil
                                </button>
                                <button
                                  onClick={() => deleteStudent(s.id)}
                                  className="p-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-800/60"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )) : (
                      <div className="admin-glass-card rounded-2xl border-dashed p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                        Tidak ada siswa yang ditemukan.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
            
            {/* Student Detail Popup */}
            <AnimatePresence>
              {studentDetail && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                    onClick={() => setStudentDetail(null)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative z-10 border border-slate-200/80 dark:border-slate-800"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className={cn(
                      "h-32 relative",
                      studentDetail.student.jenisKelamin === 'P' ? "bg-gradient-to-br from-rose-500 to-pink-600" : "bg-gradient-to-br from-blue-600 to-indigo-700"
                    )}>
                      <div className="absolute -bottom-12 left-8 p-1.5 bg-white dark:bg-slate-900 rounded-3xl shadow-lg">
                        <div className={cn(
                          "w-24 h-24 rounded-2xl flex items-center justify-center text-white font-black text-4xl",
                          studentDetail.student.jenisKelamin === 'P' ? "bg-rose-500" : "bg-blue-600"
                        )}>
                          {studentDetail.student.nama.charAt(0)}
                        </div>
                      </div>
                      <button 
                        onClick={() => setStudentDetail(null)}
                        className="absolute top-4 right-4 p-2 bg-black/15 hover:bg-black/25 rounded-full text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="px-8 pt-16 pb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{studentDetail.student.nama}</h2>
                          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm tracking-tight tabular-nums">{studentDetail.student.nis} • Kelas {studentDetail.student.student_management?.kelas || studentDetail.student.kelas}</p>
                        </div>
                        <div className="bg-brand/10 dark:bg-blue-900/30 border border-brand/20 dark:border-blue-800/60 px-4 py-2 rounded-2xl text-center">
                          <p className="text-[10px] font-extrabold text-brand dark:text-blue-400 uppercase tracking-widest leading-none mb-1">Total Nilai</p>
                          <p className="text-2xl font-black text-brand dark:text-blue-400 leading-none tabular-nums">{studentDetail.score}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Materi & Skor ({activeTahunPelajaran} · Sem {activeSemester})</p>
                        <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar">
                          {scopedAssessments.filter(a => a.studentId === studentDetail.student.id).length > 0 ? (
                            scopedAssessments.filter(a => a.studentId === studentDetail.student.id).map((a, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                <div className="min-w-0 flex-1 mr-3">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">{a.courseTitle}</span>
                                  {a.completedAt && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                                      {new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(a.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-xs font-extrabold px-2.5 py-1 rounded-lg tabular-nums",
                                    a.score >= 80 ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70" : a.score >= 60 ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70" : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/70"
                                  )}>{a.score}</span>
                                  <button
                                    onClick={() => deleteAssessment({
                                      id: a.id,
                                      studentName: studentDetail.student.nama,
                                      courseTitle: a.courseTitle,
                                      score: a.score,
                                      kelas: studentDetail.student.kelas
                                    })}
                                    className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-lg transition-all"
                                    title="Hapus Nilai Asesmen Siswa Ini"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 italic">Belum ada materi yang diselesaikan.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Jenis Kelamin</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{studentDetail.student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status Akun</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">Aktif</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button className="w-full bg-gradient-to-r from-brand to-blue-600 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-md shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                          <History size={18} /> Lihat Log Aktivitas
                        </button>
                        <button 
                          onClick={() => setStudentDetail(null)} 
                          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-2xl font-bold text-sm transition-all"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            
            {adminTab === 'materials' && (
              <>
                <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {materialSubTab === 'analisis_soal' ? 'Analisis Soal' : 'Ruang Informatika'}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 text-xs font-extrabold text-brand dark:text-blue-300 tabular-nums">
                        <CalendarDays size={13} />
                        TA {activeTahunPelajaran} · Sem {activeSemester}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {materialSubTab === 'analisis_soal'
                        ? 'Unggah dokumen soal untuk menyusun kisi-kisi, materi, pembahasan rinci, dan latihan soal serupa pada semester aktif.'
                        : 'Terbitkan materi untuk Tahun Pelajaran & Semester aktif agar dapat diakses oleh siswa.'}
                    </p>
                  </div>

                  {/* Navigasi Sub-Halaman di Kelola Materi */}
                  <div className="inline-flex items-center gap-1.5 p-1.5 bg-white/30 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/12 w-fit shrink-0">
                    <button
                      type="button"
                      onClick={() => setMaterialSubTab('list')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2",
                        materialSubTab === 'list'
                          ? "bg-brand text-white shadow-md shadow-brand/20"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <GraduationCap size={15} />
                      Daftar Materi
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaterialSubTab('analisis_soal')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2",
                        materialSubTab === 'analisis_soal'
                          ? "bg-brand text-white shadow-md shadow-brand/20"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Sparkles size={15} />
                      Analisis Soal
                    </button>
                  </div>
                </div>

                {materialSubTab === 'analisis_soal' ? (
                  <AdminQuestionAnalysis
                    scopeKey={`${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}`}
                    logoUrl={settingsConfig?.logoUrl || '/images/labkom_nesaka_logo.jpg'}
                    suppressPrintPortal={Boolean(printingMaterialCourseId)}
                    onHasPrintableResultChange={setHasPrintableQuestionAnalysis}
                  />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {COURSES.map((course, index) => {
                    const isActive = isCourseActive(course.id);
                    const colorVariants = [
                      { bg: "bg-blue-500/10 dark:bg-blue-950/30 border-white/55 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700", text: "text-blue-950 dark:text-blue-100", badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200" },
                      { bg: "bg-emerald-500/10 dark:bg-emerald-950/30 border-white/55 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700", text: "text-emerald-950 dark:text-emerald-100", badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200" },
                      { bg: "bg-purple-500/10 dark:bg-purple-950/30 border-white/55 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700", text: "text-purple-950 dark:text-purple-100", badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200" },
                    ];
                    const variant = colorVariants[index % colorVariants.length];
                        const courseConfig = materialConfigs[course.id];
                        const topicSeconds = courseConfig?.topicTimers ? Object.values(courseConfig.topicTimers as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
                        const quizSeconds = courseConfig?.quizTimers ? Object.values(courseConfig.quizTimers as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
                        const availSeconds = courseConfig?.quizAvailableAt ? Object.values(courseConfig.quizAvailableAt as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
                        const totalLimit = courseConfig?.totalCourseTimer ?? 0;
                        const tM = Math.floor(topicSeconds / 60);
                        const tS = topicSeconds % 60;
                        const qM = Math.floor(quizSeconds / 60);
                        const qS = quizSeconds % 60;
                             return (
                      <div 
                        key={course.id} 
                        className={cn("admin-glass-card p-6 border rounded-2xl hover:shadow-md transition-all duration-300 flex flex-col", variant.bg)}
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <h3 className={cn("font-extrabold text-xl leading-tight", variant.text)}>{course.title}</h3>
                          <div className={cn("p-2 rounded-xl shrink-0 shadow-xs", isActive ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                            {isActive ? <CheckCircle size={20} /> : <X size={20} />}
                          </div>
                      </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 flex-1">{course.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 mb-6 bg-white/25 dark:bg-white/5 border border-white/45 dark:border-white/12 p-2.5 rounded-xl tabular-nums">
                          <span>{tM}m {tS}s materi</span>
                          <span>{qM}m {qS}s kuis</span>
                          <span>{availSeconds}s kuis ready</span>
                          {totalLimit > 0 && <span>{totalLimit}s total</span>}
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200/70 dark:border-slate-800/80 mt-auto flex-wrap">
                          <span className={cn("text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest", isActive ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            {isActive ? 'Terbit' : 'Draft'}
                          </span>
                          <div className="flex-1"></div>
                          <button 
                            onClick={() => toggleMaterialActive(course.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-xs active:scale-95",
                              isActive ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/50" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button 
                            onClick={() => setEditingMaterialConfigId(course.id)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 shadow-xs active:scale-95 flex items-center gap-1.5"
                          >
                            <Settings size={14} />
                            Setelan
                          </button>
                          <button 
                            onClick={() => setPrintingMaterialCourseId(course.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all duration-300 shadow-xs active:scale-95 flex items-center gap-1.5"
                          >
                            <Printer size={14} />
                            Cetak
                          </button>
                          <button 
                            onClick={() => { setActiveCourseId(course.id); setCurrentPage('course'); }}
                            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition-all duration-300 shadow-xs active:scale-95 flex items-center gap-1.5"
                          >
                            <Eye size={14} />
                            Pratinjau
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </>
            )}
            {adminTab === 'assessments' && (() => {
              const activeGroupMap =
                assessmentCategory === 'materi'
                  ? groupedAssessments
                  : assessmentCategory === 'game'
                  ? groupedGameScores
                  : groupedSoalAssessments;
              const groupList = Object.values(activeGroupMap).sort((a, b) =>
                a.title.localeCompare(b.title, 'id-ID')
              );
              const selectedGroup = assessmentNav.course ? activeGroupMap[assessmentNav.course] : null;
              const selectedClassData =
                selectedGroup && assessmentNav.kelas ? selectedGroup.classes[assessmentNav.kelas] : null;

              const isMateri = assessmentCategory === 'materi';
              const isGame = assessmentCategory === 'game';
              const isSoal = assessmentCategory === 'soal';

              const categoryAccentBtn = isMateri
                ? 'bg-brand text-white shadow-md shadow-brand/20'
                : isGame
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-amber-600 text-white shadow-md shadow-amber-600/20';

              const categoryBadge = isMateri
                ? 'bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 border-brand/20'
                : isGame
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';

              const renderScoreCsvExport = (title: string, kelas: string, rowsData: any[]) => {
                const headers = isGame
                  ? ['No', 'Nama Siswa', 'Kelas', 'Game & Stage', 'Skor Tertinggi', 'Waktu']
                  : ['No', 'NISN', 'Nama Siswa', 'Kelas', isSoal ? 'Paket Soal' : 'Materi', 'Nilai', 'Waktu Selesai'];
                const csvRows = rowsData.map((r, i) => {
                  if (isGame) {
                    return [
                      i + 1,
                      r.studentName || 'Siswa',
                      r.kelas || r.studentKelas || kelas,
                      r.gameTitle || r.gameId || title,
                      Number(r.score ?? 0),
                      formatScoreTimestamp(r),
                    ];
                  }
                  const stu = scopedStudents.find(s => s.id === r.studentId || s.nis === r.studentNis);
                  return [
                    i + 1,
                    stu?.nis || r.studentNis || '-',
                    r.studentName || stu?.nama || 'Siswa',
                    r.studentKelas || kelas,
                    r.courseTitle || title,
                    Number(r.score ?? 0),
                    r.completedAt ? new Date(r.completedAt).toLocaleString('id-ID') : '-',
                  ];
                });
                const esc = (v: string | number) => {
                  const s = String(v ?? '');
                  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const content = [headers.map(esc).join(','), ...csvRows.map(r => r.map(esc).join(','))].join('\n');
                const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Hasil_${assessmentCategory}_${slugifyTermPart(title)}_${slugifyTermPart(kelas)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              };

              return (
                <div className="space-y-6">
                  {/* Top Bar: 3 Kategori Asesmen & Tahun Pelajaran */}
                  <div className="admin-glass-card rounded-3xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentCategory('materi');
                          setAssessmentNav({ course: null, kelas: null });
                          setAssessmentSearch('');
                          setShowIncompleteInAssessment(false);
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
                          isMateri ? categoryAccentBtn : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <BookOpen size={15} />
                        <span>Hasil Nilai Materi</span>
                        <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums", isMateri ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200")}>
                          {scopedMateriAssessments.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentCategory('soal');
                          setAssessmentNav({ course: null, kelas: null });
                          setAssessmentSearch('');
                          setShowIncompleteInAssessment(false);
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
                          isSoal ? categoryAccentBtn : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <ClipboardList size={15} />
                        <span>Hasil Nilai Soal / Ujian</span>
                        <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums", isSoal ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200")}>
                          {scopedSoalAssessments.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentCategory('game');
                          setAssessmentNav({ course: null, kelas: null });
                          setAssessmentSearch('');
                          setShowIncompleteInAssessment(false);
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
                          isGame ? categoryAccentBtn : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <Gamepad2 size={15} />
                        <span>Hasil Skor Game</span>
                        <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums", isGame ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200")}>
                          {bestAdminGameScores.length}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 text-xs font-extrabold text-brand dark:text-blue-300 tabular-nums">
                        <CalendarDays size={13} />
                        TA {activeTahunPelajaran} · Sem {activeSemester}
                      </span>
                    </div>
                  </div>

                  {/* Success Banner after Importing to Kelola Administrasi -> Nilai */}
                  {assessmentBannerNotice && (
                    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle size={18} />
                        </div>
                        <p className="text-xs md:text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          {assessmentBannerNotice.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setAdministrasiNavRequest({
                              subTab: 'nilai',
                              nilaiSubTab: assessmentBannerNotice.targetSubTab,
                              kelas: assessmentBannerNotice.targetKelas,
                              nonce: Date.now(),
                            });
                            setAdminTab('administrasi');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Buka Halaman Nilai</span>
                          <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssessmentBannerNotice(null)}
                          className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Breadcrumb Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentNav({ course: null, kelas: null });
                          setAssessmentSearch('');
                          setShowIncompleteInAssessment(false);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer",
                          assessmentNav.course
                            ? "bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand"
                            : "bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 border border-brand/20"
                        )}
                      >
                        {isMateri ? <BookOpen size={14} /> : isGame ? <Gamepad2 size={14} /> : <ClipboardList size={14} />}
                        <span>
                          {isMateri ? 'Semua Modul Materi' : isGame ? 'Semua Game Edukasi' : 'Semua Paket Soal / Ujian'}
                        </span>
                      </button>

                      {assessmentNav.course && (
                        <>
                          <ChevronRight size={15} className="text-slate-400" />
                          <button
                            type="button"
                            onClick={() => {
                              setAssessmentNav(prev => ({ ...prev, kelas: null }));
                              setAssessmentSearch('');
                              setShowIncompleteInAssessment(false);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-xl transition-colors cursor-pointer max-w-[260px] truncate",
                              assessmentNav.kelas
                                ? "bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand"
                                : "bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 border border-brand/20"
                            )}
                          >
                            {assessmentNav.course}
                          </button>
                        </>
                      )}

                      {assessmentNav.kelas && (
                        <>
                          <ChevronRight size={15} className="text-slate-400" />
                          <span className="px-3 py-1.5 rounded-xl bg-brand text-white shadow-xs">
                            Kelas {assessmentNav.kelas}
                          </span>
                        </>
                      )}
                    </div>

                    {assessmentNav.course && (
                      <button
                        type="button"
                        onClick={() => {
                          if (assessmentNav.kelas) {
                            setAssessmentNav(prev => ({ ...prev, kelas: null }));
                          } else {
                            setAssessmentNav({ course: null, kelas: null });
                          }
                          setAssessmentSearch('');
                          setShowIncompleteInAssessment(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        &larr; {assessmentNav.kelas ? 'Kembali ke Kartu Kelas' : 'Kembali ke Daftar Kategori'}
                      </button>
                    )}
                  </div>

                  {/* LEVEL 1: DAFTAR KARTU MODUL / PAKET SOAL / GAME */}
                  {!assessmentNav.course && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {groupList.length > 0 ? (
                        groupList.map((group) => {
                          const classEntries = Object.values(group.classes);
                          const allResults = classEntries.flatMap(c => c.results);
                          const totalSubmissions = allResults.length;
                          const avgScore =
                            totalSubmissions > 0
                              ? Math.round(allResults.reduce((acc, r) => acc + Number(r.score || 0), 0) / totalSubmissions)
                              : 0;
                          const maxScore =
                            totalSubmissions > 0
                              ? Math.max(...allResults.map(r => Number(r.score || 0)))
                              : 0;

                          return (
                            <div
                              key={group.title}
                              onClick={() => setAssessmentNav({ course: group.title, kelas: null })}
                              className="admin-glass-card p-6 rounded-3xl text-left hover:border-brand/40 dark:hover:border-blue-500/50 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                                    isMateri
                                      ? "bg-brand/10 dark:bg-blue-900/40 text-brand dark:text-blue-400"
                                      : isGame
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                                  )}>
                                    {isMateri ? <BookOpen size={22} /> : isGame ? <Gamepad2 size={22} /> : <ClipboardList size={22} />}
                                  </div>
                                  <span className={cn("px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider", categoryBadge)}>
                                    {isMateri ? 'Materi' : isGame ? 'Game Edukasi' : 'Soal / Ujian'}
                                  </span>
                                </div>

                                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
                                  {group.title}
                                </h4>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 tabular-nums">
                                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    <Users size={12} className="text-brand dark:text-blue-400" />
                                    {classEntries.length} Kartu Kelas
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    {totalSubmissions} {isGame ? 'Rekor' : 'Selesai'}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-4 tabular-nums">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                      {isGame ? 'Skor Tertinggi' : 'Rata-rata'}
                                    </span>
                                    <span className={cn(
                                      "text-lg font-black",
                                      (isGame ? maxScore : avgScore) >= 80
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : (isGame ? maxScore : avgScore) >= 60
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    )}>
                                      {isGame ? maxScore : avgScore}
                                    </span>
                                  </div>
                                  {!isGame && (
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tertinggi</span>
                                      <span className="text-lg font-black text-slate-700 dark:text-slate-200">{maxScore}</span>
                                    </div>
                                  )}
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand group-hover:text-white text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-colors">
                                  <span>Kartu Kelas</span>
                                  <ChevronRight size={15} />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-16 admin-glass-card rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-center px-6">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            {isMateri ? <BookOpen size={30} className="opacity-40" /> : isGame ? <Gamepad2 size={30} className="opacity-40" /> : <ClipboardList size={30} className="opacity-40" />}
                          </div>
                          <p className="font-extrabold text-base text-slate-700 dark:text-slate-200">
                            Belum Ada Data {isMateri ? 'Nilai Materi' : isGame ? 'Skor Game' : 'Nilai Soal / Ujian'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                            Data kartu kelas dan nilai siswa akan otomatis tampil setelah siswa menyelesaikan {isMateri ? 'modul materi' : isGame ? 'permainan edukasi' : 'paket soal ujian'}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LEVEL 2: KARTU-KARTU KELAS */}
                  {assessmentNav.course && !assessmentNav.kelas && selectedGroup && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {Object.values(selectedGroup.classes)
                        .sort((a, b) => naturalCompareKelas(a.name, b.name))
                        .map((classData) => {
                          const totalInClass = groupedClasses[classData.name] || classData.results.length;
                          const uniqueStudentKeys = new Set(
                            classData.results.map(r => String(r.studentId || r.studentNis || r.studentName || r.id))
                          );
                          const completedStudentsCount = uniqueStudentKeys.size;
                          const progressPct = totalInClass > 0 ? Math.min(100, Math.round((completedStudentsCount / totalInClass) * 100)) : 100;
                          const avgScore =
                            classData.results.length > 0
                              ? Math.round(classData.results.reduce((acc, r) => acc + Number(r.score || 0), 0) / classData.results.length)
                              : 0;
                          const maxScore =
                            classData.results.length > 0
                              ? Math.max(...classData.results.map(r => Number(r.score || 0)))
                              : 0;

                          return (
                            <div
                              key={classData.name}
                              className="admin-glass-card rounded-3xl p-5 flex flex-col justify-between gap-4 hover:border-brand/40 dark:hover:border-blue-500/40 hover:shadow-lg transition-all"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setAssessmentNav({ course: selectedGroup.title, kelas: classData.name });
                                  setAssessmentSearch('');
                                }}
                                className="text-left space-y-3 group cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn(
                                    "px-3 py-1 rounded-xl text-xs font-black",
                                    isMateri
                                      ? "bg-brand text-white"
                                      : isGame
                                      ? "bg-indigo-600 text-white"
                                      : "bg-amber-600 text-white"
                                  )}>
                                    Kelas {classData.name}
                                  </span>
                                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tabular-nums">
                                    {completedStudentsCount}/{totalInClass} siswa
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        isMateri ? "bg-brand" : isGame ? "bg-indigo-600" : "bg-amber-500"
                                      )}
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                    <span>Ketuntasan Partisipasi</span>
                                    <span className="text-slate-700 dark:text-slate-200">{progressPct}%</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 border border-slate-200/70 dark:border-slate-700/70">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Rata-rata</span>
                                    <span className={cn(
                                      "text-lg font-black tabular-nums",
                                      avgScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : avgScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                    )}>
                                      {avgScore}
                                    </span>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 border border-slate-200/70 dark:border-slate-700/70">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Tertinggi</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white tabular-nums">
                                      {maxScore}
                                    </span>
                                  </div>
                                </div>
                              </button>

                              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex flex-col gap-2">
                                {(isMateri || isSoal) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setImportNilaiTarget({
                                        sourceType: isSoal ? 'soal' : 'materi',
                                        sourceTitle: selectedGroup.title,
                                        kelas: classData.name,
                                        entries: classData.results,
                                      })
                                    }
                                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                                  >
                                    <Send size={13} />
                                    <span>Masukkan ke Nilai</span>
                                  </button>
                                )}

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAssessmentNav({ course: selectedGroup.title, kelas: classData.name });
                                      setAssessmentSearch('');
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand hover:text-white text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Detail Siswa</span>
                                    <ChevronRight size={14} />
                                  </button>
                                  {!isGame && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteAssessment({
                                          courseTitle: selectedGroup.title,
                                          kelas: classData.name,
                                          isBulkClass: true,
                                        })
                                      }
                                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition-colors cursor-pointer"
                                      title={`Hapus semua nilai Kelas ${classData.name}`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* LEVEL 3: TABEL NILAI SISWA PER KELAS */}
                  {assessmentNav.course && assessmentNav.kelas && selectedClassData && (() => {
                    const classStudents = scopedStudents
                      .filter(s => s.kelas === assessmentNav.kelas)
                      .sort((a, b) => a.nama.localeCompare(b.nama, 'id-ID'));

                    const q = assessmentSearch.trim().toLowerCase();
                    const sortedResults = [...selectedClassData.results]
                      .filter(r => {
                        if (!q) return true;
                        return (
                          String(r.studentName || '').toLowerCase().includes(q) ||
                          String(r.studentNis || '').toLowerCase().includes(q)
                        );
                      })
                      .sort((a, b) => {
                        if (assessmentSort === 'score') {
                          return Number(b.score || 0) - Number(a.score || 0);
                        }
                        if (assessmentSort === 'time') {
                          const tA = isGame ? getScoreTimestampMs(a) : new Date(a.completedAt || 0).getTime();
                          const tB = isGame ? getScoreTimestampMs(b) : new Date(b.completedAt || 0).getTime();
                          return tB - tA;
                        }
                        return String(a.studentName || '').localeCompare(String(b.studentName || ''), 'id-ID');
                      });

                    const completedStudentIdSet = new Set(
                      selectedClassData.results.map(r => String(r.studentId || ''))
                    );
                    const completedStudentNameSet = new Set(
                      selectedClassData.results.map(r => String(r.studentName || '').trim().toLowerCase())
                    );
                    const incompleteStudents = classStudents.filter(
                      s => !completedStudentIdSet.has(s.id) && !completedStudentNameSet.has(s.nama.trim().toLowerCase())
                    );

                    const classAvg =
                      selectedClassData.results.length > 0
                        ? Math.round(selectedClassData.results.reduce((acc, r) => acc + Number(r.score || 0), 0) / selectedClassData.results.length)
                        : 0;

                    return (
                      <div className="space-y-4">
                        {/* Action & Filter Header */}
                        <div className="admin-glass-card rounded-3xl p-4 md:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase", categoryBadge)}>
                                {isMateri ? 'Nilai Materi' : isGame ? 'Skor Game' : 'Nilai Soal / Ujian'}
                              </span>
                              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tabular-nums">
                                {selectedClassData.results.length} data · Rata-rata: <strong className="text-slate-900 dark:text-white">{classAvg}</strong>
                              </span>
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1">
                              {assessmentNav.course} — Kelas {assessmentNav.kelas}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(isMateri || isSoal) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setImportNilaiTarget({
                                    sourceType: isSoal ? 'soal' : 'materi',
                                    sourceTitle: assessmentNav.course!,
                                    kelas: assessmentNav.kelas!,
                                    entries: selectedClassData.results,
                                  })
                                }
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Send size={14} />
                                <span>Masukkan ke Halaman Nilai</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                renderScoreCsvExport(assessmentNav.course!, assessmentNav.kelas!, sortedResults)
                              }
                              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download size={14} />
                              <span>Export CSV</span>
                            </button>

                            {!isGame && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteAssessment({
                                    courseTitle: assessmentNav.course!,
                                    kelas: assessmentNav.kelas!,
                                    isBulkClass: true,
                                  })
                                }
                                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                                <span>Reset Kelas</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Search, Sort & Belum Selesai Toggle */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5 flex-1">
                            <div className="relative flex-1 min-w-[200px] max-w-xs">
                              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={assessmentSearch}
                                onChange={(e) => setAssessmentSearch(e.target.value)}
                                placeholder="Cari nama atau NISN siswa..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                              />
                            </div>

                            <select
                              value={assessmentSort}
                              onChange={(e) => setAssessmentSort(e.target.value as 'name' | 'time' | 'score')}
                              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                            >
                              <option value="name">Urutkan: Nama A-Z</option>
                              <option value="score">Urutkan: Nilai Tertinggi</option>
                              <option value="time">Urutkan: Waktu Terbaru</option>
                            </select>
                          </div>

                          {incompleteStudents.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowIncompleteInAssessment(v => !v)}
                              className={cn(
                                "px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer tabular-nums",
                                showIncompleteInAssessment
                                  ? "bg-amber-600 border-amber-600 text-white"
                                  : "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                              )}
                            >
                              {showIncompleteInAssessment ? 'Sembunyikan' : 'Lihat'} Belum Selesai ({incompleteStudents.length})
                            </button>
                          )}
                        </div>

                        {showIncompleteInAssessment && incompleteStudents.length > 0 && (
                          <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 space-y-2">
                            <p className="text-xs font-black text-amber-900 dark:text-amber-200">
                              Siswa Kelas {assessmentNav.kelas} yang Belum Mengerjakan ({incompleteStudents.length}):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {incompleteStudents.map(st => (
                                <span
                                  key={st.id}
                                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                                >
                                  {st.nama}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Students Score Table */}
                        <div className="admin-glass-card rounded-3xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[650px]">
                              <thead>
                                <tr className="bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-extrabold tracking-wider">
                                  <th className="p-4 pl-6 w-12">No</th>
                                  <th className="p-4">Nama Siswa</th>
                                  <th className="p-4 text-center">{isGame ? 'Skor Tertinggi' : 'Nilai'}</th>
                                  <th className="p-4 text-center">{isGame ? 'Diperbarui' : 'Waktu Selesai'}</th>
                                  <th className="p-4 text-right pr-6">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sortedResults.length > 0 ? (
                                  sortedResults.map((item, idx) => {
                                    const numScore = Number(item.score ?? 0);
                                    const stu = scopedStudents.find(
                                      s => s.id === item.studentId || s.nis === item.studentNis
                                    );
                                    return (
                                      <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/35 transition-colors"
                                      >
                                        <td className="p-4 pl-6 text-xs font-bold text-slate-400 tabular-nums">
                                          {idx + 1}
                                        </td>
                                        <td className="p-4">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                              {item.studentName || stu?.nama || 'Siswa'}
                                            </span>
                                            {(item.cheatAttempts > 0 || item.tabSwitches > 0) && (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                                                <AlertTriangle size={11} />
                                                {item.cheatAttempts || item.tabSwitches}x Pindah Tab
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] font-mono text-slate-400">
                                            NISN: {stu?.nis || item.studentNis || '-'}
                                          </p>
                                        </td>
                                        <td className="p-4 text-center">
                                          <span
                                            className={cn(
                                              "inline-block px-3 py-1 rounded-xl text-xs font-black tabular-nums",
                                              isGame
                                                ? "bg-indigo-600 text-white"
                                                : numScore >= 80
                                                ? "bg-emerald-600 text-white"
                                                : numScore >= 60
                                                ? "bg-amber-500 text-white"
                                                : "bg-rose-600 text-white"
                                            )}
                                          >
                                            {numScore}{isGame ? ' Poin' : ''}
                                          </span>
                                        </td>
                                        <td className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                          {isGame
                                            ? formatScoreTimestamp(item)
                                            : item.completedAt
                                            ? new Date(item.completedAt).toLocaleString('id-ID')
                                            : '-'}
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                          {isGame ? (
                                            confirmDeleteGameScoreId === item.id ? (
                                              <div className="inline-flex items-center gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={async () => {
                                                    try {
                                                      await deleteDoc(doc(db, 'game_scores', item.id));
                                                      setConfirmDeleteGameScoreId(null);
                                                    } catch (err) {
                                                      handleFirestoreError(err, OperationType.DELETE, `game_scores/${item.id}`);
                                                    }
                                                  }}
                                                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-black cursor-pointer"
                                                >
                                                  Hapus
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setConfirmDeleteGameScoreId(null)}
                                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                                                >
                                                  Batal
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => setConfirmDeleteGameScoreId(item.id)}
                                                className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer"
                                                title="Hapus Skor Game"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            )
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteAssessment({
                                                  id: item.id,
                                                  studentName: item.studentName,
                                                  courseTitle: item.courseTitle,
                                                  score: item.score,
                                                  kelas: item.studentKelas,
                                                })
                                              }
                                              className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer"
                                              title="Hapus Nilai"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                                      Tidak ada data nilai siswa yang cocok dengan filter pencarian.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Modal: Masukkan Nilai Materi / Soal ke Kelola Administrasi -> Nilai */}
                  <ImportAssessmentToNilaiModal
                    isOpen={Boolean(importNilaiTarget)}
                    onClose={() => setImportNilaiTarget(null)}
                    sourceType={importNilaiTarget?.sourceType || 'materi'}
                    sourceTitle={importNilaiTarget?.sourceTitle || ''}
                    kelas={importNilaiTarget?.kelas || ''}
                    activeTahunPelajaran={activeTahunPelajaran}
                    activeSemester={activeSemester}
                    classStudents={
                      importNilaiTarget
                        ? scopedStudents
                            .filter(s => s.kelas === importNilaiTarget.kelas)
                            .sort((a, b) => a.nama.localeCompare(b.nama, 'id-ID'))
                        : []
                    }
                    assessmentEntries={importNilaiTarget?.entries || []}
                    onSuccess={(message, targetSubTab, targetKelas) => {
                      setAssessmentBannerNotice({ message, targetSubTab, targetKelas });
                    }}
                    onFirestoreError={(err, op, path) => {
                      const opEnum =
                        op === 'create'
                          ? OperationType.CREATE
                          : op === 'update'
                          ? OperationType.UPDATE
                          : op === 'delete'
                          ? OperationType.DELETE
                          : op === 'list'
                          ? OperationType.LIST
                          : op === 'get'
                          ? OperationType.GET
                          : OperationType.WRITE;
                      handleFirestoreError(err, opEnum, path);
                    }}
                  />
                </div>
              );
            })()}
            {adminTab === 'history' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Riwayat Akses Siswa</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memantau aktivitas login dan perangkat siswa secara real-time.</p>
                  </div>
                  <div className="bg-brand/10 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-brand/20 dark:border-blue-800/60 w-fit">
                    <p className="text-xs font-extrabold text-brand dark:text-blue-400 uppercase tracking-widest tabular-nums">Total {accessLogs.length} Aktivitas</p>
                  </div>
                </div>

                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/25 dark:bg-white/5 border-b border-white/40 dark:border-white/10">
                          <th className="p-4 pl-8 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Siswa</th>
                          <th className="p-4 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Waktu Akses</th>
                          <th className="p-4 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Alamat IP</th>
                          <th className="p-4 pr-8 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Perangkat & Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {accessLogs.length > 0 ? (
                          [...accessLogs]
                            .sort((a, b) => {
                              const dateA = a.timestamp?.seconds || 0;
                              const dateB = b.timestamp?.seconds || 0;
                              return dateB - dateA;
                            })
                            .slice(0, 100)
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors duration-200">
                                <td className="p-4 pl-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                      <User size={14} />
                                    </div>
                                    <p className="font-bold text-slate-900 dark:text-white">{log.studentName}</p>
                                  </div>
                                </td>
                                <td className="p-4 tabular-nums">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                      {log.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(log.timestamp.toDate()) : '-'}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                      {log.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(log.timestamp.toDate()) : '-'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-sm font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                                  <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-slate-400 dark:text-slate-500" />
                                    {log.ip}
                                  </div>
                                </td>
                                <td className="p-4 pr-8">
                                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.device}>
                                    {log.device}
                                  </p>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400 dark:text-slate-500">
                              Belum ada data riwayat akses.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {adminTab === 'announcements' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Pengumuman</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Kelola dan kirim pengumuman untuk siswa.</p>
                  </div>
                  <button 
                    onClick={() => {
                        setEditingAnnouncementId(null);
                        setAnnouncementTargetType('all');
                        setAnnouncementTargetValue('');
                        setAnnouncementContent('');
                        setAnnouncementLink('');
                        setIsAnnouncementModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 w-fit"
                  >
                    <Plus size={18} /> <span className="hidden sm:inline">Buat Pengumuman</span>
                  </button>
                </div>

                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-white/25 dark:bg-white/5 border-b border-white/40 dark:border-white/10">
                          <th className="p-4 pl-8 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Waktu</th>
                          <th className="p-4 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target</th>
                          <th className="p-4 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Isi Pengumuman</th>
                          <th className="p-4 pr-8 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {announcements.length > 0 ? (
                          [...announcements]
                            .sort((a, b) => {
                              const dateA = a.timestamp?.seconds || 0;
                              const dateB = b.timestamp?.seconds || 0;
                              return dateB - dateA;
                            })
                            .map((ann) => (
                              <tr key={ann.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors duration-200">
                                <td className="p-4 pl-8 tabular-nums">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                      {ann.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(ann.timestamp.toDate()) : '-'}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                      {ann.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(ann.timestamp.toDate()) : '-'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest">
                                        {ann.targetType === 'all' ? 'Semua Siswa' : ann.targetType === 'class' ? `Kelas ${ann.targetValue}` : 'Siswa Spesifik'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                  <p className="max-w-md truncate" title={ann.content}>
                                    {ann.content}
                                  </p>
                                </td>
                                <td className="p-4 pr-8">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => toggleAnnouncementVisibility(ann.id, ann.isVisible !== false)}
                                      className={cn(
                                        "p-2 rounded-xl transition-colors duration-200 flex items-center gap-1",
                                        ann.isVisible !== false ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      )}
                                      title={ann.isVisible !== false ? "Sembunyikan dari siswa" : "Tampilkan ke siswa"}
                                    >
                                      {ann.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                      onClick={() => startEditAnnouncement(ann)}
                                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-blue-400 hover:bg-brand/10 dark:hover:bg-blue-900/30 rounded-xl transition-colors duration-200"
                                      title="Edit Pengumuman"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteAnnouncementAdmin(ann.id)}
                                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors duration-200"
                                      title="Hapus Pengumuman"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                              Belum ada pengumuman.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pengaturan Website & Akademik</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Konfigurasi Tahun Pelajaran, Semester aktif, tema mode gelap, logo instansi, dan latar belakang aplikasi.</p>
                  </div>
                </div>

                {/* Card Academic Term: Tahun Pelajaran & Semester */}
                <div className="admin-glass-card rounded-2xl overflow-hidden p-6 md:p-8 space-y-5 border border-blue-200/70 dark:border-blue-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 text-brand dark:text-blue-400 flex items-center justify-center shrink-0">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Tahun Pelajaran & Semester Aktif</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Menjadi acuan seluruh halaman di Kelola Administrasi, Kelola Materi, Asesmen, dan Siswa & Kelas.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 dark:bg-blue-900/40 text-brand dark:text-blue-300 text-xs font-extrabold tabular-nums w-fit">
                      Aktif: TA {activeTahunPelajaran} · Sem {activeSemester}
                    </span>
                  </div>

                  {termSettingsNotice && (
                    <div className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between gap-2",
                      termSettingsNotice.type === 'success'
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    )}>
                      <span>{termSettingsNotice.message}</span>
                      <button type="button" onClick={() => setTermSettingsNotice(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Pilih Tahun Pelajaran
                      </label>
                      <select
                        value={activeTahunPelajaran}
                        onChange={async (e) => {
                          const nextYear = e.target.value;
                          setSettingsConfig(prev => ({ ...prev, activeTahunPelajaran: nextYear }));
                          try {
                            await setDoc(doc(db, 'app_settings', 'global'), {
                              activeTahunPelajaran: nextYear,
                              activeSemester,
                              tahunPelajaranList,
                            }, { merge: true });
                            setTermSettingsNotice({
                              type: 'success',
                              message: `Tahun Pelajaran diubah ke ${nextYear}. Data tahun sebelumnya tetap tersimpan aman.`,
                            });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        {tahunPelajaranList.map(yr => (
                          <option key={yr} value={yr}>Tahun Pelajaran {yr}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newAcademicYearInput}
                          onChange={(e) => setNewAcademicYearInput(e.target.value)}
                          placeholder="Tambah tahun baru, mis. 2028/2029"
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const cleaned = newAcademicYearInput.trim();
                            if (!/^\d{4}\/\d{4}$/.test(cleaned)) {
                              setTermSettingsNotice({
                                type: 'error',
                                message: 'Format tahun pelajaran harus YYYY/YYYY, contoh: 2028/2029.',
                              });
                              return;
                            }
                            const updatedList = Array.from(new Set([...tahunPelajaranList, cleaned])).sort();
                            setSettingsConfig(prev => ({
                              ...prev,
                              tahunPelajaranList: updatedList,
                              activeTahunPelajaran: cleaned,
                            }));
                            setNewAcademicYearInput('');
                            try {
                              await setDoc(doc(db, 'app_settings', 'global'), {
                                activeTahunPelajaran: cleaned,
                                activeSemester,
                                tahunPelajaranList: updatedList,
                              }, { merge: true });
                              setTermSettingsNotice({
                                type: 'success',
                                message: `Tahun Pelajaran ${cleaned} ditambahkan dan diaktifkan.`,
                              });
                            } catch (err) {
                              handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                            }
                          }}
                          className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Plus size={14} />
                          Tambah
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Pilih Semester Aktif
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(['Ganjil', 'Genap'] as const).map(sem => (
                          <button
                            key={sem}
                            type="button"
                            onClick={async () => {
                              if (activeSemester === sem) return;
                              setSettingsConfig(prev => ({ ...prev, activeSemester: sem }));
                              try {
                                await setDoc(doc(db, 'app_settings', 'global'), {
                                  activeTahunPelajaran,
                                  activeSemester: sem,
                                  tahunPelajaranList,
                                }, { merge: true });
                                setTermSettingsNotice({
                                  type: 'success',
                                  message: `Semester diubah ke ${sem} (${activeTahunPelajaran}). Siswa & Kelas dan Tujuan Pembelajaran tetap dipertahankan.`,
                                });
                              } catch (err) {
                                handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                              }
                            }}
                            className={cn(
                              "px-4 py-3 rounded-xl text-sm font-extrabold border transition-all flex items-center justify-center gap-2 cursor-pointer",
                              activeSemester === sem
                                ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand/50"
                            )}
                          >
                            {activeSemester === sem && <Check size={15} />}
                            Semester {sem}
                          </button>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed">
                        <p><strong>Ganti Tahun Pelajaran:</strong> Tampilan Siswa & Kelas, Kelola Administrasi, dan Kelola Materi menjadi kosong untuk tahun baru (data lama tetap tersimpan).</p>
                        <p><strong>Ganti Semester (Tahun Sama):</strong> Hanya mengosongkan tampilan per-semester di Kelola Materi & Administrasi, <strong>kecuali Tujuan Pembelajaran dan Siswa & Kelas yang tetap tersimpan</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Pengaturan Jam & Istirahat Jadwal Pelajaran */}
                <div className="admin-glass-card rounded-2xl overflow-hidden p-6 md:p-8 space-y-5 border border-emerald-200/70 dark:border-emerald-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Pengaturan Jam & Istirahat Jadwal Pelajaran</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Atur durasi per jam pelajaran, durasi istirahat, jam mulai, jumlah jam, dan posisi Istirahat 1 & 2 per hari.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          const resetData = normalizeJadwalScheduleSettings(DEFAULT_JADWAL_SCHEDULE_SETTINGS);
                          setJadwalSettingsDraft(resetData);
                          setIsSavingJadwalSettings(true);
                          try {
                            setSettingsConfig(prev => ({ ...prev, jadwalSettings: resetData }));
                            await setDoc(doc(db, 'app_settings', 'global'), { jadwalSettings: resetData }, { merge: true });
                            setJadwalSettingsNotice({
                              type: 'success',
                              message: 'Pengaturan jam jadwal pelajaran dikembalikan ke pengaturan default sekolah (40 menit / 20 menit).',
                            });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                          } finally {
                            setIsSavingJadwalSettings(false);
                          }
                        }}
                        disabled={isSavingJadwalSettings}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        Reset Default
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const normalized = normalizeJadwalScheduleSettings(jadwalSettingsDraft);
                          setJadwalSettingsDraft(normalized);
                          setIsSavingJadwalSettings(true);
                          try {
                            setSettingsConfig(prev => ({ ...prev, jadwalSettings: normalized }));
                            await setDoc(doc(db, 'app_settings', 'global'), { jadwalSettings: normalized }, { merge: true });
                            setJadwalSettingsNotice({
                              type: 'success',
                              message: 'Pengaturan jam & istirahat jadwal pelajaran berhasil disimpan.',
                            });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                            setJadwalSettingsNotice({
                              type: 'error',
                              message: 'Gagal menyimpan pengaturan jam jadwal pelajaran.',
                            });
                          } finally {
                            setIsSavingJadwalSettings(false);
                          }
                        }}
                        disabled={isSavingJadwalSettings}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Check size={14} />
                        {isSavingJadwalSettings ? 'Menyimpan...' : 'Simpan Pengaturan Jam'}
                      </button>
                    </div>
                  </div>

                  {jadwalSettingsNotice && (
                    <div className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between gap-2",
                      jadwalSettingsNotice.type === 'success'
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    )}>
                      <span>{jadwalSettingsNotice.message}</span>
                      <button type="button" onClick={() => setJadwalSettingsNotice(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Global Durations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Durasi 1 Jam Pelajaran (Menit)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={180}
                        value={jadwalSettingsDraft.lessonDurationMinutes}
                        onChange={(e) =>
                          setJadwalSettingsDraft(prev => ({
                            ...prev,
                            lessonDurationMinutes: Math.max(10, Number(e.target.value) || 40),
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white tabular-nums"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Durasi Istirahat (Menit)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={jadwalSettingsDraft.breakDurationMinutes}
                        onChange={(e) =>
                          setJadwalSettingsDraft(prev => ({
                            ...prev,
                            breakDurationMinutes: Math.max(5, Number(e.target.value) || 20),
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Per-day Schedule Config Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <table className="w-full text-left border-collapse min-w-[780px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <th className="p-3.5">Hari</th>
                          <th className="p-3.5">Jam 1 Mulai</th>
                          <th className="p-3.5">Sampai Jam Ke-</th>
                          <th className="p-3.5">Istirahat 1 (Setelah Jam Ke-)</th>
                          <th className="p-3.5">Istirahat 2 (Setelah Jam Ke-)</th>
                          <th className="p-3.5">Ringkasan Waktu Otomatis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-slate-900/40">
                        {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as JadwalPelajaranItem['hari'][]).map((day) => {
                          const cfg = jadwalSettingsDraft.days[day];
                          const preview = computeDayScheduleSlots(
                            cfg,
                            jadwalSettingsDraft.lessonDurationMinutes,
                            jadwalSettingsDraft.breakDurationMinutes
                          );
                          const lastSlot = preview.slots[cfg.totalSlots];
                          return (
                            <tr key={day} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-xs font-extrabold">
                                  {day}{day === 'Sabtu' ? ' (Opsional)' : ''}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <input
                                  type="time"
                                  value={cfg.startTime}
                                  onChange={(e) =>
                                    setJadwalSettingsDraft(prev => ({
                                      ...prev,
                                      days: {
                                        ...prev.days,
                                        [day]: { ...prev.days[day], startTime: e.target.value },
                                      },
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tabular-nums"
                                />
                              </td>
                              <td className="p-3.5">
                                <input
                                  type="number"
                                  min={1}
                                  max={14}
                                  value={cfg.totalSlots}
                                  onChange={(e) =>
                                    setJadwalSettingsDraft(prev => ({
                                      ...prev,
                                      days: {
                                        ...prev.days,
                                        [day]: {
                                          ...prev.days[day],
                                          totalSlots: Math.max(1, Math.min(14, Number(e.target.value) || 1)),
                                        },
                                      },
                                    }))
                                  }
                                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-center tabular-nums"
                                />
                              </td>
                              <td className="p-3.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={14}
                                  value={cfg.break1AfterSlot}
                                  onChange={(e) =>
                                    setJadwalSettingsDraft(prev => ({
                                      ...prev,
                                      days: {
                                        ...prev.days,
                                        [day]: {
                                          ...prev.days[day],
                                          break1AfterSlot: Math.max(0, Math.min(14, Number(e.target.value) || 0)),
                                        },
                                      },
                                    }))
                                  }
                                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-center tabular-nums"
                                  title="0 = Tidak ada istirahat 1"
                                />
                              </td>
                              <td className="p-3.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={14}
                                  value={cfg.break2AfterSlot}
                                  onChange={(e) =>
                                    setJadwalSettingsDraft(prev => ({
                                      ...prev,
                                      days: {
                                        ...prev.days,
                                        [day]: {
                                          ...prev.days[day],
                                          break2AfterSlot: Math.max(0, Math.min(14, Number(e.target.value) || 0)),
                                        },
                                      },
                                    }))
                                  }
                                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-center tabular-nums"
                                  title="0 = Tidak ada istirahat 2"
                                />
                              </td>
                              <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium tabular-nums">
                                <div className="font-bold text-slate-800 dark:text-slate-100">
                                  {cfg.startTime} – {lastSlot?.selesai || cfg.startTime} ({cfg.totalSlots} Jam)
                                </div>
                                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  {preview.breaks.length > 0
                                    ? preview.breaks.map(b => `Ist.${b.breakIndex}: ${b.mulai}-${b.selesai}`).join(' · ')
                                    : 'Tanpa istirahat'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Card 0: Theme Mode (Light / Dark) */}
                <div className="admin-glass-card rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
                      isDarkMode
                        ? "bg-amber-950/50 border-amber-800/70 text-amber-400"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    )}>
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Mode Tampilan Aplikasi</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Beralih antara Mode Terang dan Mode Gelap untuk kenyamanan visual di perangkat ini.
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 w-fit shrink-0">
                    <button
                      type="button"
                      onClick={() => isDarkMode && toggleDarkMode()}
                      className={cn(
                        "px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer",
                        !isDarkMode
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Sun size={14} className={!isDarkMode ? "text-amber-500" : ""} />
                      Terang
                    </button>
                    <button
                      type="button"
                      onClick={() => !isDarkMode && toggleDarkMode()}
                      className={cn(
                        "px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer",
                        isDarkMode
                          ? "bg-slate-950 text-white shadow-xs border border-slate-700"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <Moon size={14} className={isDarkMode ? "text-amber-400" : ""} />
                      Gelap
                    </button>
                  </div>
                </div>

                {/* Card 1: Logo Sekolah */}
                <div className="admin-glass-card rounded-2xl overflow-hidden p-6 md:p-8">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">Upload Logo Sekolah</label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Disarankan menggunakan gambar berformat persegi, atau rasio aspek 1:1 transparan dengan format PNG/SVG. Maks 1MB.</p>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200/80 dark:border-slate-700 shadow-xs overflow-hidden relative shrink-0">
                          {settingsConfig.logoUrl ? (
                            <img src={settingsConfig.logoUrl} alt="Preview Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold px-2 text-center">Belum<br/>ada logo</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            id="logo-upload"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Ukuran gambar tidak boleh melebihi 2MB.");
                                return;
                              }
                              
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64String = reader.result as string;
                                // If it's a raster image, compress to max 256x256 to ensure snappy load & under Firestore document limit
                                if (file.type.startsWith('image/') && !file.type.includes('svg')) {
                                  const img = new Image();
                                  img.onload = async () => {
                                    const canvas = document.createElement('canvas');
                                    const maxDim = 256;
                                    let width = img.width;
                                    let height = img.height;
                                    if (width > height) {
                                      if (width > maxDim) {
                                        height = Math.round((height * maxDim) / width);
                                        width = maxDim;
                                      }
                                    } else {
                                      if (height > maxDim) {
                                        width = Math.round((width * maxDim) / height);
                                        height = maxDim;
                                      }
                                    }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, width, height);
                                      const optimizedBase64 = canvas.toDataURL('image/png');
                                      setSettingsConfig(prev => ({ ...prev, logoUrl: optimizedBase64 }));
                                      try {
                                        await setDoc(doc(db, 'app_settings', 'global'), { logoUrl: optimizedBase64 }, { merge: true });
                                        alert("Logo sekolah berhasil diperbarui!");
                                      } catch (err) {
                                        handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                                      }
                                    }
                                  };
                                  img.src = base64String;
                                } else {
                                  setSettingsConfig(prev => ({ ...prev, logoUrl: base64String }));
                                  try {
                                    await setDoc(doc(db, 'app_settings', 'global'), { logoUrl: base64String }, { merge: true });
                                    alert("Logo sekolah berhasil diperbarui!");
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <label 
                            htmlFor="logo-upload"
                            className="inline-flex cursor-pointer items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-sm shadow-xs hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 text-slate-700 dark:text-slate-200"
                          >
                            Pilih File Gambar
                          </label>
                          {settingsConfig.logoUrl && (
                            <button
                              onClick={async () => {
                                if (confirm('Apakah Anda yakin ingin menghapus logo kustom ini dan kembali ke logo bawaan?')) {
                                  try {
                                    setSettingsConfig(prev => ({ ...prev, logoUrl: '' }));
                                    await setDoc(doc(db, 'app_settings', 'global'), { logoUrl: '' }, { merge: true });
                                    alert("Logo kustom berhasil dihapus!");
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                                  }
                                }
                              }}
                              className="block mt-2.5 text-xs font-bold text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                            >
                              Hapus Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Background Customization (10 Distinct Styles) */}
                <div className="admin-glass-card rounded-2xl overflow-hidden p-6 md:p-8 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Palette size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Gaya Latar Belakang Aplikasi</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Pilih salah satu dari 10 gaya background berbeda untuk halaman Admin, Siswa, dan Login.
                        </p>
                      </div>
                    </div>

                    {(settingsConfig.backgroundPreset && settingsConfig.backgroundPreset !== 'default') && (
                      <button
                        onClick={async () => {
                          setSettingsConfig(prev => ({ ...prev, backgroundPreset: 'default' }));
                          try {
                            await setDoc(doc(db, 'app_settings', 'global'), { backgroundPreset: 'default' }, { merge: true });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        Reset Default
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {APP_BACKGROUNDS.map((bg, idx) => {
                      const isSelected = (settingsConfig.backgroundPreset || 'default') === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={async () => {
                            setSettingsConfig(prev => ({ ...prev, backgroundPreset: bg.id }));
                            try {
                              await setDoc(doc(db, 'app_settings', 'global'), { backgroundPreset: bg.id }, { merge: true });
                            } catch (err) {
                              handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                            }
                          }}
                          className={cn(
                            "text-left rounded-2xl border p-2.5 transition-colors duration-200 flex flex-col gap-2.5 group cursor-pointer",
                            isSelected
                              ? "border-brand ring-2 ring-brand/25 bg-blue-500/15 dark:bg-blue-950/40 shadow-sm"
                              : "admin-glass-card hover:shadow-xs"
                          )}
                        >
                          {/* Mini App Canvas Preview */}
                          <div className={cn("h-24 w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-2.5 relative overflow-hidden flex flex-col justify-between", bg.className)}>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                                {idx + 1}. {bg.category}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs shrink-0">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="h-6 rounded-md bg-white/90 dark:bg-slate-900/85 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs" />
                              <div className="h-6 rounded-md bg-white/90 dark:bg-slate-900/85 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs col-span-2" />
                            </div>
                          </div>

                          <div className="px-0.5">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{bg.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mt-0.5">{bg.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'administrasi' && (
              <AdminAdministrasi
                activeTahunPelajaran={activeTahunPelajaran}
                activeSemester={activeSemester}
                students={scopedStudents}
                assessments={scopedAssessments}
                soalSets={enrichedSoalSets}
                soalQuestions={soalQuestions}
                jadwalSettings={settingsConfig.jadwalSettings || DEFAULT_JADWAL_SCHEDULE_SETTINGS}
                navigationRequest={administrasiNavRequest}
                onNavigateTab={(tab) => setAdminTab(tab)}
                onOpenStudentDetail={(student) => setStudentDetail({ student, score: getStudentScore(student.id) })}
                onFirestoreError={(err, op, path) => {
                  const opEnum =
                    op === 'create'
                      ? OperationType.CREATE
                      : op === 'update'
                      ? OperationType.UPDATE
                      : op === 'delete'
                      ? OperationType.DELETE
                      : op === 'list'
                      ? OperationType.LIST
                      : op === 'get'
                      ? OperationType.GET
                      : OperationType.WRITE;
                  handleFirestoreError(err, opEnum, path);
                }}
              />
            )}
            {adminTab === 'games' && (
              <AdminGames isAdmin={true} studentsList={scopedStudents} />
            )}
            {adminTab === 'questions' && (
              <AdminSoal
                soalSets={enrichedSoalSets}
                soalQuestions={soalQuestions}
                materialConfigs={materialConfigs}
                classOptions={adminClassOptions}
                activeTahunPelajaran={activeTahunPelajaran}
                activeSemester={activeSemester}
                assessments={scopedAssessments}
                soalDbConfigured={soalDbConfigured}
                soalDbError={soalDbError}
                soalAdminToken={soalAdminToken}
                onSetSoalAdminToken={setSoalAdminToken}
                onRefreshSoal={fetchSoalFromMysql}
                onPreviewSet={(set) => {
                  setActiveSoalSetId(set.id);
                  sessionStorage.setItem('activeSoalSetId', set.id);
                  setIsPreviewingSoal(true);
                  setCurrentPage('soal');
                }}
                onFirestoreError={(err, op, path) => {
                  const opEnum =
                    op === 'create'
                      ? OperationType.CREATE
                      : op === 'update'
                      ? OperationType.UPDATE
                      : op === 'delete'
                      ? OperationType.DELETE
                      : op === 'list'
                      ? OperationType.LIST
                      : op === 'get'
                      ? OperationType.GET
                      : OperationType.WRITE;
                  handleFirestoreError(err, opEnum, path);
                }}
              />
            )}
            </div>
          </div>

          <AnimatePresence>
            {editingMaterialConfigId && localMaterialConfig && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl shadow-slate-900/20 my-8"
                >
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-7 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mb-1">Konfigurasi Materi</h3>
                      <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">
                        {COURSES.find(c => c.id === editingMaterialConfigId)?.title}
                      </p>
                    </div>
                    <button 
                      onClick={() => setEditingMaterialConfigId(null)}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 relative z-10"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4 p-5 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                            <Lock size={18} className={localMaterialConfig.isGatekeepingEnabled ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"} />
                            Gatekeeping Bab
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-balance">
                            Siswa diwajibkan untuk menyelesaikan quiz topik sebelumnya untuk membuka topik berikutnya.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={localMaterialConfig.isGatekeepingEnabled} 
                            onChange={(e) => setLocalMaterialConfig({...localMaterialConfig, isGatekeepingEnabled: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <Settings size={18} className="text-slate-500 dark:text-slate-400" />
                          Pengaturan Waktu (Detik)
                        </h4>
                        <div className="space-y-4">
                          <div className="p-5 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 mb-6">
                            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-4 flex items-center gap-2">
                              <Timer size={18} className="text-emerald-600 dark:text-emerald-400" />
                              Global Course Settings (Defaults)
                            </h4>
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-emerald-200/70 dark:border-emerald-800/60">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Gunakan Waktu Global</span>
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-300/80">Jika aktif, sistem akan menggunakan timer global untuk bab yang tidak disetting manual.</span>
                              </div>
                              <button 
                                onClick={() => setLocalMaterialConfig({ ...localMaterialConfig, useGlobalTimers: !localMaterialConfig.useGlobalTimers })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                                  localMaterialConfig.useGlobalTimers ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                  localMaterialConfig.useGlobalTimers ? "right-1" : "left-1"
                                )} />
                              </button>
                            </div>

                            <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-opacity", !localMaterialConfig.useGlobalTimers && "opacity-50 pointer-events-none")}>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Waktu Tunggu Materi (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-950 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none tabular-nums"
                                  value={localMaterialConfig.defaultTopicTimer ?? 70}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultTopicTimer: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Waktu Keluar Kuis (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-950 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none tabular-nums"
                                  value={localMaterialConfig.defaultQuizAvailableAt ?? 40}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultQuizAvailableAt: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Timer Kuis (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-950 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none tabular-nums"
                                  value={localMaterialConfig.defaultQuizTimer ?? 60}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultQuizTimer: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Minimal
                                  <span className="px-1.5 py-0.5 bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/70 rounded-xl text-sm font-extrabold text-emerald-900 dark:text-emerald-200 cursor-not-allowed tabular-nums"
                                    value={(() => {
                                      const totalSec = localMaterialConfig.minCourseTimer ?? 0;
                                      const m = Math.floor(totalSec / 60);
                                      const s = totalSec % 60;
                                      return `${m}m ${s}s (${totalSec}s)`;
                                    })()}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Maksimal
                                  <span className="px-1.5 py-0.5 bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/70 rounded-xl text-sm font-extrabold text-emerald-900 dark:text-emerald-200 cursor-not-allowed tabular-nums"
                                    value={(() => {
                                      const totalSec = localMaterialConfig.maxCourseTimer ?? 0;
                                      const m = Math.floor(totalSec / 60);
                                      const s = totalSec % 60;
                                      return `${m}m ${s}s (${totalSec}s)`;
                                    })()}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Total Course
                                  <span className="px-1.5 py-0.5 bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/70 rounded-xl text-sm font-extrabold text-emerald-900 dark:text-emerald-200 cursor-not-allowed tabular-nums"
                                    value={(() => {
                                      const totalSec = localMaterialConfig.totalCourseTimer ?? 0;
                                      const m = Math.floor(totalSec / 60);
                                      const s = totalSec % 60;
                                      return `${m}m ${s}s (${totalSec} detik)`;
                                    })()}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-4 font-medium italic">* Nilai global akan digunakan jika pengaturan per-bab tidak diisi atau 0.</p>
                          </div>

                          {COURSES.find(c => c.id === editingMaterialConfigId)?.topics.map(topic => (
                            <div key={topic.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-brand/40 transition-all duration-300 shadow-xs">
                              <div className="col-span-full mb-1 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{topic.title}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Waktu Tunggu:</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none tabular-nums"
                                  placeholder={String(localMaterialConfig.defaultTopicTimer || 70)}
                                  value={localMaterialConfig.topicTimers?.[topic.id] ?? 0}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({
                                      ...localMaterialConfig,
                                      topicTimers: { ...localMaterialConfig.topicTimers, [topic.id]: val }
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Timer Kuis:</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none tabular-nums"
                                  placeholder={String(localMaterialConfig.defaultQuizTimer || 60)}
                                  value={localMaterialConfig.quizTimers?.[topic.id] ?? 0}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({
                                      ...localMaterialConfig,
                                      quizTimers: { ...localMaterialConfig.quizTimers, [topic.id]: val }
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Waktu Keluar Kuis (Detik):</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none tabular-nums"
                                  placeholder={String(localMaterialConfig.defaultQuizAvailableAt || 40)}
                                  value={localMaterialConfig.quizAvailableAt?.[topic.id] ?? 0}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({
                                      ...localMaterialConfig,
                                      quizAvailableAt: { ...localMaterialConfig.quizAvailableAt, [topic.id]: val }
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 bg-slate-50/90 dark:bg-slate-800/60 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-slate-800">
                    <button 
                      onClick={() => setEditingMaterialConfigId(null)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={saveMaterialConfig}
                      disabled={isSavingConfig}
                      className="bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-xl font-bold shadow-md shadow-brand/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                      {isSavingConfig ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Simpan Konfigurasi
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMaterialConfirmOpen && materialToggleTarget && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 16 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200/90 dark:border-slate-800"
                >
                  <div className={cn(
                    "p-7 flex flex-col items-center text-center border-b",
                    materialToggleTarget.nextStatus ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60" : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60"
                  )}>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-4 ring-white dark:ring-slate-900",
                      materialToggleTarget.nextStatus ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400"
                    )}>
                      {materialToggleTarget.nextStatus ? <Globe size={30} /> : <Lock size={30} />}
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                      {materialToggleTarget.nextStatus ? 'Aktifkan Materi' : 'Nonaktifkan Materi'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      Apakah Anda yakin ingin {materialToggleTarget.nextStatus ? 'menerbitkan' : 'menarik'} materi <span className="font-bold text-slate-900 dark:text-white">"{materialToggleTarget.title}"</span>?
                      <br />
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {materialToggleTarget.nextStatus 
                          ? 'Siswa akan dapat mengakses materi ini di dashboard mereka.' 
                          : 'Siswa tidak akan dapat lagi mengakses materi ini.'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-2.5 bg-white dark:bg-slate-900">
                    <button 
                      onClick={confirmToggleMaterial}
                      className={cn(
                        "w-full py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-md hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-white",
                        materialToggleTarget.nextStatus ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25" : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25"
                      )}
                    >
                      {materialToggleTarget.nextStatus ? <CheckCircle size={20} /> : <Lock size={20} />}
                      {materialToggleTarget.nextStatus ? 'Ya, Terbitkan Materi' : 'Ya, Nonaktifkan'}
                    </button>
                    
                    <button 
                      onClick={() => { setIsMaterialConfirmOpen(false); setMaterialToggleTarget(null); }}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold transition-all duration-300 active:scale-[0.98]"
                    >
                      Batal
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {isDeleteModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 16 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200/90 dark:border-slate-800"
                >
                  <div className="bg-rose-50/80 dark:bg-rose-950/40 p-7 flex flex-col items-center text-center border-b border-rose-200/80 dark:border-rose-800/60">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-4 ring-white dark:ring-slate-900">
                      <Trash2 size={30} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Konfirmasi Hapus</h2>
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      {deleteType === 'student' ? (
                        deleteTarget === 'selected' 
                          ? <p>Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-800 dark:text-white">{selectedStudentIds.length} siswa</span> yang terpilih?</p> 
                          : <p>Apakah Anda yakin ingin menghapus data siswa ini?</p>
                      ) : deleteAssessmentInfo?.isBulkClass ? (
                        <p>Apakah Anda yakin ingin mereset/menghapus <b>semua nilai siswa Kelas {deleteAssessmentInfo.kelas}</b> untuk materi <b>"{deleteAssessmentInfo.courseTitle}"</b>?</p>
                      ) : deleteAssessmentInfo?.isBulkCourse ? (
                        <p>Apakah Anda yakin ingin menghapus seluruh nilai asesmen untuk materi <b>"{deleteAssessmentInfo.courseTitle}"</b>?</p>
                      ) : deleteAssessmentInfo?.studentName ? (
                        <p>Apakah Anda yakin ingin menghapus nilai asesmen milik <span className="font-bold text-slate-900 dark:text-white">{deleteAssessmentInfo.studentName}</span>{deleteAssessmentInfo.courseTitle ? <> pada materi <span className="font-bold text-slate-900 dark:text-white">"{deleteAssessmentInfo.courseTitle}"</span></> : ''}?</p>
                      ) : (
                        <p>Apakah Anda yakin ingin menghapus data nilai asesmen ini?</p>
                      )}
                      <p className="mt-2 font-semibold text-rose-600 dark:text-rose-400">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-2.5 bg-white dark:bg-slate-900">
                    <button 
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-md shadow-rose-500/25 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <RotateCcw className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                      {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
                    </button>
                    
                    <button 
                      onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); setDeleteType(null); }}
                      disabled={isDeleting}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isAnnouncementModalOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, y: 16, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 16, opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 relative"
                >
                  <div className="p-6 md:p-7 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 dark:bg-blue-900/30 border border-brand/20 dark:border-blue-800/60 rounded-2xl text-brand dark:text-blue-400">
                          <Megaphone size={22} />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {editingAnnouncementId ? 'Edit Pengumuman' : 'Buat Pengumuman'}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bagikan info ke siswa</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAnnouncementModalOpen(false)}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-300 border border-slate-200 dark:border-slate-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Target Pengumuman</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setAnnouncementTargetType('all')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300",
                              announcementTargetType === 'all' 
                                ? "bg-gradient-to-r from-brand to-blue-600 text-white border-transparent shadow-md shadow-brand/20" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40 hover:bg-slate-100 dark:hover:bg-slate-700"
                            )}
                          >
                            Semua
                          </button>
                          <button 
                            onClick={() => setAnnouncementTargetType('class')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300",
                              announcementTargetType === 'class' 
                                ? "bg-gradient-to-r from-brand to-blue-600 text-white border-transparent shadow-md shadow-brand/20" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40 hover:bg-slate-100 dark:hover:bg-slate-700"
                            )}
                          >
                            Per Kelas
                          </button>
                          <button 
                            onClick={() => setAnnouncementTargetType('student')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300",
                              announcementTargetType === 'student' 
                                ? "bg-gradient-to-r from-brand to-blue-600 text-white border-transparent shadow-md shadow-brand/20" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40 hover:bg-slate-100 dark:hover:bg-slate-700"
                            )}
                          >
                            Per Siswa
                          </button>
                        </div>
                      </div>

                      {announcementTargetType === 'class' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Pilih Kelas</label>
                          <select 
                            value={announcementTargetValue}
                            onChange={(e) => setAnnouncementTargetValue(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand appearance-none font-bold text-sm text-slate-800 dark:text-slate-100"
                          >
                            <option value="">Pilih...</option>
                            {Array.from(new Set(scopedStudents.map(s => s.kelas))).sort().map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      {announcementTargetType === 'student' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Pilih Siswa</label>
                          <select 
                            value={announcementTargetValue}
                            onChange={(e) => setAnnouncementTargetValue(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand appearance-none font-bold text-sm text-slate-800 dark:text-slate-100"
                          >
                            <option value="">Pilih...</option>
                            {[...scopedStudents].sort((a,b) => a.nama.localeCompare(b.nama)).map(s => (
                              <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Isi Pengumuman</label>
                        <textarea 
                          value={announcementContent}
                          onChange={(e) => setAnnouncementContent(e.target.value)}
                          placeholder="Masukkan isi pengumuman..."
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[100px] resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Tautan/Link (Opsional)</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                          <input 
                            type="url"
                            value={announcementLink}
                            onChange={(e) => setAnnouncementLink(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-7 py-5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200/70 dark:border-slate-800 flex gap-3">
                    <button 
                      onClick={() => setIsAnnouncementModalOpen(false)}
                      className="flex-1 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 active:scale-[0.98]"
                    >
                      Batal
                    </button>
                    <button 
                      disabled={!announcementContent || (announcementTargetType !== 'all' && !announcementTargetValue) || isSendingAnnouncement}
                      onClick={handleSendAnnouncement}
                      className="flex-[2] py-3 bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-md shadow-brand/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                    >
                      {isSendingAnnouncement ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={17} /> {editingAnnouncementId ? 'Simpan Perubahan' : 'Kirim Pengumuman'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {isImportModalOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, y: 16, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 16, opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl shadow-slate-900/20"
                >
                  <div className="p-6 md:p-7 pb-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 dark:bg-blue-900/30 border border-brand/20 dark:border-blue-800/60 rounded-2xl text-brand dark:text-blue-400">
                          <Users size={22} />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tambah Siswa</h3>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kelola data peserta didik</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsImportModalOpen(false)}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-700">
                      <button 
                        onClick={() => setImportModalTab('manual')}
                        className={cn(
                          "flex-1 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300",
                          importModalTab === 'manual' ? "bg-gradient-to-r from-brand to-blue-600 text-white shadow-sm shadow-brand/20" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        Input Manual
                      </button>
                      <button 
                        onClick={() => setImportModalTab('excel')}
                        className={cn(
                          "flex-1 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300",
                          importModalTab === 'excel' ? "bg-gradient-to-r from-brand to-blue-600 text-white shadow-sm shadow-brand/20" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        Impor Excel
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-7 pt-0">
                    {importModalTab === 'manual' ? (
                      <form onSubmit={handleAddStudentManual} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">NISN (Nomor Induk Nasional)</label>
                            <input 
                              type="text" 
                              value={manualStudentNis}
                              onChange={(e) => setManualStudentNis(e.target.value)}
                              placeholder="Contoh: 2021001" 
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                            <input 
                              type="text" 
                              value={manualStudentKelas}
                              onChange={(e) => setManualStudentKelas(e.target.value)}
                              placeholder="Contoh: 7A, 8B" 
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Nama Lengkap Siswa</label>
                          <input 
                            type="text" 
                            value={manualStudentNama}
                            onChange={(e) => setManualStudentNama(e.target.value)}
                            placeholder="Masukkan Nama Lengkap" 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Jenis Kelamin</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              type="button"
                              onClick={() => setManualStudentJenisKelamin('L')}
                              className={cn(
                                "py-3 rounded-xl border font-bold text-sm transition-all duration-300",
                                manualStudentJenisKelamin === 'L' 
                                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-brand dark:text-blue-400 shadow-xs" 
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              Laki-laki
                            </button>
                            <button 
                              type="button"
                              onClick={() => setManualStudentJenisKelamin('P')}
                              className={cn(
                                "py-3 rounded-xl border font-bold text-sm transition-all duration-300",
                                manualStudentJenisKelamin === 'P' 
                                  ? "bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 shadow-xs" 
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              Perempuan
                            </button>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isAddingStudent}
                          className="w-full py-3.5 bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-base shadow-lg shadow-brand/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                          {isAddingStudent ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Plus size={19} /> Tambahkan Siswa
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-7 bg-slate-50/90 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-brand dark:text-blue-400 mb-4 shadow-xs">
                            <Database size={28} />
                          </div>
                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Impor Data Excel</h4>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mb-5">
                            Gunakan format kolom: <br/> 
                            <span className="text-brand dark:text-blue-400 font-extrabold">NISN | Nama | L/P | Kelas</span>
                          </p>
                          
                          <label className="w-full cursor-pointer">
                            <input 
                              type="file" 
                              accept=".xlsx, .xls" 
                              onChange={handleExcelUpload} 
                              className="hidden" 
                            />
                            <div className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 flex items-center justify-center gap-2 shadow-xs">
                              <Plus size={18} /> Pilih File Excel
                            </div>
                          </label>
                        </div>
                        
                        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
                          <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/60 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                            <Info size={12} />
                          </div>
                          <p className="text-[11px] font-semibold text-amber-900/80 dark:text-amber-200/90 leading-relaxed">
                            Pastikan file excel Anda memiliki baris judul (header) dan data dimulai dari baris kedua.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {printingMaterialCourseId && (() => {
            const targetCourse = COURSES.find((c) => c.id === printingMaterialCourseId);
            if (!targetCourse) return null;
            return (
              <AdminMaterialPrintModal
                course={targetCourse}
                logoUrl={settingsConfig?.logoUrl || '/images/labkom_nesaka_logo.jpg'}
                onClose={() => setPrintingMaterialCourseId(null)}
              />
            );
          })()}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {!isAdmin && materialConfigs[activeCourse.id]?.isFullScreen && !isFullscreenActive && currentPage === 'course' && !showCompletionPopup && (
        <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white/10 border border-white/15 rounded-2xl flex items-center justify-center mb-6">
            <Maximize size={40} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Wajib Layar Penuh</h2>
          <p className="text-slate-300 max-w-md mb-8 leading-relaxed text-sm">
            Guru mewajibkan materi ini dikerjakan dalam mode layar penuh (Fullscreen) untuk menjaga fokus belajar. <br/><br/>
            <strong>Peringatan!</strong> Jika kamu keluar dari mode layar penuh saat mengerjakan materi, aktivitas ini akan tercatat di sistem guru.
          </p>
          <button 
            onClick={() => document.documentElement.requestFullscreen().catch(err => console.error(err))}
            className="px-7 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold shadow-lg transition-colors cursor-pointer"
          >
            Masuk Layar Penuh Sekarang
          </button>
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 300 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 transition-all duration-300",
          !isSidebarOpen && "pointer-events-none overflow-hidden"
        )}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              IK
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                {activeCourse.title}
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{activeCourse.level}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3.5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" size={15} />
            <input 
              type="text" 
              placeholder="Cari topik..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-sans"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
          {isAdmin && (
            <button 
              onClick={() => { setCurrentPage('admin'); setAdminTab('materials'); }} 
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 mb-3 font-bold text-xs transition-colors cursor-pointer"
            >
              <Home size={16} /> Kembali ke Dashboard
            </button>
          )}
          
          {currentPage !== 'course' && (
            <>
              <div className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-300 px-3">Modul Pembelajaran</div>
              <div className="px-3 mb-5">
                <select 
                    value={activeCourseId} 
                    onChange={(e) => setActiveCourseId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl focus:ring-brand focus:border-brand block p-2.5 transition-colors cursor-pointer"
                  >
                    {COURSES.map(course => (
                      <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
                    ))}
                  </select>
                </div>
            </>
          )}
            
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1.5">Daftar Topik</div>
            {filteredTopics.map((topic, index) => {
              const Icon = ICON_MAP[topic.icon] || Code;
              const isActive = topic.id === activeTopicId;
              const isCompleted = passedQuizzes[topic.id];
              
              // Gatekeeping evaluation
              const isGatekeepingEnabled = materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true;
              let isLocked = false;
              if (isGatekeepingEnabled && !isAdmin) {
                for (let i = 0; i < index; i++) {
                  if (!passedQuizzes[activeCourse.topics[i].id]) {
                    isLocked = true;
                    break;
                  }
                }
              }

              return (
                <button
                  key={topic.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    setActiveTopicId(topic.id);
                    setCurrentPage('course');
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 group text-left cursor-pointer",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/70" 
                      : isCompleted
                        ? "bg-emerald-50/70 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                    isLocked && "opacity-45 grayscale cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-[11px] font-mono font-bold shrink-0 tabular-nums",
                    isActive ? "bg-brand text-white" : isCompleted ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}>
                    {isCompleted ? "✓" : isLocked ? <Lock size={11} /> : String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{topic.title}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Course Progress */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 tabular-nums">
            <div className="flex justify-between text-xs mb-2 font-bold">
              <span className="text-slate-500 dark:text-slate-400">Progres Belajar</span>
              <span className="text-brand dark:text-blue-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="bg-brand h-full rounded-full" 
              />
            </div>
          </div>
        </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 md:px-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 sticky top-0 gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
                >
                  <Menu size={19} />
                </button>
              )}
              <div className="flex items-center gap-2 text-xs md:text-sm min-w-0 tabular-nums">
                <span className="text-slate-500 dark:text-slate-400 font-medium hidden lg:block whitespace-nowrap">{activeCourse.title}</span>
                <span className="text-slate-300 dark:text-slate-700 hidden lg:block">/</span>
                <span className="text-slate-900 dark:text-white font-extrabold truncate">{currentIndex + 1}. {activeTopic.title}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 shrink-0 tabular-nums">
              <div className="flex items-center gap-2">
                {topicTimeRemaining !== null && topicTimeRemaining > 0 && !isAdmin && viewMode === 'material' && (
                  <div className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 rounded-xl flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                    <Clock size={14} />
                    <span className="text-[11px] font-semibold hidden sm:inline">Baca:</span>
                    <span className="font-mono font-bold text-xs md:text-sm">{topicTimeRemaining}s</span>
                  </div>
                )}
                {quizTimeRemaining !== null && quizTimeRemaining > 0 && !isAdmin && viewMode === 'quiz' && (
                  <div className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 rounded-xl flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Clock size={14} />
                    <span className="text-[11px] font-semibold hidden sm:inline">Waktu Kuis:</span>
                    <span className="font-mono font-bold text-xs md:text-sm">{quizTimeRemaining}s</span>
                  </div>
                )}
                {(isAdmin || (materialConfigs[activeCourse.id]?.isScoreVisible ?? true)) && (
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5">
                     <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                       Skor{isAdmin && materialConfigs[activeCourse.id]?.isScoreVisible === false ? ' (Tersembunyi)' : ':'}
                     </span>
                     <span className={cn("font-mono font-extrabold text-xs md:text-sm", currentScore >= 80 ? "text-emerald-700 dark:text-emerald-400" : currentScore >= 60 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400")}>
                        {currentScore}
                     </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                aria-label={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {viewMode === 'material' && (
                <button 
                  onClick={() => {
                    const nextTopic = activeCourse.topics[currentIndex + 1];
                    const gatekeepingEnabled = materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true;
                    const canProceed = gatekeepingEnabled ? passedQuizzes[activeTopicId] : true;
                    if (nextTopic && (canProceed || isAdmin)) {
                      handleNextTopic(false);
                    }
                  }}
                  disabled={
                    (currentIndex === activeCourse.topics.length - 1 && passedQuizzes[activeTopicId]) || 
                    (!isAdmin && (materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true) && !passedQuizzes[activeTopicId])
                  }
                  className="hidden md:inline-flex px-4 py-2 text-xs font-bold bg-brand hover:bg-brand-hover text-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:grayscale disabled:pointer-events-none"
                >
                  {passedQuizzes[activeTopicId] ? 'Lanjut Materi' : 'Selesaikan Kuis'}
                </button>
              )}
            </div>
          </header>


        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={cn(
            "max-w-4xl mx-auto px-4 md:px-8 transition-all duration-300",
            viewMode === 'quiz' ? "py-6 md:py-8" : "py-6 md:py-10"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTopicId}-${viewMode}`}
                initial={{ opacity: 0, x: viewMode === 'quiz' ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewMode === 'quiz' ? -16 : 16 }}
                transition={{ duration: 0.2 }}
                className="markdown-body bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xs"
              >
                {viewMode === 'material' ? (
                    <>
                      {courseCompleted ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 md:p-10 text-center flex flex-col items-center"
                        >
                          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle size={40} />
                          </div>
                          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Selamat!</h2>
                          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-7">Anda telah menyelesaikan seluruh topik pada materi ini.</p>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 w-full max-w-sm tabular-nums">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Skor Akhir Anda</p>
                            <p className={cn(
                              "text-6xl font-black font-mono mb-3",
                              currentScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : currentScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                              {currentScore}
                            </p>
                            
                            {startTime && completionTime && (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">Waktu Pengerjaan:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {(() => {
                                    const totalSeconds = Math.floor((completionTime - startTime) / 1000);
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = totalSeconds % 60;
                                    return `${minutes}m ${seconds}s`;
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              updateSessionStatus(activeCourse.id, 'finished').catch(console.error);
                              setLocalCheatingAttempts(0);
                              setLocalCheatingDetails([]);
                              setCurrentPage('student_dashboard');
                            }}
                            className="bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl font-bold transition-colors flex items-center gap-2.5 cursor-pointer"
                          >
                            <Home size={18} />
                            Kembali ke Dashboard
                          </button>
                        </motion.div>
                      ) : (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 mt-8">{children}</h3>
                              ),
                              p: ({ node, children }: any) => {
                                const hasBlockChild = node?.children?.some(
                                  (c: any) => c.tagName === 'img' || (c.type === 'element' && (c.tagName === 'img' || c.tagName === 'figure' || c.tagName === 'div'))
                                );
                                if (hasBlockChild) {
                                  return (
                                    <div className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed mb-6">
                                      {children}
                                    </div>
                                  );
                                }
                                return (
                                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed mb-6">
                                    {children}
                                  </p>
                                );
                              },
                              img: ({ src, alt, ...props }: any) => {
                                const resolvedSrc = resolveCourseImageUrl(src);
                                const fallbackSrc = getPublicFallbackImageUrl(src);
                                return (
                                  <figure className="my-8 w-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md group">
                                    <div className="relative w-full overflow-hidden bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center p-2 md:p-3">
                                      <img
                                        src={resolvedSrc}
                                        alt={alt || "Ilustrasi Visual Materi"}
                                        referrerPolicy="no-referrer"
                                        loading="eager"
                                        decoding="async"
                                        onError={(e) => {
                                          const img = e.currentTarget;
                                          if (img.dataset.fallbackApplied !== '1' && fallbackSrc && img.getAttribute('src') !== fallbackSrc) {
                                            img.dataset.fallbackApplied = '1';
                                            img.src = fallbackSrc;
                                          }
                                        }}
                                        className="w-full h-auto object-contain rounded-xl md:rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                                        {...props}
                                      />
                                    </div>
                                    {alt && (
                                      <figcaption className="px-5 py-3.5 bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                        <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                                          <ImageIcon size={16} className="text-brand dark:text-blue-400 shrink-0" /> {alt}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-brand dark:text-blue-300 bg-brand/10 dark:bg-blue-900/40 border border-brand/20 dark:border-blue-800/60 px-3 py-1 rounded-full">
                                          💡 Ilustrasi Visual Materi
                                        </span>
                                      </figcaption>
                                    )}
                                  </figure>
                                );
                              },
                              table: ({ children }: any) => (
                                <div className="my-6 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800/60">
                                  <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200 border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }: any) => (
                                <thead className="bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                  {children}
                                </thead>
                              ),
                              th: ({ children }: any) => (
                                <th className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{children}</th>
                              ),
                              td: ({ children }: any) => (
                                <td className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/80">{children}</td>
                              ),
                              ol: ({ children }) => (
                                <div className="grid grid-cols-1 gap-3 mb-8 list-decimal">{children}</div>
                              ),
                              ul: ({ children }) => (
                                <div className="grid grid-cols-1 gap-3 mb-8">{children}</div>
                              ),
                              li: ({ children, ...props }: any) => {
                                const isOrdered = props.node?.parent?.tagName === 'ol' || props.ordered;
                                const index = props.index !== undefined ? props.index : -1;
                                
                                  return (
                                    <div className="flex items-start gap-3 md:gap-3.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                                      <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-brand dark:text-blue-400 font-bold text-xs mt-0.5 tabular-nums">
                                        {isOrdered ? (index + 1) : "✓"}
                                      </div>
                                      <div className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed">{children}</div>
                                    </div>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <div className="mt-6 p-4 md:p-5 border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl flex items-start gap-3.5">
                                    <div className="w-8 h-8 flex-shrink-0 bg-brand rounded-lg flex items-center justify-center text-white mt-0.5">
                                      <Info size={16} />
                                    </div>
                                    <div className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                      {children}
                                    </div>
                                  </div>
                                ),
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const lang = match ? match[1] : '';
                                  const isScratch = lang === 'scratch';
                                  return !inline && match ? (
                                    <div className="my-6 md:my-8 rounded-2xl overflow-hidden shadow-md flex flex-col bg-slate-900 border border-transparent dark:border-slate-800">
                                      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                                          {isScratch ? 'Scratch Blocks' : `${lang || 'editor'}.code`}
                                        </span>
                                      </div>
                                      <div className="relative overflow-x-auto custom-scrollbar">
                                        <SyntaxHighlighter
                                          style={vscDarkPlus}
                                          language={isScratch ? 'javascript' : lang}
                                          PreTag="div"
                                          customStyle={{
                                            margin: 0,
                                            padding: '1rem 1.25rem',
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            background: 'transparent',
                                            minWidth: '100%'
                                          }}
                                          {...props}
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      </div>
                                      <div className="bg-slate-950 p-3 md:p-4 border-t border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                          {isScratch ? 'Eksekusi Balok Scratch' : 'Output Program'}
                                        </div>
                                        <div className="text-xs md:text-sm font-mono text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40">
                                          {isScratch ? 'Balok terhubung dan aktif di Stage Scratch... ✓' : 'Data diproses... ✓'}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <code className="font-mono text-brand dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 px-1.5 py-0.5 rounded text-[13px] md:text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {activeTopic.content}
                            </ReactMarkdown>

                            <div className="mt-10 md:mt-12 flex flex-col items-center">
                               <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl text-center w-full">
                              {currentIndex === activeCourse.topics.length - 1 && passedQuizzes[activeTopicId] ? (
                                <>
                                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">Kurikulum Selesai!</h3>
                                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-md mx-auto">Kamu telah menyelesaikan semua materi dan kuis. Klik tombol di bawah untuk melihat skor akhirmu.</p>
                                  <button 
                                    onClick={() => handleCourseCompletion()}
                                    className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto cursor-pointer text-sm"
                                  >
                                    <CheckCircle size={18} />
                                    Selesaikan & Lihat Skor
                                  </button>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">Siap untuk evaluasi?</h3>
                                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-md mx-auto">Selesaikan kuis singkat untuk memastikan pemahamanmu dan membuka topik berikutnya.</p>
                                  <button 
                                    onClick={() => setViewMode('quiz')}
                                      disabled={
                                      (() => {
                                        const config = materialConfigs[activeCourse.id];
                                        const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                                        const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                                        if (quizAvailableAt > 0 && quizAvailableAt < waitTime) {
                                          return topicTimeRemaining !== null && topicTimeRemaining > (waitTime - quizAvailableAt);
                                        }
                                        return topicTimeRemaining !== null && topicTimeRemaining > 0;
                                      })()
                                    }
                                    className="px-7 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto cursor-pointer text-sm tabular-nums disabled:opacity-45 disabled:grayscale disabled:pointer-events-none"
                                  >
                                    <Code size={18} />
                                    {(() => {
                                      const config = materialConfigs[activeCourse.id];
                                      const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                                      const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                                      const threshold = waitTime - quizAvailableAt;
                                      
                                      if (topicTimeRemaining !== null && topicTimeRemaining > threshold && threshold >= 0) {
                                        return `Tunggu ${topicTimeRemaining - threshold}s`;
                                      }
                                      return passedQuizzes[activeTopicId] ? 'Ulangi Kuis Materi' : 'Mulai Kuis Materi';
                                    })()}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                      /* Quiz Section */
                      <div className="quiz-container flex flex-col">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
                          <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-8 text-white shrink-0 z-10 border-b border-transparent dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4 tabular-nums">
                              <button 
                                onClick={() => {
                                  setViewMode('material');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <ChevronRight size={14} className="rotate-180" />
                                Kembali ke Materi
                              </button>
                              <div className="flex items-center gap-2">
                                {quizTimeRemaining !== null && quizTimeRemaining > 0 && !isAdmin && (
                                  <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-xs font-mono font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Clock size={12} />
                                    {quizTimeRemaining}s
                                  </span>
                                )}
                                <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-300 border border-slate-700">
                                  Soal {quizState.currentQuestionIndex + 1} / {activeTopic.quiz.length}
                                </span>
                              </div>
                            </div>
                            <h3 className="text-lg md:text-2xl font-extrabold leading-snug tracking-tight">
                              {activeTopic.quiz[quizState.currentQuestionIndex].question}
                            </h3>
                          </div>
                          
                          <div className="p-5 md:p-8 space-y-5 flex flex-col">
                            {/* Feedback & Action Section */}
                            <AnimatePresence mode="wait">
                              {quizState.selectedOption !== null && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.98 }}
                                  className="space-y-4 pb-5 border-b border-slate-100 dark:border-slate-800"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className={cn(
                                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold w-fit",
                                      quizState.isCorrect ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70" : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70"
                                    )}>
                                      {quizState.isCorrect ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                      <span>{quizState.isCorrect ? "Jawaban Benar!" : "Kurang Tepat"}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                      {quizState.isCorrect ? (
                                        quizState.currentQuestionIndex < activeTopic.quiz.length - 1 ? (
                                          <button 
                                            onClick={nextQuestion}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                          >
                                            Lanjut
                                            <ChevronRight size={16} />
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={() => handleNextTopic()}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                          >
                                            Materi Berikutnya
                                            <ChevronRight size={16} />
                                          </button>
                                        )
                                      ) : (
                                        <button 
                                          onClick={() => setQuizState({ ...quizState, selectedOption: null, isCorrect: null })}
                                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                        >
                                          <RotateCcw size={15} />
                                          Coba Lagi
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className={cn(
                                    "p-4 rounded-xl text-xs md:text-sm leading-relaxed font-medium border",
                                    quizState.isCorrect 
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200" 
                                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70 text-rose-900 dark:text-rose-200"
                                  )}>
                                    <span className="font-extrabold block mb-1 text-xs">
                                      {quizState.isCorrect ? "Pembahasan" : "Kunci & Pembahasan"}
                                    </span>
                                    {quizState.isCorrect 
                                      ? activeTopic.quiz[quizState.currentQuestionIndex].explanation
                                      : `Kunci Jawaban: ${String.fromCharCode(65 + activeTopic.quiz[quizState.currentQuestionIndex].correctAnswer)}. ${activeTopic.quiz[quizState.currentQuestionIndex].explanation}`
                                    }
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="space-y-2.5">
                              {activeTopic.quiz[quizState.currentQuestionIndex].options.map((option, idx) => {
                                const isSelected = quizState.selectedOption === idx;
                                const isCorrect = idx === activeTopic.quiz[quizState.currentQuestionIndex].correctAnswer;
                                const showResult = quizState.selectedOption !== null;

                                return (
                                  <button
                                    key={idx}
                                    disabled={showResult}
                                    onClick={() => handleAnswer(idx)}
                                    className={cn(
                                      "w-full text-left p-3.5 md:p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer",
                                      !showResult 
                                        ? "border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-800 dark:text-slate-100 group" 
                                        : isCorrect 
                                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200" 
                                          : isSelected 
                                            ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200" 
                                            : "border-slate-200 dark:border-slate-800 opacity-50"
                                    )}>
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shrink-0",
                                      !showResult 
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-brand group-hover:text-white" 
                                        : isCorrect 
                                          ? "bg-emerald-600 text-white" 
                                          : isSelected 
                                            ? "bg-rose-600 text-white" 
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                    )}>
                                      {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="font-semibold text-sm md:text-base">{option}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {viewMode === 'material' && (
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <LessonNavButton 
                            topics={activeCourse.topics} 
                            currentId={activeTopicId} 
                            direction="prev" 
                            onClick={setActiveTopicId} 
                          />
                          <button
                            onClick={() => {
                              const nextTopic = activeCourse.topics[currentIndex + 1];
                              const gatekeepingEnabled = materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true;
                              const canProceed = gatekeepingEnabled ? passedQuizzes[activeTopicId] : true;
                              if (nextTopic && (canProceed || isAdmin)) {
                                handleNextTopic(false);
                              } else if (!nextTopic && (canProceed || isAdmin)) {
                                handleCourseCompletion();
                              }
                            }}
                            disabled={
                              (!isAdmin && (materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true) && !passedQuizzes[activeTopicId])
                            }
                            className="flex-1 w-full sm:w-auto p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-all group flex flex-col items-end text-right hover:border-brand/40 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 cursor-pointer disabled:opacity-45 disabled:grayscale disabled:pointer-events-none"
                          >
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                              {currentIndex === activeCourse.topics.length - 1 
                                ? (passedQuizzes[activeTopicId] ? 'Kurikulum Selesai' : 'Selesaikan Kuis Terakhir')
                                : (passedQuizzes[activeTopicId] ? 'Topik Selanjutnya' : 'Selesaikan Kuis')}
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold group-hover:text-brand dark:group-hover:text-blue-400 transition-colors text-base">
                              {currentIndex === activeCourse.topics.length - 1
                                ? (passedQuizzes[activeTopicId] ? 'Klik untuk Selesaikan' : 'Kuis belum dikerjakan')
                                : (passedQuizzes[activeTopicId] ? activeCourse.topics[currentIndex + 1].title : 'Kuis belum dikerjakan')}
                            </span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
            </div>
          </div>

          {/* Sticky Mobile Navigation Bar */}
          {viewMode === 'material' && !courseCompleted && (
            <div className="md:hidden sticky bottom-0 left-0 right-0 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 z-20">
              <button 
                onClick={() => {
                  const prevIndex = currentIndex - 1;
                  if (prevIndex >= 0) {
                    const prevTopic = activeCourse.topics[prevIndex];
                    setActiveTopicId(prevTopic.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentIndex === 0}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl disabled:opacity-35"
              >
                <ChevronRight className="rotate-180" size={20} />
              </button>

              <button 
                onClick={() => {
                  const nextTopic = activeCourse.topics[currentIndex + 1];
                  const gatekeepingEnabled = materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true;
                  const canProceed = gatekeepingEnabled ? passedQuizzes[activeTopicId] : true;
                  
                  if (!canProceed && !isAdmin) {
                    const config = materialConfigs[activeCourse.id];
                    const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                    const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                    const threshold = waitTime - quizAvailableAt;
                    const isAvailable = topicTimeRemaining === null || topicTimeRemaining <= Math.max(0, threshold);

                    if (isAvailable) {
                      setViewMode('quiz');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  } else if (nextTopic && (canProceed || isAdmin)) {
                    handleNextTopic(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    handleCourseCompletion();
                  }
                }}
                disabled={
                  (!isAdmin && (materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true) && !passedQuizzes[activeTopicId] && (() => {
                    const config = materialConfigs[activeCourse.id];
                    const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                    const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                    const threshold = waitTime - quizAvailableAt;
                    return topicTimeRemaining !== null && topicTimeRemaining > Math.max(0, threshold);
                  })())
                }
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-brand flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {passedQuizzes[activeTopicId] 
                  ? (currentIndex === activeCourse.topics.length - 1 ? 'Selesai' : 'Lanjut') 
                  : (() => {
                      const config = materialConfigs[activeCourse.id];
                      const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                      const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                      const threshold = waitTime - quizAvailableAt;
                      const diff = topicTimeRemaining !== null ? (topicTimeRemaining - threshold) : 0;
                      
                      if (topicTimeRemaining !== null && diff > 0) {
                        return `Tunggu ${diff}s`;
                      }
                      return 'Mulai Kuis';
                    })()
                }
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>


        <AnimatePresence>
          {showCompletionPopup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl text-center"
              >
                <div className="bg-brand p-8 text-white">
                  <div className="w-16 h-16 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight mb-1">Luar Biasa!</h3>
                  <p className="text-blue-100 text-sm font-medium">
                    Kamu telah menyelesaikan seluruh materi
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 tabular-nums">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Skor Akhir Kamu</p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className={cn(
                        "text-6xl font-black font-mono",
                        currentScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : currentScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {currentScore}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Poin</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      updateSessionStatus(activeCourse.id, 'finished').catch(console.error);
                      setLocalCheatingAttempts(0);
                      setLocalCheatingDetails([]);
                      setShowCompletionPopup(false);
                      setCurrentPage('student_dashboard');
                    }}
                    className="w-full bg-brand hover:bg-brand-hover text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Home size={18} />
                    Kembali ke Dashboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        `}</style>
      </div>
    );
  }

  function LessonNavButton({ 
    topics, 
    currentId, 
    direction, 
    onClick 
  }: { 
    topics: Topic[], 
    currentId: string, 
    direction: 'prev' | 'next',
    onClick: (id: string) => void
  }) {
    const currentIndex = topics.findIndex(t => t.id === currentId);
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    const targetTopic = topics[targetIndex];

    if (!targetTopic) return <div className="flex-1" />;

    return (
      <button
        onClick={() => onClick(targetTopic.id)}
        className={cn(
          "flex-1 w-full sm:w-auto p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand/40 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all group flex flex-col cursor-pointer",
          direction === 'next' ? "items-end text-right" : "items-start text-left"
        )}
      >
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1">
          {direction === 'prev' ? 'Topik Sebelumnya' : 'Topik Selanjutnya'}
        </span>
        <span className="text-slate-900 dark:text-white font-extrabold group-hover:text-brand dark:group-hover:text-blue-400 transition-colors text-base">
          {targetTopic.title}
        </span>
      </button>
    );
  }
