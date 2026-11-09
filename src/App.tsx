/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { COURSES } from './constants';
import { Topic } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from './firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc, setDoc, query, where, onSnapshot, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';                
import Login from './components/Login';

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
  Gamepad2,
  Sparkles,
  Layers
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'admin' | 'course' | 'student_dashboard'>(() => {
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
  const [adminTab, setAdminTab] = useState<'dashboard' | 'student_management' | 'materials' | 'history' | 'assessments' | 'settings' | 'announcements'>('dashboard');
  const [studentSubTab, setStudentSubTab] = useState<'students' | 'classes'>('classes');
  const [students, setStudents] = useState<{id: string, nis: string, nama: string, jenisKelamin: string, kelas: string}[]>([]);
  const [materialConfigs, setMaterialConfigs] = useState<Record<string, {
    isActive: boolean; 
    isGatekeepingEnabled?: boolean; 
    isFullScreen?: boolean;
    topicTimers?: Record<string, number>;
    quizTimers?: Record<string, number>;
    quizAvailableAt?: Record<string, number>;
    totalCourseTimer?: number;
    defaultTopicTimer?: number;
    defaultQuizTimer?: number;
    defaultQuizAvailableAt?: number;
    useGlobalTimers?: boolean;
  }>>({});
  const [settingsConfig, setSettingsConfig] = useState<{logoUrl: string}>({ logoUrl: '' });
  const [localMaterialConfig, setLocalMaterialConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [editingMaterialConfigId, setEditingMaterialConfigId] = useState<string | null>(null);

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
  const [messageTargetStudent, setMessageTargetStudent] = useState<any>(null);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [assessmentNav, setAssessmentNav] = useState<{ course: string | null; kelas: string | null }>({
    course: null,
    kelas: null
  });
  const [assessmentSort, setAssessmentSort] = useState<'name' | 'time'>('name');
  const [dashboardClassFilter, setDashboardClassFilter] = useState<string>('all');

  const groupedClasses = useMemo(() => {
    const classMap: Record<string, number> = {};
    students.forEach(s => {
      classMap[s.kelas] = (classMap[s.kelas] || 0) + 1;
    });
    return classMap;
  }, [students]);

  const groupedAssessments = useMemo(() => {
    const data: Record<string, { title: string; classes: Record<string, { name: string; results: any[] }> }> = {};
    assessments.forEach(a => {
      if (!data[a.courseTitle]) {
        data[a.courseTitle] = { title: a.courseTitle, classes: {} };
      }
      if (!data[a.courseTitle].classes[a.studentKelas]) {
        data[a.courseTitle].classes[a.studentKelas] = { name: a.studentKelas, results: [] };
      }
      data[a.courseTitle].classes[a.studentKelas].results.push(a);
    });
    return data;
  }, [assessments]);

  useEffect(() => {
    if (assessmentNav.course && !groupedAssessments[assessmentNav.course]) {
      setAssessmentNav({ course: null, kelas: null });
    } else if (assessmentNav.course && assessmentNav.kelas && (!groupedAssessments[assessmentNav.course] || !groupedAssessments[assessmentNav.course].classes[assessmentNav.kelas])) {
      setAssessmentNav(prev => ({ ...prev, kelas: null }));
    }
  }, [groupedAssessments, assessmentNav]);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
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
    return students.filter(s => 
      s.nama.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.nis.includes(studentSearchQuery) ||
      s.kelas.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  }, [students, studentSearchQuery]);

  const sortedFilteredStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => a.nama.localeCompare(b.nama));
  }, [filteredStudents]);

  const [studentDetail, setStudentDetail] = useState<{student: any, score: number} | null>(null);
  
  const getStudentScore = (studentId: string) => {
    const studentAssessments = assessments.filter(a => a.studentId === studentId);
    if (studentAssessments.length === 0) return 0;
    const totalScore = studentAssessments.reduce((sum, a) => sum + Number(a.score), 0);
    return Math.round(totalScore / studentAssessments.length);
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
          const targetAssessments = assessments.filter(
            a => a.studentKelas === deleteAssessmentInfo.kelas && a.courseTitle === deleteAssessmentInfo.courseTitle
          );
          const promises = targetAssessments.map(a => deleteDoc(doc(db, 'assessments', a.id)));
          await Promise.all(promises);
        } else if (deleteAssessmentInfo?.isBulkCourse && deleteAssessmentInfo.courseTitle) {
          const targetAssessments = assessments.filter(
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
    try {
      await setDoc(doc(db, 'material_configs', editingMaterialConfigId), localMaterialConfig, { merge: true });
      // materialConfigs will be updated via onSnapshot
      setEditingMaterialConfigId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `material_configs/${editingMaterialConfigId}`);
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
        const assessmentId = `${currentStudent.id}_${activeCourse.id}`;
        const durationSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
        
        await setDoc(doc(db, 'assessments', assessmentId), {
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          studentKelas: currentStudent.kelas,
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
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
          score: scoreToSave,
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

    // 1. Material Configs (Global)
    const unsubConfigs = onSnapshot(collection(db, 'material_configs'), (snapshot) => {
      const configs: any = {};
      snapshot.docs.forEach(doc => {
        configs[doc.id] = doc.data();
      });
      setMaterialConfigs(configs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'material_configs');
    });
    unsubscribes.push(unsubConfigs);

    const unsubSettings = onSnapshot(doc(db, 'app_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettingsConfig(docSnap.data() as {logoUrl: string});
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

    // Admin Data
    if (isAdmin) {
      // 2. All Assessments (Admin)
      const unsubAllAssessments = onSnapshot(collection(db, 'assessments'), (snapshot) => {
        setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assessments');
      });
      unsubscribes.push(unsubAllAssessments);

      // Active Sessions (Admin)
      const unsubActiveSessions = onSnapshot(collection(db, 'active_sessions'), (snapshot) => {
        setActiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'active_sessions');
      });
      unsubscribes.push(unsubActiveSessions);

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
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isAdmin, currentStudent]);

  const handleNotificationClick = async (notif: any) => {
    try {
      // Find student
      const student = students.find(s => s.id === notif.studentId);
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
    
    const currentStatus = materialConfigs[courseId]?.isActive ?? true;
    const newStatus = !currentStatus;
    
    setMaterialToggleTarget({ id: courseId, title: course.title, nextStatus: newStatus });
    setIsMaterialConfirmOpen(true);
  };

  const toggleMaterialFullScreen = async (courseId: string) => {
    try {
      const currentConfig = materialConfigs[courseId] || { isActive: true };
      await setDoc(doc(db, 'material_configs', courseId), {
        ...currentConfig,
        isFullScreen: !(currentConfig.isFullScreen ?? false)
      }, { merge: true });
    } catch (error) {
      console.error("Error toggling full screen:", error);
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
      await setDoc(doc(db, 'material_configs', id), { isActive: nextStatus }, { merge: true });
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
        kelas: manualStudentKelas
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
        kelas: String(row[3] || '')
      })).filter(s => s.nis || s.nama);

      const addedStudents = [];
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
      await updateDoc(doc(db, 'students', editingStudentId!), editFormData);
      setEditingStudentId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${editingStudentId}`);
    }
  };

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-frame flex items-center justify-center p-4">
        <Login 
          setCurrentPage={setCurrentPage} 
          setIsAdmin={setIsAdmin}
          setCurrentStudent={setCurrentStudent}
          setCurrentScore={setCurrentScore}
          settingsConfig={settingsConfig}
        />
      </div>
    );
  }

  if (currentPage === 'student_dashboard') {
    const activeCoursesList = COURSES.filter(c => (materialConfigs[c.id]?.isActive ?? true));
    
    return (
      <div className="flex h-screen bg-slate-300 text-slate-900 flex-col overflow-hidden" style={{ fontFamily: 'Calibri, sans-serif' }}>
        {/* Mobile-friendly fixed header */}
        <header className="w-full bg-slate-100 px-4 md:px-8 py-4 border-b border-slate-300 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-slate-300 overflow-hidden bg-slate-200">
                <img src="/images/labkom_nesaka_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Profil Siswa</p>
                <h2 className="text-sm md:text-lg font-black text-slate-900 leading-none">{currentStudent?.nama}</h2>
             </div>
          </div>
          <button 
             onClick={async () => { 
                if (currentStudent) {
                  setCurrentPage('login');
                  setLocalCheatingAttempts(0);
                  setLocalCheatingDetails([]);
                  try {
                    for (const c of COURSES) {
                      await deleteDoc(doc(db, 'active_sessions', `${currentStudent.id}_${c.id}`)).catch(()=> {});
                    }
                  } catch(e) {}
                }

                setCurrentStudent(null); 
             }}
             className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-red-200"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 w-full max-w-5xl mx-auto custom-scrollbar">
          <div className="bg-slate-100 p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-300 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-3xl flex items-center justify-center p-2 shadow-md relative overflow-hidden border border-slate-300">
                <img src="/images/labkom_nesaka_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-[3px] border-slate-100 shadow-sm">
                <CheckCircle size={16} />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">{currentStudent?.nama}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="bg-slate-200 px-5 py-2 rounded-2xl text-sm md:text-base font-bold text-slate-700 tracking-wide border border-slate-300">NISN: <span className="text-slate-900">{currentStudent?.nis}</span></div>
                  <div className="bg-slate-200 px-5 py-2 rounded-2xl text-sm md:text-base font-bold text-slate-700 tracking-wide border border-slate-300">Kelas: <span className="text-slate-900">{currentStudent?.kelas}</span></div>
                  <div className={cn(
                    "px-5 py-2 rounded-2xl text-sm md:text-base font-black uppercase tracking-widest border",
                    currentStudent?.jenisKelamin === 'L' 
                      ? 'bg-blue-100 text-brand border-blue-200' 
                      : 'bg-pink-100 text-pink-700 border-pink-200'
                  )}>
                    {currentStudent?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 bg-blue-100/70 text-blue-900 rounded-[1.5rem] border border-blue-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/20 rounded-bl-full pointer-events-none" />
                <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-300 text-brand">
                  <Brain size={24} />
                </div>
                <p className="text-base md:text-xl font-bold tracking-tight leading-snug">Selamat datang kembali! Mari lanjutkan petualangan belajarmu hari ini.</p>
              </div>

              {announcements.filter(msg => {
                if (msg.isVisible === false) return false;
                if (msg.targetType === 'all') return true;
                if (msg.targetType === 'class' && msg.targetValue === currentStudent?.student_management?.kelas) return true;
                if (msg.targetType === 'class' && !currentStudent?.student_management?.kelas && msg.targetValue === currentStudent?.kelas) return true;
                if (msg.targetType === 'student' && msg.targetValue === currentStudent?.id) return true;
                return false;
              }).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Megaphone size={14} className="text-brand" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pengumuman Terbaru</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {announcements
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
                      })
                      .map((msg) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className="bg-slate-100 p-4 rounded-2xl border border-slate-300 shadow-sm flex items-start gap-4 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300 text-brand">
                            <Bell size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] md:text-xs font-black text-brand uppercase tracking-widest px-2 py-0.5 bg-brand/10 rounded-md">
                                {msg.targetType === 'all' ? '📢 Pengumuman' : msg.targetType === 'class' ? `🏫 Kelas ${msg.targetValue}` : '👤 Privat'}
                              </span>
                              <span className="text-[10px] md:text-xs font-bold text-slate-500">
                                {msg.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(msg.timestamp.toDate()) : ''}
                              </span>
                            </div>
                            <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed break-words">{msg.content}</p>
                            {msg.link && (
                              <a 
                                href={msg.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
                              >
                                {msg.link} <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 border border-slate-300 shadow-sm rounded-xl flex items-center justify-center text-brand">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Pilih Materi</h2>
                  <p className="text-slate-600 font-bold text-sm md:text-base mt-1">Lanjutkan progres belajar Anda</p>
                </div>
              </div>
              <div className="bg-slate-200 border border-slate-300 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black text-slate-700 hidden md:block tracking-widest uppercase">
                {activeCoursesList.length} Materi Aktif
              </div>
            </div>

            {activeCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {activeCoursesList.map((course, index) => {
                  const hasCompleted = studentAssessments.some(a => a.studentId === currentStudent?.id && a.courseId === course.id);
                  const studentAssessment = studentAssessments.find(a => a.studentId === currentStudent?.id && a.courseId === course.id);
                  const colors = [
                    { bg: "bg-brand", border: "border-blue-700", icon: "text-brand" },
                    { bg: "bg-brand", border: "border-blue-700", icon: "text-brand" },
                    { bg: "bg-blue-600", border: "border-brand", icon: "text-blue-600" },
                    { bg: "bg-brand", border: "border-indigo-700", icon: "text-brand" },
                    { bg: "bg-sky-600", border: "border-sky-700", icon: "text-sky-600" },
                    { bg: "bg-blue-700", border: "border-blue-800", icon: "text-blue-700" }
                  ];
                  const color = colors[index % colors.length];

                  return (
                  <motion.div 
                    whileHover={hasCompleted ? {} : { y: -6 }}
                    whileTap={hasCompleted ? {} : { scale: 0.98 }}
                    key={course.id} 
                    className={cn("group p-1 rounded-[2rem] border shadow-sm transition-all flex flex-col",
                      hasCompleted ? "bg-slate-200 border-slate-300 opacity-90 cursor-default" : cn(color.bg, color.border, "shadow-xl shadow-black/5 cursor-pointer")
                    )}
                    onClick={() => { 
                      if (!hasCompleted) {
                        setActiveCourseId(course.id); 
                        setCurrentPage('course'); 
                        updateSessionStatus(course.id, 'working');
                      }
                    }}
                  >
                    <div className={cn("flex-1 rounded-[1.8rem] p-6 transition-colors flex flex-col h-full",
                      hasCompleted ? "bg-slate-100" : "bg-white/10 group-hover:bg-white/20"
                    )}>
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mb-4 transition-transform", hasCompleted ? "bg-slate-200 border border-slate-300 shadow-slate-300/30" : "bg-slate-100 shadow-black/10 group-hover:scale-105")}>
                        <BookOpen size={24} className={hasCompleted ? "text-emerald-600" : color.icon} />
                      </div>
                      
                      <h3 className={cn("font-black text-lg md:text-xl leading-tight mb-2 transition-colors", hasCompleted ? "text-slate-900" : "text-white")}>{course.title}</h3>
                      <div className="flex items-center gap-2 mb-6">
                        <span className={cn("w-2 h-2 rounded-full", hasCompleted ? "bg-emerald-500" : "bg-yellow-400 animate-pulse")}></span>
                        <p className={cn("text-xs md:text-sm font-black uppercase tracking-widest", hasCompleted ? "text-slate-600" : "text-white/90")}>{course.level}</p>
                      </div>

                      <div className={cn("mt-auto flex items-center justify-between gap-2 font-black text-sm uppercase tracking-widest pt-5 border-t",
                        hasCompleted ? "border-slate-300" : "border-white/20"
                      )}>
                        {hasCompleted ? (
                           <div className="flex flex-col gap-2 w-full">
                              <span className="text-emerald-700 flex items-center gap-2 font-black"><CheckCircle size={18}/> SELESAI</span>
                              <span className={cn("px-4 py-1.5 rounded-xl text-xs md:text-sm font-black border", studentAssessment?.score >= 80 ? "text-emerald-800 bg-emerald-100 border-emerald-200" : studentAssessment?.score >= 60 ? "text-amber-800 bg-amber-100 border-amber-200" : "text-rose-800 bg-rose-100 border-rose-200")}>SKOR: {studentAssessment?.score}</span>
                           </div>
                        ) : (
                           <span className="text-white flex items-center gap-2 group-hover:gap-3 transition-all">MULAI BELAJAR <ArrowRight size={18} className="text-yellow-400 group-hover:translate-x-1 transition-transform" /></span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )})}
              </div>
            ) : (
              <div className="bg-slate-100 py-20 rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <Lock size={48} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Belum Ada Materi Aktif</h3>
                <p className="text-slate-600 font-semibold max-w-sm">Materi akan muncul di sini setelah administrator mengaktifkannya untuk Anda.</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center text-brand shadow-sm">
                <TrendingUp size={28} />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Riwayat Skor</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-100 border border-slate-300 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px] border-collapse">
                  <thead className="bg-slate-200 border-b-2 border-slate-300">
                    <tr className="text-sm font-black text-slate-700 uppercase tracking-widest text-left">
                      <th className="px-8 py-6">Materi Pembelajaran</th>
                      <th className="px-8 py-6 text-center">Hasil Skor</th>
                      <th className="px-8 py-6 text-right">Tanggal Selesai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentAssessments.length > 0 ? [...studentAssessments].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map((a) => (
                      <tr key={a.id} className="hover:bg-slate-200/80 transition-colors">
                        <td className="px-8 py-6 font-black text-slate-900 text-base md:text-lg">{a.courseTitle}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn(
                            "px-5 py-2 rounded-2xl font-black text-base md:text-lg border shadow-sm inline-block min-w-[70px]",
                            a.score >= 80 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : a.score >= 60 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-rose-100 text-rose-800 border-rose-200"
                          )}>
                            {a.score}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right text-slate-600 text-sm md:text-base font-bold">
                          {new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-bold text-lg italic">Belum ada riwayat pengerjaan materi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {studentAssessments.length > 0 ? [...studentAssessments].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map((a) => (
                <div key={a.id} className="bg-slate-100 p-5 rounded-3xl border border-slate-300 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 text-base leading-snug mb-1">{a.courseTitle}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                        <Calendar size={12} />
                        {new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-2xl font-black text-lg border shadow-sm shrink-0",
                      a.score >= 80 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : a.score >= 60 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-rose-100 text-rose-800 border-rose-200"
                    )}>
                      {a.score}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-slate-100 py-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-bold text-sm italic">
                  Belum ada riwayat pengerjaan materi.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === 'admin') {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'bg-brand/10 text-brand' },
      { id: 'student_management', label: 'Siswa & Kelas', icon: Users, color: 'bg-brand/10 text-brand' },
      { id: 'materials', label: 'Kelola Materi', icon: BookOpen, color: 'bg-brand/10 text-brand' },
      { id: 'assessments', label: 'Hasil Asesmen', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
      { id: 'history', label: 'Riwayat Akses', icon: GitBranch, color: 'bg-brand/10 text-brand' },
      { id: 'announcements', label: 'Pengumuman', icon: Megaphone, color: 'bg-brand/10 text-brand' },
      { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'bg-brand/10 text-brand' },
    ] as const;

    return (
      <div className="flex h-screen bg-slate-300 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-100 border-b border-slate-300 z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-slate-200 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden relative border border-slate-300">
              <img src="/images/labkom_nesaka_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">SMPN 1 Kawali</h2>
          </div>
          <button 
            onClick={() => setIsAdminSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Sidebar Backdrop (Mobile) */}
        <AnimatePresence>
          {isAdminSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsAdminSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-100 border-r border-slate-300 p-6 flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0",
          isAdminSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-200 w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden relative border border-slate-300">
                <img src="/images/labkom_nesaka_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">SMPN 1 KAWALI</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informatika</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAdminSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600"
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
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group",
                  adminTab === item.id 
                    ? "bg-brand text-white shadow-lg shadow-brand/20 lg:scale-[1.02] relative" 
                    : "text-slate-500 hover:bg-frame hover:text-brand"
                )}
              >
                {adminTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  adminTab === item.id ? "bg-white/20 text-white" : "bg-brand/10 text-brand"
                )}>
                  <item.icon size={16} />
                </div>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button 
              onClick={() => { setIsAdmin(false); setCurrentPage('login'); }} 
              className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 p-4 rounded-2xl transition-all font-bold text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut size={16} />
              </div>
              Logout Admin
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto w-full bg-frame">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500",
                menuItems.find(i => i.id === adminTab)?.color
              )}>
                {(() => {
                  const Icon = menuItems.find(i => i.id === adminTab)?.icon;
                  return Icon ? <Icon size={24} className="md:w-7 md:h-7" /> : null;
                })()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight lowercase first-letter:uppercase">
                  {adminTab === 'history' ? 'Aktivitas' : adminTab === 'student_management' ? 'Siswa & Kelas' : 
                   adminTab === 'materials' ? 'Kelola Materi' : adminTab === 'assessments' ? 'Hasil Asesmen' :
                   adminTab === 'announcements' ? 'Pengumuman' : adminTab === 'settings' ? 'Pengaturan' : adminTab}
                </h1>
                <p className="text-slate-400 font-bold text-sm tracking-tight capitalize">
                  Manajer sistem &bull; {adminTab}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all relative group"
                >
                  <Bell size={20} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform text-brand" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-100 ring-2 ring-red-500/20 px-1">
                      {notifications.length}
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
                        className="fixed inset-0 z-40 bg-slate-900/20 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] md:translate-x-0 md:translate-y-0 md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-96 bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 z-50 overflow-hidden origin-center md:origin-top-right"
                      >
                        <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-slate-200">
                          <h3 className="font-black text-slate-800 tracking-tight text-sm md:text-base">Notifikasi Baru</h3>
                          <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-1 rounded-lg uppercase tracking-wider">
                            {notifications.length} Pesan
                          </span>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                              {[...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => (
                                <div 
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className="p-4 hover:bg-frame transition-colors cursor-pointer group relative"
                                >
                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                      <TrendingUp size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="font-black text-slate-800 text-sm truncate">{notif.studentName}</p>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                          {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">
                                        Baru saja menyelesaikan <span className="text-slate-900">{notif.courseTitle}</span> dengan skor <span className="text-emerald-600 underline">{notif.score}</span>
                                      </p>
                                    </div>
                                    <button 
                                      onClick={(e) => deleteNotification(notif.id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all shrink-0"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-12 text-center">
                              <div className="w-16 h-16 bg-frame rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                <Bell size={32} />
                              </div>
                              <p className="text-slate-400 font-bold text-sm italic">Belum ada notifikasi baru.</p>
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 bg-frame/50 border-t border-slate-50">
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
                              className="w-full py-2.5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
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
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20 active:scale-95 transition-all"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Tambah Siswa</span>
                </button>
                {selectedStudentIds.length > 0 && (
                  <button 
                    onClick={() => { setDeleteType('student'); setDeleteTarget('selected'); setIsDeleteModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={18} /> <span className="hidden sm:inline">Hapus ({selectedStudentIds.length})</span>
                  </button>
                )}
              </div>
            )}
          </header>
          
          <div className={cn(
            "rounded-2xl transition-all",
            adminTab === 'dashboard' ? "" : "bg-slate-100 p-6 shadow-sm border border-slate-300"
          )}>
            {adminTab === 'dashboard' && (() => {
              const activeSessionList = activeSessions.filter(s => {
                if (!s.lastActive) return true;
                const lastActiveTime = s.lastActive?.toMillis ? s.lastActive.toMillis() : (s.lastActive.seconds * 1000);
                return (Date.now() - lastActiveTime) < 120000;
              });

              const cheatingSessionsList = activeSessions.filter(session => (session.cheatingAttempts || 0) > 0);
              const workingStudentsCount = activeSessionList.filter(s => s.courseTitle || s.status === 'working').length;
              const activeCourseCount = COURSES.filter(c => (materialConfigs[c.id]?.isActive ?? true)).length;
              
              const distinctClasses = Array.from(new Set(activeSessionList.map(s => s.kelas))).filter(Boolean).sort();
              const filteredClasses = dashboardClassFilter === 'all' 
                ? distinctClasses 
                : distinctClasses.filter(c => c === dashboardClassFilter);

              return (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Top Modern KPI Highlights Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <div className="relative overflow-hidden bg-slate-100 rounded-3xl p-6 border border-slate-300 shadow-sm hover:shadow-md transition-all group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                          <Radio size={22} className="text-yellow-400 animate-pulse" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 border border-blue-200">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                          Live Real-time
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{activeSessionList.length}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Siswa Aktif</p>
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>Terhubung ke sistem</span>
                        <span className="font-bold text-brand">{activeSessionList.length > 0 ? `${activeSessionList.length} Online` : 'Standby'}</span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden bg-slate-100 rounded-3xl p-6 border border-slate-300 shadow-sm hover:shadow-md transition-all group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                          <Activity size={22} className="text-yellow-400" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 border border-blue-200">
                          <Zap size={12} className="text-yellow-400" />
                          Progres
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{workingStudentsCount}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Sedang Mengerjakan</p>
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>Aktif di materi/kuis</span>
                        <span className="font-bold text-brand">{workingStudentsCount} Siswa</span>
                      </div>
                    </div>

                    {/* Card 3: Monitoring Kecurangan */}
                    <div className="relative overflow-hidden bg-slate-100 rounded-3xl p-6 border border-slate-300 shadow-sm hover:shadow-md transition-all group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all",
                          cheatingSessionsList.length > 0 
                            ? "bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-500/20" 
                            : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20"
                        )}>
                          {cheatingSessionsList.length > 0 ? <ShieldAlert size={22} className="animate-bounce" /> : <ShieldCheck size={22} />}
                        </div>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                          cheatingSessionsList.length > 0
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        )}>
                          {cheatingSessionsList.length > 0 ? '⚠️ Peringatan' : '🛡️ Aman'}
                        </span>
                      </div>
                      <h4 className={cn("text-3xl md:text-4xl font-black tracking-tight", cheatingSessionsList.length > 0 ? "text-rose-600" : "text-slate-900")}>
                        {cheatingSessionsList.length}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Monitoring Kecurangan</p>
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>Keluar fullscreen / tab</span>
                        <span className={cn("font-bold", cheatingSessionsList.length > 0 ? "text-rose-600" : "text-emerald-700")}>
                          {cheatingSessionsList.length > 0 ? `${cheatingSessionsList.length} Terdeteksi` : 'Tertib'}
                        </span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden bg-slate-100 rounded-3xl p-6 border border-slate-300 shadow-sm hover:shadow-md transition-all group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                          <Layers size={22} className="text-yellow-400" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 border border-blue-200">
                          <Sparkles size={12} className="text-yellow-400" />
                          Materi
                        </span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{activeCourseCount} <span className="text-lg text-slate-500 font-bold">/ {COURSES.length}</span></h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Status Materi Aktif</p>
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>Modul terbuka</span>
                        <span className="font-bold text-brand">{activeCourseCount} Siap Diakses</span>
                      </div>
                    </div>
                  </div>

                  {/* System Health / Setup Guide - Only show if issues detected */}
                  {/* System Health / Setup Guide - Removed Auth Check */}
                    <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-amber-900 mb-1">Peringatan: Sistem Autentikasi Belum Siap</h3>
                        <p className="text-amber-800 font-medium text-sm leading-relaxed">
                          Aplikasi mendeteksi bahwa <b>Anonymous Authentication</b> belum diaktifkan di Firebase Console. 
                          Ini akan menyebabkan siswa gagal login via NISN. Mohon aktifkan di: 
                          <br/>
                          <code className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 text-xs font-bold">Console &gt; Authentication &gt; Sign-in method &gt; Anonymous &gt; Enable</code>
                        </p>
                      </div>
                      <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
                      >
                        Buka Firebase Console
                      </a>
                    </div>
                  
                  {/* TOP SECTION: KARTU PARTICIPANT & MONITORING KECURANGAN SEJAJAR DI ATAS */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: KARTU PARTICIPANT */}
                    <div className="xl:col-span-7 bg-slate-100 rounded-[2.2rem] border border-slate-300 shadow-sm overflow-hidden flex flex-col transition-all">
                      {/* Vibrant Gradient Header */}
                      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 md:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                            <Users size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">Kartu Participant</h3>
                              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                            </div>
                            <p className="text-white/80 text-xs font-semibold mt-0.5">Pemantauan aktivitas siswa & kelas secara langsung</p>
                          </div>
                        </div>

                        {/* Total Aktif Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/25 shadow-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
                          <span className="text-sm font-black text-white tracking-wide">
                            Total Aktif: <span className="text-yellow-300 font-black">{activeSessionList.length}</span>
                          </span>
                        </div>
                      </div>

                      {/* Class Quick Filter Tabs */}
                      {distinctClasses.length > 0 && (
                        <div className="px-6 py-3 bg-slate-200/90 border-b border-slate-300 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0 mr-1">Filter Kelas:</span>
                          <button
                            onClick={() => setDashboardClassFilter('all')}
                            className={cn(
                              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                              dashboardClassFilter === 'all' 
                                ? "bg-brand text-white shadow-sm shadow-brand/30" 
                                : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
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
                                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                                  dashboardClassFilter === c 
                                    ? "bg-brand text-white shadow-sm shadow-indigo-600/30" 
                                    : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
                                )}
                              >
                                Kelas {c}
                                <span className={cn(
                                  "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                                  dashboardClassFilter === c ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                  {countInClass}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Participant Cards Container */}
                      <div className="p-6 space-y-6 max-h-[580px] overflow-y-auto custom-scrollbar">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((className, idx) => {
                            const workingInClass = activeSessionList
                              .filter(s => s.kelas === className)
                              .sort((a, b) => a.studentName.localeCompare(b.studentName));

                            const classThemes = [
                              { bg: "bg-blue-50/60", border: "border-blue-100", header: "text-blue-900", badge: "bg-blue-500 text-white", icon: "text-brand" },
                              { bg: "bg-indigo-50/60", border: "border-indigo-100", header: "text-indigo-900", badge: "bg-indigo-500 text-white", icon: "text-brand" },
                              { bg: "bg-sky-50/60", border: "border-sky-100", header: "text-sky-900", badge: "bg-sky-500 text-white", icon: "text-sky-600" },
                              { bg: "bg-emerald-50/60", border: "border-emerald-100", header: "text-emerald-900", badge: "bg-emerald-500 text-white", icon: "text-emerald-600" },
                              { bg: "bg-amber-50/60", border: "border-amber-100", header: "text-amber-900", badge: "bg-amber-500 text-white", icon: "text-amber-600" },
                              { bg: "bg-rose-50/60", border: "border-rose-100", header: "text-rose-900", badge: "bg-rose-500 text-white", icon: "text-rose-600" },
                            ];
                            const theme = classThemes[idx % classThemes.length];

                            return (
                              <div key={className} className={cn("rounded-2xl border p-4 transition-all shadow-xs", theme.bg, theme.border)}>
                                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-black/5">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider", theme.badge)}>
                                      Kelas {className}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">
                                      {workingInClass.length} Siswa Sedang Aktif
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                        className="bg-slate-200/70 border border-slate-300 hover:border-brand/40 p-3.5 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col gap-2.5 group"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-brand/20">
                                              {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-black text-slate-800 text-xs truncate group-hover:text-brand transition-colors" title={s.studentName}>
                                                {s.studentName}
                                              </p>
                                              <p className="text-[10px] font-bold text-slate-500">
                                                Kelas {s.kelas}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          {/* Score Tag */}
                                          <span className="px-2.5 py-1 rounded-lg font-black text-xs text-emerald-800 bg-emerald-100 border border-emerald-200 shrink-0 shadow-xs">
                                            Skor: {s.currentScore ?? 100}
                                          </span>
                                        </div>

                                        {/* Course and Activity Tag */}
                                        <div className="pt-2 border-t border-slate-300/80 flex items-center justify-between gap-2 text-xs">
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1 text-slate-700 bg-slate-300/80 px-2 py-1 rounded-lg border border-slate-300">
                                            <BookOpen size={13} className="text-brand shrink-0" />
                                            <span className="truncate font-semibold text-[11px]" title={s.courseTitle || 'Di Halaman Siswa'}>
                                              {s.courseTitle || 'Di Halaman Siswa'}
                                            </span>
                                          </div>

                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-brand mb-4 border border-blue-200 shadow-inner relative">
                              <Users size={36} />
                              <span className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping pointer-events-none" />
                            </div>
                            <h4 className="text-base font-black text-slate-800">Belum Ada Siswa yang Aktif</h4>
                            <p className="text-xs font-semibold text-slate-500 max-w-sm mt-1">
                              Ketika siswa login dan membuka materi pembelajaran, kartu aktivitas siswa akan otomatis tampil di sini secara real-time.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: MONITORING KECURANGAN */}
                    <div className="xl:col-span-5 bg-slate-100 rounded-[2.2rem] border border-slate-300 shadow-sm overflow-hidden flex flex-col transition-all">
                      {/* Vibrant Red Gradient Header */}
                      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-500 p-6 md:p-7 text-white flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                            <ShieldAlert size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">Monitoring Kecurangan</h3>
                            </div>
                            <p className="text-white/80 text-xs font-semibold mt-0.5">Deteksi keluar layar penuh & tab ujian</p>
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
                            className="px-3.5 py-2 bg-white/20 hover:bg-slate-100 text-white hover:text-red-600 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 backdrop-blur-md border border-white/30 shadow-xs active:scale-95"
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
                              className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-rose-950 text-sm">{session.studentName}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-200 text-rose-800">
                                      Kelas {session.kelas}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-rose-700 mt-0.5 flex items-center gap-1">
                                    <BookOpen size={12} className="text-rose-500" />
                                    {session.courseTitle || 'Materi'}
                                  </p>
                                </div>

                                <div className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 shadow-sm shadow-rose-500/20">
                                  <AlertTriangle size={12} />
                                  {session.cheatingAttempts}x Pelanggaran
                                </div>
                              </div>

                              {/* Details breakdown */}
                              {session.cheatingDetails && session.cheatingDetails.length > 0 && (
                                <div className="bg-slate-200/90 border border-rose-200 rounded-xl p-2.5 space-y-1 text-xs">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-1">Rincian Log Waktu:</p>
                                  <ul className="text-xs text-rose-900 font-medium space-y-1">
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
                                  className="text-xs flex items-center gap-1 px-3 py-1.5 text-rose-600 bg-slate-200 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all font-bold active:scale-95 shadow-xs"
                                >
                                  <Trash2 size={13} />
                                  Hapus Log Siswa
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 border border-emerald-200 shadow-inner">
                              <ShieldCheck size={36} />
                            </div>
                            <h4 className="text-base font-black text-slate-800">Ruang Ujian Aman & Tertib</h4>
                            <p className="text-xs font-semibold text-slate-500 max-w-xs mt-1">
                              Tidak ada aktivitas mencurigakan atau upaya keluar dari layar penuh yang terdeteksi pada siswa saat ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTION: STATUS AKTIVASI MATERI (MODERN COLORFUL SWITCHBOARD) */}
                  <div className="bg-slate-100 p-6 md:p-8 rounded-[2.2rem] border border-slate-300 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-5 border-b border-slate-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Status Aktivasi & Keamanan Materi</h3>
                          <p className="text-slate-500 font-semibold text-xs mt-0.5">Buka akses materi dan aktifkan proteksi mode layar penuh untuk ujian</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 rounded-2xl text-xs font-black tracking-widest uppercase bg-slate-200 text-slate-700 border border-slate-300">
                          {activeCourseCount} Dari {COURSES.length} Materi Terbuka
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {COURSES.map((course, index) => {
                        const isActive = materialConfigs[course.id]?.isActive ?? true;
                        const isFullScreen = materialConfigs[course.id]?.isFullScreen || false;

                        const courseColors = [
                          { bg: "hover:border-blue-400", banner: "from-blue-600 to-indigo-600", tag: "bg-blue-100 text-blue-800 border-blue-200", icon: "text-brand bg-blue-100" },
                          { bg: "hover:border-emerald-400", banner: "from-emerald-600 to-teal-600", tag: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "text-emerald-600 bg-emerald-100" },
                          { bg: "hover:border-purple-400", banner: "from-purple-600 to-violet-600", tag: "bg-purple-100 text-purple-800 border-purple-200", icon: "text-purple-600 bg-purple-100" },
                          { bg: "hover:border-rose-400", banner: "from-rose-600 to-pink-600", tag: "bg-rose-100 text-rose-800 border-rose-200", icon: "text-rose-600 bg-rose-100" },
                          { bg: "hover:border-amber-400", banner: "from-amber-500 to-yellow-600", tag: "bg-amber-100 text-amber-800 border-amber-200", icon: "text-amber-600 bg-amber-100" },
                          { bg: "hover:border-indigo-400", banner: "from-indigo-600 to-blue-700", tag: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: "text-brand bg-indigo-100" },
                          { bg: "hover:border-cyan-400", banner: "from-cyan-600 to-blue-600", tag: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: "text-cyan-600 bg-cyan-100" },
                          { bg: "hover:border-orange-400", banner: "from-orange-600 to-red-600", tag: "bg-orange-100 text-orange-800 border-orange-200", icon: "text-orange-600 bg-orange-100" }
                        ];
                        const theme = courseColors[index % courseColors.length];

                        return (
                          <div 
                            key={course.id} 
                            className={cn(
                              "bg-slate-200/80 border border-slate-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:bg-slate-200 hover:shadow-md",
                              theme.bg
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs", theme.icon)}>
                                  <BookOpen size={20} />
                                </div>
                                <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", theme.tag)}>
                                  {course.level}
                                </span>
                              </div>

                              <h4 className="font-black text-slate-800 text-sm leading-snug line-clamp-2" title={course.title}>
                                {course.title}
                              </h4>
                              <p className="text-[11px] font-bold text-slate-500 mt-1">
                                {course.topics.length} Topik Pembelajaran
                              </p>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-300">
                              {/* Toggle 1: Akses Materi */}
                              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-300 shadow-xs">
                                <div>
                                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Akses Siswa</span>
                                  <span className={cn("text-xs font-bold", isActive ? "text-emerald-700" : "text-slate-400")}>
                                    {isActive ? "✓ Terbuka" : "✕ Terkunci"}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => toggleMaterialActive(course.id)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    isActive ? "bg-emerald-600" : "bg-slate-300"
                                  )}
                                >
                                  <span 
                                    className={cn(
                                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-100 shadow-md ring-0 transition duration-200 ease-in-out",
                                      isActive ? "translate-x-5" : "translate-x-0"
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Toggle 2: Wajib Fullscreen */}
                              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-300 shadow-xs">
                                <div>
                                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Mode Ujian</span>
                                  <span className={cn("text-xs font-bold", isFullScreen ? "text-brand" : "text-slate-400")}>
                                    {isFullScreen ? "🔒 Fullscreen" : "🔓 Bebas"}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => toggleMaterialFullScreen(course.id)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    isFullScreen ? "bg-brand" : "bg-slate-300"
                                  )}
                                >
                                  <span 
                                    className={cn(
                                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-100 shadow-md ring-0 transition duration-200 ease-in-out",
                                      isFullScreen ? "translate-x-5" : "translate-x-0"
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
                <div className="flex bg-slate-200 p-1 rounded-xl border border-slate-300 shadow-sm w-fit">
                  <button
                    onClick={() => setStudentSubTab('classes')}
                    className={cn(
                      "px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2",
                      studentSubTab === 'classes' ? "bg-brand text-white shadow-md" : "text-slate-600 hover:bg-frame"
                    )}
                  >
                    <LayoutGrid size={18} />
                    Daftar Kelas
                  </button>
                  <button
                    onClick={() => setStudentSubTab('students')}
                    className={cn(
                      "px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2",
                      studentSubTab === 'students' ? "bg-brand text-white shadow-md" : "text-slate-600 hover:bg-frame"
                    )}
                  >
                    <Users size={18} />
                    Daftar Siswa
                  </button>
                </div>

                {studentSubTab === 'classes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {Object.entries(groupedClasses).sort((a, b) => a[0].localeCompare(b[0])).map(([className, studentCount], idx) => {
                      const colors = [
                        { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: "bg-blue-100", hover: "hover:border-blue-300" },
                        { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", icon: "bg-purple-100", hover: "hover:border-purple-300" },
                        { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: "bg-emerald-100", hover: "hover:border-emerald-300" },
                        { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: "bg-amber-100", hover: "hover:border-amber-300" },
                        { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", icon: "bg-rose-100", hover: "hover:border-rose-300" },
                        { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", icon: "bg-indigo-100", hover: "hover:border-indigo-300" },
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <motion.button 
                          whileHover={{ y: -4 }}
                          key={className}
                          className={cn(
                            "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group relative overflow-hidden shadow-sm",
                            color.bg, color.border, color.hover
                          )}
                          onClick={() => {
                            setStudentSubTab('students');
                            setStudentSearchQuery(className);
                          }}
                        >
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color.icon, color.text)}>
                            <Users size={28} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kelas {className}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("w-2 h-2 rounded-full animate-pulse", color.text.replace('text', 'bg'))}></span>
                              <p className={cn("font-bold text-sm", color.text)}>{studentCount} Siswa Terdaftar</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand transition-colors">
                            Lihat Detail <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={120} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {studentSubTab === 'students' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Cari NISN, Nama, atau Kelas..." 
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-frame border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedStudentIds.length > 0 && (
                          <button 
                            onClick={deleteSelectedStudents}
                            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-medium border border-red-100"
                          >
                            <Trash2 size={18} />
                            Hapus ({selectedStudentIds.length})
                          </button>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-xl transition-colors font-medium">
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
                    
                    <div className="overflow-x-auto rounded-3xl border border-slate-300 bg-slate-100 shadow-md mb-4">
                      <div className="min-w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-200 border-b border-slate-300 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                            <th className="px-6 py-4 w-10">
                              <input 
                                type="checkbox" 
                                checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                onChange={toggleSelectAll}
                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer w-4 h-4"
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
                        <tbody className="divide-y divide-slate-50">
                          {sortedFilteredStudents.length > 0 ? sortedFilteredStudents.map((s, index) => (
                            <tr key={s.id} className={cn(
                              "hover:bg-frame/80 transition-all group",
                              selectedStudentIds.includes(s.id) && "bg-brand/[0.02]"
                            )}>
                              <td className="px-6 py-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedStudentIds.includes(s.id)}
                                  onChange={() => toggleSelectStudent(s.id)}
                                  className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer w-4 h-4"
                                />
                              </td>
                              <td className="px-6 py-4 text-slate-300 font-mono text-xs">{index + 1}</td>
                              {editingStudentId === s.id ? (
                                <>
                                  <td className="p-2"><input value={editFormData.nis} onChange={e => setEditFormData({...editFormData, nis: e.target.value})} className="bg-frame border-slate-200 p-2 rounded-lg w-full outline-brand text-sm font-mono" /></td>
                                  <td className="p-2"><input value={editFormData.nama} onChange={e => setEditFormData({...editFormData, nama: e.target.value})} className="bg-frame border-slate-200 p-2 rounded-lg w-full outline-brand text-sm font-bold" /></td>
                                  <td className="p-2">
                                    <select value={editFormData.jenisKelamin} onChange={e => setEditFormData({...editFormData, jenisKelamin: e.target.value})} className="bg-frame border-slate-200 p-2 rounded-lg w-full outline-brand text-sm">
                                      <option value="L">Laki-laki (L)</option>
                                      <option value="P">Perempuan (P)</option>
                                    </select>
                                  </td>
                                  <td className="p-2"><input value={editFormData.kelas} onChange={e => setEditFormData({...editFormData, kelas: e.target.value})} className="bg-frame border-slate-200 p-2 rounded-lg w-full outline-brand text-sm uppercase" /></td>
                                  <td className="p-2 text-right whitespace-nowrap">
                                    <button onClick={saveEditStudent} className="text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all">Simpan</button>
                                    <button onClick={() => setEditingStudentId(null)} className="text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all ml-2">Batal</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4 text-slate-500 font-mono text-sm tracking-tight">{s.nis}</td>
                                  <td className="px-6 py-4">
                                    <button 
                                      onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                      className="text-left group/name"
                                    >
                                      <div className={cn("font-extrabold text-sm transition-colors", s.jenisKelamin === 'P' ? 'text-rose-600 group-hover/name:text-rose-700' : 'text-slate-800 group-hover/name:text-brand')}>
                                        {s.nama}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", s.jenisKelamin === 'L' ? 'bg-blue-400' : 'bg-rose-400')}></div>
                                        {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                      </div>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", 
                                      s.jenisKelamin === 'L' ? 'bg-blue-50 text-brand' : 'bg-rose-50 text-rose-600'
                                    )}>
                                      {s.jenisKelamin}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-frame flex items-center justify-center text-slate-400 text-[10px] font-bold border border-slate-100">
                                        {s.kelas.substring(0, 2)}
                                      </div>
                                      <span className="text-slate-700 font-bold text-sm tracking-tight">{s.kelas}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-x-4 group-hover:translate-x-0">
                                      <button 
                                        onClick={() => startEditStudent(s)} 
                                        className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                                        title="Edit Siswa"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => deleteStudent(s.id)} 
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Hapus Siswa"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => setStudentDetail({ student: s, score: getStudentScore(s.id) })}
                                        className="p-2 text-slate-400 hover:text-brand hover:bg-indigo-50 rounded-xl transition-all"
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
                                  <div className="w-20 h-20 bg-frame rounded-full flex items-center justify-center text-slate-200">
                                    <Users size={40} />
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-bold">Tidak ada siswa yang ditemukan</p>
                                    <p className="text-slate-300 text-sm">Coba kata kunci pencarian lain atau impor data baru.</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Horizontal scroll indicator for mobile */}
                  <div className="md:hidden flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                    <ArrowRight size={12} className="animate-pulse" /> geser tabel ke samping <ArrowRight size={12} className="animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
            
            {/* Student Detail Popup */}
            <AnimatePresence>
              {studentDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                    onClick={() => setStudentDetail(null)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-slate-100 rounded-[2.5rem] overflow-hidden max-w-md w-full shadow-2xl relative z-10 border border-slate-300"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className={cn(
                      "h-32 relative",
                      studentDetail.student.jenisKelamin === 'P' ? "bg-gradient-to-br from-rose-400 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-700"
                    )}>
                      <div className="absolute -bottom-12 left-8 p-1 bg-slate-100 rounded-3xl shadow-xl">
                        <div className={cn(
                          "w-24 h-24 rounded-[1.25rem] flex items-center justify-center text-white font-black text-4xl",
                          studentDetail.student.jenisKelamin === 'P' ? "bg-rose-500" : "bg-blue-600"
                        )}>
                          {studentDetail.student.nama.charAt(0)}
                        </div>
                      </div>
                      <button 
                        onClick={() => setStudentDetail(null)}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="px-8 pt-16 pb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 leading-tight">{studentDetail.student.nama}</h2>
                          <p className="text-slate-500 font-bold text-sm tracking-tight">{studentDetail.student.nis} • Kelas {studentDetail.student.student_management?.kelas || studentDetail.student.kelas}</p>
                        </div>
                        <div className="bg-brand/10 border border-brand/20 px-4 py-2 rounded-2xl text-center">
                          <p className="text-[10px] font-black text-brand uppercase tracking-widest leading-none mb-1">Total Nilai</p>
                          <p className="text-2xl font-black text-brand leading-none">{studentDetail.score}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Materi & Skor</p>
                        <div className="space-y-2 bg-slate-200 p-3 rounded-2xl max-h-48 overflow-y-auto">
                          {assessments.filter(a => a.studentId === studentDetail.student.id).length > 0 ? (
                            assessments.filter(a => a.studentId === studentDetail.student.id).map((a, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-100 rounded-xl border border-slate-300 shadow-sm">
                                <div className="min-w-0 flex-1 mr-3">
                                  <span className="text-xs font-bold text-slate-700 block truncate">{a.courseTitle}</span>
                                  {a.completedAt && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {new Date(a.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(a.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-xs font-black px-2 py-1 rounded-lg",
                                    a.score >= 80 ? "bg-emerald-100 text-emerald-700" : a.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                  )}>{a.score}</span>
                                  <button
                                    onClick={() => deleteAssessment({
                                      id: a.id,
                                      studentName: studentDetail.student.nama,
                                      courseTitle: a.courseTitle,
                                      score: a.score,
                                      kelas: studentDetail.student.kelas
                                    })}
                                    className="p-1.5 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-all"
                                    title="Hapus Nilai Asesmen Siswa Ini"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-4 italic">Belum ada materi yang diselesaikan.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-frame p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jenis Kelamin</p>
                          <p className="font-bold text-slate-700">{studentDetail.student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                        </div>
                        <div className="bg-frame p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Akun</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <p className="font-bold text-slate-700">Aktif</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button className="w-full bg-brand text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                          <History size={18} /> Lihat Log Aktivitas
                        </button>
                        <button 
                          onClick={() => setStudentDetail(null)} 
                          className="w-full bg-frame hover:bg-slate-100 text-slate-500 py-3 rounded-2xl font-bold text-sm transition-all"
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Pembelajaran Informatika</h2>
                  <p className="text-slate-600">Terbitkan materi agar dapat diakses oleh siswa di dashboard mereka.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {COURSES.map((course, index) => {
                    const isActive = materialConfigs[course.id]?.isActive ?? true;
                    const colorVariants = [
                      { bg: "bg-blue-100 border-blue-200 shadow-blue-500/10", text: "text-blue-900", badge: "bg-blue-200 text-blue-900" },
                      { bg: "bg-emerald-100 border-emerald-200 shadow-emerald-500/10", text: "text-emerald-900", badge: "bg-emerald-200 text-emerald-900" },
                      { bg: "bg-purple-100 border-purple-200 shadow-purple-500/10", text: "text-purple-900", badge: "bg-purple-200 text-purple-900" },
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
                        className={cn("p-6 border-2 rounded-2xl shadow-sm transition-all flex flex-col", variant.bg)}
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <h3 className={cn("font-bold text-xl leading-tight", variant.text)}>{course.title}</h3>
                          <div className={cn("p-2 rounded-xl shrink-0 shadow-sm", isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                            {isActive ? <CheckCircle size={20} /> : <X size={20} />}
                          </div>
                      </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2 flex-1">{course.description}</p>
                        <div className="flex gap-4 text-xs font-bold text-slate-600 mb-6 bg-slate-200/80 border border-slate-300 p-2 rounded-lg">
                          <span>{tM}m {tS}s materi</span>
                          <span>{qM}m {qS}s kuis</span>
                          <span>{availSeconds}s kuis ready</span>
                          {totalLimit > 0 && <span>{totalLimit}s total</span>}
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200/50 mt-auto flex-wrap">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest", isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                            {isActive ? 'Terbit' : 'Draft'}
                          </span>
                          <div className="flex-1"></div>
                          <button 
                            onClick={() => toggleMaterialActive(course.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95",
                              isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button 
                            onClick={() => setEditingMaterialConfigId(course.id)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                          >
                            <Settings size={14} />
                            Setelan
                          </button>
                          <button 
                            onClick={() => { setActiveCourseId(course.id); setCurrentPage('course'); }}
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                          >
                            <Eye size={14} />
                            Pratinjau
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {adminTab === 'assessments' && (
              <div className="space-y-6">
                {/* Header & Navigation */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAssessmentNav({ course: null, kelas: null })}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      assessmentNav.course ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "text-slate-300 pointer-events-none"
                    )}
                  >
                    <BookOpen size={20} />
                  </button>
                  {assessmentNav.course && <ChevronRight size={16} className="text-slate-400" />}
                  {assessmentNav.course && (
                    <button 
                      onClick={() => setAssessmentNav(prev => ({ ...prev, kelas: null }))}
                      className={cn(
                        "font-bold transition-colors",
                        assessmentNav.kelas ? "text-slate-500 hover:text-slate-700" : "text-slate-900"
                      )}
                    >
                      {assessmentNav.course}
                    </button>
                  )}
                  {assessmentNav.kelas && <ChevronRight size={16} className="text-slate-400" />}
                  {assessmentNav.kelas && (
                    <span className="font-bold text-slate-900">Kelas {assessmentNav.kelas}</span>
                  )}
                </div>

                {/* Content View */}
                {!assessmentNav.course ? (
                  /* 1. Course Cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(groupedAssessments).length > 0 ? Object.values(groupedAssessments).map((courseData) => {
                      const totalSubmissions = Object.values(courseData.classes).reduce((acc, c) => acc + c.results.length, 0);
                      const avgScore = totalSubmissions > 0 ? Math.round(Object.values(courseData.classes).reduce((acc, c) => acc + c.results.reduce((s, r) => s + r.score, 0), 0) / totalSubmissions) : 0;
                      
                      return (
                        <button 
                          key={courseData.title}
                          onClick={() => setAssessmentNav({ course: courseData.title, kelas: null })}
                          className="bg-slate-100 p-6 rounded-[2rem] border border-slate-300 text-left hover:border-brand/40 group hover:shadow-xl hover:shadow-brand/10 transition-all duration-500 flex flex-col relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen size={64} />
                          </div>
                          <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-sm">
                            <BookOpen size={28} />
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-brand transition-colors">{courseData.title}</h4>
                          
                          <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <span className="flex items-center gap-1.5 bg-slate-200 px-2 py-1 rounded-lg">
                                <Users size={12} className="text-brand" /> {Object.keys(courseData.classes).length} Kelas
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-200 px-2 py-1 rounded-lg">
                                <CheckCircle size={12} className="text-emerald-500" /> {totalSubmissions} Done
                              </span>
                            </div>

                            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rerata Skor</span>
                                <span className={cn(
                                  "text-lg font-black",
                                  avgScore >= 80 ? "text-emerald-600" : avgScore >= 60 ? "text-amber-600" : "text-rose-600"
                                )}>{avgScore}</span>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    }) : (
                      <div className="col-span-full py-20 bg-slate-200/50 rounded-[2.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                          <TrendingUp size={40} className="opacity-20" />
                        </div>
                        <p className="font-black text-lg tracking-tight mb-1">Belum Ada Data Asesmen</p>
                        <p className="text-sm font-bold opacity-60">Data akan muncul setelah siswa menyelesaikan kursus.</p>
                      </div>
                    )}
                  </div>
                ) : !assessmentNav.kelas ? (
                  /* 2. Class Cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assessmentNav.course && groupedAssessments[assessmentNav.course] ? Object.values(groupedAssessments[assessmentNav.course].classes).map((classData) => {
                      const submissions = classData.results.length;
                      const avgScore = submissions > 0 ? Math.round(classData.results.reduce((acc, r) => acc + r.score, 0) / submissions) : 0;

                      return (
                        <button 
                          key={classData.name}
                          onClick={() => setAssessmentNav({ ...assessmentNav, kelas: classData.name })}
                          className="bg-slate-100 p-6 rounded-[2rem] border border-slate-300 text-left hover:border-brand/40 group hover:shadow-xl hover:shadow-brand/5 transition-all duration-500 flex flex-col relative"
                        >
                          <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                            <Users size={24} />
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 mb-1">Kelas {classData.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                            <CheckCircle size={10} className="text-emerald-500" />
                            {submissions} Siswa Selesai
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nilai Rata-rata</span>
                              <span className={cn(
                                "text-lg font-black",
                                avgScore >= 80 ? "text-emerald-600" : avgScore >= 60 ? "text-amber-600" : "text-rose-600"
                              )}>{avgScore}</span>
                            </div>
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">
                                  {classData.name[0]}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                            <ChevronRight size={16} className="text-brand" />
                          </div>
                        </button>
                      );
                    }) : null}
                  </div>
                ) : (
                  /* 3. Student Score List */
                  <div className="space-y-4">
                    {/* Class Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(() => {
                        if (!assessmentNav.course || !assessmentNav.kelas) return null;
                        const classData = groupedAssessments[assessmentNav.course]?.classes?.[assessmentNav.kelas];
                        const completed = classData?.results.length || 0;
                        const studentsInClass = students.filter(s => s.kelas === assessmentNav.kelas).length;
                        const avgScore = completed > 0 ? Math.round(classData.results.reduce((acc, r) => acc + r.score, 0) / completed) : 0;

                        return (
                          <>
                            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 text-brand rounded-xl flex items-center justify-center">
                                <Users size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Partisipasi</p>
                                <p className="text-sm font-black text-slate-900">{completed} / {studentsInClass} Siswa</p>
                              </div>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rata-rata Kelas</p>
                                <p className="text-sm font-black text-slate-900">{avgScore} Poin</p>
                              </div>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 flex items-center gap-4">
                              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                <CheckCircle size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Materi</p>
                                <p className="text-sm font-black text-slate-900">{completed === studentsInClass ? 'Selesai Semua' : 'Dalam Proses'}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="bg-slate-100 rounded-3xl border border-slate-300 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-200/60 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-900">Daftar Nilai Siswa</h4>
                            <span className="bg-brand/10 text-brand text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Kelas {assessmentNav.kelas}</span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                            <BookOpen size={12} /> {assessmentNav.course}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex bg-slate-200 p-1 rounded-xl border border-slate-300 shadow-sm">
                            <button 
                              onClick={() => setAssessmentSort('time')}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                assessmentSort === 'time' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-600 hover:bg-slate-300"
                              )}
                            >
                              <Clock size={14} /> Teranyar
                            </button>
                            <button 
                              onClick={() => setAssessmentSort('name')}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                assessmentSort === 'name' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-600 hover:bg-slate-300"
                              )}
                            >
                              <Type size={14} /> Abjad
                            </button>
                          </div>

                          {groupedAssessments[assessmentNav.course]?.classes?.[assessmentNav.kelas]?.results?.length > 0 && (
                            <button 
                              onClick={() => deleteAssessment({
                                isBulkClass: true,
                                kelas: assessmentNav.kelas || undefined,
                                courseTitle: assessmentNav.course || undefined
                              })}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                              title="Hapus semua nilai asesmen siswa di kelas ini"
                            >
                              <Trash2 size={14} />
                              <span>Reset Kelas</span>
                            </button>
                          )}

                          <button 
                            onClick={() => setAssessmentNav(prev => ({ ...prev, kelas: null }))}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            Kembali
                          </button>
                        </div>
                      </div>

                      {(() => {
                        if (!assessmentNav.course || !assessmentNav.kelas) return null;
                        const classResults = groupedAssessments[assessmentNav.course]?.classes?.[assessmentNav.kelas]?.results || [];
                        const studentIdsWithResults = new Set(classResults.map(r => r.studentId));
                        
                        // Find students in this class who haven't completed this course
                        const missingStudents = students
                          .filter(s => s.kelas === assessmentNav.kelas && !studentIdsWithResults.has(s.id))
                          .map(s => ({
                            id: `missing-${s.id}`,
                            studentId: s.id,
                            studentName: s.nama,
                            score: -1, // Special value for UI
                            completedAt: null,
                            cheatingAttempts: 0,
                            isMissing: true
                          }));

                        const sortedList = [...classResults, ...missingStudents]
                          .sort((a, b) => {
                            if (assessmentSort === 'time') {
                              if (a.isMissing && b.isMissing) return a.studentName.localeCompare(b.studentName);
                              if (a.isMissing) return 1;
                              if (b.isMissing) return -1;
                              return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                            } else {
                              return a.studentName.localeCompare(b.studentName);
                            }
                          });

                        return (
                          <>
                            {/* Desktop View Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-left border-collapse border-spacing-0">
                                <thead>
                                  <tr className="bg-frame text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b-2 border-slate-200">
                                    <th className="p-4 pl-6 border-r border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        <span>Nama Siswa</span>
                                      </div>
                                    </th>
                                    <th className="p-4 text-center border-r border-slate-100">
                                      <div className="flex items-center justify-center gap-2">
                                        <TrendingUp size={14} className="text-slate-400" />
                                        <span>Skor</span>
                                      </div>
                                    </th>
                                    <th className="p-4 text-center border-r border-slate-100">
                                      <div className="flex items-center justify-center gap-2">
                                        <Megaphone size={14} className="text-slate-400" />
                                        <span>Potensi Curang</span>
                                      </div>
                                    </th>
                                    <th className="p-4 text-center border-r border-slate-100">
                                      <div className="flex items-center justify-center gap-2">
                                        <Timer size={14} className="text-slate-400" />
                                        <span>Durasi</span>
                                      </div>
                                    </th>
                                    <th className="p-4 text-center border-r border-slate-100">
                                      <div className="flex items-center justify-center gap-2">
                                        <Clock size={14} className="text-slate-400" />
                                        <span>Waktu Selesai</span>
                                      </div>
                                    </th>
                                    <th className="p-4 text-right pr-6">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {sortedList.map((res) => (
                                    <tr key={res.id} className={cn(
                                      "hover:bg-blue-50/30 transition-all group", 
                                      res.isMissing ? "bg-slate-200/50 font-medium" : "bg-slate-100"
                                    )}>
                                      <td className="p-4 pl-6 border-r border-slate-100/50">
                                        <div className="flex items-center gap-3">
                                          <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm",
                                            res.isMissing ? "bg-slate-200" : "bg-gradient-to-br from-brand to-brand-dark"
                                          )}>
                                            {res.studentName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className={cn("text-sm font-bold", res.isMissing ? "text-slate-400" : "text-slate-900")}>
                                              {res.studentName}
                                            </span>
                                            {res.isMissing && (
                                              <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-1 rounded border border-rose-100">Belum Selesai</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 text-center border-r border-slate-100/50">
                                        {res.isMissing ? (
                                          <div className="w-8 h-8 bg-slate-100/50 rounded-lg mx-auto flex items-center justify-center">
                                            <span className="text-slate-300 text-xs font-bold">-</span>
                                          </div>
                                        ) : (
                                          <div className={cn(
                                            "px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-sm",
                                            res.score >= 80 ? "bg-emerald-500 text-white" : res.score >= 60 ? "bg-amber-400 text-amber-900" : "bg-rose-500 text-white"
                                          )}>
                                            {res.score}
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-4 text-center border-r border-slate-100/50">
                                        {res.isMissing ? (
                                          <span className="text-slate-200">-</span>
                                        ) : res.cheatingAttempts > 0 ? (
                                          <div 
                                            title={res.cheatingDetails ? "Detail kecurangan:\n" + res.cheatingDetails.map((t: string) => parseCheatingDetail(t)).join('\n') : undefined} 
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 cursor-help shadow-sm"
                                          >
                                            <Megaphone size={10} />
                                            {res.cheatingAttempts}x Deteksi
                                          </div>
                                        ) : (
                                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-500 bg-emerald-50 border border-emerald-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Aman
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-4 text-center border-r border-slate-100/50">
                                        {res.isMissing ? (
                                          <span className="text-slate-200">-</span>
                                        ) : (
                                          <span className="text-xs font-black text-slate-700">
                                            {(() => {
                                              const totalSec = res.durationSeconds || 0;
                                              if (totalSec === 0) return "-";
                                              const m = Math.floor(totalSec / 60);
                                              const s = totalSec % 60;
                                              return `${m}m ${s}s`;
                                            })()}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-4 text-center border-r border-slate-100/50">
                                        {!res.isMissing && res.completedAt ? (
                                          <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-700">
                                              {new Date(res.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap uppercase tracking-tighter">
                                              {new Date(res.completedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-slate-200">-</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-right pr-6">
                                        {!res.isMissing && (
                                          <button 
                                            onClick={() => deleteAssessment({
                                              id: res.id,
                                              studentName: res.studentName,
                                              courseTitle: assessmentNav.course || undefined,
                                              score: res.score,
                                              kelas: assessmentNav.kelas || undefined
                                            })}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/80 rounded-xl transition-all shadow-sm active:scale-95 text-xs font-bold ml-auto"
                                            title="Hapus Nilai Asesmen"
                                          >
                                            <Trash2 size={14} />
                                            <span>Hapus</span>
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile View: Cards */}
                            <div className="block md:hidden divide-y divide-slate-200">
                              {sortedList.map((res) => (
                                <div key={res.id} className="p-4 bg-slate-100 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-white shadow-sm shrink-0",
                                        res.isMissing ? "bg-slate-200" : "bg-gradient-to-br from-brand to-brand-dark"
                                      )}>
                                        {res.studentName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                      </div>
                                      <div>
                                        <h5 className={cn("text-sm font-bold leading-tight", res.isMissing ? "text-slate-400" : "text-slate-900")}>
                                          {res.studentName}
                                        </h5>
                                        {res.isMissing ? (
                                          <span className="inline-block mt-0.5 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                            Belum Selesai
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-slate-400 font-medium">
                                            {res.completedAt ? new Date(res.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' • ' + new Date(res.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {!res.isMissing && (
                                      <div className={cn(
                                        "px-3 py-1 rounded-xl text-xs font-black shrink-0",
                                        res.score >= 80 ? "bg-emerald-500 text-white" : res.score >= 60 ? "bg-amber-400 text-amber-900" : "bg-rose-500 text-white"
                                      )}>
                                        {res.score}
                                      </div>
                                    )}
                                  </div>

                                  {!res.isMissing && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        {res.cheatingAttempts > 0 ? (
                                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            {res.cheatingAttempts}x Curang
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            Aman
                                          </span>
                                        )}
                                        {res.durationSeconds ? (
                                          <span className="text-[10px] font-bold text-slate-400">
                                            ⏱ {Math.floor(res.durationSeconds / 60)}m {res.durationSeconds % 60}s
                                          </span>
                                        ) : null}
                                      </div>
                                      <button 
                                        onClick={() => deleteAssessment({
                                          id: res.id,
                                          studentName: res.studentName,
                                          courseTitle: assessmentNav.course || undefined,
                                          score: res.score,
                                          kelas: assessmentNav.kelas || undefined
                                        })}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                      >
                                        <Trash2 size={13} />
                                        <span>Hapus Nilai</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
            {adminTab === 'history' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Riwayat Akses Siswa</h3>
                    <p className="text-sm text-slate-500">Memantau aktivitas login dan perangkat siswa secara real-time.</p>
                  </div>
                  <div className="bg-brand/10 px-4 py-2 rounded-xl border border-brand/20">
                    <p className="text-xs font-bold text-brand uppercase tracking-widest">Total {accessLogs.length} Aktivitas</p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-3xl border border-slate-300 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-200 border-b border-slate-300">
                          <th className="p-4 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa</th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu Akses</th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Alamat IP</th>
                          <th className="p-4 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Perangkat & Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {accessLogs.length > 0 ? (
                          [...accessLogs]
                            .sort((a, b) => {
                              const dateA = a.timestamp?.seconds || 0;
                              const dateB = b.timestamp?.seconds || 0;
                              return dateB - dateA;
                            })
                            .slice(0, 100)
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-slate-200/50 transition-colors">
                                <td className="p-4 pl-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                      <User size={14} />
                                    </div>
                                    <p className="font-bold text-slate-900">{log.studentName}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">
                                      {log.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(log.timestamp.toDate()) : '-'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {log.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(log.timestamp.toDate()) : '-'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-sm font-mono text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-slate-400" />
                                    {log.ip}
                                  </div>
                                </td>
                                <td className="p-4 pr-8">
                                  <p className="text-xs text-slate-500 max-w-xs truncate" title={log.device}>
                                    {log.device}
                                  </p>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400">
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
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Manajemen Pengumuman</h3>
                    <p className="text-sm text-slate-500">Kelola dan kirim pengumuman untuk siswa.</p>
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
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20 active:scale-95 transition-all"
                  >
                    <Plus size={18} /> <span className="hidden sm:inline">Buat Pengumuman</span>
                  </button>
                </div>

                <div className="bg-slate-100 rounded-3xl border border-slate-300 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-200 border-b border-slate-300">
                          <th className="p-4 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Isi Pengumuman</th>
                          <th className="p-4 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {announcements.length > 0 ? (
                          [...announcements]
                            .sort((a, b) => {
                              const dateA = a.timestamp?.seconds || 0;
                              const dateB = b.timestamp?.seconds || 0;
                              return dateB - dateA;
                            })
                            .map((ann) => (
                              <tr key={ann.id} className="hover:bg-slate-200/50 transition-colors">
                                <td className="p-4 pl-8">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">
                                      {ann.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(ann.timestamp.toDate()) : '-'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {ann.timestamp?.toDate() ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(ann.timestamp.toDate()) : '-'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-widest">
                                        {ann.targetType === 'all' ? 'Semua Siswa' : ann.targetType === 'class' ? `Kelas ${ann.targetValue}` : 'Siswa Spesifik'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                  <p className="max-w-md truncate" title={ann.content}>
                                    {ann.content}
                                  </p>
                                </td>
                                <td className="p-4 pr-8">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => toggleAnnouncementVisibility(ann.id, ann.isVisible !== false)}
                                      className={cn(
                                        "p-2 rounded-lg transition-colors flex items-center gap-1",
                                        ann.isVisible !== false ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                      )}
                                      title={ann.isVisible !== false ? "Sembunyikan dari siswa" : "Tampilkan ke siswa"}
                                    >
                                      {ann.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                      onClick={() => startEditAnnouncement(ann)}
                                      className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                                      title="Edit Pengumuman"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteAnnouncementAdmin(ann.id)}
                                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                            <td colSpan={4} className="p-12 text-center text-slate-400 font-semibold">
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
                    <h3 className="text-xl font-bold text-slate-800">Pengaturan Website</h3>
                    <p className="text-sm text-slate-500">Konfigurasi tampilan visual seperti logo dan nama instansi.</p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-3xl border border-slate-300 overflow-hidden shadow-sm p-6">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Upload Logo Sekolah</label>
                      <p className="text-xs text-slate-500 mb-4 shadow-sm">Disarankan menggunakan gambar berformat persegi, atau rasio aspek 1:1 transparan dengan format PNG/SVG. Maks 1MB.</p>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300 overflow-hidden relative shrink-0">
                          {settingsConfig.logoUrl ? (
                            <img src={settingsConfig.logoUrl} alt="Preview Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-400 text-xs font-bold px-2 text-center">Belum<br/>ada logo</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="logo-upload"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 1024 * 1024) {
                                alert("Ukuran gambar tidak boleh melebih 1MB.");
                                return;
                              }
                              
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64String = reader.result as string;
                                try {
                                  await setDoc(doc(db, 'app_settings', 'global'), { logoUrl: base64String }, { merge: true });
                                } catch (err) {
                                  handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <label 
                            htmlFor="logo-upload"
                            className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-slate-200 border border-slate-300 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-300 hover:text-brand transition-colors text-slate-700"
                          >
                            Pilih File Gambar
                          </label>
                          {settingsConfig.logoUrl && (
                            <button
                              onClick={async () => {
                                if (confirm('Apakah Anda yakin ingin menghapus logo ini?')) {
                                  try {
                                    await setDoc(doc(db, 'app_settings', 'global'), { logoUrl: '' }, { merge: true });
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.WRITE, 'app_settings/global');
                                  }
                                }
                              }}
                              className="block mt-2 text-xs font-bold text-red-500 hover:text-red-700"
                            >
                              Hapus Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {editingMaterialConfigId && localMaterialConfig && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-slate-100 rounded-[2.5rem] border border-slate-300 w-full max-w-2xl overflow-hidden shadow-2xl my-8"
                >
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black tracking-tight mb-1">Konfigurasi Materi</h3>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                        {COURSES.find(c => c.id === editingMaterialConfigId)?.title}
                      </p>
                    </div>
                    <button 
                      onClick={() => setEditingMaterialConfigId(null)}
                      className="p-3 hover:bg-white/10 rounded-2xl transition-colors relative z-10"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-8 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                      <div className="flex items-start justify-between p-6 bg-frame rounded-2xl border border-slate-200">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <Lock size={18} className={localMaterialConfig.isGatekeepingEnabled ? "text-indigo-500" : "text-slate-400"} />
                            Gatekeeping Bab
                          </h4>
                          <p className="text-sm text-slate-500 text-balance">
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
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Settings size={18} className="text-slate-500" />
                          Pengaturan Waktu (Detik)
                        </h4>
                        <div className="space-y-4">
                          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mb-8">
                            <h4 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                              <Timer size={18} className="text-emerald-500" />
                              Global Course Settings (Defaults)
                            </h4>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-100">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-emerald-900">Gunakan Waktu Global</span>
                                <span className="text-[10px] text-emerald-600">Jika aktif, sistem akan menggunakan timer global untuk bab yang tidak disetting manual.</span>
                              </div>
                              <button 
                                onClick={() => setLocalMaterialConfig({ ...localMaterialConfig, useGlobalTimers: !localMaterialConfig.useGlobalTimers })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-colors relative",
                                  localMaterialConfig.useGlobalTimers ? "bg-emerald-500" : "bg-slate-300"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                  localMaterialConfig.useGlobalTimers ? "right-1" : "left-1"
                                )} />
                              </button>
                            </div>

                            <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-opacity", !localMaterialConfig.useGlobalTimers && "opacity-50 pointer-events-none")}>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Waktu Tunggu Materi (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-slate-200 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  value={localMaterialConfig.defaultTopicTimer ?? 70}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultTopicTimer: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Waktu Keluar Kuis (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-slate-200 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  value={localMaterialConfig.defaultQuizAvailableAt ?? 40}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultQuizAvailableAt: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Timer Kuis (Detik)</label>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-full p-2.5 bg-slate-200 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  value={localMaterialConfig.defaultQuizTimer ?? 60}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalMaterialConfig({ ...localMaterialConfig, defaultQuizTimer: val });
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Minimal
                                  <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-900 cursor-not-allowed"
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
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Maksimal
                                  <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-900 cursor-not-allowed"
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
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1.5">
                                  Waktu Total Course
                                  <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded font-black text-[8px] uppercase">Auto</span>
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-900 cursor-not-allowed"
                                    value={(() => {
                                      const totalSec = localMaterialConfig.totalCourseTimer ?? 0;
                                      const m = Math.floor(totalSec / 60);
                                      const s = totalSec % 60;
                                      return `${m}m ${s}s (${totalSec} detik)`;
                                    })()}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Clock size={14} className="text-emerald-500" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-emerald-600 mt-4 font-medium italic">* Nilai global akan digunakan jika pengaturan per-bab tidak diisi atau 0.</p>
                          </div>

                          {COURSES.find(c => c.id === editingMaterialConfigId)?.topics.map(topic => (
                            <div key={topic.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-200/70 border border-slate-300 rounded-2xl hover:border-brand/40 transition-colors shadow-sm">
                              <div className="col-span-full mb-2 pb-2 border-b border-slate-50">
                                <span className="font-bold text-slate-800 text-sm">{topic.title}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Waktu Tunggu:</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-frame border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand focus:outline-none"
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
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Timer Kuis:</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-frame border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand focus:outline-none"
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
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Waktu Keluar Kuis (Detik):</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  className="w-20 p-2 bg-frame border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand focus:outline-none"
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

                  <div className="p-8 bg-frame flex items-center justify-end gap-4 border-t border-slate-100">
                    <button 
                      onClick={() => setEditingMaterialConfigId(null)}
                      className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={saveMaterialConfig}
                      disabled={isSavingConfig}
                      className="bg-brand text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                      {isSavingConfig ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-slate-100 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-300"
                >
                  <div className={cn(
                    "p-8 flex flex-col items-center text-center border-b",
                    materialToggleTarget.nextStatus ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-slate-200",
                      materialToggleTarget.nextStatus ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {materialToggleTarget.nextStatus ? <Globe size={32} /> : <Lock size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {materialToggleTarget.nextStatus ? 'Aktifkan Materi' : 'Nonaktifkan Materi'}
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Apakah Anda yakin ingin {materialToggleTarget.nextStatus ? 'menerbitkan' : 'menarik'} materi <span className="font-bold">"{materialToggleTarget.title}"</span>?
                      <br />
                      <span className="font-medium text-slate-500">
                        {materialToggleTarget.nextStatus 
                          ? 'Siswa akan dapat mengakses materi ini di dashboard mereka.' 
                          : 'Siswa tidak akan dapat lagi mengakses materi ini.'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-3">
                    <button 
                      onClick={confirmToggleMaterial}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-white",
                        materialToggleTarget.nextStatus ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                      )}
                    >
                      {materialToggleTarget.nextStatus ? <CheckCircle size={20} /> : <Lock size={20} />}
                      {materialToggleTarget.nextStatus ? 'Ya, Terbitkan Materi' : 'Ya, Nonaktifkan'}
                    </button>
                    
                    <button 
                      onClick={() => { setIsMaterialConfirmOpen(false); setMaterialToggleTarget(null); }}
                      className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-2xl font-bold transition-all active:scale-[0.98]"
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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-slate-100 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-300"
                >
                  <div className="bg-red-50 p-8 flex flex-col items-center text-center border-b border-red-200">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-slate-200">
                      <Trash2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfirmasi Hapus</h2>
                    <div className="text-slate-600 leading-relaxed text-sm">
                      {deleteType === 'student' ? (
                        deleteTarget === 'selected' 
                          ? <p>Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-800">{selectedStudentIds.length} siswa</span> yang terpilih?</p> 
                          : <p>Apakah Anda yakin ingin menghapus data siswa ini?</p>
                      ) : deleteAssessmentInfo?.isBulkClass ? (
                        <p>Apakah Anda yakin ingin mereset/menghapus <b>semua nilai siswa Kelas {deleteAssessmentInfo.kelas}</b> untuk materi <b>"{deleteAssessmentInfo.courseTitle}"</b>?</p>
                      ) : deleteAssessmentInfo?.isBulkCourse ? (
                        <p>Apakah Anda yakin ingin menghapus seluruh nilai asesmen untuk materi <b>"{deleteAssessmentInfo.courseTitle}"</b>?</p>
                      ) : deleteAssessmentInfo?.studentName ? (
                        <p>Apakah Anda yakin ingin menghapus nilai asesmen milik <span className="font-bold text-slate-900">{deleteAssessmentInfo.studentName}</span>{deleteAssessmentInfo.courseTitle ? <> pada materi <span className="font-bold text-slate-900">"{deleteAssessmentInfo.courseTitle}"</span></> : ''}?</p>
                      ) : (
                        <p>Apakah Anda yakin ingin menghapus data nilai asesmen ini?</p>
                      )}
                      <p className="mt-2 font-semibold text-red-600">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-3">
                    <button 
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
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
                      className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
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
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  className="bg-slate-100 rounded-[2.5rem] border border-slate-300 w-full max-w-md overflow-hidden shadow-2xl relative"
                >
                  <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl text-brand">
                          <Megaphone size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">
                            {editingAnnouncementId ? 'Edit Pengumuman' : 'Buat Pengumuman'}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bagikan info ke siswa</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAnnouncementModalOpen(false)}
                        className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all border border-slate-300"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Target Pengumuman</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setAnnouncementTargetType('all')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              announcementTargetType === 'all' 
                                ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                                : "bg-slate-200 text-slate-600 border-slate-300 hover:border-brand/40"
                            )}
                          >
                            Semua
                          </button>
                          <button 
                            onClick={() => setAnnouncementTargetType('class')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              announcementTargetType === 'class' 
                                ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                                : "bg-slate-200 text-slate-600 border-slate-300 hover:border-brand/40"
                            )}
                          >
                            Per Kelas
                          </button>
                          <button 
                            onClick={() => setAnnouncementTargetType('student')}
                            className={cn(
                              "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              announcementTargetType === 'student' 
                                ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                                : "bg-slate-200 text-slate-600 border-slate-300 hover:border-brand/40"
                            )}
                          >
                            Per Siswa
                          </button>
                        </div>
                      </div>

                      {announcementTargetType === 'class' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pilih Kelas</label>
                          <select 
                            value={announcementTargetValue}
                            onChange={(e) => setAnnouncementTargetValue(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none font-bold text-sm text-slate-800"
                          >
                            <option value="">Pilih...</option>
                            {Array.from(new Set(students.map(s => s.kelas))).sort().map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      {announcementTargetType === 'student' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pilih Siswa</label>
                          <select 
                            value={announcementTargetValue}
                            onChange={(e) => setAnnouncementTargetValue(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none font-bold text-sm text-slate-800"
                          >
                            <option value="">Pilih...</option>
                            {students.sort((a,b) => a.nama.localeCompare(b.nama)).map(s => (
                              <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Isi Pengumuman</label>
                        <textarea 
                          value={announcementContent}
                          onChange={(e) => setAnnouncementContent(e.target.value)}
                          placeholder="Masukkan isi pengumuman..."
                          className="w-full p-4 bg-slate-200 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all font-medium text-slate-800 min-h-[100px] resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Tautan/Link (Opsional)</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input 
                            type="url"
                            value={announcementLink}
                            onChange={(e) => setAnnouncementLink(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all font-medium text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-4 flex gap-3">
                    <button 
                      onClick={() => setIsAnnouncementModalOpen(false)}
                      className="flex-1 py-4 bg-slate-200 text-slate-700 border border-slate-300 rounded-2xl font-bold hover:bg-slate-300 transition-all active:scale-[0.98]"
                    >
                      Batal
                    </button>
                    <button 
                      disabled={!announcementContent || (announcementTargetType !== 'all' && !announcementTargetValue) || isSendingAnnouncement}
                      onClick={handleSendAnnouncement}
                      className="flex-[2] py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                    >
                      {isSendingAnnouncement ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} /> {editingAnnouncementId ? 'Simpan Perubahan' : 'Kirim Pengumuman'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {isImportModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  className="bg-slate-100 rounded-[2.5rem] border border-slate-300 w-full max-w-lg overflow-hidden shadow-2xl"
                >
                  <div className="p-8 pb-0">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl text-brand">
                          <Users size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Siswa</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kelola data peserta didik</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsImportModalOpen(false)}
                        className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-300 flex items-center justify-center transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex bg-slate-200 p-1 rounded-2xl mb-8 border border-slate-300">
                      <button 
                        onClick={() => setImportModalTab('manual')}
                        className={cn(
                          "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                          importModalTab === 'manual' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Input Manual
                      </button>
                      <button 
                        onClick={() => setImportModalTab('excel')}
                        className={cn(
                          "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                          importModalTab === 'excel' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Impor Excel
                      </button>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    {importModalTab === 'manual' ? (
                      <form onSubmit={handleAddStudentManual} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NISN (Nomor Induk Nasional)</label>
                            <input 
                              type="text" 
                              value={manualStudentNis}
                              onChange={(e) => setManualStudentNis(e.target.value)}
                              placeholder="Contoh: 2021001" 
                              className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                            <input 
                              type="text" 
                              value={manualStudentKelas}
                              onChange={(e) => setManualStudentKelas(e.target.value)}
                              placeholder="Contoh: 7A, 8B" 
                              className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap Siswa</label>
                          <input 
                            type="text" 
                            value={manualStudentNama}
                            onChange={(e) => setManualStudentNama(e.target.value)}
                            placeholder="Masukkan Nama Lengkap" 
                            className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jenis Kelamin</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              type="button"
                              onClick={() => setManualStudentJenisKelamin('L')}
                              className={cn(
                                "py-3 rounded-2xl border font-bold text-sm transition-all",
                                manualStudentJenisKelamin === 'L' 
                                  ? "bg-blue-50 border-blue-200 text-brand shadow-sm" 
                                  : "bg-slate-200 border-slate-300 text-slate-600 hover:border-slate-400"
                              )}
                            >
                              Laki-laki
                            </button>
                            <button 
                              type="button"
                              onClick={() => setManualStudentJenisKelamin('P')}
                              className={cn(
                                "py-3 rounded-2xl border font-bold text-sm transition-all",
                                manualStudentJenisKelamin === 'P' 
                                  ? "bg-pink-50 border-pink-200 text-pink-600 shadow-sm" 
                                  : "bg-slate-200 border-slate-300 text-slate-600 hover:border-slate-400"
                              )}
                            >
                              Perempuan
                            </button>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isAddingStudent}
                          className="w-full py-4 bg-brand text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                          {isAddingStudent ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Plus size={20} /> Tambahkan Siswa
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-8 bg-slate-200/60 border border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-center text-brand mb-4 shadow-sm">
                            <Database size={32} />
                          </div>
                          <h4 className="text-lg font-black text-slate-800 mb-2">Impor Data Excel</h4>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs mb-6">
                            Gunakan format kolom: <br/> 
                            <span className="text-brand font-black">NISN | Nama | L/P | Kelas</span>
                          </p>
                          
                          <label className="w-full cursor-pointer">
                            <input 
                              type="file" 
                              accept=".xlsx, .xls" 
                              onChange={handleExcelUpload} 
                              className="hidden" 
                            />
                            <div className="w-full py-4 bg-slate-100 border border-slate-300 text-brand rounded-2xl font-black text-sm hover:bg-brand hover:text-white hover:border-brand transition-all flex items-center justify-center gap-2 shadow-sm">
                              <Plus size={18} /> Pilih File Excel
                            </div>
                          </label>
                        </div>
                        
                        <div className="bg-slate-200 p-4 rounded-2xl border border-slate-300 flex items-start gap-3">
                          <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                            <Info size={12} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-frame font-sans text-slate-900 overflow-hidden">
      {!isAdmin && materialConfigs[activeCourse.id]?.isFullScreen && !isFullscreenActive && currentPage === 'course' && !showCompletionPopup && (
        <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8">
            <Maximize size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Wajib Layar Penuh</h2>
          <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
            Guru mewajibkan materi ini dikerjakan dalam mode layar penuh (Fullscreen) untuk menghindari gangguan. <br/><br/>
            <strong>Peringatan!</strong> Jika kamu keluar dari mode layar penuh saat mengerjakan materi, aktivitas ini akan tercatat sebagai kecurangan di sistem guru.
          </p>
          <button 
            onClick={() => document.documentElement.requestFullscreen().catch(err => console.error(err))}
            className="px-8 py-4 bg-brand text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
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
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 320 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={cn(
          "bg-slate-100 border-r border-slate-300 flex flex-col z-30 transition-all duration-300",
          !isSidebarOpen && "pointer-events-none overflow-hidden"
        )}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-xl">
              IK
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                {activeCourse.title}
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Level: {activeCourse.level}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-slate-200 rounded-lg text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Cari materi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-sans"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
          {isAdmin ? (
            <button 
              onClick={() => { setCurrentPage('admin'); setAdminTab('materials'); }} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-200 text-slate-600 mb-4 font-bold text-sm transition-colors"
            >
              <Home size={18} /> Kembali ke Dashboard
            </button>
          ) : (
            <button 
              onClick={async () => {
                if (currentStudent) {
                  setCurrentPage('login');
                  setLocalCheatingAttempts(0);
                  setLocalCheatingDetails([]);
                  try {
                    for (const c of COURSES) {
                      await deleteDoc(doc(db, 'active_sessions', `${currentStudent.id}_${c.id}`)).catch(()=> {});
                    }
                  } catch(e) {}
                }
                setCurrentStudent(null); 
              }} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 mb-4 font-bold text-sm transition-colors"
            >
              <LogOut size={18} /> Logout ({currentStudent?.nama})
            </button>
          )}
          
          {currentPage !== 'course' && (
            <>
              <div className="mb-4 text-xs font-semibold text-slate-600 uppercase tracking-widest px-3">Modul Pembelajaran</div>
              <div className="px-3 mb-6">
                <select 
                    value={activeCourseId} 
                    onChange={(e) => setActiveCourseId(e.target.value)}
                    className="w-full bg-slate-200 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 transition-colors cursor-pointer shadow-sm hover:border-slate-400"
                  >
                    {COURSES.map(course => (
                      <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
                    ))}
                  </select>
                </div>
            </>
          )}
            
            <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-widest">Daftar Materi</div>
            {filteredTopics.map((topic, index) => {
              const Icon = ICON_MAP[topic.icon] || Code;
              const isActive = topic.id === activeTopicId;
              const isCompleted = passedQuizzes[topic.id];
              
              // Gatekeeping evaluation
              const isGatekeepingEnabled = materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true;
              let isLocked = false;
              if (isGatekeepingEnabled && !isAdmin) {
                // Topic is locked if any previous topic is not completed
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
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-left",
                    isActive 
                      ? "bg-indigo-50 text-brand font-semibold border-r-4 border-brand rounded-sm shadow-sm" 
                      : isCompleted
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "hover:bg-frame text-slate-500 hover:text-slate-900",
                    isLocked && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center transition-colors text-[11px] font-bold",
                    isActive ? "text-brand" : isCompleted ? "text-emerald-500" : "text-slate-400"
                  )}>
                    {isCompleted ? "✓" : isLocked ? <Lock size={12} /> : String(index + 1).padStart(2, '0') + "."}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{topic.title}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Course Progress */}
          <div className="p-6 bg-frame border-t border-slate-100">
            <div className="flex justify-between text-[11px] mb-2 font-bold">
              <span className="text-slate-400 uppercase tracking-tight">Course Progress</span>
              <span className="text-brand">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="bg-brand h-full" 
              />
            </div>
          </div>
        </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-300 relative">
        <header className="h-16 border-b border-slate-300 flex items-center justify-between px-3 md:px-8 bg-slate-100/95 backdrop-blur-md z-20 sticky top-0">
            <div className="flex items-center gap-1.5 md:gap-4 shrink-0 overflow-hidden">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 md:p-2 hover:bg-slate-200 rounded-lg text-slate-600 shrink-0"
                >
                  <Menu size={18} className="md:w-5 md:h-5" />
                </button>
              )}
              <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-sm overflow-hidden">
                <span className="text-slate-500 hidden lg:block whitespace-nowrap">{activeCourse.title}</span>
                <span className="text-slate-400 font-light hidden lg:block">/</span>
                <span className="text-slate-900 font-bold truncate max-w-[100px] xs:max-w-[140px] md:max-w-none">{currentIndex + 1}. {activeTopic.title}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2">
                {topicTimeRemaining !== null && topicTimeRemaining > 0 && !isAdmin && viewMode === 'material' && (
                  <div className="px-1.5 md:px-3 py-1 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 text-red-600">
                    <Clock size={10} className="md:w-[14px] md:h-[14px] animate-spin-slow" />
                    <span className="text-[7px] md:text-[9px] font-bold text-red-500 uppercase tracking-widest block">Waktu Tunggu</span>
                    <span className="font-mono font-bold text-[10px] md:text-lg tracking-tight">{topicTimeRemaining}s</span>
                  </div>
                )}
                {quizTimeRemaining !== null && quizTimeRemaining > 0 && !isAdmin && viewMode === 'quiz' && (
                  <div className="px-1.5 md:px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 text-amber-700">
                    <Clock size={10} className="md:w-[14px] md:h-[14px] animate-pulse" />
                    <span className="text-[7px] md:text-[9px] font-bold text-amber-600 uppercase tracking-widest block">Waktu Kuis</span>
                    <span className="font-mono font-bold text-[10px] md:text-lg tracking-tight">{quizTimeRemaining}s</span>
                  </div>
                )}
                <div className="px-2 md:px-4 py-1 bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1">
                   <span className="text-[7px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Skor sementara</span>
                   <span className={cn("font-bold text-[11px] md:text-lg", currentScore >= 80 ? "text-emerald-600" : currentScore >= 60 ? "text-amber-600" : "text-red-600")}>
                      {currentScore}
                   </span>
                </div>
              </div>
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
                  className="hidden md:block px-5 py-1.5 text-xs font-semibold bg-brand text-white rounded-lg shadow-md hover:bg-brand-hover active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
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
            viewMode === 'quiz' ? "py-6 md:py-8" : "py-8 md:py-16"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTopicId}-${viewMode}`}
                initial={{ opacity: 0, x: viewMode === 'quiz' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewMode === 'quiz' ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className="markdown-body bg-slate-100 border border-slate-300 p-6 sm:p-10 md:p-12 rounded-[2rem] shadow-sm"
              >
                {viewMode === 'material' ? (
                    <>
                      {courseCompleted ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-100 p-12 rounded-[2rem] shadow-xl border border-slate-300 text-center flex flex-col items-center"
                        >
                          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-50">
                            <CheckCircle size={48} />
                          </div>
                          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Selamat!</h2>
                          <p className="text-slate-600 text-xl mb-8">Anda telah menyelesaikan kurikulum ini.</p>
                          
                          <div className="bg-slate-200 p-8 rounded-3xl border border-slate-300 mb-10 w-full max-w-sm">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Skor Akhir Anda</p>
                            <p className={cn(
                              "text-7xl font-black mb-4",
                              currentScore >= 80 ? "text-emerald-500" : currentScore >= 60 ? "text-amber-500" : "text-red-500"
                            )}>
                              {currentScore}
                            </p>
                            
                            {startTime && completionTime && (
                              <div className="pt-4 border-t border-slate-200/50 flex flex-col gap-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Pengerjaan</p>
                                <p className="text-xl font-black text-slate-700">
                                  {(() => {
                                    const totalSeconds = Math.floor((completionTime - startTime) / 1000);
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = totalSeconds % 60;
                                    return `${minutes}m ${seconds}s`;
                                  })()}
                                </p>
                              </div>
                            )}
                            
                            <p className="text-[10px] font-bold text-slate-300 mt-4">Dimulai dari 100 poin</p>
                          </div>

                          <button 
                            onClick={() => {
                              updateSessionStatus(activeCourse.id, 'finished').catch(console.error);
                              setLocalCheatingAttempts(0);
                              setLocalCheatingDetails([]);
                              setCurrentPage('student_dashboard');
                            }}
                            className="bg-brand text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-3"
                          >
                            <Home size={20} />
                            Kembali ke Profil
                          </button>
                        </motion.div>
                      ) : (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-8 mb-4 tracking-tight">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">{children}</h3>
                              ),
                              p: ({ node, children }: any) => {
                                const hasBlockChild = node?.children?.some(
                                  (c: any) => c.tagName === 'img' || (c.type === 'element' && (c.tagName === 'img' || c.tagName === 'figure' || c.tagName === 'div'))
                                );
                                if (hasBlockChild) {
                                  return (
                                    <div className="text-slate-700 text-base md:text-lg leading-relaxed mb-6">
                                      {children}
                                    </div>
                                  );
                                }
                                return (
                                  <p className="text-slate-700 text-base md:text-lg leading-relaxed mb-6">
                                    {children}
                                  </p>
                                );
                              },
                              img: ({ src, alt, ...props }: any) => (
                                <figure className="my-8 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md group">
                                  <div className="relative overflow-hidden bg-slate-200 flex items-center justify-center p-2 md:p-3">
                                    <img
                                      src={src}
                                      alt={alt || "Ilustrasi Visual Materi"}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="w-full h-auto object-contain rounded-xl md:rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                                      {...props}
                                    />
                                  </div>
                                  {alt && (
                                    <figcaption className="px-5 py-3.5 bg-slate-200 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
                                      <span className="flex items-center gap-2 font-bold text-slate-800">
                                        <ImageIcon size={16} className="text-brand shrink-0" /> {alt}
                                      </span>
                                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
                                        💡 Panduan Visual Scratch
                                      </span>
                                    </figcaption>
                                  )}
                                </figure>
                              ),
                              table: ({ children }: any) => (
                                <div className="my-6 overflow-x-auto rounded-2xl border border-slate-300 shadow-sm bg-slate-100">
                                  <table className="w-full text-left text-sm text-slate-700 border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }: any) => (
                                <thead className="bg-slate-200 border-b border-slate-300 text-xs font-black uppercase tracking-wider text-slate-800">
                                  {children}
                                </thead>
                              ),
                              th: ({ children }: any) => (
                                <th className="px-5 py-3.5 font-bold text-slate-800">{children}</th>
                              ),
                              td: ({ children }: any) => (
                                <td className="px-5 py-3.5 border-b border-slate-200">{children}</td>
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
                                  <div className="flex items-start gap-3 md:gap-4 bg-slate-200/80 p-3 md:p-4 rounded-xl border border-slate-300 transition-hover hover:border-slate-400">
                                    <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-brand font-bold text-[10px] md:text-xs ring-4 ring-blue-50 mt-0.5">
                                      {isOrdered ? (index + 1) : "✓"}
                                    </div>
                                    <div className="text-slate-800 text-sm md:text-base leading-relaxed">{children}</div>
                                  </div>
                                );
                              },
                              blockquote: ({ children }) => (
                                <div className="mt-8 p-4 md:p-5 border border-indigo-100 bg-indigo-50/30 rounded-xl flex items-center gap-3 md:gap-4">
                                  <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-brand rounded-lg flex items-center justify-center text-white">
                                    <Info size={18} />
                                  </div>
                                  <div className="text-xs text-slate-600 font-medium">
                                    {children}
                                  </div>
                                </div>
                              ),
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : '';
                                const isScratch = lang === 'scratch';
                                return !inline && match ? (
                                  <div className="my-6 md:my-10 rounded-xl md:rounded-2xl overflow-hidden shadow-xl flex flex-col bg-slate-900 mx-[-1rem] md:mx-0">
                                    <div className="bg-slate-800 px-4 py-2 md:py-3 flex items-center justify-between border-b border-slate-700">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-[#FF5F56]" />
                                        <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-[#27C93F]" />
                                      </div>
                                      <span className="text-[9px] md:text-[10px] font-mono text-slate-400 uppercase tracking-widest">
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
                                          padding: '1rem md:1.5rem',
                                          fontSize: '13px md:14px',
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
                                      <div className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase mb-2">
                                        {isScratch ? 'Eksekusi Balok Scratch' : 'Output Browser'}
                                      </div>
                                      <div className="text-xs md:text-sm font-mono text-emerald-400 bg-emerald-950/20 p-2 md:p-3 rounded border border-emerald-900/30">
                                        {isScratch ? 'Balok terhubung dan aktif di Stage Scratch... ✓' : 'Data diproses... ✓'}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <code className="font-mono text-brand bg-indigo-100 px-1 py-0.5 rounded text-[13px] md:text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {activeTopic.content}
                          </ReactMarkdown>

                          <div className="mt-12 md:mt-16 flex flex-col items-center">
                             <div className="bg-brand/5 border border-brand/10 p-6 md:p-10 rounded-3xl text-center w-full">
                            {currentIndex === activeCourse.topics.length - 1 && passedQuizzes[activeTopicId] ? (
                              <>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Kurikulum Selesai!</h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">Kamu telah menyelesaikan semua materi dan kuis. Klik tombol di bawah untuk melihat skor akhirmu.</p>
                                <button 
                                  onClick={() => handleCourseCompletion()}
                                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 mx-auto"
                                >
                                  <CheckCircle size={20} />
                                  Selesaikan & Lihat Skor
                                </button>
                              </>
                            ) : (
                              <>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Siap untuk evaluasi?</h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">Selesaikan quiz singkat untuk memastikan pemahamanmu dan membuka materi berikutnya.</p>
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
                                  className="px-10 py-4 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 mx-auto disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                                >
                                  <Code size={20} />
                                  {(() => {
                                    const config = materialConfigs[activeCourse.id];
                                    const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                                    const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                                    const threshold = waitTime - quizAvailableAt;
                                    
                                    if (topicTimeRemaining !== null && topicTimeRemaining > threshold && threshold >= 0) {
                                      return `Tunggu ${topicTimeRemaining - threshold}s`;
                                    }
                                    return passedQuizzes[activeTopicId] ? 'Ulangi Quiz Materi' : 'Mulai Quiz Materi';
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
                    <div className="quiz-container px-0 md:px-4 flex flex-col">
                      <div className="bg-slate-100 rounded-none md:rounded-[2rem] border-x-0 md:border border-slate-300 shadow-xl flex flex-col">
                        <div className="bg-slate-900 p-5 md:p-10 text-white shrink-0 z-10">
                          <div className="flex items-center justify-between mb-4 md:mb-6">
                            <button 
                              onClick={() => {
                                setViewMode('material');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[9px] md:text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 md:gap-2 uppercase tracking-widest transition-all backdrop-blur-sm shadow-inner"
                            >
                              <ChevronRight size={10} className="rotate-180 md:w-[12px] md:h-[12px]" />
                              Materi
                            </button>
                            <div className="flex items-center gap-2">
                              {quizTimeRemaining !== null && quizTimeRemaining > 0 && !isAdmin && (
                                <span className="px-2.5 py-1 bg-amber-500/20 rounded-full text-[9px] md:text-[10px] font-bold text-amber-300 uppercase tracking-widest border border-amber-500/30 flex items-center gap-1">
                                  <Clock size={12} />
                                  {quizTimeRemaining}s
                                </span>
                              )}
                              <span className="px-2.5 py-1 bg-slate-800/50 rounded-full text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700/50">
                                Quest {quizState.currentQuestionIndex + 1} / {activeTopic.quiz.length}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg md:text-3xl font-extrabold leading-tight tracking-tight">
                            {activeTopic.quiz[quizState.currentQuestionIndex].question}
                          </h3>
                        </div>
                        
                        <div className="p-4 md:p-10 space-y-4 md:space-y-8 flex flex-col">
                          {/* ACTION BUTTONS & EXPLANATION (Positioned below question, above options) */}
                          <AnimatePresence mode="wait">
                            {quizState.selectedOption !== null && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-4 md:space-y-6 pb-6 md:pb-8 border-b border-slate-100"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider w-fit shadow-sm",
                                    quizState.isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                                  )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", quizState.isCorrect ? "bg-emerald-500" : "bg-red-500")} />
                                    {quizState.isCorrect ? "Benar Sekali!" : "Kurang Tepat"}
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    {quizState.isCorrect ? (
                                      quizState.currentQuestionIndex < activeTopic.quiz.length - 1 ? (
                                        <button 
                                          onClick={nextQuestion}
                                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                          Lanjut
                                          <ChevronRight size={16} />
                                        </button>
                                      ) : (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                                          <button 
                                            onClick={() => handleNextTopic()}
                                            className="w-full sm:px-6 md:px-8 py-3 md:py-3.5 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                                          >
                                            Materi Berikutnya
                                            <ChevronRight size={16} />
                                          </button>
                                        </div>
                                      )
                                    ) : (
                                      <button 
                                        onClick={() => setQuizState({ ...quizState, selectedOption: null, isCorrect: null })}
                                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                                      >
                                        <RotateCcw size={16} />
                                        Coba Lagi
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className={cn(
                                  "p-4 md:p-6 rounded-2xl text-[13px] md:text-base leading-relaxed font-medium border-l-[4px] md:border-l-[6px]",
                                  quizState.isCorrect 
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                                    : "bg-red-50 border-red-500 text-red-900"
                                )}>
                                  <span className="font-extrabold block mb-1 md:mb-2 uppercase text-[9px] md:text-[10px] tracking-widest opacity-60">
                                    {quizState.isCorrect ? "Wawasan" : "Koreksi"}
                                  </span>
                                  {quizState.isCorrect 
                                    ? activeTopic.quiz[quizState.currentQuestionIndex].explanation
                                    : `Kunci Jawaban: ${String.fromCharCode(65 + activeTopic.quiz[quizState.currentQuestionIndex].correctAnswer)}. ${activeTopic.quiz[quizState.currentQuestionIndex].explanation}`
                                  }
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="space-y-2.5 md:space-y-3 pb-8">
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
                                    "w-full text-left p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 md:gap-4",
                                    !showResult 
                                      ? "border-slate-100 hover:border-brand hover:bg-indigo-50/50 group" 
                                      : isCorrect 
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                                        : isSelected 
                                          ? "border-red-500 bg-red-50 text-red-700"
                                          : "border-slate-100 opacity-50"
                                  )}>
                                  <div className={cn(
                                    "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm",
                                    !showResult 
                                      ? "bg-slate-100 text-slate-500 group-hover:bg-brand group-hover:text-white" 
                                      : isCorrect 
                                        ? "bg-emerald-500 text-white" 
                                        : isSelected 
                                          ? "bg-red-500 text-white" 
                                          : "bg-slate-100 text-slate-300"
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
                      <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
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
                          className="flex-1 w-full sm:w-auto p-5 rounded-2xl border border-slate-100 transition-all group flex flex-col items-end text-right shadow-sm hover:border-brand/30 hover:bg-brand/[0.03] hover:shadow-md cursor-pointer disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            {currentIndex === activeCourse.topics.length - 1 
                              ? (passedQuizzes[activeTopicId] ? 'Kurikulum Selesai' : 'Selesaikan Kuis Terakhir')
                              : (passedQuizzes[activeTopicId] ? 'Buka Materi Selanjutnya' : 'Selesaikan Kuis')}
                          </span>
                          <span className="text-slate-800 font-bold group-hover:text-brand transition-colors text-lg">
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
          <div className="md:hidden sticky bottom-0 left-0 right-0 p-4 bg-slate-100/95 backdrop-blur-lg border-t border-slate-300 flex items-center justify-between gap-4 z-20">
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
              className="p-3 bg-slate-100 text-slate-500 rounded-xl disabled:opacity-30"
            >
              <ChevronRight className="rotate-180" size={24} />
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
                (currentIndex === activeCourse.topics.length - 1 && passedQuizzes[activeTopicId] && false) || 
                (!isAdmin && (materialConfigs[activeCourse.id]?.isGatekeepingEnabled ?? true) && !passedQuizzes[activeTopicId] && (() => {
                  const config = materialConfigs[activeCourse.id];
                  const waitTime = config?.useGlobalTimers ? (config?.defaultTopicTimer || 70) : (config?.topicTimers?.[activeTopicId] || 0);
                  const quizAvailableAt = config?.useGlobalTimers ? (config?.defaultQuizAvailableAt || 40) : (config?.quizAvailableAt?.[activeTopicId] || 0);
                  const threshold = waitTime - quizAvailableAt;
                  return topicTimeRemaining !== null && topicTimeRemaining > Math.max(0, threshold);
                })())
              }
              className={cn(
                "flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                passedQuizzes[activeTopicId] ? "bg-brand shadow-brand/20" : "bg-brand shadow-brand/20"
              )}
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
              <ArrowRight size={18} />
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-100 rounded-[2.5rem] border border-slate-300 w-full max-w-md overflow-hidden shadow-2xl text-center"
            >
              <div className="bg-brand p-12 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-xl">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight mb-2">Luar Biasa!</h3>
                  <p className="text-brand-foreground/80 font-medium tracking-wide border-t border-white/20 pt-4 mt-2">
                    Kamu telah menyelesaikan materi Terakhir
                  </p>
                </div>
              </div>
              
              <div className="p-10">
                <div className="bg-slate-200/70 p-8 rounded-3xl border border-slate-300 mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Skor Akhir Kamu</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn(
                      "text-7xl font-black",
                      currentScore >= 80 ? "text-emerald-500" : currentScore >= 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {currentScore}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-400">Poin</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Terakumulasi</div>
                    </div>
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
                  className="w-full bg-brand text-white py-4 rounded-2xl font-bold border border-transparent shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Home size={20} />
                  Kembali ke Profil
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
        "flex-1 w-full sm:w-auto p-5 rounded-2xl border border-slate-100 hover:border-brand/30 hover:bg-brand/[0.03] transition-all group flex flex-col shadow-sm hover:shadow-md",
        direction === 'next' ? "items-end text-right" : "items-start text-left"
      )}
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {direction === 'prev' ? 'Materi Sebelumnya' : 'Materi Selanjutnya'}
      </span>
      <span className="text-slate-800 font-bold group-hover:text-brand transition-colors text-lg">
        {targetTopic.title}
      </span>
    </button>
  );
}
