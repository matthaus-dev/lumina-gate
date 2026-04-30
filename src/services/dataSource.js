import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'firestore';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const settingsRef = collection(db, 'tenants', tenantId, 'settings');
    const snapshot = await getDocs(settingsRef);
    if (snapshot.empty) {
      return { id: 'general', name: tenantId, email: '', enablePorteiro: true, enableDispositivo: true };
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async updateSettings(tenantId, settings) {
    const settingsRef = doc(db, 'tenants', tenantId, 'settings', settings.id || 'general');
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        const settingsCollection = collection(db, 'tenants', tenantId, 'settings');
        await addDoc(settingsCollection, {
          ...settings,
          createdAt: serverTimestamp(),
        });
      } else {
        throw error;
      }
    });
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
 * API adapter implementation
 */
const apiAdapter = {
  // Students
  async getStudents(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/students`);
    if (!response.ok) throw new Error(`Failed to fetch students: ${response.status}`);
    return response.json();
  },

  async createStudent(tenantId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create student: ${response.status}`);
    return response.json();
  },

  async updateStudent(tenantId, studentId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update student: ${response.status}`);
    return response.json();
  },

  async deleteStudent(tenantId, studentId) {
    const response = await fetch(`${API_URL}/${tenantId}/students/${studentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete student: ${response.status}`);
    return true;
  },

  // Classes
  async getClasses(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/classes`);
    if (!response.ok) throw new Error(`Failed to fetch classes: ${response.status}`);
    return response.json();
  },

  async createClass(tenantId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create class: ${response.status}`);
    return response.json();
  },

  async updateClass(tenantId, classId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update class: ${response.status}`);
    return response.json();
  },

  async deleteClass(tenantId, classId) {
    const response = await fetch(`${API_URL}/${tenantId}/classes/${classId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete class: ${response.status}`);
    return true;
  },

  // Settings
  async getSettings(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/settings`);
    if (!response.ok) return { id: 'general', name: tenantId, email: '', enablePorteiro: true, enableDispositivo: true };
    return response.json();
  },

  async updateSettings(tenantId, settings) {
    const response = await fetch(`${API_URL}/${tenantId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error(`Failed to update settings: ${response.status}`);
    return response.json();
  },

  // Calls
  async getCalls(tenantId) {
    const response = await fetch(`${API_URL}/${tenantId}/calls`);
    if (!response.ok) throw new Error(`Failed to fetch calls: ${response.status}`);
    return response.json();
  },

  async createCall(tenantId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create call: ${response.status}`);
    return response.json();
  },

  async updateCall(tenantId, callId, data) {
    const response = await fetch(`${API_URL}/${tenantId}/calls/${callId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update call: ${response.status}`);
    return response.json();
  },

  async deleteCall(tenantId, callId) {
    const response = await fetch(`${API_URL}/${tenantId}/calls/${callId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete call: ${response.status}`);
    return true;
  },

  onSnapshotStudents(tenantId, callback) {
    // Polling fallback for API (real-time not supported)
    this.getStudents(tenantId).then(callback);
    const interval = setInterval(() => {
      this.getStudents(tenantId).then(callback);
    }, 3000); // Poll every 3s
    return () => clearInterval(interval);
  },

  onSnapshotCalls(tenantId, callback) {
    // Polling fallback for API (real-time not supported)
    this.getCalls(tenantId).then(callback);
    const interval = setInterval(() => {
      this.getCalls(tenantId).then(callback);
    }, 2000); // Poll every 2s
    return () => clearInterval(interval);
  },
};

/**
 * Factory function to get the appropriate data source adapter
 */
export function getDataSource() {
  if (DATA_SOURCE === 'api') {
    console.log('[DataSource] Using API adapter:', API_URL);
    return apiAdapter;
  } else {
    console.log('[DataSource] Using Firestore adapter');
    return firestoreAdapter;
  }
}

export function getDataSourceType() {
  return DATA_SOURCE;
}
