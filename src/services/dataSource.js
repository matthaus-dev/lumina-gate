import { db } from '../firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

// Dynamic configuration - can be updated at runtime.
// The app reads all domain data from the API by default; Firestore is reserved for calls.
let DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'api';
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Update data source configuration at runtime
 */
export function setDataSourceConfig(dataSource, apiUrl) {
  console.log('[DataSource] Setting config:', { dataSource, apiUrl });
  if (dataSource) {
    DATA_SOURCE = dataSource;
  }
  if (apiUrl) {
    API_URL = apiUrl;
  }
}

/**
 * Get current data source configuration
 */
export function getDataSourceConfig() {
  return { dataSource: DATA_SOURCE, apiUrl: API_URL };
}

/**
 * Firestore adapter implementation
 */
const firestoreAdapter = {
  // Students
  async getStudents(tenantId) {
    const studentsRef = collection(db, 'tenants', tenantId, 'students');
    const snapshot = await getDocs(studentsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createStudent(tenantId, data) {
    const studentsRef = collection(db, 'tenants', tenantId, 'students');
    const docRef = await addDoc(studentsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async updateStudent(tenantId, studentId, data) {
    const studentRef = doc(db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(studentRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id: studentId, ...data };
  },

  async deleteStudent(tenantId, studentId) {
    const studentRef = doc(db, 'tenants', tenantId, 'students', studentId);
    await deleteDoc(studentRef);
    return true;
  },

  // Classes
  async getClasses(tenantId) {
    const classesRef = collection(db, 'tenants', tenantId, 'classes');
    const snapshot = await getDocs(classesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createClass(tenantId, data) {
    const classesRef = collection(db, 'tenants', tenantId, 'classes');
    const docRef = await addDoc(classesRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async updateClass(tenantId, classId, data) {
    const classRef = doc(db, 'tenants', tenantId, 'classes', classId);
    await updateDoc(classRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id: classId, ...data };
  },

  async deleteClass(tenantId, classId) {
    const classRef = doc(db, 'tenants', tenantId, 'classes', classId);
    await deleteDoc(classRef);
    return true;
  },

  // Settings
  async getSettings(tenantId) {
    const settingsRef = doc(db, 'tenants', tenantId, 'settings', 'general');
    const snapshot = await getDoc(settingsRef);
    if (!snapshot.exists()) {
      return { id: 'general', nome: tenantId, email: '', features: { porteiro: false, display: false } };
    }
    return { id: snapshot.id, ...snapshot.data() };
  },

  async updateSettings(tenantId, settings) {
    const settingsRef = doc(db, 'tenants', tenantId, 'settings', settings.id || 'general');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return settings;
  },

  // Calls (Chamadas)
  async getCalls(tenantId) {
    const callsRef = collection(db, 'tenants', tenantId, 'calls');
    const snapshot = await getDocs(callsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createCall(tenantId, data) {
    const callsRef = collection(db, 'tenants', tenantId, 'calls');
    const docRef = await addDoc(callsRef, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data, status: 'pending' };
  },

  async updateCall(tenantId, callId, data) {
    const callRef = doc(db, 'tenants', tenantId, 'calls', callId);
    await updateDoc(callRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id: callId, ...data };
  },

  async deleteCall(tenantId, callId) {
    const callRef = doc(db, 'tenants', tenantId, 'calls', callId);
    await deleteDoc(callRef);
    return true;
  },

  onSnapshotStudents(tenantId, callback) {
    const studentsRef = collection(db, 'tenants', tenantId, 'students');
    return onSnapshot(studentsRef, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    });
  },

  onSnapshotCalls(tenantId, callback) {
    const callsRef = collection(db, 'tenants', tenantId, 'calls');
    const q = query(callsRef, where('status', '==', 'pending'));
    return onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    });
  },
};

/**
 * Helper function to extract array from various API response formats
 */
function extractArray(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    // Try common wrapping patterns
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.students)) return data.students;
    if (Array.isArray(data.classes)) return data.classes;
    if (Array.isArray(data.calls)) return data.calls;
  }
  console.warn('Unexpected API response format:', data);
  return [];
}

/**
 * Normalize student data to ensure turmaId is set
 * API returns "turma" as the name, we normalize to turmaId for compatibility
 */
function normalizeStudentData(students) {
  return students.map(student => ({
    ...student,
    // If API returns "turma" as name, keep it as turmaName for display
    turmaName: student.turma || student.turmaName,
    // If no turmaId, use turma as turmaId (for API compatibility)
    turmaId: student.turmaId || student.turma,
  }));
}

/**
 * API adapter implementation
 */
const apiAdapter = {
  // Students
  async getStudents(tenantId) {
    const url = `${API_URL}/${tenantId}/students`;
    console.log('[DataSource] Fetching students from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[DataSource] API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch students: ${response.status}`);
    }
    const data = await response.json();
    console.log('[DataSource] Students response:', data);
    const students = extractArray(data);
    return normalizeStudentData(students);
  },

  async createStudent(tenantId, data) {
    throw new Error('Operacao indisponivel: alunos sao gerenciados pela API externa.');
  },

  async updateStudent(tenantId, studentId, data) {
    throw new Error('Operacao indisponivel: alunos sao gerenciados pela API externa.');
  },

  async deleteStudent(tenantId, studentId) {
    throw new Error('Operacao indisponivel: alunos sao gerenciados pela API externa.');
  },

  // Classes
  async getClasses(tenantId) {
    const url = `${API_URL}/${tenantId}/classes`;
    console.log('[DataSource] Fetching classes from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[DataSource] API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch classes: ${response.status}`);
    }
    const data = await response.json();
    console.log('[DataSource] Classes response:', data);
    return extractArray(data);
  },

  async createClass(tenantId, data) {
    throw new Error('Operacao indisponivel: turmas sao gerenciadas pela API externa.');
  },

  async updateClass(tenantId, classId, data) {
    throw new Error('Operacao indisponivel: turmas sao gerenciadas pela API externa.');
  },

  async deleteClass(tenantId, classId) {
    throw new Error('Operacao indisponivel: turmas sao gerenciadas pela API externa.');
  },

  // Settings
  async getSettings(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/settings`);
    if (!response.ok) return { id: 'general', name: tenantId, email: '', enablePorteiro: true, enableDispositivo: true };
    return response.json();
  },

  async updateSettings(tenantId, settings) {
    throw new Error('Operacao indisponivel: configuracoes sao parametrizadas no ambiente/API.');
  },

  // Calls
  async getCalls(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/calls`);
    if (!response.ok) throw new Error(`Failed to fetch calls: ${response.status}`);
    const data = await response.json();
    return extractArray(data);
  },

  // NOTE: Calls are ALWAYS handled by Firestore, never by API
  // See the factory function below which merges Firestore call methods
  
  onSnapshotStudents(tenantId, callback) {
    // Polling fallback for API (real-time not supported for students)
    this.getStudents(tenantId).then(callback);
    const interval = setInterval(() => {
      this.getStudents(tenantId).then(callback);
    }, 3000); // Poll every 3s
    return () => clearInterval(interval);
  },
};

/**
 * Factory function to get the appropriate data source adapter
 * NOTE: Calls (createCall, updateCall, deleteCall, onSnapshotCalls) ALWAYS use Firestore for real-time updates
 * Only students/classes/settings can alternate between API and Firestore
 */
export function getDataSource() {
  if (DATA_SOURCE === 'api') {
    console.log('[DataSource] Using API adapter for students/classes:', API_URL);
    console.log('[DataSource] Using Firestore adapter for calls (real-time)');
    // Merge API adapter with Firestore call methods
    return {
      ...apiAdapter,
      // Override call methods to always use Firestore
      createCall: firestoreAdapter.createCall.bind(firestoreAdapter),
      updateCall: firestoreAdapter.updateCall.bind(firestoreAdapter),
      deleteCall: firestoreAdapter.deleteCall.bind(firestoreAdapter),
      onSnapshotCalls: firestoreAdapter.onSnapshotCalls.bind(firestoreAdapter),
    };
  } else {
    console.log('[DataSource] Using Firestore adapter');
    return firestoreAdapter;
  }
}

export function getDataSourceType() {
  return DATA_SOURCE;
}

/**
 * Check if using API data source
 */
export function isApiDataSource() {
  return DATA_SOURCE === 'api';
}
