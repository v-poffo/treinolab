
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  generateWorkoutCycle, 
  generateCardioLab, 
  analyzeMeal,
} from './services/geminiService';
import { UserProfile, WorkoutDay, WeightEntry, DayLog, CardioSession, MealAnalysis } from './types';

const Icons = {
  Workout: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12M6 8v8M18 8v8M2 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1ZM19 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1Z"/></svg>,
  Cardio: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 17V10l4.2-3.4c.5-.4.6-1.1.2-1.6l-.6-.8M8 12l1.9 2 2-2.1"/></svg>,
  Abs: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM8 10h8M8 14h8"/></svg>,
  Diet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L5.5 7.5L2 11l9 9l3.5-3.5L18 22"/>
      <path d="M13 2l6 6l3 3l-9 9l-3-3L13 2z"/>
      <path d="M11 2l6 6M13 4l4 4"/>
    </svg>
  ),
  ForkKnife: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2v20"/><path d="M2 12s1 0 1 0c1.1 0 2-.9 2-2V2"/><path d="M2 12v10"/><path d="M9 12v10"/><path d="M9 12s-1 0-1 0c-1.1 0-2-.9-2-2V2"/><path d="M5.5 2v10"/>
    </svg>
  ),
  Scale: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 1 0-8 0"/><circle cx="12" cy="7" r="1"/><path d="M12 11v3"/><rect x="3" y="14" width="18" height="7" rx="1"/>
    </svg>
  ),
  Progress: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/></svg>,
  Social: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>,
  ArrowBack: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>,
  Flame: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#4a7c59" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Cloud: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-4-4.5-1-3.5-4.2-6-8-6-3.8 0-7 2.5-8 6-2.3.3-4 2.2-4 4.5 0 2.5 2 4.5 4.5 4.5h15z"/></svg>,
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'treino'|'cardio'|'abs'|'dieta'|'progresso'|'calendar'|'social'>('treino');
  const [loading, setLoading] = useState(false);
  const [detailView, setDetailView] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [userBriefing, setUserBriefing] = useState('');
  const [showScanInputs, setShowScanInputs] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<DayLog | null>(null);
  const [onboardingGender, setOnboardingGender] = useState<'M' | 'F' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMeal, setRecordingMeal] = useState<string | null>(null);
  const [globalRankings, setGlobalRankings] = useState<any[]>([]);

  const [timer, setTimer] = useState({ running: false, mode: '', index: 0, time: 0, isRest: false });
  const timerRef = useRef<any>(null);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

  useEffect(() => {
    const saved = localStorage.getItem('treino_lab_v25_final');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('treino_lab_v25_final', JSON.stringify(profiles));
    if (activeProfile) syncToCloud();
  }, [profiles]);

  const syncToCloud = async () => {
    if (!activeProfile || !activeProfile.groupId || !process.env.SUPABASE_URL) return;
    try {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/rankings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: activeProfile.id,
          name: activeProfile.name,
          count: activeProfile.count,
          group_id: activeProfile.groupId.toUpperCase()
        })
      });
    } catch (e) { console.error("Erro ao sincronizar com nuvem:", e); }
  };

  const fetchGlobalRankings = async () => {
    if (!activeProfile?.groupId || !process.env.SUPABASE_URL) {
       setGlobalRankings([...profiles].sort((a,b) => b.count - a.count));
       return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rankings?group_id=eq.${activeProfile.groupId.toUpperCase()}&select=*&order=count.desc`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      if (!res.ok) throw new Error("Falha na resposta do ranking.");
      const data = await res.json();
      setGlobalRankings(data);
    } catch (e) { 
      console.error(e);
      alert("Erro ao buscar ranking global. Verifique sua conexão e chaves de API.");
      setGlobalRankings([...profiles].sort((a,b) => b.count - a.count));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'social') fetchGlobalRankings();
  }, [activeTab]);

  const exportBackup = () => {
    const dataStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_treino_lab_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setProfiles(json);
          alert("Backup restaurado com sucesso!");
        } else {
          alert("Formato de arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo de backup.");
      }
    };
    reader.readAsText(file);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setDetailView(null);
  };

  const streak = useMemo(() => activeProfile?.checkInDates.length || 0, [activeProfile]);

  const weekDays = useMemo(() => {
    const now = new Date();
    const days = [];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        date: d.getDate(),
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0).toUpperCase(),
        done: activeProfile?.checkInDates.some(cid => cid.startsWith(iso))
      });
    }
    return days;
  }, [activeProfile]);

  const dailyMetrics = useMemo(() => {
    if (!activeProfile) return { kcalGoal: 2000, currentKcal: 0 };
    const latestWeight = activeProfile.weights[activeProfile.weights.length-1]?.value || 70;
    let hRaw = parseFloat(activeProfile.height);
    let hCm = hRaw < 3 ? hRaw * 100 : hRaw;
    let bmr = (10 * latestWeight) + (6.25 * hCm) - (5 * 25);
    bmr = activeProfile.gender === 'M' ? bmr + 5 : bmr - 161;
    let tdee = bmr * 1.4; 
    const targetWeight = parseFloat(activeProfile.targetWeight) || latestWeight;
    let goal = tdee;
    if (targetWeight < latestWeight) goal = tdee - 500;
    else if (targetWeight > latestWeight) goal = tdee + 400;
    goal = Math.min(Math.max(goal, 1200), 4500);
    const current = (Object.values(activeProfile.meals) as MealAnalysis[]).reduce((acc, m) => acc + (m.calories || 0), 0);
    return { kcalGoal: Math.round(goal), currentKcal: Math.round(current) };
  }, [activeProfile]);

  const bodyMetrics = useMemo(() => {
    if (!activeProfile) return { imc: '0.0', fat: 0 };
    const latest = activeProfile.weights[activeProfile.weights.length-1];
    const weight = latest?.value || 0;
    let hRaw = parseFloat(activeProfile.height);
    let hM = hRaw > 3 ? hRaw / 100 : hRaw;
    let hCm = hM * 100;
    const imcValue = weight > 0 ? (weight / (hM * hM)).toFixed(1) : '0.0';
    let fatValue = 0;
    if (latest?.waist && latest?.neck && (activeProfile.gender === 'M' || latest.hips)) {
      const neck = latest.neck;
      const waist = latest.waist;
      const hips = latest.hips || 0;
      try {
        if (activeProfile.gender === 'M') {
          const logVal = waist - neck;
          if (logVal > 0) fatValue = 86.010 * Math.log10(logVal) - 70.041 * Math.log10(hCm) + 36.76;
        } else {
          const logVal = waist + hips - neck;
          if (logVal > 0) fatValue = 163.205 * Math.log10(logVal) - 97.684 * Math.log10(hCm) - 78.387;
        }
      } catch (e) { fatValue = 0; }
    }
    if (!fatValue || isNaN(fatValue)) {
      const imcNum = parseFloat(imcValue);
      fatValue = (1.20 * imcNum) + (0.23 * 25) - (16.2 * (activeProfile.gender === 'M' ? 1 : 0)) - 5.4;
    }
    return { imc: imcValue, fat: Math.max(0, Math.round(fatValue)) };
  }, [activeProfile]);

  const startVoiceInput = (mealKey?: string) => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return alert("Microfone ou Reconhecimento de Voz não suportado neste navegador.");
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => { setIsRecording(true); if (mealKey) setRecordingMeal(mealKey); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (mealKey && activeProfile) {
        const currentText = activeProfile.meals[mealKey].text;
        updateProfile({ meals: { ...activeProfile.meals, [mealKey]: { ...activeProfile.meals[mealKey], text: (currentText + " " + transcript).trim() } } });
      } else { setUserBriefing(prev => (prev + " " + transcript).trim()); }
    };
    recognition.onerror = (e: any) => { console.error(e); setIsRecording(false); setRecordingMeal(null); };
    recognition.onend = () => { setIsRecording(false); setRecordingMeal(null); };
    recognition.start();
  };

  useEffect(() => {
    if (timer.running && timer.time > 0) {
      timerRef.current = setTimeout(() => { setTimer(t => ({ ...t, time: t.time - 1 })); }, 1000);
    } else if (timer.running && timer.time === 0) {
      const currentLab = timer.mode === 'Abs' ? activeProfile?.abs : activeProfile?.cardio;
      if (currentLab?.exercises) {
        if (!timer.isRest) {
          setTimer(t => ({ ...t, isRest: true, time: currentLab.exercises![t.index].rest }));
        } else {
          if (timer.index < currentLab.exercises.length - 1) {
            setTimer(t => ({ ...t, index: t.index + 1, isRest: false, time: currentLab.exercises![t.index+1].work }));
          } else {
            setTimer({ running: false, mode: '', index: 0, time: 0, isRest: false });
            alert("Sessão Bio-Lab Concluída com Sucesso!");
          }
        }
      } else if (currentLab?.intervals) {
        if (timer.index < currentLab.intervals.length - 1) {
          setTimer(t => ({ ...t, index: t.index + 1, time: currentLab.intervals![t.index+1].seconds }));
        } else {
          setTimer({ running: false, mode: '', index: 0, time: 0, isRest: false });
          alert("Cardio Lab Finalizado!");
        }
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, activeProfile]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-petrol p-10 flex flex-col justify-center animate-in slide-in-from-bottom-12">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none">ATIVAR<br/><span className="text-leaf">BIO-LAB</span></h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Defina seu código de grupo para o ranking</p>
        <div className="space-y-4">
           <input id="ob-group" type="text" placeholder="Código do Grupo (Ex: AMIGOS-VIP)" className="w-full bg-slate-900 border border-leaf/20 p-5 rounded-2xl text-leaf font-black outline-none focus:border-leaf uppercase" />
           <input id="ob-name" type="text" placeholder="Nome do Atleta" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold outline-none focus:border-leaf" />
           <div className="flex gap-4">
              <button onClick={() => setOnboardingGender('M')} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase border transition-all ${onboardingGender === 'M' ? 'bg-leaf border-leaf text-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>Masculino</button>
              <button onClick={() => setOnboardingGender('F')} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase border transition-all ${onboardingGender === 'F' ? 'bg-terracotta border-terracotta text-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>Feminino</button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <input id="ob-h" type="text" placeholder="Altura (Ex: 1.75)" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold focus:border-leaf" />
              <input id="ob-w" type="number" step="0.1" placeholder="Peso Atual (kg)" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold focus:border-leaf" />
           </div>
           <input id="ob-freq" type="number" placeholder="Treinos por semana" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold" />
           <input id="ob-target" type="number" step="0.1" placeholder="Peso Alvo (kg)" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold" />
           <button onClick={() => {
              const name = (document.getElementById('ob-name') as any).value;
              const groupId = (document.getElementById('ob-group') as any).value;
              const h = (document.getElementById('ob-h') as any).value;
              const w = (document.getElementById('ob-w') as any).value;
              const t = (document.getElementById('ob-target') as any).value;
              const freq = (document.getElementById('ob-freq') as any).value;
              if(!name || !w || !onboardingGender || !freq) return alert("Por favor, preencha todos os campos obrigatórios.");
              const id = Date.now().toString();
              const p: UserProfile = {
                id, name, groupId: groupId || undefined, gender: onboardingGender, height: h, targetWeight: t, trainingFrequency: parseInt(freq), trainingGoal: 'Performance',
                weights: [{ date: new Date().toISOString(), value: parseFloat(w) }],
                cycle: null, cardio: null, abs: null, count: 0, checkInDates: [], history: {},
                meals: { 'Café': { text: '', analysis: '', calories: 0 }, 'Almoço': { text: '', analysis: '', calories: 0 }, 'Café Tarde': { text: '', analysis: '', calories: 0 }, 'Jantar': { text: '', analysis: '', calories: 0 } }
              };
              setProfiles([...profiles, p]); setActiveProfileId(id); setIsOnboarding(false);
           }} className="w-full py-6 bg-leaf text-white rounded-[2rem] font-black uppercase shadow-xl hover:bg-terracotta transition-colors mt-4">INICIAR LABORATÓRIO</button>
           <button onClick={() => setIsOnboarding(false)} className="w-full text-[10px] font-black text-slate-500 uppercase py-2">Voltar</button>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-petrol flex flex-col items-center justify-center p-10 overflow-y-auto">
        <h1 className="text-7xl font-black tracking-tighter mb-12 flex flex-col items-center">
          <span className="text-leaf">TREINO</span>
          <span className="text-terracotta -mt-6">LAB</span>
        </h1>
        <div className="w-full max-w-xs space-y-4">
          {profiles.map(p => (
            <button key={p.id} onClick={() => setActiveProfileId(p.id)} className="w-full p-8 glass rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-leaf transition-all shadow-xl relative overflow-hidden">
              <div className="flex flex-col items-start z-10">
                <span className="font-black text-white text-sm uppercase">{p.name}</span>
                {p.groupId && <span className="text-[8px] font-black text-leaf bg-leaf/10 px-2 py-0.5 rounded-full mt-1">GRUPO: {p.groupId.toUpperCase()}</span>}
              </div>
              <div className="text-leaf z-10"><Icons.Social /></div>
              <div className="absolute right-0 bottom-0 w-12 h-12 bg-leaf/5 rounded-tl-full"></div>
            </button>
          ))}
          <button onClick={() => setIsOnboarding(true)} className="w-full py-8 border-2 border-dashed border-white/10 rounded-[3rem] text-white/30 font-black uppercase hover:text-leaf transition-all hover:border-leaf">+ NOVO ATLETA</button>
          
          <div className="pt-8 space-y-3">
             <p className="text-[10px] font-black text-slate-600 uppercase text-center tracking-widest">Opções de Dados</p>
             <div className="flex gap-2">
                <button onClick={exportBackup} className="flex-1 py-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-leaf hover:border-leaf transition-all">
                   <Icons.Download />
                   <span className="text-[8px] font-black uppercase">Exportar</span>
                </button>
                <label className="flex-1 py-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-terracotta hover:border-terracotta transition-all cursor-pointer text-center px-2">
                   <Icons.Upload />
                   <span className="text-[8px] font-black uppercase">Importar</span>
                   <input type="file" accept=".json" onChange={importBackup} className="hidden" />
                </label>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-petrol text-slate-100">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
         <div className="p-6 flex justify-between items-center">
            <button onClick={() => setActiveProfileId(null)} className="flex items-center gap-3 text-left">
               <div className="w-10 h-10 bg-leaf rounded-xl flex items-center justify-center text-white font-black text-lg">{activeProfile.name.charAt(0)}</div>
               <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-terracotta leading-none">{activeProfile.name.split(' ')[0]}</h2>
                  {activeProfile.groupId && <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">LAB: {activeProfile.groupId}</span>}
               </div>
            </button>
            <div className="flex items-center gap-3">
               {activeProfile.groupId && process.env.SUPABASE_URL && <div className="text-leaf animate-pulse"><Icons.Cloud /></div>}
               <div className="flex items-center gap-2 bg-leaf/10 px-4 py-1.5 rounded-full border border-leaf/20">
                  <Icons.Flame /><span className="text-xs font-black text-leaf">{streak}</span>
               </div>
            </div>
         </div>
         <div className="px-6 pb-6 flex justify-between items-center gap-2 overflow-x-auto">
            {weekDays.map(wd => (
               <button key={wd.iso} onClick={() => { setSelectedHistoryDay(activeProfile.history[wd.iso] || { date: wd.iso, caloriesIn: 0 }); setActiveTab('calendar'); }} className="flex flex-col items-center gap-1.5 min-w-[2.8rem]">
                  <span className="text-[8px] font-black text-slate-500 uppercase">{wd.label}</span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${wd.done ? 'bg-leaf border-leaf text-white shadow-lg' : 'border-white/5 text-slate-600'}`}>
                     {wd.done ? <Icons.Check /> : wd.date}
                  </div>
               </button>
            ))}
         </div>
      </header>

      {timer.running && activeTab !== 'cardio' && activeTab !== 'abs' && (
        <button onClick={() => setActiveTab(timer.mode === 'Abs' ? 'abs' : 'cardio')} className="fixed top-32 left-1/2 -translate-x-1/2 z-[60] bg-terracotta px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl text-white">
          SESSÃO ATIVA: {timer.time}s
        </button>
      )}

      <main className="max-w-md mx-auto p-6 space-y-10">
        
        {activeTab === 'treino' && !detailView && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="glass p-10 rounded-[4rem] space-y-6 border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Personal IA</h3>
                   <button onClick={() => startVoiceInput()} className={`p-4 rounded-full transition-all ${isRecording && !recordingMeal ? 'bg-leaf text-white shadow-xl recording-pulse relative' : 'text-slate-500 hover:text-leaf'}`}>
                     <Icons.Mic />
                   </button>
                </div>
                <textarea value={userBriefing} onChange={e => setUserBriefing(e.target.value)} placeholder="Ex: Foco em glúteos e pernas, treino rápido de 40min..." className="w-full h-24 bg-black/20 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-leaf text-white" />
                <button onClick={async () => {
                  setLoading(true); 
                  try {
                    const res = await generateWorkoutCycle(activeProfile.height, activeProfile.weights[activeProfile.weights.length-1].value.toString(), activeProfile.targetWeight, activeProfile.trainingFrequency, userBriefing);
                    updateProfile({ cycle: { ...res, totalCheckInsAtGeneration: activeProfile.count } });
                  } catch (err) {
                    console.error(err);
                    alert("Erro ao conectar com a IA. Verifique se a API_KEY está configurada corretamente nas variáveis de ambiente da Vercel.");
                  } finally { setLoading(false); }
                }} className="w-full py-5 bg-leaf text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-terracotta">Sincronizar Ciclo</button>
             </div>

             {activeProfile.cycle && (
               <div className="grid grid-cols-2 gap-4">
                 {activeProfile.cycle.days.map((day, i) => (
                   <button key={i} onClick={() => setDetailView(day)} className="card-sage p-12 rounded-[4.5rem] text-left hover:border-leaf transition-all group shadow-xl border border-white/5">
                     <span className="block text-leaf font-black text-5xl mb-2 group-hover:scale-110 transition-all">{day.category}</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-terracotta">{day.title}</span>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'treino' && detailView && (
          <div className="space-y-6 animate-in fade-in">
             <button onClick={() => setDetailView(null)} className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-4 hover:text-white"><Icons.ArrowBack /> Painel</button>
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Bio-Treino {detailView.category}<br/><span className="text-terracotta">{detailView.title}</span></h3>
             <div className="space-y-4">
                {detailView.exercises.map((ex: any, i: number) => (
                  <div key={i} className="card-leaf p-7 rounded-[3rem] border border-leaf/20 shadow-lg">
                    <div className="flex justify-between items-start mb-4"><h4 className="font-black text-white text-sm uppercase">{ex.name}</h4><span className="text-[10px] font-black text-leaf bg-leaf/10 px-4 py-1.5 rounded-full border border-leaf/20">{ex.sets}x{ex.reps}</span></div>
                    <div className="space-y-3">
                       <p className="text-[10px] text-slate-500 italic"><span className="text-terracotta font-bold uppercase">Objetivo:</span> {ex.purpose}</p>
                       <div className="bg-black/10 p-4 rounded-2xl border border-white/5">
                          <p className="text-[11px] text-slate-300 leading-relaxed font-bold">{ex.howTo}</p>
                       </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => { 
                   const today = new Date().toISOString().split('T')[0];
                   updateProfile({ 
                     count: activeProfile.count + 1, 
                     checkInDates: [...activeProfile.checkInDates, new Date().toISOString()],
                     history: { ...activeProfile.history, [today]: { ...activeProfile.history[today], date: today, workoutDone: detailView.category } }
                   }); 
                   setDetailView(null);
                   alert("Check-in realizado! +1 sessão Bio-Lab.");
                }} className="w-full py-7 bg-leaf text-white rounded-[3rem] font-black uppercase tracking-[0.2em] shadow-xl mt-6">Confirmar Sessão</button>
             </div>
          </div>
        )}

        {activeTab === 'social' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-black uppercase tracking-tighter leading-none italic flex flex-col">
                  <span className="text-leaf">BIO-LAB</span>
                  <span className="text-terracotta">RANKING</span>
                </h3>
                {activeProfile.groupId ? (
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 py-2 rounded-full inline-block px-6 border border-white/5">Grupo: {activeProfile.groupId}</p>
                ) : (
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-50">Sincronização Desativada</p>
                )}
              </div>
              
              <div className="space-y-4">
                 {globalRankings.map((p, i) => (
                    <div key={p.id} className={`glass p-8 rounded-[3.5rem] flex justify-between items-center group border transition-all shadow-xl ${p.id === activeProfile.id ? 'border-leaf/50 bg-leaf/5' : 'border-white/5 hover:border-leaf/30'}`}>
                       <div className="flex items-center gap-6">
                          <span className={`text-2xl font-black ${i === 0 ? 'text-leaf' : i === 1 ? 'text-gold' : i === 2 ? 'text-terracotta' : 'text-slate-600'}`}>{i+1}</span>
                          <div className="text-left">
                             <p className="font-black text-white text-sm uppercase tracking-widest">{p.name}</p>
                             <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Célula Ativa</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="px-5 py-2 bg-leaf/10 rounded-2xl border border-leaf/20 text-leaf font-black text-[12px] shadow-inner">{p.count} <span className="text-[8px] uppercase ml-0.5">Treinos</span></div>
                          {p.id !== activeProfile.id && profiles.find(pr => pr.id === p.id) && (
                             <button onClick={() => setActiveProfileId(p.id)} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white hover:bg-leaf active:scale-90 transition-all"><Icons.Check /></button>
                          )}
                       </div>
                    </div>
                 ))}
                 
                 {globalRankings.length === 0 && (
                    <div className="py-20 text-center opacity-30 italic font-black text-sm uppercase">Nenhum dado sincronizado ainda</div>
                 )}
              </div>

              <button onClick={fetchGlobalRankings} className="w-full py-4 text-[10px] font-black text-leaf uppercase tracking-widest border border-leaf/20 rounded-full hover:bg-leaf/5 transition-all">Atualizar Ranking Amigos</button>
           </div>
        )}

        {(activeTab === 'cardio' || activeTab === 'abs') && !detailView && (
           <div className="space-y-8 animate-in slide-in-from-bottom-4 text-center">
              <h3 className="text-3xl font-black text-white uppercase px-4 tracking-tighter leading-none">LABORATÓRIO<br/><span className="text-leaf">{activeTab === 'cardio' ? 'HIIT' : 'CORE'}</span></h3>
              <div className="grid grid-cols-1 gap-4">
                 {(activeTab === 'cardio' ? ['Bike', 'Corrida', 'Funcional'] : ['Abs']).map((type: any) => (
                    <button key={type} onClick={async () => { 
                       setLoading(true); try {
                          const res = await generateCardioLab(type); 
                          updateProfile({ [activeTab]: res } as any); setDetailView(res);
                       } catch (err) {
                          alert("Erro ao conectar com a IA. Verifique sua API_KEY na Vercel.");
                       } finally { setLoading(false); }
                    }} className="glass p-14 rounded-[5rem] border border-white/5 hover:border-leaf transition-all flex justify-between items-center group shadow-xl">
                       <div className="text-left">
                          <p className="text-[10px] text-terracotta font-black uppercase mb-1">Célula HIIT</p>
                          <span className="text-3xl font-black text-white uppercase group-hover:text-leaf transition-all">{type}</span>
                       </div>
                       <div className="w-16 h-16 bg-slate-800 rounded-[2rem] flex items-center justify-center text-leaf group-hover:scale-110 transition-transform"><Icons.Cardio /></div>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {(activeTab === 'cardio' || activeTab === 'abs') && detailView && (
           <div className="space-y-10 animate-in fade-in text-center">
              <button onClick={() => setDetailView(null)} className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 hover:text-white"><Icons.ArrowBack /> Painel</button>
              <div className="glass p-10 rounded-[4rem] text-left border-leaf/10 space-y-4 shadow-xl">
                 <div className="flex items-center gap-3 text-leaf"><Icons.Info /><h4 className="text-[11px] font-black uppercase tracking-widest text-terracotta">Base Didática</h4></div>
                 <p className="text-xs text-slate-300 leading-relaxed font-bold italic">{detailView.didacticExplanation}</p>
                 <div className="pt-4 border-t border-white/5 flex justify-between"><span className="text-[10px] font-black text-slate-500 uppercase">Duração: {detailView.duration}</span><span className="text-[10px] font-black text-leaf uppercase">Intensidade: {detailView.intensity}</span></div>
              </div>
              
              {!timer.running ? (
                <button onClick={() => {
                  if(detailView.exercises) {
                    setTimer({ running: true, mode: detailView.type, index: 0, time: detailView.exercises[0].work, isRest: false });
                  } else if(detailView.intervals) {
                    setTimer({ running: true, mode: detailView.type, index: 0, time: detailView.intervals[0].seconds, isRest: false });
                  }
                }} className="w-64 h-64 bg-leaf rounded-full text-white font-black text-4xl shadow-2xl mx-auto flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter hover:bg-terracotta">PLAY</button>
              ) : (
                <div className="bg-slate-900/80 p-16 rounded-[6rem] border border-leaf/30 shadow-2xl text-center space-y-10 animate-in zoom-in">
                  <div className={`px-10 py-4 rounded-full font-black uppercase text-xs text-white ${timer.isRest ? 'bg-slate-700' : 'bg-leaf animate-pulse'}`}>{timer.isRest ? 'DESCANSO' : (detailView.exercises ? detailView.exercises[timer.index].name : detailView.intervals[timer.index].label)}</div>
                  <p className="text-[10rem] font-black text-white tabular-nums leading-none tracking-tighter">{timer.time}</p>
                  <button onClick={() => setTimer(t => ({...t, running: false}))} className="text-[10px] font-black text-terracotta uppercase tracking-[0.4em] hover:text-leaf">Parar Bio-Lab</button>
                </div>
              )}

              <div className="space-y-4 text-left">
                 {detailView.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="card-sage p-6 rounded-[3rem] group hover:border-leaf transition-all">
                       <div className="flex justify-between items-center mb-4">
                          <p className="font-black text-white uppercase text-sm group-hover:text-leaf transition-all">{ex.name}</p>
                          <span className="text-[10px] font-black text-leaf bg-leaf/10 px-4 py-2 rounded-full border border-leaf/10">{ex.work}s / {ex.rest}s</span>
                       </div>
                       <p className="text-[11px] text-slate-300 font-bold border-l-2 border-terracotta/40 pl-4">{ex.howTo}</p>
                    </div>
                 ))}
                 {detailView.intervals?.map((iv: any, i: number) => (
                    <div key={i} className="card-sage p-6 rounded-[3rem] flex justify-between items-center hover:border-leaf transition-all">
                       <div><p className="font-black text-white uppercase text-sm">{iv.label}</p><p className="text-[10px] text-slate-500 font-bold">{iv.description || 'Foco Celular'}</p></div>
                       <span className="text-[12px] font-black text-leaf">{iv.seconds}s</span>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'dieta' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="glass p-12 rounded-[5rem] border-white/5 space-y-10 text-center shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-leaf/5 rounded-full -translate-y-16 translate-x-16"></div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Nutrição Master</h4>
                 <div className="flex justify-around items-end">
                    <div><p className="text-[10px] font-black text-terracotta mb-2 uppercase tracking-widest">Ingerido</p><p className="text-4xl font-black text-white">{dailyMetrics.currentKcal}</p></div>
                    <div className="w-16 h-16 bg-leaf/10 rounded-full flex items-center justify-center text-leaf border border-leaf/20 shadow-inner"><Icons.Diet /></div>
                    <div><p className="text-[10px] font-black text-terracotta mb-2 uppercase tracking-widest">Meta Diária</p><p className="text-4xl font-black text-white">{dailyMetrics.kcalGoal}</p></div>
                 </div>
              </div>
              {Object.keys(activeProfile.meals).map(m => (
                 <div key={m} className="card-sage p-8 rounded-[3.5rem] space-y-6 border-white/5 hover:border-leaf/20 transition-all shadow-lg">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[12px] font-black text-terracotta uppercase tracking-widest">{m}</label>
                       <div className="flex gap-2">
                          <button onClick={() => startVoiceInput(m)} className={`p-3 rounded-2xl transition-all ${recordingMeal === m ? 'bg-leaf text-white shadow-xl recording-pulse relative' : 'bg-slate-900 text-leaf hover:bg-leaf/10'}`}>
                            <Icons.Mic />
                          </button>
                          <div className="p-3 bg-slate-900 rounded-2xl text-leaf"><Icons.ForkKnife /></div>
                       </div>
                    </div>
                    <input type="text" value={activeProfile.meals[m].text} onChange={e => updateProfile({ meals: { ...activeProfile.meals, [m]: { ...activeProfile.meals[m], text: e.target.value } } })} className="w-full bg-black/20 border border-white/5 rounded-2xl p-6 text-sm outline-none focus:border-leaf text-white" placeholder="Descreva sua refeição..." />
                    <button onClick={async () => {
                       setLoading(true); try {
                          const res = await analyzeMeal(activeProfile.meals[m].text);
                          updateProfile({ meals: { ...activeProfile.meals, [m]: { ...activeProfile.meals[m], analysis: res.analysis, calories: res.calories, macros: res.macros } } });
                       } catch (err) {
                          alert("Erro ao analisar refeição com IA.");
                       } finally { setLoading(false); }
                    }} className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-leaf py-4 px-8 rounded-3xl active:scale-95 transition-all hover:bg-terracotta shadow-md">Analisar Refeição</button>
                    {activeProfile.meals[m].calories > 0 && <p className="text-[11px] text-slate-400 font-bold border-l-2 border-leaf/40 pl-5 italic leading-relaxed">{activeProfile.meals[m].analysis}</p>}
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'progresso' && (
           <div className="space-y-10 animate-in slide-in-from-bottom-4">
              <div className="glass p-12 rounded-[5.5rem] flex justify-around items-center border border-leaf/20 shadow-2xl relative">
                 <div className="text-center"><p className="text-[11px] font-black text-terracotta mb-1 uppercase tracking-widest">IMC Lab</p><p className="text-5xl font-black text-white tracking-tighter leading-none">{bodyMetrics.imc}</p></div>
                 <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-leaf shadow-xl border border-white/10"><Icons.Scale /></div>
                 <div className="text-center"><p className="text-[11px] font-black text-terracotta mb-1 uppercase tracking-widest">Gordura %</p><p className="text-5xl font-black text-leaf tracking-tighter leading-none">{bodyMetrics.fat}%</p></div>
              </div>

              <div className="glass p-10 rounded-[4.5rem] space-y-10 border border-white/5 shadow-xl">
                 <div className="flex justify-between items-center px-4">
                    <p className="text-[13px] font-black text-white uppercase tracking-widest">Sinc. Biometria</p>
                    <button onClick={() => setShowScanInputs(!showScanInputs)} className={`text-[10px] font-black px-6 py-3 rounded-full border transition-all ${showScanInputs ? 'bg-leaf border-leaf text-white shadow-lg' : 'text-slate-500 border-white/5 hover:text-leaf hover:border-leaf'}`}>BIO-SCAN</button>
                 </div>
                 <div className="space-y-6">
                    <div className="relative">
                       <input id="new-weight-val" type="number" step="0.1" placeholder="00.0" className="w-full bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] text-6xl font-black text-white outline-none focus:border-leaf text-center tabular-nums shadow-inner" />
                       <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[12px] font-black text-terracotta uppercase">KG</span>
                    </div>
                    {showScanInputs && (
                       <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-6">
                          <input id="new-waist-val" type="number" placeholder="Cintura (cm)" className="bg-slate-900 border border-white/5 p-5 rounded-2xl text-center font-black text-sm text-white focus:border-leaf" />
                          <input id="new-neck-val" type="number" placeholder="Pescoço (cm)" className="bg-slate-900 border border-white/5 p-5 rounded-2xl text-center font-black text-sm text-white focus:border-leaf" />
                          {activeProfile.gender === 'F' && <input id="new-hips-val" type="number" placeholder="Quadril (cm)" className="bg-slate-900 border border-white/5 p-5 rounded-2xl text-center font-black text-sm text-white col-span-2 focus:border-leaf" />}
                       </div>
                    )}
                    <button onClick={() => {
                       const v = parseFloat((document.getElementById('new-weight-val') as any).value);
                       const waist = parseFloat((document.getElementById('new-waist-val') as any)?.value || "0");
                       const neck = parseFloat((document.getElementById('new-neck-val') as any)?.value || "0");
                       const hips = parseFloat((document.getElementById('new-hips-val') as any)?.value || "0");
                       if(!v) return alert("Por favor, insira o peso.");
                       const entry: WeightEntry = { 
                          date: new Date().toISOString(), 
                          value: v, 
                          waist: waist || undefined, 
                          neck: neck || undefined, 
                          hips: hips || undefined,
                          fatPercentage: bodyMetrics.fat 
                       };
                       updateProfile({ weights: [...activeProfile.weights, entry] });
                       alert("Peso sincronizado com o Bio-Lab!");
                       (document.getElementById('new-weight-val') as any).value = "";
                       setShowScanInputs(false);
                    }} className="w-full py-8 bg-leaf text-white rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-2xl hover:bg-terracotta transition-all active:scale-95">Salvar Medidas</button>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'calendar' && (
           <div className="space-y-10 animate-in slide-in-from-bottom-4">
              <div className="glass p-10 rounded-[4.5rem] shadow-2xl border border-white/5">
                <div className="flex justify-between items-center px-6 mb-10">
                   <button onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><Icons.ChevronLeft /></button>
                   <div className="text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{calendarDate.toLocaleString('pt-BR', { month: 'long' })}</h3>
                      <p className="text-[10px] text-terracotta font-bold">{calendarDate.getFullYear()}</p>
                   </div>
                   <button onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><Icons.ChevronRight /></button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {Array.from({length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()}).map((_, i) => {
                      const d = i + 1;
                      const dayIso = `${calendarDate.getFullYear()}-${(calendarDate.getMonth()+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                      const hasData = activeProfile.checkInDates.some(cid => cid.startsWith(dayIso));
                      const isSelected = selectedHistoryDay?.date === dayIso;
                      return (
                        <button key={d} onClick={() => setSelectedHistoryDay(activeProfile.history[dayIso] || { date: dayIso, caloriesIn: 0 })} className={`aspect-square flex flex-col items-center justify-center rounded-2xl font-black text-sm border transition-all ${hasData ? 'bg-leaf border-leaf text-white shadow-xl scale-105' : 'bg-slate-900 border-white/5 text-slate-700'} ${isSelected ? 'border-leaf scale-110 shadow-lg bg-leaf/20' : ''}`}>
                           {d}
                           {hasData && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
                        </button>
                      );
                   })}
                </div>
              </div>
              
              {selectedHistoryDay && (
                 <div className="glass p-12 rounded-[4rem] animate-in fade-in zoom-in border-leaf/30 shadow-2xl">
                    <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedHistoryDay.date.split('-').reverse().join('/')}</h3>
                       <div className="px-5 py-2 bg-leaf/10 border border-leaf/20 rounded-full text-[10px] font-black text-leaf uppercase">Bio-Lab Record</div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between bg-slate-900/50 p-6 rounded-[2.5rem]"><span className="text-[11px] text-terracotta font-black uppercase tracking-widest">Treino Lab</span><span className="font-black text-white text-sm">{selectedHistoryDay.workoutDone ? `TREINO ${selectedHistoryDay.workoutDone}` : 'OFF'}</span></div>
                       <div className="flex justify-between bg-slate-900/50 p-6 rounded-[2.5rem]"><span className="text-[11px] text-terracotta font-black uppercase tracking-widest">Consumo IA</span><span className="font-black text-leaf text-sm">{selectedHistoryDay.caloriesIn} KCAL</span></div>
                    </div>
                 </div>
              )}
           </div>
        )}

      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 glass border-white/10 p-3 rounded-[4rem] shadow-2xl flex gap-2.5 z-50">
        {[{ id: 'treino', icon: Icons.Workout }, { id: 'cardio', icon: Icons.Cardio }, { id: 'abs', icon: Icons.Abs }, { id: 'dieta', icon: Icons.Diet }, { id: 'progresso', icon: Icons.Scale }, { id: 'calendar', icon: Icons.Calendar }, { id: 'social', icon: Icons.Social }].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id as any)} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-leaf text-white scale-110 shadow-xl shadow-leaf/30' : 'text-slate-500 hover:text-white'}`}>
            <tab.icon />
          </button>
        ))}
      </nav>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-petrol/98 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in">
           <div className="relative">
              <div className="w-24 h-24 border-2 border-white/10 border-t-leaf rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-leaf rounded-full animate-ping"></div></div>
           </div>
           <p className="mt-12 text-[12px] font-black text-leaf uppercase tracking-[1em] animate-pulse">SINCRONIZANDO COM A IA...</p>
        </div>
      )}
    </div>
  );
};

export default App;
