
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateWorkoutCycle, generateCardioLab, analyzeMeal } from './services/geminiService';
import { UserProfile, WeightEntry, DayLog, MealAnalysis } from './types';

const Icons = {
  Workout: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 12h12M6 8v8M18 8v8M2 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1ZM19 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1Z"/></svg>,
  Cardio: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 17V10l4.2-3.4c.5-.4.6-1.1.2-1.6l-.6-.8M8 12l1.9 2 2-2.1"/></svg>,
  Abs: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM8 10h8M8 14h8"/></svg>,
  Diet: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 2L5.5 7.5L2 11l9 9l3.5-3.5L18 22"/><path d="M13 2l6 6l3 3l-9 9l-3-3L13 2z"/></svg>,
  Scale: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 1 0-8 0"/><circle cx="12" cy="7" r="1"/><path d="M12 11v3"/><rect x="3" y="14" width="18" height="7" rx="1"/></svg>,
  Social: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
  ArrowBack: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>,
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'treino'|'cardio'|'abs'|'dieta'|'progresso'|'calendar'|'social'>('treino');
  const [loading, setLoading] = useState(false);
  const [detailView, setDetailView] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [userBriefing, setUserBriefing] = useState('');
  const [globalRankings, setGlobalRankings] = useState<any[]>([]);
  const [onboardingGender, setOnboardingGender] = useState<'M' | 'F' | null>(null);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
  };

  useEffect(() => {
    const saved = localStorage.getItem('treino_lab_v25_final');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('treino_lab_v25_final', JSON.stringify(profiles));
    if (activeProfile) syncToSupabase();
  }, [profiles, activeProfileId]);

  const syncToSupabase = async () => {
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
    } catch (e) { console.error("Erro Supabase:", e); }
  };

  const fetchRankings = async () => {
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
      const data = await res.json();
      setGlobalRankings(data);
    } catch (e) { console.error("Erro Ranking:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'social') fetchRankings(); }, [activeTab]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-petrol p-10 flex flex-col justify-center animate-in slide-in-from-bottom-12">
        <h2 className="text-4xl font-black text-white mb-8 italic uppercase">NOVO ATLETA</h2>
        <div className="space-y-4">
           <input id="ob-group" type="text" placeholder="Código do Grupo (Ex: AMIGOS-TREINO)" className="w-full bg-slate-900 border border-leaf/20 p-5 rounded-2xl text-leaf font-black outline-none uppercase" />
           <input id="ob-name" type="text" placeholder="Seu Nome" className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl text-white font-bold outline-none" />
           <div className="flex gap-4">
              <button onClick={() => setOnboardingGender('M')} className={`flex-1 py-4 rounded-2xl font-black ${onboardingGender === 'M' ? 'bg-leaf text-white' : 'bg-slate-800 text-slate-500'}`}>MASC</button>
              <button onClick={() => setOnboardingGender('F')} className={`flex-1 py-4 rounded-2xl font-black ${onboardingGender === 'F' ? 'bg-terracotta text-white' : 'bg-slate-800 text-slate-500'}`}>FEM</button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <input id="ob-h" type="text" placeholder="Altura (1.75)" className="bg-slate-900 border border-white/5 p-5 rounded-2xl text-white" />
              <input id="ob-w" type="number" placeholder="Peso (kg)" className="bg-slate-900 border border-white/5 p-5 rounded-2xl text-white" />
           </div>
           <button onClick={() => {
              const name = (document.getElementById('ob-name') as any).value;
              const groupId = (document.getElementById('ob-group') as any).value;
              const w = (document.getElementById('ob-w') as any).value;
              const h = (document.getElementById('ob-h') as any).value || '1.75';
              if(!name || !w || !onboardingGender) return alert("Preencha os campos!");
              const p: UserProfile = {
                id: Date.now().toString(), name, groupId: groupId || undefined, gender: onboardingGender, height: h, targetWeight: w, trainingFrequency: 5, trainingGoal: 'Performance',
                weights: [{ date: new Date().toISOString(), value: parseFloat(w) }], cycle: null, cardio: null, abs: null, count: 0, checkInDates: [], history: {},
                meals: { 'Café': { text: '', analysis: '', calories: 0 } }
              };
              setProfiles([...profiles, p]); setActiveProfileId(p.id); setIsOnboarding(false);
           }} className="w-full py-6 bg-leaf text-white rounded-[2rem] font-black uppercase shadow-xl mt-4">CRIAR PERFIL</button>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-petrol flex flex-col items-center justify-center p-10">
        <h1 className="text-6xl font-black mb-12 text-leaf italic">TREINO LAB</h1>
        <div className="w-full max-w-xs space-y-4">
          {profiles.map(p => (
            <button key={p.id} onClick={() => setActiveProfileId(p.id)} className="w-full p-6 glass rounded-[2rem] flex justify-between items-center text-white font-black uppercase">
              {p.name} <Icons.Check />
            </button>
          ))}
          <button onClick={() => setIsOnboarding(true)} className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2rem] text-white/30 font-black">+ NOVO ATLETA</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-petrol text-slate-100">
      <header className="p-6 glass border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
         <button onClick={() => setActiveProfileId(null)} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf rounded-xl flex items-center justify-center font-black">{activeProfile.name[0]}</div>
            <div className="text-left leading-none">
               <p className="text-sm font-black uppercase">{activeProfile.name}</p>
               <p className="text-[10px] text-slate-500">GRUPO: {activeProfile.groupId || 'LOCAL'}</p>
            </div>
         </button>
         <div className="bg-leaf/20 px-4 py-1.5 rounded-full text-leaf font-black text-xs">TREINOS: {activeProfile.count}</div>
      </header>

      <main className="p-6 space-y-6 max-w-md mx-auto">
        {activeTab === 'treino' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="glass p-8 rounded-[3rem] space-y-4 shadow-xl">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">IA Personal Trainer</h3>
                 <textarea value={userBriefing} onChange={e => setUserBriefing(e.target.value)} placeholder="Foco em glúteos, treino de 1h..." className="w-full bg-black/20 p-4 rounded-xl text-sm outline-none border border-white/5 focus:border-leaf h-24" />
                 <button onClick={async () => {
                    setLoading(true);
                    try {
                      const latestWeight = activeProfile.weights[activeProfile.weights.length - 1].value.toString();
                      const res = await generateWorkoutCycle(activeProfile.height, latestWeight, activeProfile.targetWeight, activeProfile.trainingFrequency, userBriefing);
                      updateProfile({ cycle: res });
                    } catch(e: any) { 
                      alert(`Erro na IA: ${e.message}\n\nVerifique se a API_KEY na Vercel está correta e faça um REDEPLOY.`);
                    }
                    finally { setLoading(false); }
                 }} className="w-full py-4 bg-leaf text-white rounded-full font-black uppercase shadow-lg">Gerar Treinos com IA</button>
              </div>

              {activeProfile.cycle?.days.map((day, i) => (
                 <button key={i} onClick={() => setDetailView(day)} className="w-full p-8 glass rounded-[2.5rem] text-left border border-white/5 hover:border-leaf transition-all">
                    <p className="text-leaf font-black text-3xl">{day.category}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase">{day.title}</p>
                 </button>
              ))}
           </div>
        )}

        {activeTab === 'cardio' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-leaf italic uppercase text-center">BIOMETRIA HIIT</h2>
              <div className="grid grid-cols-1 gap-4">
                 {['Bike', 'Corrida', 'Funcional'].map(type => (
                    <button key={type} onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await generateCardioLab(type);
                        setDetailView(res);
                      } catch(e: any) { alert(`Erro: ${e.message}`); }
                      finally { setLoading(false); }
                    }} className="glass p-10 rounded-[2.5rem] text-left border border-white/5 hover:border-leaf transition-all">
                       <p className="text-terracotta font-black text-xs uppercase mb-1">Célula Cardio</p>
                       <p className="text-2xl font-black uppercase">{type}</p>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'dieta' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-leaf italic uppercase text-center">LABORATÓRIO NUTRICIONAL</h2>
              {Object.keys(activeProfile.meals).map(meal => (
                <div key={meal} className="glass p-6 rounded-[2rem] space-y-4">
                  <p className="font-black uppercase text-terracotta text-sm">{meal}</p>
                  <textarea 
                    value={activeProfile.meals[meal].text} 
                    onChange={e => updateProfile({ meals: { ...activeProfile.meals, [meal]: { ...activeProfile.meals[meal], text: e.target.value } } })}
                    placeholder="O que você comeu?" 
                    className="w-full bg-black/10 p-4 rounded-xl text-sm border border-white/5 outline-none focus:border-leaf h-20"
                  />
                  <button onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await analyzeMeal(activeProfile.meals[meal].text);
                      updateProfile({ meals: { ...activeProfile.meals, [meal]: { ...activeProfile.meals[meal], analysis: res.analysis, calories: res.calories } } });
                    } catch(e: any) { alert(`Erro: ${e.message}`); }
                    finally { setLoading(false); }
                  }} className="w-full py-3 bg-slate-800 text-white rounded-full font-black text-[10px] uppercase">Analisar com IA</button>
                  {activeProfile.meals[meal].calories > 0 && (
                    <div className="p-4 bg-leaf/10 border border-leaf/20 rounded-xl">
                      <p className="text-leaf font-black text-xs">{activeProfile.meals[meal].calories} kcal</p>
                      <p className="text-[10px] text-slate-300 italic">{activeProfile.meals[meal].analysis}</p>
                    </div>
                  )}
                </div>
              ))}
           </div>
        )}

        {activeTab === 'social' && (
           <div className="space-y-6 animate-in fade-in">
              <h2 className="text-3xl font-black text-center text-leaf italic uppercase">RANKING DO GRUPO</h2>
              <div className="space-y-3">
                 {globalRankings.map((p, i) => (
                    <div key={p.id} className={`glass p-6 rounded-[2rem] flex justify-between items-center ${p.id === activeProfile.id ? 'border-leaf' : ''}`}>
                       <div className="flex items-center gap-4">
                          <span className="text-leaf font-black text-xl">#{i+1}</span>
                          <span className="font-black uppercase text-sm">{p.name}</span>
                       </div>
                       <span className="bg-leaf/10 px-4 py-1 rounded-full text-leaf font-black">{p.count} pts</span>
                    </div>
                 ))}
              </div>
              <button onClick={fetchRankings} className="w-full py-3 text-xs font-black uppercase text-slate-500">Atualizar</button>
           </div>
        )}

        {detailView && (
           <div className="fixed inset-0 z-[60] bg-petrol p-6 overflow-y-auto">
              <button onClick={() => setDetailView(null)} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-slate-500"><Icons.ArrowBack /> Voltar</button>
              <h2 className="text-4xl font-black text-leaf mb-8">{detailView.category || detailView.type}</h2>
              <div className="space-y-4">
                 {detailView.exercises && detailView.exercises.map((ex: any, i: number) => (
                    <div key={i} className="glass p-6 rounded-3xl space-y-2">
                       <div className="flex justify-between font-black uppercase text-sm">
                        <span>{ex.name}</span> 
                        <span className="text-leaf">{ex.sets ? `${ex.sets}x${ex.reps}` : `${ex.work}s / ${ex.rest}s`}</span>
                       </div>
                       <p className="text-xs text-slate-400">{ex.howTo}</p>
                    </div>
                 ))}
                 {detailView.didacticExplanation && (
                   <p className="p-6 glass rounded-2xl text-[10px] text-slate-400 italic">{detailView.didacticExplanation}</p>
                 )}
                 <button onClick={() => {
                    updateProfile({ count: activeProfile.count + 1, checkInDates: [...activeProfile.checkInDates, new Date().toISOString()] });
                    setDetailView(null);
                    alert("Sessão Finalizada!");
                 }} className="w-full py-6 bg-leaf text-white rounded-full font-black uppercase shadow-2xl mt-8">CONFIRMAR SESSÃO</button>
              </div>
           </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 glass p-2 rounded-full flex gap-2 z-50">
        {[{id:'treino', icon: Icons.Workout}, {id:'cardio', icon: Icons.Cardio}, {id:'dieta', icon: Icons.Diet}, {id:'social', icon: Icons.Social}].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-14 h-14 flex items-center justify-center rounded-full ${activeTab === tab.id ? 'bg-leaf text-white' : 'text-slate-500'}`}><tab.icon /></button>
        ))}
      </nav>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-petrol/90 flex flex-col items-center justify-center">
           <div className="w-12 h-12 border-4 border-leaf border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-4 font-black uppercase text-xs tracking-widest text-leaf">Sincronizando com a IA...</p>
        </div>
      )}
    </div>
  );
};

export default App;
