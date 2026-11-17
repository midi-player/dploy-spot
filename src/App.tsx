import { useEffect, useRef, useState } from 'react';
import { deleteSpot, listSpots, saveSpot, type SavedSpot } from '@/library';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  CircleUserRound,
  Library,
  Mail,
  Menu,
  Pause,
  Pencil,
  Play,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';

import { eraThemes, generatePhrase } from '@/eraThemes';
import claimLogo from '@/assets/Claim-OutLoud-white.svg';
import brandIcon from '@/assets/dploy-brand-icon-white.svg';
import noelImage from '@/assets/noel.svg';
import { mixVoiceWithMusic } from '@/audioMix';

type Product = { name: string; image: string; accent: string };
type Era = { name: string; year: string; image: string; className?: string };

const products: Product[] = [
  { name: 'Bananes', image: 'https://images.pexels.com/photos/47305/bananas-banana-shrub-fruits-yellow-47305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#f4c84b' },
  { name: 'Chips', image: 'https://images.pexels.com/photos/6485538/pexels-photo-6485538.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#f1b648' },
  { name: 'Glaces', image: 'https://images.pexels.com/photos/19087695/pexels-photo-19087695.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#f4a9bd' },
  { name: 'Tomates', image: 'https://images.pexels.com/photos/18254763/pexels-photo-18254763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#ed5c42' },
  { name: 'Sardines', image: 'https://images.pexels.com/photos/20141098/pexels-photo-20141098.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#7895ad' },
  { name: 'Saumon', image: 'https://images.pexels.com/photos/8696472/pexels-photo-8696472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#e86c47' },
  { name: 'Viande', image: 'https://images.pexels.com/photos/1314041/pexels-photo-1314041.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#a8544e' },
  { name: 'Savon', image: 'https://images.pexels.com/photos/6930879/pexels-photo-6930879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#dce0da' },
  { name: 'Collagène Marin', image: 'https://images.pexels.com/photos/6475113/pexels-photo-6475113.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#0a6b3b' },
  { name: 'Douche Litchi', image: 'https://images.pexels.com/photos/27689938/pexels-photo-27689938.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#3b5cc4' },
  { name: 'Gigoteuse bébé', image: 'https://images.pexels.com/photos/16222075/pexels-photo-16222075.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', accent: '#1e8fc4' },
];

const eraDiffusion: Record<string, string> = {
  '1500': 'il sera diffusé via des ménestrels et sera facturé 5 écus.',
  '1950': 'il sera diffusé via la radio à transistor et sera facturé 50 francs.',
  '1980': 'il sera diffusé via des cassettes audio et sera facturé 100 francs.',
  '2020': 'il sera diffusé via des podcasts et sera facturé 1 000 euros.',
  '2500': 'il sera diffusé via des hologrammes et sera facturé 50 tokens.',
  'Noël': 'il sera diffusé par le traîneau du Père Noël et sera facturé un biscuit et un verre de lait.',
};

const eras: Era[] = [
  { name: 'Renaissance', year: '1500', image: 'https://images.pexels.com/photos/22873395/pexels-photo-22873395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Années 50', year: '1950', image: 'https://images.pexels.com/photos/2927586/pexels-photo-2927586.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Années 80', year: '1980', image: 'https://images.pexels.com/photos/4335773/pexels-photo-4335773.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Années 2020', year: '2020', image: 'https://images.pexels.com/photos/20870797/pexels-photo-20870797.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Futur', year: '2500', image: 'https://images.pexels.com/photos/17195067/pexels-photo-17195067.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Noël', year: 'Noël', image: noelImage },
];

const waveHeights = Array.from({ length: 56 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 75));

const resultBars = Array.from({ length: 72 }, (_, i) => 18 + Math.round(Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31)) * 82));
const steps = ['Produit', 'Époque', 'Intention', 'Génération'];

function App() {
  const [screen, setScreen] = useState<'home' | 'wizard' | 'result' | 'library'>('home');
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [phraseKey, setPhraseKey] = useState('');
  const [product, setProduct] = useState(products[0]);
  const [era, setEra] = useState(eras[0]);
  const [intention, setIntention] = useState('Oyé Oyé, bienvenue dans votre magasin, rendez vous au rayon frais pour profiter de notre promo flash sur les bananes.');
  const [intentionEdited, setIntentionEdited] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioStatus, setAudioStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioError, setAudioError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioKeyRef = useRef('');
  const [editingText, setEditingText] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [mailOpen, setMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState('');
  const [mailStatus, setMailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [mailError, setMailError] = useState('');

  useEffect(() => {
    if (screen !== 'result') return;
    const audioKey = `${era.year}|${intention}`;
    if (audioKeyRef.current === audioKey) { setAudioStatus('ready'); setIsPlaying(false); setCurrentTime(0); return; }
    const controller = new AbortController();
    setAudioStatus('loading');
    setAudioError('');
    setIsPlaying(false);
    setCurrentTime(0);
    const apiUrl = import.meta.env.DEV
      ? '/api/tts'
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-voice`;
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(import.meta.env.DEV ? {} : {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        }),
      },
      body: JSON.stringify({ text: intention, era: era.year }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const details = await response.json().catch(() => null) as { error?: string; details?: string } | null;
          throw new Error([details?.error, details?.details].filter(Boolean).join(' — ') || response.statusText);
        }
        return response.blob();
      })
      .then(async (voiceBlob) => {
        const mixed = await mixVoiceWithMusic(voiceBlob, era.year);
        audioKeyRef.current = audioKey;
        void saveSpot({ product: product.name, era: era.name, eraYear: era.year, text: intention, blob: mixed }).catch(() => undefined);
        setAudioUrl(URL.createObjectURL(mixed));
        setAudioStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setAudioError(error instanceof Error ? error.message : 'Erreur audio inconnue');
          setAudioStatus('error');
        }
      });
    return () => controller.abort();
  }, [screen, era.year, intention]);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioStatus !== 'ready') return;
    if (audio.paused) void audio.play(); else audio.pause();
  };

  const sendMail = async () => {
    if (!audioUrl) return;
    setMailStatus('sending');
    setMailError('');
    try {
      const blob = await (await fetch(audioUrl)).blob();
      const audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: mailTo.trim(), audio, text: intention, product: product.name, era: era.year }),
      });
      if (!response.ok) throw new Error(await response.text());
      setMailStatus('sent');
    } catch (error) {
      setMailError(error instanceof Error ? error.message : 'Erreur inconnue');
      setMailStatus('error');
    }
  };

  const regenerateText = () => { setEditingText(false); setIntention(generatePhrase(product.name, era.year, intention)); setIntentionEdited(false); setPhraseKey(`${product.name}|${era.year}`); };
  const startEditText = () => { setDraftText(intention); setEditingText(true); };
  const saveEditText = () => { const trimmed = draftText.trim(); if (trimmed) { setIntention(trimmed); setIntentionEdited(true); } setEditingText(false); };

  const closeMail = () => { setMailOpen(false); setMailStatus('idle'); setMailError(''); };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  const selectCustom = () => {
    const trimmed = customText.trim();
    if (trimmed) {
      setProduct({ name: trimmed, image: '', accent: '#ff5531' });
      setCustomOpen(false);
      setCustomText('');
    }
  };

  const begin = () => { setScreen('wizard'); setStep(1); };
  const goToStep = (target: number) => {
    if (target === step || target > maxStep) return;
    if (target === 3 && !intentionEdited && phraseKey !== `${product.name}|${era.year}`) refreshPhrase();
    setStep(target);
  };
  const refreshPhrase = () => { setIntention(generatePhrase(product.name, era.year)); setPhraseKey(`${product.name}|${era.year}`); };
  const next = () => {
    const key = `${product.name}|${era.year}`;
    // only rewrite the suggested phrase when product/era changed and the user didn't write their own
    if (step === 2 && !intentionEdited && key !== phraseKey) refreshPhrase();
    if (step < 3) { setStep(step + 1); setMaxStep((m) => Math.max(m, step + 1)); } else setScreen('result');
  };
  const back = () => step > 1 ? setStep(step - 1) : setScreen('home');

  if (screen === 'home') {
    return (
      <main className="landing-shell">
        <header className="landing-nav">
          <Logo />
          <div className="nav-actions"><span className="desktop-only">La machine à remonter le temps</span><button type="button" className="library-link" onClick={() => setScreen('library')}><Library size={15} /> Mes spots</button><CircleUserRound size={18} /><Menu size={18} className="mobile-only" /></div>
        </header>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Dploy Audio Lab</p>
            <h1>Contextual audio,<br /><em>Real Impact.</em></h1>
            <div className="toggle-row"><span className="active-line">In store</span><span>Out Loud</span></div>
            <p className="hero-description">Créez des spots audio contextualisés<br className="desktop-only" /> dans le temps, en quelques clics.</p>
            <button className="primary-button hero-button" onClick={begin}>Commencer <ArrowRight size={17} /></button>
          </div>
          <div className="orbit-stage">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
            <div className="sound-core"><img className="brand-icon-image" src={brandIcon} alt="Dploy" /></div>
            <OrbitCards />
          </div>
        </section>
        <footer className="landing-footer"><Logo small /><span>In store · Out Loud</span><div className="footer-wave"><AudioLines size={34} /></div></footer>
      </main>
    );
  }

  if (screen === 'library') return <LibraryScreen onHome={() => setScreen('home')} onNew={begin} />;

  if (screen === 'result') {
    return (
      <main className="app-shell result-shell" style={{ '--era-sun': eraThemes[era.year].vars['--p-sun'], '--era-accent': eraThemes[era.year].vars['--p-ribbon-bg'] } as React.CSSProperties}>
        <div className="result-backdrop" aria-hidden="true"><div className="result-glow" /><div className={`result-bars ${isPlaying ? 'playing' : ''} ${audioStatus === 'loading' ? 'loading' : ''}`}>{resultBars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${(index % 14) * -0.13}s` }} />)}</div></div>
        <TopBar onBack={() => setScreen('wizard')} onLibrary={() => setScreen('library')} />
        <div className="result-content">
          <div className="result-heading"><p className="back-link" onClick={() => setScreen('wizard')}><ArrowLeft size={14} /> Retour</p><h1>Et voilà votre spot<br />pour <em>{era.year}</em>,<br /><span className="diffusion-text">{eraDiffusion[era.year] ?? ''}</span></h1></div>
          <div className="result-grid">
            <div className="result-details">
              <div className="ad-script"><p className="ad-script-label">Le texte de votre pub</p>{editingText ? <textarea className="ad-script-input" value={draftText} maxLength={300} autoFocus onChange={(e) => setDraftText(e.target.value)} /> : <p className="ad-script-text">{intention}</p>}<div className="ad-script-actions">{editingText ? <><button className="secondary-button" onClick={saveEditText} disabled={!draftText.trim()}><Check size={14} /> Valider</button><button className="secondary-button" onClick={() => setEditingText(false)}><X size={14} /> Annuler</button></> : <><button className="secondary-button" onClick={regenerateText} disabled={audioStatus === 'loading'}><RefreshCw size={14} /> Régénérer</button><button className="secondary-button" onClick={startEditText} disabled={audioStatus === 'loading'}><Pencil size={14} /> Modifier</button></>}</div></div>
              <div className="audio-player">{audioUrl && <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} />}<div className="player-wave" onClick={(event) => { const audio = audioRef.current; if (!audio || !duration) return; const box = event.currentTarget.getBoundingClientRect(); audio.currentTime = ((event.clientX - box.left) / box.width) * duration; }}>{waveHeights.map((height, index) => <i key={index} className={duration && index / waveHeights.length < currentTime / duration ? 'played' : ''} style={{ height: `${height}%` }} />)}</div><div className="player-controls"><span>{formatTime(currentTime)}</span><button className="play-button" onClick={togglePlay} disabled={audioStatus !== 'ready'}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><span>{audioStatus === 'loading' ? '…' : formatTime(duration)}</span></div>{audioStatus === 'loading' && <p className="audio-status">Génération de la voix…</p>}{audioStatus === 'error' && <p className="audio-status">{audioError || "La voix n'a pas pu être générée."}</p>}</div>
              <div className="result-actions"><button className="secondary-button" onClick={() => setMailOpen(true)} disabled={audioStatus !== 'ready'}><Mail size={15} /> Envoyer par mail</button></div>
            </div>
          </div>
        </div>
      {mailOpen && (
        <div className="modal-overlay" onClick={closeMail}>
          <div className="modal mail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMail}><X size={18} /></button>
            <h2>Recevez votre spot</h2>
            {mailStatus === 'sent' ? <p>C’est parti ! Le spot a été envoyé à {mailTo}.</p> : <>
              <p>Entrez votre adresse e-mail, nous vous envoyons le fichier audio.</p>
              <input className="modal-input mail-input" type="email" placeholder="vous@exemple.fr" value={mailTo} onChange={(e) => setMailTo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && /^\S+@\S+\.\S+$/.test(mailTo)) void sendMail(); }} />
              {mailStatus === 'error' && <p className="mail-error">{mailError || 'L’envoi a échoué.'}</p>}
              <button className="primary-button" onClick={sendMail} disabled={!/^\S+@\S+\.\S+$/.test(mailTo) || mailStatus === 'sending'}>{mailStatus === 'sending' ? 'Envoi…' : <>Envoyer <ArrowRight size={16} /></>}</button>
            </>}
          </div>
        </div>
      )}
      </main>
    );
  }

  return (
    <main className="app-shell wizard-shell">
      <TopBar onLibrary={() => setScreen('library')} />
      <div className="wizard-layout">
        <aside className="wizard-aside"><p className="back-link" onClick={back}><ArrowLeft size={14} /> Retour</p><p className="aside-kicker">The Ads Time Machine</p><h2>Donnez une autre dimension à votre message.</h2></aside>
        <section className="wizard-panel">
          <Progress current={step} maxStep={maxStep} onSelect={goToStep} />
          {step === 1 && <ProductStep selected={product.name} onSelect={(item) => setProduct(item)} onOpenCustom={() => setCustomOpen(true)} />}
          {step === 2 && <EraStep selected={era.name} onSelect={(item) => setEra(item)} />}
          {step === 3 && <IntentStep value={intention} onChange={(value, manual = true) => { setIntention(value); setIntentionEdited(manual); }} product={product.name} eraYear={era.year} />}
          <div className="wizard-footer"><span>{step === 3 ? 'Prêt pour le voyage ?' : 'Étape suivante'}</span><button className="primary-button" onClick={next}>{step === 3 ? <><AudioLines size={16} /> Générer</> : <>Suivant <ArrowRight size={16} /></>}</button></div>
        </section>
      </div>
      {customOpen && (
        <div className="modal-overlay" onClick={() => setCustomOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCustomOpen(false)}><X size={18} /></button>
            <h2>OU</h2>
            <p>Tapez en quelques mots votre souhait</p>
            <textarea className="modal-input" placeholder="Ex : une nouvelle gamme de jus de fruits bio..." value={customText} maxLength={80} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') selectCustom(); }} />
            <button className="primary-button" onClick={selectCustom} disabled={!customText.trim()}>Valider <ArrowRight size={16} /></button>
          </div>
        </div>
      )}
    </main>
  );
}

function Logo({ small = false }: { small?: boolean }) { return <div className={`logo ${small ? 'logo-small' : ''}`}><img className="logo-claim" src={claimLogo} alt="Dploy – In store, Out Loud" /></div>; }
function TopBar({ onBack, onLibrary }: { onBack?: () => void; onLibrary?: () => void }) { return <header className="topbar"><Logo /><span className="topbar-title">The Ads Time Machine</span><div className="topbar-actions">{onLibrary ? <button type="button" className="library-link" onClick={onLibrary}><Library size={15} /> Mes spots</button> : null}{onBack ? <button className="icon-button" onClick={onBack}><ArrowLeft size={15} /></button> : null}<CircleUserRound size={18} /><Menu size={18} /></div></header>; }
function Progress({ current, maxStep, onSelect }: { current: number; maxStep: number; onSelect: (step: number) => void }) { return <div className="progress">{steps.map((label, index) => <button type="button" className={`progress-step ${index + 1 <= current ? 'done' : ''} ${index + 1 <= maxStep && index + 1 !== current ? 'reachable' : ''}`} key={label} disabled={index + 1 > maxStep || index + 1 === current} onClick={() => onSelect(index + 1)}><span>{index + 1 < current ? <Check size={11} /> : index + 1}</span><b>{label}</b></button>)}</div>; }
function ProductStep({ selected, onSelect, onOpenCustom }: { selected: string; onSelect: (item: Product) => void; onOpenCustom: () => void }) { const isCustom = !products.some((item) => item.name === selected); return <div className="step-content"><p className="section-label">01 / Sélection</p><h1>Que voulez-vous<br />promouvoir ?</h1><p className="step-intro">Choisissez un produit pour lequel créer votre spot.</p><div className="product-grid">{products.map((item) => <button className={`product-card ${selected === item.name ? 'selected' : ''}`} key={item.name} onClick={() => onSelect(item)}><div className="product-image">{item.image ? <img src={item.image} alt="" /> : <Sparkles size={26} className="product-placeholder" />}</div><span>{item.name}</span>{selected === item.name && <i><Check size={11} /></i>}</button>)}<button className={`product-card custom-card ${isCustom ? 'selected' : ''}`} onClick={onOpenCustom}><span className="custom-ou">OU</span>{isCustom ? <span className="custom-value">{selected}</span> : <span className="custom-hint">Tapez votre<br />propre produit</span>}{isCustom && <i><Check size={11} /></i>}</button></div></div>; }
function EraStep({ selected, onSelect }: { selected: string; onSelect: (item: Era) => void }) { return <div className="step-content"><p className="section-label">02 / Atmosphère</p><h1>Choisissez maintenant<br />une époque</h1><p className="step-intro">Chaque époque a son propre ton, son style, ses émotions.</p><div className="era-grid">{eras.map((item) => <button className={`era-card ${selected === item.name ? 'selected' : ''}`} key={item.name} onClick={() => onSelect(item)}><img src={item.image} alt="" /><span>· {item.name}</span><i>{selected === item.name ? <Check size={11} /> : ''}</i></button>)}</div></div>; }
function IntentStep({ value, onChange, product, eraYear }: { value: string; onChange: (value: string, manual?: boolean) => void; product: string; eraYear: string }) { return <div className="step-content intent-content"><p className="section-label">03 / Direction</p><h1>Voici votre intention</h1><p className="step-intro">Décrivez le message que votre publicité doit faire passer.</p><div className="intent-layout"><div><div className="textarea-wrap"><button className="ai-icon" type="button" title="Générer une phrase avec l’IA" onClick={() => onChange(generatePhrase(product, eraYear, value), false)}><Sparkles size={16} /></button><textarea value={value} maxLength={300} onChange={(event) => onChange(event.target.value)} /><span>{value.length}/300</span></div><button className="ai-button" type="button" onClick={() => onChange(generatePhrase(product, eraYear, value), false)}><RefreshCw size={14} /> Régénérer</button></div><div className="preparing"><div className="preparing-ring"><img className="brand-icon-image" src={brandIcon} alt="Dploy" /></div><span>Préparation<br />du voyage temporel...</span></div></div></div>; }
function OrbitCard({ className, label, image }: { className: string; label: string; image: string }) { return <div className={className}><img key={image} className="orbit-img" src={image} alt="" /><span key={label} className="orbit-label">{label}</span><b>+</b></div>; }

const orbitPool = [...eras.map((item) => ({ label: item.name, image: item.image })), ...products.map((item) => ({ label: item.name, image: item.image }))];
const orbitSlots = ['castle-card', 'banana-card', 'chips-card', 'phone-card', 'woman-card'];

// Home orbit: one card swaps to the next picture every few seconds, so the "time machine" keeps moving.
function OrbitCards() {
  const [cursor, setCursor] = useState(() => orbitSlots.map((_, slot) => slot * 3));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (tick === 0) return;
    const slot = tick % orbitSlots.length;
    setCursor((current) => current.map((value, index) => (index === slot ? (Math.max(...current) + 1) % orbitPool.length : value)));
  }, [tick]);
  return <>{orbitSlots.map((slot, index) => { const item = orbitPool[cursor[index] % orbitPool.length]; return <OrbitCard key={slot} className={`orbit-card ${slot}`} label={item.label} image={item.image} />; })}</>;
}
function Detail({ label, value, icon }: { label: string; value: string; icon: string }) { return <div className="detail"><span className="detail-icon">{icon}</span><div><small>{label}</small><b>{value}</b></div></div>; }

export default App;

function LibraryScreen({ onHome, onNew }: { onHome: () => void; onNew: () => void }) {
  const [spots, setSpots] = useState<SavedSpot[] | null>(null);
  const [playingId, setPlayingId] = useState('');
  const [url, setUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => { void listSpots().then(setSpots).catch(() => setSpots([])); }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const play = (spot: SavedSpot) => {
    if (playingId === spot.id) { audioRef.current?.pause(); setPlayingId(''); return; }
    setUrl(URL.createObjectURL(spot.blob));
    setPlayingId(spot.id);
  };
  const remove = async (id: string) => {
    if (id === playingId) { setPlayingId(''); setUrl(''); }
    await deleteSpot(id);
    setSpots((list) => (list ?? []).filter((item) => item.id !== id));
  };
  return (
    <main className="app-shell library-shell">
      <TopBar onBack={onHome} />
      <div className="library-content">
        <p className="section-label">Bibliothèque</p>
        <h1>Mes spots</h1>
        {playingId && url && <audio ref={audioRef} src={url} autoPlay onEnded={() => setPlayingId('')} />}
        {spots === null ? null : spots.length === 0 ? (
          <div className="library-empty"><p>Aucun spot pour l’instant.</p><button className="primary-button" onClick={onNew}>Créer un spot <ArrowRight size={16} /></button></div>
        ) : (
          <ul className="library-list">
            {spots.map((spot) => (
              <li key={spot.id} className={`library-item ${playingId === spot.id ? 'playing' : ''}`}>
                <button className="play-button" onClick={() => play(spot)} aria-label={playingId === spot.id ? 'Pause' : 'Lire'}>{playingId === spot.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
                <div className="library-meta">
                  <b>{spot.product} · {spot.era}</b>
                  <small>{new Date(spot.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                  <p>{spot.text}</p>
                </div>
                <button className="icon-button" onClick={() => void remove(spot.id)} aria-label="Supprimer"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
