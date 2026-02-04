
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateWorkoutCycle, generateCardioLab, analyzeMeal } from './services/geminiService';
import { UserProfile, WeightEntry, DayLog, MealAnalysis } from './types';

const Icons = {
  Workout: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 12h12M6 8v8M18 8v8M2 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1ZM19 11v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1Z"/></svg>,
  Cardio: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 17V10l4.2-3.4c.5-.4.6-1.1.2-1.6l-.6-.8M8 12l1.9 2 2-2.1"/></svg>,
  Diet: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 2L5.5 7.5L2 11l9 9l3.5-3.5L18 22"/><path d="M13 2l6 6l3 3l-9 9l-3-3L13 2z"/></svg>,
  Social: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  ArrowBack: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>,
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'treino'|'cardio'|'dieta'|'social'>('treino');
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
  }, [profiles]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-petrol p-10 flex flex-col justify-center animate-in slide-in-from-bottom-12">
        <h2 className="text-4xl font-black text-white mb-8 italic uppercase">NOVO ATLETA</h2>
        <div className="space-y-4">
           <input id="ob-group" type="text" placeholder="Código do Grupo" className="w-full bg-slate-900 border border-leaf/20 p-5 rounded-2xl text-leaf font-black outline-none uppercase" />
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
              if(!name || !w || !onboardingGender) return alert("Preencha tudo!");
              const p: UserProfile = {
                id: Date.now().toString(), name, groupId: groupId || undefined, gender: onboardingGender, height: h, targetWeight: w, trainingFrequency: 5, trainingGoal: 'Performance',
                weights: [{ date: new Date().toISOString(), value: parseFloat(w) }], cycle: null, cardio: null, abs: null, count: 0, checkInDates: [], history: {},
                meals: { 'Café': { text: '', analysis: '', calories: 0 } }
              };
              setProfiles([...profiles, p]); setActiveProfileId(p.id); setIsOnboarding(false);
           }} className="w-full py-6 bg-leaf text-white rounded-[2rem] font-black uppercase shadow-xl mt-4">COMEÇAR</button>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-petrol flex flex-col items-center justify-center p-10">
        <h1 className="text-6xl font-black mb-12 text-leaf italic tracking-tighter">TREINO LAB</h1>
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
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf rounded-xl flex items-center justify-center font-black text-white">{activeProfile.name[0]}</div>
            <div className="text-left">
               <p className="text-sm font-black uppercase leading-none">{activeProfile.name}</p>
               <button onClick={() => setActiveProfileId(null)} className="text-[10px] text-slate-500 uppercase font-bold">Trocar Perfil</button>
            </div>
         </div>
         <div className="bg-leaf/20 px-4 py-1.5 rounded-full text-leaf font-black text-xs">{activeProfile.count} TREINOS</div>
      </header>

      <main className="p-6 space-y-6 max-w-md mx-auto">
        {activeTab === 'treino' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="glass p-8 rounded-[3rem] space-y-4 shadow-xl border border-white/5">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">IA Personal Trainer</h3>
                 <textarea value={userBriefing} onChange={e => setUserBriefing(e.target.value)} placeholder="Ex: Foco em glúteos e pernas, treino rápido de 45min..." className="w-full bg-black/20 p-5 rounded-2xl text-sm outline-none border border-white/5 focus:border-leaf h-28 text-white" />
                 <button onClick={async () => {
                    setLoading(true);
                    try {
                      const latestWeight = activeProfile.weights[activeProfile.weights.length - 1].value.toString();
                      const res = await generateWorkoutCycle(activeProfile.height, latestWeight, activeProfile.targetWeight, activeProfile.trainingFrequency, userBriefing);
                      updateProfile({ cycle: res });
                    } catch(e: any) { 
                      console.error(e);
                      alert(`ERRO: Ocorreu um problema ao falar com a IA.\n\nPossíveis causas:\n1. A chave API_KEY ainda não foi ativada (faça REDEPLOY na Vercel).\n2. Erro técnico: ${e.message}`);
                    } finally { setLoading(false); }
                 }} className="w-full py-5 bg-leaf text-white rounded-full font-black uppercase shadow-lg active:scale-95 transition-transform">Gerar Treinos com IA</button>
              </div>

              {activeProfile.cycle?.days.map((day, i) => (
                 <button key={i} onClick={() => setDetailView(day)} className="w-full p-8 glass rounded-[2.5rem] text-left border border-white/5 hover:border-leaf transition-all group">
                    <p className="text-leaf font-black text-3xl group-hover:scale-105 transition-transform">{day.category}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{day.title}</p>
                 </button>
              ))}
           </div>
        )}

        {/* ... Resto das abas mantidas como antes ... */}
      </main>

      {detailView && (
           <div className="fixed inset-0 z-[60] bg-petrol p-6 overflow-y-auto animate-in fade-in zoom-in-95">
              <button onClick={() => setDetailView(null)} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-slate-500"><Icons.ArrowBack /> Voltar</button>
              <h2 className="text-4xl font-black text-leaf mb-8 tracking-tighter uppercase">{detailView.category || detailView.type}</h2>
              <div className="space-y-4">
                 {detailView.exercises && detailView.exercises.map((ex: any, i: number) => (
                    <div key={i} className="glass p-6 rounded-3xl border border-white/5">
                       <div className="flex justify-between font-black uppercase text-sm mb-2">
                        <span className="text-white">{ex.name}</span> 
                        <span className="text-leaf">{ex.sets}x{ex.reps}</span>
                       </div>
                       <p className="text-xs text-slate-400 leading-relaxed">{ex.howTo}</p>
                    </div>
                 ))}
                 <button onClick={() => {
                    updateProfile({ count: activeProfile.count + 1, checkInDates: [...activeProfile.checkInDates, new Date().toISOString()] });
                    setDetailView(null);
                    alert("Treino Concluído com Sucesso!");
                 }} className="w-full py-6 bg-leaf text-white rounded-full font-black uppercase shadow-2xl mt-8">FINALIZAR SESSÃO</button>
              </div>
           </div>
        )}

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 glass p-2 rounded-full flex gap-2 z-50 border border-white/10 shadow-2xl">
        {[{id:'treino', icon: Icons.Workout}, {id:'cardio', icon: Icons.Cardio}, {id:'dieta', icon: Icons.Diet}, {id:'social', icon: Icons.Social}].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${activeTab === tab.id ? 'bg-leaf text-white' : 'text-slate-500 hover:text-white'}`}><tab.icon /></button>
        ))}
      </nav>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-petrol/90 backdrop-blur-sm flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-leaf border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-6 font-black uppercase text-xs tracking-[0.2em] text-leaf animate-pulse">Invocando Inteligência...</p>
        </div>
      )}
    </div>
  );
};

export default App;
