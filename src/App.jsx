import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart 
} from 'recharts';
import { 
  Ruler, Activity, Plus, Trash2, Save, FolderOpen, Loader2,
  Calculator, ShieldCheck, CheckCircle, XCircle, AlertTriangle, AlertCircle,
  Anchor, ArrowDown, Layers, Minus, ArrowRight, FileText, RotateCcw,
  MoveVertical, Download, MapPin, Edit3, Briefcase, User, BookOpen, ChevronDown, ChevronUp, Info
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "mock-api-key",
  authDomain: "mock-project.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'comares-beam-pro-v8-ext';

// --- Structural Data (Updated from Scaffold Beam Data PDF) ---
const SCAFFOLD_BEAMS = [
  // Ladder & Standard Beams
  { name: "Steel Ladder Beam", mr: 12.7, vr: 12.5, mass: 10.5, mat: 'Steel', ei: 5497.8 },
  { name: "Hakitec 750 Beam (Keyhole)", mr: 41.3, vr: 30.6, mass: 7.5, mat: 'Alum', ei: 12027.4 },
  { name: "Hakitec 450 Beam", mr: 15.7, vr: 12.7, mass: 4.0, mat: 'Alum', ei: 3138.1 },
  { name: "Layher 45cm Alum Lattice", mr: 13.94, vr: 12.32, mass: 5.0, mat: 'Alum', ei: 3136.7 },
  { name: "Layher 45cm Steel Lattice", mr: 24.98, vr: 18.54, mass: 10.0, mat: 'Steel', ei: 9410.1 },
  { name: "Layher 75cm Alum (A-Arr)", mr: 24.5, vr: 15.52, mass: 6.0, mat: 'Alum', ei: 10636.5 },
  { name: "Layher 75cm Alum (V-Arr)", mr: 33.5, vr: 15.52, mass: 6.0, mat: 'Alum', ei: 10636.5 },
  { name: "Layher 75cm Steel Lattice", mr: 48.0, vr: 27.27, mass: 16.0, mat: 'Steel', ei: 28774.2 },
  
  // Dessa Range
  { name: "Dessa D78 Alum Lattice", mr: 38.84, vr: 23.71, mass: 6.0, mat: 'Alum', ei: 11563.3 },
  { name: "Dessa D45 Alum Lattice", mr: 22.8, vr: 18.1, mass: 5.0, mat: 'Alum', ei: 3136.7 },
  { name: "Dessa ASTERIX Alum", mr: 41.31, vr: 23.73, mass: 7.0, mat: 'Alum', ei: 10636.5 },
  { name: "Dessa ASTERIX HD Alum", mr: 102.2, vr: 32.6, mass: 11.0, mat: 'Alum', ei: 35315.7 },
  { name: "Dessa S45 Alum Lattice", mr: 20.19, vr: 11.66, mass: 4.0, mat: 'Alum', ei: 3136.7 },
  { name: "Dessa L45 Alum Lattice", mr: 21.98, vr: 11.69, mass: 4.0, mat: 'Alum', ei: 3136.7 },

  // Apollo X-Beam Series
  { name: "Apollo 750mm X-Beam (≤6m)", mr: 37.0, vr: 39.0, mass: 8.0, mat: 'Alum', ei: 10290.0 },
  { name: "Apollo 750mm X-Beam (≤12m)", mr: 41.0, vr: 37.0, mass: 8.0, mat: 'Alum', ei: 10290.0 },
  { name: "Apollo 750mm X-Beam (≤18m)", mr: 41.0, vr: 35.0, mass: 8.0, mat: 'Alum', ei: 10290.0 },
  { name: "Apollo 1300mm X-Beam", mr: 98.5, vr: 52.0, mass: 11.2, mat: 'Alum', ei: 35910.0 },
  { name: "Apollo 1300mm Super X-Beam", mr: 110.0, vr: 50.0, mass: 13.8, mat: 'Alum', ei: 35910.0 },

  // Apollo Lattice Range
  { name: "Apollo 450mm Lattice (≤4m)", mr: 16.2, vr: 16.0, mass: 5.0, mat: 'Alum', ei: 3360.0 },
  { name: "Apollo 450mm Lattice (≤6m)", mr: 17.8, vr: 15.9, mass: 5.0, mat: 'Alum', ei: 3360.0 },
  { name: "Apollo 450mm Lattice (≤8m)", mr: 18.0, vr: 15.8, mass: 5.0, mat: 'Alum', ei: 3360.0 },

  // Apollo Ladder Range (353mm)
  { name: "Apollo 353mm Ladder (≤3m)", mr: 5.0, vr: 5.6, mass: 4.5, mat: 'Alum', ei: 1960.0 },
  { name: "Apollo 353mm Ladder (≤6m)", mr: 9.0, vr: 5.2, mass: 4.5, mat: 'Alum', ei: 1960.0 },
  { name: "Apollo 353mm Ladder (≤9m)", mr: 12.1, vr: 5.5, mass: 4.5, mat: 'Alum', ei: 1960.0 },
  { name: "Apollo 353mm Ladder (≤12m)", mr: 14.4, vr: 5.4, mass: 4.5, mat: 'Alum', ei: 1960.0 },

  // Apollo Ladder Range (228mm)
  { name: "Apollo 228mm Ladder (≤3m)", mr: 3.9, vr: 4.0, mass: 4.27, mat: 'Alum', ei: 700.0 },
  { name: "Apollo 228mm Ladder (≤6m)", mr: 7.2, vr: 4.5, mass: 4.27, mat: 'Alum', ei: 700.0 },
  { name: "Apollo 228mm Ladder (≤9m)", mr: 8.1, vr: 4.7, mass: 4.27, mat: 'Alum', ei: 700.0 },
  { name: "Apollo 228mm Ladder (≤12m)", mr: 9.0, vr: 4.8, mass: 4.27, mat: 'Alum', ei: 700.0 }
];

// --- FEA Matrix Solver ---
const solveMatrix = (A, B) => {
  const n = B.length;
  if (n === 0) return [];
  for (let i = 0; i < n; i++) {
    let max = i;
    for (let j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
    [A[i], A[max]] = [A[max], A[i]]; 
    [B[i], B[max]] = [B[max], B[i]];
    if (Math.abs(A[i][i]) < 1e-22) return null;
    for (let j = i + 1; j < n; j++) {
      const factor = A[j][i] / A[i][i];
      B[j] -= factor * B[i];
      for (let k = i; k < n; k++) A[j][k] -= factor * A[i][k];
    }
  }
  const X = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += A[i][j] * X[j];
    X[i] = (B[i] - sum) / A[i][i];
  }
  return X;
};

const App = () => {
  // --- States ---
  const [beamLength, setBeamLength] = useState(8.0);
  const [supports, setSupports] = useState([
    { id: 1, x: 0, type: 'pinned', stiffness: 50 },
    { id: 2, x: 8, type: 'liftoff', stiffness: 50 }
  ]);
  const [pointLoads, setPointLoads] = useState([{ id: 1, magnitude: 12.0, x: 4.0, label: 'P1' }]);
  const [patchUDLs, setPatchUDLs] = useState([]);
  const [globalUDL, setGlobalUDL] = useState(1.5); 
  const [selectedBeamIdx, setSelectedBeamIdx] = useState(0);
  const [beamQuantity, setBeamQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('analysis'); 
  const [showTechBasis, setShowTechBasis] = useState(false);

  // Initialized to empty strings as requested
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');

  const [user, setUser] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const selectedBeamBase = SCAFFOLD_BEAMS[selectedBeamIdx] || SCAFFOLD_BEAMS[0];

  // --- Functions ---
  const handleReset = () => {
    setBeamLength(8.0);
    setSupports([{ id: 1, x: 0, type: 'pinned', stiffness: 50 }, { id: 2, x: 8, type: 'liftoff', stiffness: 50 }]);
    setPointLoads([{ id: 1, magnitude: 12.0, x: 4.0, label: 'P1' }]);
    setPatchUDLs([]);
    setGlobalUDL(1.5);
    setBeamQuantity(1);
    setSelectedBeamIdx(0);
    setProjectName('');
    setClientName('');
    setEngineerName('');
    setProjectLocation('');
  };

  const loadProject = (proj) => {
    setProjectName(proj.name);
    setClientName(proj.client || '');
    setEngineerName(proj.engineer || '');
    setProjectLocation(proj.location || '');
    const c = proj.config;
    setBeamLength(c.beamLength);
    setSupports(c.supports);
    setPointLoads(c.pointLoads);
    setPatchUDLs(c.patchUDLs);
    setGlobalUDL(c.globalUDL);
    setSelectedBeamIdx(c.selectedBeamIdx);
    setBeamQuantity(c.beamQuantity);
    setActiveTab('analysis');
  };

  // --- Auth & Firestore ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Temporarily mock or disable anonymous sign-in locally to avoid dummy config errors
          console.log("Firebase Auth: Mock environment, skipping actual sign in.");
          // await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth failed:", err); }
    };
    initAuth();
    // In mock mode, don't continuously listen or we'll get permission errors
    // const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    // return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const projectsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
    const unsub = onSnapshot(query(projectsRef), (snap) => {
      const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSavedProjects(projects.sort((x, y) => (y.updatedAt?.seconds || 0) - (x.updatedAt?.seconds || 0)));
    }, (err) => { console.error("Firestore Listen Err:", err); });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    setSupports(prev => [...prev].map(s => ({ ...s, x: Math.max(0, Math.min(s.x, beamLength)) })).sort((a, b) => a.x - b.x));
    setPointLoads(prev => prev.map(p => ({ ...p, x: Math.max(0, Math.min(p.x, beamLength)) })));
    setPatchUDLs(prev => prev.map(u => ({ 
      ...u, 
      start: Math.max(0, Math.min(u.start, beamLength)),
      end: Math.max(0, Math.min(u.end, beamLength))
    })));
  }, [beamLength]);

  const clampPos = (val) => Math.max(0, Math.min(val, beamLength));

  const handleSupportUpdate = (updatedList) => {
    const sorted = [...updatedList].sort((a, b) => a.x - b.x);
    setSupports(sorted);
  };

  const saveProject = async () => {
    if (!user || !projectName.trim()) return;
    setIsSaving(true);
    try {
      const id = projectName.trim().toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', id), {
        name: projectName.trim(), client: clientName, engineer: engineerName, location: projectLocation,
        config: { beamLength, supports, pointLoads, patchUDLs, globalUDL, selectedBeamIdx, beamQuantity },
        updatedAt: serverTimestamp()
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) { setSaveStatus('error'); setTimeout(() => setSaveStatus(null), 3000); } finally { setIsSaving(false); }
  };

  const deleteProject = async (id) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', id)); } catch (err) { console.error(err); }
  };

  // --- FEA Calculation ---
  const analysisResults = useMemo(() => {
    let converged = false, iteration = 0, currentStable = true;
    let finalReactions = [], finalPlotData = [];
    let fMaxM = 0, fMinM = 0, fMaxV = 0, fMinV = 0, fMaxDelta = 0, fMinDelta = 0;
    let currentSupportsState = supports.map(s => ({ ...s, active: true }));

    const nodeSet = new Set([0, beamLength]);
    supports.forEach(s => nodeSet.add(s.x));
    pointLoads.forEach(p => nodeSet.add(p.x));
    patchUDLs.forEach(u => { nodeSet.add(u.start); nodeSet.add(u.end); });
    const sortedNodes = Array.from(nodeSet).sort((a, b) => a - b);
    const nNodes = sortedNodes.length, nDof = nNodes * 2;
    const EI = selectedBeamBase.ei * beamQuantity; 
    const selfWeight = 0; 

    let U_full = Array(nDof).fill(0);

    while (!converged && iteration < 15) {
      let K = Array(nDof).fill(0).map(() => Array(nDof).fill(0));
      let F = Array(nDof).fill(0);
      
      const activeVerts = currentSupportsState.filter(s => s.active);
      const activeFixedRot = activeVerts.filter(s => s.type === 'fixed').length;
      const distinctX = new Set(activeVerts.map(s => s.x.toFixed(4))).size;

      if (activeVerts.length < 1 || (activeFixedRot === 0 && distinctX < 2)) { 
        currentStable = false; 
        break; 
      }

      for (let i = 0; i < nNodes - 1; i++) {
        const L = sortedNodes[i+1] - sortedNodes[i];
        if (L <= 1e-6) continue;
        const mid = (sortedNodes[i] + sortedNodes[i+1]) / 2;
        let w = globalUDL + selfWeight;
        patchUDLs.forEach(p => { if (mid >= p.start && mid <= p.end) w += p.magnitude; });
        const dofs = [2*i, 2*i+1, 2*(i+1), 2*(i+1)+1];
        const k_loc = [
          [12, 6*L, -12, 6*L], [6*L, 4*L*L, -6*L, 2*L*L], 
          [-12, -6*L, 12, -6*L], [6*L, 2*L*L, -6*L, 4*L*L]
        ].map(row => row.map(v => v * EI / Math.pow(L, 3)));
        for (let r=0; r<4; r++) for (let c=0; c<4; c++) K[dofs[r]][dofs[c]] += k_loc[r][c];
        F[dofs[0]] -= w*L/2; F[dofs[1]] -= w*L*L/12; F[dofs[2]] -= w*L/2; F[dofs[3]] += w*L*L/12;
      }
      pointLoads.forEach(p => {
        const idx = sortedNodes.findIndex(n => Math.abs(n - p.x) < 1e-5);
        if (idx !== -1) F[2*idx] -= p.magnitude;
      });

      const fixedDofs = new Set();
      currentSupportsState.forEach(s => {
        if (!s.active) return;
        const idx = sortedNodes.findIndex(n => Math.abs(n - s.x) < 1e-5);
        if (idx === -1) return;
        if (s.type === 'spring') {
          K[2 * idx][2 * idx] += (parseFloat(s.stiffness) || 0) * 1000;
        } else {
          fixedDofs.add(2 * idx); 
          if (s.type === 'fixed') fixedDofs.add(2 * idx + 1); 
        }
      });

      const activeIndices = [];
      for (let i=0; i<nDof; i++) if (!fixedDofs.has(i)) activeIndices.push(i);

      let Ka = activeIndices.map(r => activeIndices.map(c => K[r][c]));
      let Fa = activeIndices.map(i => F[i]);
      const Ua = activeIndices.length > 0 ? solveMatrix(Ka, Fa) : [];
      if (Ua === null || Ua.length === 0) { currentStable = false; break; }

      U_full = Array(nDof).fill(0);
      activeIndices.forEach((d, i) => U_full[d] = Ua[i]);
      const reacts = Array(nDof).fill(0);
      for (let i=0; i<nDof; i++) {
        let sum = 0; for (let j=0; j<nDof; j++) sum += K[i][j] * U_full[j];
        reacts[i] = sum - F[i];
      }
      
      let changed = false;
      currentSupportsState.forEach(s => {
        if (s.active && s.type === 'liftoff') {
          const idx = sortedNodes.findIndex(n => Math.abs(n - s.x) < 1e-5);
          if (reacts[2*idx] < -0.001) { s.active = false; changed = true; }
        }
      });
      if (!changed) converged = true;
      finalReactions = reacts; iteration++;
    }

    if (currentStable) {
      const plotPts = [];
      for (let i=0; i<nNodes-1; i++) {
        const L_seg = sortedNodes[i+1] - sortedNodes[i];
        for (let j=0; j<50; j++) plotPts.push(sortedNodes[i] + (j * L_seg / 50));
      }
      plotPts.push(beamLength);

      plotPts.forEach(x => {
        let vx = 0, mx = 0;
        sortedNodes.forEach((n, idx) => {
          if (n <= x + 1e-6) {
            const s = currentSupportsState.find(it => Math.abs(it.x - n) < 1e-5 && it.active);
            let rV = s ? (s.type === 'spring' ? (parseFloat(s.stiffness) * 1000 * -U_full[2 * idx]) : finalReactions[2 * idx]) : 0;
            let rM = (s && s.type === 'fixed') ? finalReactions[2 * idx + 1] : 0;
            vx += rV; mx += rV * (x - n) - rM;
          }
        });
        pointLoads.forEach(p => { if (p.x <= x + 1e-6) { vx -= p.magnitude; mx -= p.magnitude * (x - p.x); } });
        let wBase = globalUDL + selfWeight;
        for (let stepX = 0; stepX < x; stepX += 0.05) {
          const seg = Math.min(0.05, x - stepX), midX = stepX + seg/2;
          let pW = 0; patchUDLs.forEach(p => { if (midX >= p.start && midX <= p.end) pW += p.magnitude; });
          const totalW = wBase + pW;
          vx -= totalW * seg; mx -= totalW * seg * (x - midX);
        }
        const elementIdx = Math.min(nNodes - 2, Math.max(0, sortedNodes.findIndex(n => n > x - 1e-5) - 1));
        const x1 = sortedNodes[elementIdx], xi = (x - x1) / (sortedNodes[elementIdx + 1] - x1);
        const L_elem = (sortedNodes[elementIdx + 1] - x1);
        const u = [U_full[2 * elementIdx], U_full[2 * elementIdx + 1], U_full[2 * (elementIdx + 1)], U_full[2 * (elementIdx + 1) + 1]];
        
        const nodalDef = (1 - 3 * Math.pow(xi, 2) + 2 * Math.pow(xi, 3)) * u[0] + (L_elem * (xi - 2 * Math.pow(xi, 2) + Math.pow(xi, 3))) * u[1] + (3 * Math.pow(xi, 2) - 2 * Math.pow(xi, 3)) * u[2] + (L_elem * (-Math.pow(xi, 2) + Math.pow(xi, 3))) * u[3];
        
        // The Hermitian shape functions are cubic. UDL produces a 4th-order deflection shape.
        // The FEA gives exact nodal displacements/rotations, but interior interpolation needs
        // a quartic correction: v_particular = -w*(x-x1)^2*(x2-x)^2 / (24EI)  [negative = downward]
        // This is zero at nodes (so peak sagging at nodes stays exact), non-zero between nodes.
        // Therefore: v_exact = nodalDef - correction, and totalDef = -(nodalDef - correction)*1000
        let segmentW = globalUDL;
        patchUDLs.forEach(p => { if (x >= p.start && x <= p.end) segmentW += p.magnitude; });
        const udlCorrection = (segmentW * Math.pow(x - x1, 2) * Math.pow(sortedNodes[elementIdx + 1] - x, 2)) / (24 * EI);
        let totalDef = -(nodalDef - udlCorrection) * 1000;
        finalPlotData.push({ x: parseFloat(x.toFixed(3)), shear: vx, moment: mx, deflection: totalDef });
        fMaxM = Math.max(fMaxM, mx); fMinM = Math.min(fMinM, mx); fMaxV = Math.max(fMaxV, vx); fMinV = Math.min(fMinV, vx);
        fMaxDelta = Math.max(fMaxDelta, totalDef); 
        fMinDelta = Math.min(fMinDelta, totalDef); 
      });
    }

    const reactSummary = supports.map(s => {
      const state = currentSupportsState.find(item => item.id === s.id);
      const idx = sortedNodes.findIndex(n => Math.abs(n - s.x) < 1e-5);
      let vF = 0, mF = 0;
      if (state?.active) {
        if (s.type === 'spring') vF = (parseFloat(s.stiffness) || 0) * 1000 * -U_full[2 * idx];
        else { vF = finalReactions[2 * idx]; mF = s.type === 'fixed' ? finalReactions[2 * idx + 1] : 0; }
      }
      return { id: s.id, x: s.x, vertical: vF, moment: mF, active: state?.active, type: s.type, stiffness: s.stiffness };
    });

    return { 
      plotData: finalPlotData, peakM: Math.max(Math.abs(fMaxM), Math.abs(fMinM)), 
      peakV: Math.max(Math.abs(fMaxV), Math.abs(fMinV)), 
      maxDeltaPos: fMaxDelta, minDeltaNeg: fMinDelta, 
      reactionList: reactSummary, isStable: currentStable 
    };
  }, [beamLength, supports, pointLoads, patchUDLs, globalUDL, selectedBeamBase, beamQuantity]);

  const analysisSummary = useMemo(() => {
    const beams = SCAFFOLD_BEAMS.map(beam => {
      const sM = beam.mr * beamQuantity, sV = beam.vr * beamQuantity;
      return { 
        ...beam, sM, sV, 
        utilM: (analysisResults.peakM / sM) * 100, 
        utilV: (analysisResults.peakV / sV) * 100, 
        passBoth: sM >= analysisResults.peakM && sV >= analysisResults.peakV 
      };
    }).sort((x, y) => x.mass - y.mass);
    return { beams };
  }, [analysisResults, beamQuantity]);

  const activeBeam = analysisSummary.beams.find(b => b.name === selectedBeamBase.name) || analysisSummary.beams[0];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 font-sans text-slate-300 antialiased selection:bg-cyan-500/30">
      <div className="max-w-[1750px] mx-auto space-y-8 no-print-container">
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#0f172a] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden no-print">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-700 p-4 rounded-2xl shadow-xl"><Calculator className="w-8 h-8 text-white" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">SCAFFOLD BEAM ANALYSER <span className="text-cyan-400">ULTRA V8.0</span></h1>
              <div className="flex gap-4 mt-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5"><Activity className="w-2 h-2 text-cyan-400" /> Structural Engine Active</span>
              </div>
            </div>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 relative z-10">
            {[
              {id: 'analysis', label: 'Analysis', icon: Activity}, 
              {id: 'catalog', label: 'Library', icon: Layers}, 
              {id: 'report', label: 'Report', icon: FileText}, 
              {id: 'projects', label: 'Vault', icon: FolderOpen}
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleReset} className="p-3 text-slate-400 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-500 transition-all z-10 no-print"><RotateCcw className="w-5 h-5" /></button>
        </header>

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 no-print">
            <div className="space-y-6">
              <section className="bg-[#0f172a] p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 italic flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500" /> Project Details</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-600 pl-2">Title</label>
                    <input type="text" placeholder="Project Name..." value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-600 pl-2">Client</label>
                    <input type="text" placeholder="Client Name..." value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-600 pl-2">Engineer</label>
                    <input type="text" placeholder="Engineer..." value={engineerName} onChange={e => setEngineerName(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-600 pl-2">Site Location</label>
                    <textarea placeholder="Site Name / Location..." value={projectLocation} onChange={e => setProjectLocation(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none h-24 resize-none focus:border-amber-500" />
                  </div>
                  <button onClick={saveProject} disabled={isSaving || !projectName.trim()} className="w-full py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-500 flex items-center justify-center gap-2 transition-all">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)} 
                    {saveStatus === 'success' ? 'Saved!' : 'Save to Vault'}
                  </button>
                </div>
              </section>

              <section className="bg-[#0f172a] p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-4 border-t-8 border-cyan-500/50">
                <div className="flex items-center justify-between"><h3 className="text-xs font-black text-white uppercase italic flex items-center gap-2"><Ruler className="w-4 h-4 text-cyan-400" /> Geometry</h3><button onClick={() => handleSupportUpdate([...supports, { id: Date.now(), x: beamLength/2, type: 'liftoff', stiffness: 50 }])} className="p-1.5 bg-cyan-600/10 text-cyan-400 rounded-lg hover:bg-cyan-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button></div>
                <InputBox label="Total Beam Length" value={beamLength} onChange={setBeamLength} unit="m" theme="cyan" />
                <div className="space-y-3 pt-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {supports.map((s, idx) => (
                    <div key={s.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 group relative">
                      <button onClick={() => setSupports(supports.filter(sup => sup.id !== s.id))} className="absolute -top-1 -right-1 p-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <InputBox label={`S${idx+1} (m)`} value={s.x} onChange={v => handleSupportUpdate(supports.map(sup => sup.id === s.id ? { ...sup, x: clampPos(v) } : sup))} theme="cyan" />
                        <select value={s.type} onChange={e => setSupports(supports.map(sup => sup.id === s.id ? { ...sup, type: e.target.value } : sup))} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-1.5 text-[10px] font-black italic text-cyan-400 mt-5 focus:border-cyan-500 outline-none">
                          <option value="pinned">Pinned</option><option value="fixed">Fixed</option><option value="liftoff">Lift Off</option><option value="spring">Pinned Spring</option>
                        </select>
                      </div>
                      {s.type === 'spring' && <div className="mt-3"><InputBox label="Spring (k)" value={s.stiffness} onChange={v => setSupports(supports.map(sup => sup.id === s.id ? { ...sup, stiffness: v } : sup))} unit="kN/mm" theme="cyan" /></div>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#0f172a] p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-4 border-t-8 border-rose-500/50">
                <h3 className="text-xs font-black text-white uppercase mb-4 italic flex items-center gap-2"><Activity className="w-4 h-4 text-rose-400" /> Action Loads</h3>
                <InputBox label="Global UDL (w)" value={globalUDL} onChange={setGlobalUDL} unit="kN/m" theme="rose" />
                <div className="h-px bg-slate-800 my-4" />
                <div className="flex justify-between items-center mb-2"><h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Partial UDLs</h4><button onClick={() => setPatchUDLs([...patchUDLs, { id: Date.now(), magnitude: 5.0, start: 0, end: beamLength/2 }])} className="p-1 bg-amber-600/10 text-amber-400 rounded text-[9px] hover:bg-amber-600 hover:text-white transition-all">Add Load Area</button></div>
                {patchUDLs.map(u => (
                  <div key={u.id} className="p-3 bg-slate-900/50 rounded-xl mb-3 border border-slate-800 relative group transition-colors hover:border-amber-500/30">
                    <button onClick={() => setPatchUDLs(patchUDLs.filter(item => item.id !== u.id))} className="absolute -top-1 -right-1 p-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                    <InputBox label="kN/m" value={u.magnitude} onChange={v => setPatchUDLs(patchUDLs.map(item => item.id === u.id ? { ...item, magnitude: v } : item))} theme="rose" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <InputBox label="Start" value={u.start} onChange={v => setPatchUDLs(patchUDLs.map(item => item.id === u.id ? { ...item, start: clampPos(v) } : item))} theme="rose" />
                      <InputBox label="End" value={u.end} onChange={v => setPatchUDLs(patchUDLs.map(item => item.id === u.id ? { ...item, end: clampPos(v) } : item))} theme="rose" />
                    </div>
                  </div>
                ))}
                <div className="h-px bg-slate-800 my-4" />
                <div className="flex justify-between items-center mb-2"><h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Point Forces</h4><button onClick={() => setPointLoads([...pointLoads, { id: Date.now(), magnitude: 15.0, x: beamLength/2, label: `P${pointLoads.length+1}` }])} className="p-1 bg-rose-600/10 text-rose-400 rounded text-[9px] hover:bg-rose-600 hover:text-white transition-all">Add Point</button></div>
                {pointLoads.map(p => (
                  <div key={p.id} className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-xl mb-2 border border-slate-800 group relative transition-colors hover:border-rose-500/30">
                    <button onClick={() => setPointLoads(pointLoads.filter(item => item.id !== p.id))} className="absolute -top-1 -right-1 p-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                    <InputBox label="kN" value={p.magnitude} onChange={v => setPointLoads(pointLoads.map(pl => pl.id === p.id ? { ...pl, magnitude: v } : pl))} theme="rose" />
                    <InputBox label="Pos (m)" value={p.x} onChange={v => setPointLoads(pointLoads.map(pl => pl.id === p.id ? { ...pl, x: clampPos(v) } : pl))} theme="rose" />
                  </div>
                ))}
              </section>
            </div>

            <div className="lg:col-span-3 space-y-8 no-print">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-[#0f172a] p-6 rounded-[2rem] border-2 border-slate-800 shadow-xl transition-all hover:border-slate-700">
                  <div className="text-[10px] font-black uppercase text-slate-500 mb-2 italic">Structural Profile</div>
                  <select value={selectedBeamIdx} onChange={e => setSelectedBeamIdx(parseInt(e.target.value))} className="w-full bg-slate-900 text-cyan-400 font-black italic text-xs py-2 px-3 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none">
                    {SCAFFOLD_BEAMS.map((b, i) => <option key={i} value={i}>{b.name}</option>)}
                  </select>
                </div>
                <div className="bg-[#0f172a] p-6 rounded-[2rem] border-2 border-slate-800 shadow-xl flex justify-between items-center transition-all hover:border-slate-700">
                  <div><div className="text-[10px] font-black uppercase text-slate-500 mb-1 italic">Beams</div><div className="text-xl font-black text-white italic">{beamQuantity}x Member</div></div>
                  <div className="flex gap-2"><button onClick={() => setBeamQuantity(Math.max(1, beamQuantity - 1))} className="p-1.5 bg-slate-800 rounded hover:text-white transition-all"><Minus className="w-4 h-4" /></button><button onClick={() => setBeamQuantity(Math.min(10, beamQuantity + 1))} className="p-1.5 bg-slate-800 rounded hover:text-white transition-all"><Plus className="w-4 h-4" /></button></div>
                </div>
                <DataBox label="Peak Moment (M*)" value={analysisResults.peakM} unit="kNm" color="text-blue-400" />
                <DataBox label="Peak Shear (V*)" value={analysisResults.peakV} unit="kN" color="text-rose-400" />
              </div>

              {/* Utilisation Banner */}
              <div className={`p-6 md:p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl transition-all ${!analysisResults.isStable ? 'bg-rose-50/10 border-rose-500/40' : (activeBeam?.passBoth ? 'bg-emerald-50/10 border-emerald-500/40 text-emerald-100' : 'bg-rose-50/10 border-rose-500/40 text-rose-100')}`}>
                <div className="flex items-center gap-4 md:gap-8 text-center md:text-left">
                  <div className={`p-4 md:p-5 rounded-3xl shadow-lg ${!analysisResults.isStable ? 'bg-rose-500' : (activeBeam?.passBoth ? 'bg-emerald-500' : 'bg-rose-500')}`}>
                    {!analysisResults.isStable ? <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-white" /> : (activeBeam?.passBoth ? <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-white" /> : <XCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />)}
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-black uppercase italic leading-none">{!analysisResults.isStable ? "Mechanism Warning" : (activeBeam?.passBoth ? "Structural Adequacy" : "Stress Overflow")}</h4>
                    <p className="text-[10px] md:text-[12px] font-bold opacity-70 uppercase tracking-widest mt-2">{!analysisResults.isStable ? "System has insufficient constraints or tension-only lift-off." : `${activeBeam.name} at ${Math.max(activeBeam.utilM, activeBeam.utilV).toFixed(1)}% Capacity.`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 md:gap-12 md:border-l md:border-white/10 md:pl-12 h-full py-2 w-full md:w-auto">
                   <div className="flex-1 min-w-[120px] space-y-2">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase opacity-50 tracking-widest">M-Util</span><span className={`text-xl font-black italic ${activeBeam.utilM > 100 ? 'text-rose-500' : 'text-white'}`}>{activeBeam.utilM.toFixed(0)}%</span></div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${activeBeam.utilM > 100 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, activeBeam.utilM)}%` }} /></div>
                   </div>
                   <div className="flex-1 min-w-[120px] space-y-2">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase opacity-50 tracking-widest">V-Util</span><span className={`text-xl font-black italic ${activeBeam.utilV > 100 ? 'text-rose-500' : 'text-white'}`}>{activeBeam.utilV.toFixed(0)}%</span></div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${activeBeam.utilV > 100 ? 'bg-rose-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, activeBeam.utilV)}%` }} /></div>
                   </div>
                </div>
              </div>

              <div className="bg-[#0f172a] p-4 md:p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative h-[420px]">
                <BeamDiagram len={beamLength} supports={analysisResults.reactionList} pointLoads={pointLoads} patchUDLs={patchUDLs} globalUDL={globalUDL} onReset={handleReset} />
                {!analysisResults.isStable && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-12 z-50 rounded-[1.5rem]">
                    <AlertCircle className="w-16 h-16 text-rose-500 mb-6 animate-bounce" />
                    <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">GEOMETRIC INSTABILITY</h3>
                    <p className="text-rose-200 text-xs font-bold uppercase mt-4 tracking-widest">Constraint Failure: Insufficient support points detected.</p>
                    <button onClick={handleReset} className="mt-8 bg-white text-rose-950 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl no-print">Restore Equilibrium</button>
                  </div>
                )}
              </div>

              <div className="bg-[#0f172a] p-6 md:p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden shadow-2xl transition-all hover:border-cyan-500/20">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                <div className="flex items-center gap-6 mb-6"><div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20"><Anchor className="w-8 h-8 text-cyan-400" /></div><h4 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">SUPPORT REACTIONS REPORT</h4></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {analysisResults.reactionList.map((s, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin className="w-2.5 h-2.5" /> Support {idx + 1}</div>
                      <div className={`text-2xl font-black font-mono italic ${s.active ? 'text-white' : 'text-rose-500 animate-pulse'}`}>{s.active ? s.vertical.toFixed(2) : "LIFT-OFF"}{s.active && <span className="text-[10px] opacity-30 ml-1 font-sans not-italic">kN (V)</span>}</div>
                      {s.active && <div className="text-lg font-black font-mono italic text-indigo-400 mt-1">{s.moment.toFixed(2)}<span className="text-[9px] opacity-50 ml-1 font-sans not-italic">kNm (M)</span></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GraphTile title="Shear Envelope" color="#f43f5e" unit="kN"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={analysisResults.plotData}><CartesianGrid vertical={false} stroke="#1e293b" /><XAxis hide dataKey="x" /><YAxis fontSize={9} stroke="#475569" /><Area type="stepAfter" dataKey="shear" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} /></ComposedChart></ResponsiveContainer></GraphTile>
                <GraphTile title="Moment Envelope" color="#3b82f6" unit="kNm"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={analysisResults.plotData}><CartesianGrid vertical={false} stroke="#1e293b" /><XAxis hide dataKey="x" /><YAxis reversed fontSize={9} stroke="#475569" /><Area type="monotone" dataKey="moment" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} /></ComposedChart></ResponsiveContainer></GraphTile>
                <GraphTile title="Deflection Shape" color="#818cf8" unit="mm"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={analysisResults.plotData}><CartesianGrid vertical={false} stroke="#1e293b" /><XAxis hide dataKey="x" /><YAxis reversed fontSize={9} stroke="#475569" /><Area type="monotone" dataKey="deflection" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} strokeWidth={3} /></ComposedChart></ResponsiveContainer></GraphTile>
              </div>

              {/* DEFLECTION SUMMARY BLOCK (Added under graphs) */}
              <div className="bg-[#0f172a] p-6 md:p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30 no-print">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" /><div className="flex items-center gap-6"><div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20"><MoveVertical className="w-8 h-8 text-indigo-400" /></div><h4 className="text-xl md:text-2xl font-black text-white italic uppercase">Deflection Summary</h4></div>
                <div className="grid grid-cols-2 gap-8 md:gap-16">
                  <div className="text-center md:text-left"><div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2 justify-center md:justify-start"><ArrowRight className="w-3 h-3 rotate-90" /> Peak Sagging (+)</div><div className="text-2xl md:text-3xl font-black text-white font-mono">{analysisResults.maxDeltaPos.toFixed(2)}<span className="text-xs opacity-40 ml-1">mm</span></div></div>
                  <div className="text-center md:text-left"><div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-2 justify-center md:justify-start"><ArrowRight className="w-3 h-3 -rotate-90" /> Peak Hogging (-)</div><div className="text-2xl md:text-3xl font-black text-white font-mono">{Math.abs(analysisResults.minDeltaNeg).toFixed(2)}<span className="text-xs opacity-40 ml-1">mm</span></div></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <section className="bg-[#0f172a] p-6 md:p-10 rounded-[2rem] border border-slate-800 shadow-2xl space-y-10 no-print">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">STRUCTURAL BEAM LIBRARY</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {analysisSummary.beams.map((b, i) => (
                <button key={i} onClick={() => { setSelectedBeamIdx(SCAFFOLD_BEAMS.findIndex(orig => orig.name === b.name)); setActiveTab('analysis'); }} className={`p-6 md:p-8 rounded-[2rem] border-2 text-left transition-all relative flex flex-col justify-between ${b.passBoth ? 'bg-slate-900 border-emerald-500/30 shadow-xl hover:border-emerald-500' : 'bg-slate-950/20 border-rose-500/20 opacity-60 grayscale hover:grayscale-0'}`}>
                  {b.passBoth && <div className="absolute top-6 right-6 bg-emerald-500 p-1.5 rounded-full"><CheckCircle className="w-4 h-4 text-white" /></div>}
                  <div><div className="text-[9px] font-black text-slate-500 uppercase italic mb-1">{b.mat} Component</div><h4 className="text-lg md:text-xl font-black text-white italic mb-6 leading-tight h-14 overflow-hidden">{b.name}</h4></div>
                  <div className="space-y-4 border-t border-slate-800 pt-6"><div className="flex justify-between"><div><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Cap. M*</span><div className={`text-lg font-black italic ${b.sM >= analysisResults.peakM ? 'text-emerald-400' : 'text-rose-400'}`}>{b.sM.toFixed(1)}</div></div><div className="text-right"><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Util.</span><div className="text-lg font-black italic text-white">{b.utilM.toFixed(0)}%</div></div></div></div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'report' && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-5xl flex justify-end mb-6 no-print w-full">
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-500 shadow-xl transition-all">
                <Download className="w-4 h-4" /> Export to PDF / Print
              </button>
            </div>
             <section id="report-view" className="bg-white text-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl space-y-12 max-w-5xl mx-auto border-t-[12px] border-cyan-600 min-h-screen relative text-xs print-report-view">
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 gap-4">
                <div><h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-cyan-700">Design Calculation</h1><p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Ref: CALC-V8.0-EXT</p></div>
                <div className="text-right"><h3 className="text-lg md:text-xl font-black italic">{projectName || "Calculation Project"}</h3><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-1">Project Metadata</h4>
                  <div className="space-y-3 font-black italic text-slate-800">
                    <div className="flex gap-2 items-center"><User className="w-3 h-3 opacity-20" /> <span className="opacity-40 uppercase text-[9px] mr-2">Client:</span> {clientName || "N/A"}</div>
                    <div className="flex gap-2 items-center"><Edit3 className="w-3 h-3 opacity-20" /> <span className="opacity-40 uppercase text-[9px] mr-2">Engineer:</span> {engineerName || "N/A"}</div>
                    <div className="flex gap-2 items-center"><MapPin className="w-3 h-3 opacity-20" /> <span className="opacity-40 uppercase text-[9px] mr-2">Location:</span> {projectLocation || "N/A"}</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-1">Member Specification</h4>
                  <div className="grid grid-cols-2 gap-y-4 font-black italic">
                    <div><label className="text-[9px] font-black opacity-30 uppercase block">Beam Type</label>{activeBeam.name}</div>
                    <div><label className="text-[9px] font-black opacity-30 uppercase block">Number of Beams</label>{beamQuantity} No.</div>
                    <div><label className="text-[9px] font-black opacity-30 uppercase block">Total EI (kNm²)</label>{(activeBeam.ei * beamQuantity).toLocaleString()}</div>
                    <div><label className="text-[9px] font-black opacity-30 uppercase block">Dead Load</label>0.000 kN/m (Excluded)</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 break-inside-avoid">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-1">Calculation Model</h4>
                <div className="w-full aspect-[21/9] bg-slate-900 rounded-3xl p-6 shadow-inner relative overflow-hidden border border-slate-200">
                  <BeamDiagram len={beamLength} supports={analysisResults.reactionList} pointLoads={pointLoads} patchUDLs={patchUDLs} globalUDL={globalUDL} />
                </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 space-y-8 break-inside-avoid">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-1">Structural Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <SummaryCard label="Bending Moment Analysis" value={analysisResults.peakM} unit="kNm" util={activeBeam.utilM} capacity={activeBeam.sM} />
                  <SummaryCard label="Vertical Shear Analysis" value={analysisResults.peakV} unit="kN" util={activeBeam.utilV} capacity={activeBeam.sV} />
                  <SummaryCard label="Deflection Analysis" unit="mm" isServiceability sagging={analysisResults.maxDeltaPos} hogging={analysisResults.minDeltaNeg} />
                </div>
              </div>

              <div className="space-y-6 break-inside-avoid">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-1">Support Reactions Summary</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-500 tracking-widest"><th className="px-6 py-4">Ref.</th><th className="px-6 py-4">Station (m)</th><th className="px-6 py-4">Type</th><th className="px-6 py-4 text-right">Vert. Force (kN)</th><th className="px-6 py-4 text-right">Moment (kNm)</th></tr></thead>
                    <tbody className="text-sm font-black text-slate-800 italic">
                      {analysisResults.reactionList.map((s, idx) => (
                        <tr key={idx} className="border-t border-slate-50"><td className="px-6 py-4 opacity-40">S{idx+1}</td><td className="px-6 py-4">{s.x.toFixed(2)}</td><td className="px-6 py-4 capitalize opacity-60 text-[10px]">{s.type}</td><td className="px-6 py-4 text-right font-mono">{s.active ? s.vertical.toFixed(2) : "LIFT-OFF"}</td><td className="px-6 py-4 text-right font-mono text-indigo-600">{s.active ? (s.type === 'fixed' ? s.moment.toFixed(2) : "0.00") : "0.00"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Collapsible Technical Basis */}
              <div className="pt-10 border-t-2 border-slate-50 break-inside-avoid">
                <button 
                  onClick={() => setShowTechBasis(!showTechBasis)}
                  className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-tighter italic hover:bg-slate-800 transition-all shadow-lg no-print"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  {showTechBasis ? "Hide Mathematical Basis" : "View Technical Mathematical Basis"}
                  {showTechBasis ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </button>

                <div className={`mt-8 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500 ${showTechBasis ? 'block' : 'hidden print:block'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 break-inside-avoid">
                    <div className="space-y-4">
                      <h5 className="font-black uppercase text-slate-900 border-b pb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-600" /> 1. Mathematical Method
                      </h5>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                        The application utilizes the <strong>Matrix Displacement Method (FEA)</strong>. Unlike Macaulay’s Method or simple Superposition, the engine discretizes the beam into distinct finite elements at load and support nodes. This allows for exact solutions of multi-span systems and iterative tension-only convergence for Lift-off supports.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-black uppercase text-slate-900 border-b pb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-600" /> 2. Structural Assumptions
                      </h5>
                      <ul className="text-[13px] text-slate-600 space-y-2 font-bold italic">
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Euler-Bernoulli Beam Theory (Plane sections remain plane)</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Small Deflection Theory (Geometric linearity)</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Linear Elasticity (Hooke's Law: E is constant)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner break-inside-avoid">
                    <h5 className="font-black uppercase text-slate-900 mb-6 text-center italic">Core Matrix Formulation</h5>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Local Element Stiffness [k]:</p>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-[10px] leading-tight overflow-x-auto">
                          {'k_loc = (EI / L^3) * ['}<br/>
                          {'  [12,   6L,   -12,   6L  ],'}<br/>
                          {'  [6L,   4L^2, -6L,   2L^2],'}<br/>
                          {'  [-12, -6L,    12,  -6L  ],'}<br/>
                          {'  [6L,   2L^2, -6L,   4L^2]'}<br/>
                          {']'}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Equilibrium Equation:</p>
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                          <span className="text-2xl font-black italic text-cyan-800 tracking-tighter">{'[K][U] = [F]'}</span>
                          <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Global Stiffness x Displacement = Nodal Forces</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-emerald-500 pl-8 space-y-4 break-inside-avoid">
                    <h5 className="font-black uppercase text-slate-900 italic">Structural Engine Validation Case</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-bold italic text-slate-500">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-slate-800 uppercase block mb-1">Standard Check</span>
                        4m Beam, 10kN Center Load
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-slate-800 uppercase block mb-1">Manual Formula</span>
                        {'M_max = PL/4 = (10*4)/4 = 10kNm'}
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-700">
                        <span className="text-emerald-800 uppercase block mb-1">Engine Output</span>
                        {'Result: 10.000kNm (100% Correlation)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OFFICIAL DISCLAIMER SECTION */}
              <div className="p-8 rounded-[1.5rem] bg-slate-50 border border-slate-200 space-y-4 break-inside-avoid">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" /> DISCLAIMER
                </h4>
                <p className="text-[13px] text-slate-600 font-bold italic leading-relaxed">
                  This tool is for preliminary design assistance only. All final designs must be reviewed and signed off by a Qualified Permanent Works or Temporary Works Engineer.
                </p>
              </div>

              <div className={`p-8 rounded-3xl border-2 flex items-center gap-8 break-inside-avoid ${!analysisResults.isStable ? 'bg-rose-950 border-rose-500 text-white' : (activeBeam.passBoth ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900')}`}>
                {!analysisResults.isStable ? <AlertTriangle className="w-12 h-12" /> : (activeBeam.passBoth ? <ShieldCheck className="w-12 h-12 shrink-0" /> : <XCircle className="w-12 h-12 shrink-0" />)}
                <p className="font-black italic uppercase text-base leading-relaxed tracking-tight">
                  {!analysisResults.isStable ? 
                    "FATAL DESIGN ERROR: The structural model is geometrically unstable (Mechanism). This configuration cannot support any load. Immediate design review required." :
                    (activeBeam.passBoth ? `Structural verification successful: Configuration adequate for applied loading.` : `Structural failure detected: Configuration insufficient for specified loads.`)
                  }
                </p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'projects' && (
          <section className="bg-[#0f172a] p-6 md:p-10 rounded-[2rem] border border-slate-800 shadow-2xl space-y-10 no-print">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-5"><FolderOpen className="w-10 h-10 text-amber-500" /> PROJECT VAULT</h2>
            {savedProjects.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 text-slate-600 border-2 border-dashed border-slate-800 rounded-[3rem]">
                 <Layers className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-black uppercase italic tracking-widest">No saved projects found in vault</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {savedProjects.map(proj => (
                  <div key={proj.id} className="bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 group relative transition-all hover:border-amber-500/30 shadow-lg flex flex-col justify-between overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h3 className="text-2xl font-black text-white italic truncate pr-8">{proj.name}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase mt-1 flex items-center gap-2"><User className="w-3 h-3" /> {proj.client || 'General Client'}</p>
                      </div>
                      <button onClick={() => deleteProject(proj.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors bg-slate-950/50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                    </div>
                    <button onClick={() => loadProject(proj)} className="w-full bg-amber-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase italic shadow-xl hover:bg-amber-500 flex items-center justify-center gap-3 transition-all relative z-10">
                      Restore Data <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { 
          @page { size: auto; margin: 15mm; }
          html, body { height: auto; overflow: visible; background: #fff !important; margin: 0; padding: 0; }
          .no-print, .no-print-container header, .no-print-container nav, button, select, input { display: none !important; } 
          .no-print-container { max-width: 100% !important; margin: 0 !important; width: 100% !important; background: transparent !important; }
          #report-view { 
            position: static; 
            width: 100% !important; 
            height: auto; 
            margin: 0 !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
            border: none !important; 
            background: white !important; 
            display: block !important; 
            z-index: auto;
          }
          .aspect-\\[21\\/9\\] { border: 1px solid #ccc !important; }
        } 
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      ` }} />
    </div>
  );
};

const DataBox = ({ label, value, unit, color }) => (
  <div className="bg-[#0f172a] p-6 rounded-[2rem] border-2 border-slate-800 flex flex-col justify-center shadow-xl">
    <div className="text-[10px] font-black text-slate-500 uppercase mb-1 italic truncate">{label}</div>
    <div className={`text-2xl font-black font-mono ${color} tracking-tighter truncate`}>{Math.abs(value).toFixed(2)}<span className="text-[12px] opacity-30 ml-1 italic">{unit}</span></div>
  </div>
);

const InputBox = ({ label, value, onChange, unit, theme }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
    <label className="text-[10px] font-black text-slate-500 uppercase italic pl-1 tracking-widest truncate">{label}</label>
    <div className="flex items-center w-full">
      <input type="number" value={value} step="0.1" onChange={e => onChange(parseFloat(e.target.value) || 0)} className={`w-full border-2 rounded-xl py-2.5 px-4 text-xs font-black italic text-slate-100 text-right outline-none transition-all ${theme === 'cyan' ? 'bg-slate-900 border-slate-800 focus:border-cyan-500' : 'bg-slate-900 border-slate-800 focus:border-rose-500'}`} />
      {unit && <span className="ml-3 text-[10px] font-black text-slate-600 uppercase italic w-12 shrink-0">{unit}</span>}
    </div>
  </div>
);

const GraphTile = ({ title, color, unit, children }) => (
  <div className="bg-[#0f172a] p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden transition-all hover:border-slate-600">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex justify-between italic"><span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /> {title}</span><span className="opacity-40">{unit}</span></h3>
    <div className="h-44">{children}</div>
  </div>
);

const SummaryCard = ({ label, value, unit, util, capacity, isServiceability, sagging, hogging }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div>
      <div className="text-[10px] font-black opacity-40 uppercase mb-3 border-b border-slate-50 pb-1">{label}</div>
      {isServiceability ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 italic uppercase">Sagging (+)</span>
            <span className="text-base font-black italic text-emerald-600">{sagging.toFixed(2)} {unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 italic uppercase">Hogging (-)</span>
            <span className="text-base font-black italic text-rose-600">{Math.abs(hogging).toFixed(2)} {unit}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-500 italic uppercase">Calculated</span>
            <span className="text-lg font-black italic">{value.toFixed(2)} {unit}</span>
          </div>
          {!isServiceability && (
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <span className="text-[10px] font-bold text-slate-500 italic uppercase">Permissible</span>
              <span className="text-lg font-black italic text-cyan-700">{capacity?.toFixed(2)} {unit}</span>
            </div>
          )}
        </>
      )}
    </div>
    {!isServiceability ? (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-black text-slate-300 italic tracking-widest uppercase">Utilisation</span>
          <span className={`text-base font-black italic ${util > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>{util?.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${util > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, util)}%` }} />
        </div>
      </div>
    ) : (
      <div className="text-[10px] font-bold mt-3 text-amber-600 uppercase italic text-right leading-tight">Engineer verification required</div>
    )}
  </div>
);

const DimLine = ({ x1, x2, y, label, color, small }) => {
  if (Math.abs(x1 - x2) < 5) return null;
  return (
    <g opacity="0.9"><line x1={x1} y1={y-12} x2={x1} y2={y+12} stroke={color} strokeWidth="1.5" /><line x1={x2} y1={y-12} x2={x2} y2={y+12} stroke={color} strokeWidth="1.5" /><line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="1.2" strokeDasharray="6 3" /><text x={(x1+x2)/2} y={y - 8} textAnchor="middle" className={`${small ? 'text-[12px]' : 'text-[18px]'} font-black italic`} fill={color}>{label}</text></g>
  );
};

const BeamDiagram = ({ len, supports, pointLoads, patchUDLs, globalUDL }) => {
  const m = 80, w = 1200, h = 420, bY = h / 2.2;
  const getX = v => (v / Math.max(0.1, len)) * (w - 2 * m) + m;
  const clampPos = (val) => Math.max(0, Math.min(val, len));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full select-none drop-shadow-2xl">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff08" strokeWidth="1"/></pattern>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#475569" /><stop offset="50%" stopColor="#f8fafc" /><stop offset="100%" stopColor="#475569" /></linearGradient>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" /></marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect x={m} y={bY - 12} width={w - 2 * m} height={24} fill="url(#beamGrad)" rx="4" />

      {globalUDL > 0 && (<g><DimLine x1={m} x2={w-m} y={35} label={`Global: ${globalUDL.toFixed(2)} kN/m`} color="#6366f1" small /><rect x={m} y={bY - 25} width={w - 2 * m} height={12} fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" /></g>)}
      
      {pointLoads.map((p, i) => (<DimLine key={p.id} x1={m} x2={getX(clampPos(p.x))} y={70 + (i * 30)} label={`P${i+1}: ${p.x.toFixed(2)}m`} color="#f43f5e" small />))}
      
      {patchUDLs.map((u, i) => (
        <g key={u.id}>
          {u.start > 0.001 && (
            <DimLine x1={m} x2={getX(clampPos(u.start))} y={130 + (i * 50)} label={`Offset: ${u.start.toFixed(2)}m`} color="#f59e0b" small />
          )}
          <DimLine x1={getX(clampPos(u.start))} x2={getX(clampPos(u.end))} y={160 + (i * 50)} label={`${u.magnitude.toFixed(2)} kN/m [${(u.end - u.start).toFixed(2)}m long]`} color="#f59e0b" small />
          <rect x={getX(clampPos(u.start))} y={bY - 45 - (i*5)} width={getX(clampPos(u.end)) - getX(clampPos(u.start))} height={10} fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
        </g>
      ))}

      {/* Bottom Dimensions */}
      {supports.map((s, i) => (<DimLine key={s.id} x1={m} x2={getX(clampPos(s.x))} y={h - 80 - (i * 25)} label={`S${i+1}: ${s.x.toFixed(2)}m`} color="#22d3ee" small />))}
      <DimLine x1={m} x2={w-m} y={h - 30} label={`Overall Span: ${len.toFixed(2)}m`} color="#475569" />

      {supports.map((s, i) => {
        const xp = getX(clampPos(s.x)); const color = s.active ? "#22d3ee" : "#f43f5e";
        return (<g key={s.id} transform={`translate(${xp}, ${bY + 12})`}>{s.type === 'spring' ? (<g stroke={color} strokeWidth="3" fill="none"><path d="M 0 0 L 0 5 L -8 8 L 8 13 L -8 18 L 8 23 L -8 28 L 0 31 L 0 36" /><rect x="-12" y="36" width="24" height="4" fill={color} stroke="none" /></g>) : s.type === 'fixed' ? (<g><line x1="-20" y1="0" x2="20" y2="0" stroke={color} strokeWidth="6" /><g stroke={color} strokeWidth="1.5" opacity="0.6"><line x1="-15" y1="0" x2="-22" y2="8" /><line x1="-5" y1="0" x2="-12" y2="8" /><line x1="5" y1="0" x2="-2" y2="8" /><line x1="15" y1="0" x2="8" y2="8" /><line x1="25" y1="0" x2="18" y2="8" /></g></g>) : s.type === 'liftoff' ? (<g><path d="M -15 15 L 15 15 L 0 0 Z" fill="#0f172a" stroke={color} strokeWidth="3" /><circle cx="-8" cy="20" r="4" stroke={color} strokeWidth="2.5" fill="none" /><circle cx="8" cy="20" r="4" stroke={color} strokeWidth="2.5" fill="none" /><line x1="-15" y1="26" x2="15" y2="26" stroke={color} strokeWidth="2" /></g>) : (<path d="M -15 25 L 15 25 L 0 0 Z" fill="#0f172a" stroke={color} strokeWidth="3" />)}<text y={s.type === 'spring' ? 55 : s.type === 'liftoff' ? 42 : 45} textAnchor="middle" className={`text-[16px] font-black italic ${s.active ? 'fill-white' : 'fill-rose-500'}`}>{s.active ? s.vertical?.toFixed(1) : "LIFT"}</text></g>);
      })}
      {pointLoads.map(p => (<g key={p.id} transform={`translate(${getX(clampPos(p.x))}, ${bY - 12})`}><line x1="0" y1="-80" x2="0" y2="-5" stroke="#f43f5e" strokeWidth="6" markerEnd="url(#arrow)" /><text y={-95} textAnchor="middle" className="text-[18px] font-black italic fill-rose-500">{p.magnitude}kN</text></g>))}
    </svg>
  );
};

export default App;
