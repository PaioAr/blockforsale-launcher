import { useState, useEffect } from 'react'
import { loadProfile, logout } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

const { ipcRenderer } = window.require('electron')

const EVENTS = [
  {
    id: 1,
    name: 'UpSide',
    short: 'SMP',
    description: 'Survival Multi Player',
    status: 'open',
    date: 'Jueves 3 Ene',
    color: '#e8192c',
  }
]

const TABS = ['Jugar', 'Aspectos', 'Notas de actualización']

function SkinViewer({ username }) {
  return (
    <img
      src={`https://visage.surgeplay.com/bust/64/${username || 'Steve'}`}
      alt="skin"
      style={{ width: '48px', height: '64px', imageRendering: 'pixelated', objectFit: 'contain' }}
      onError={e => { e.target.src = 'https://visage.surgeplay.com/bust/64/Steve' }}
    />
  )
}

export default function Events() {
  const navigate = useNavigate()
  const profile = loadProfile()
  const [selected, setSelected] = useState(EVENTS[0])
  const [tab, setTab] = useState('Jugar')
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [videoSrc, setVideoSrc] = useState('')

  const settingsData = JSON.parse(localStorage.getItem('bfs_settings') || '{}')
  const animationsEnabled = settingsData.animationsEnabled !== false

  useEffect(() => {
    const isDevMode = window.location.href.includes('localhost')
    if (isDevMode) {
      setVideoSrc('http://localhost:5173/assets/background.mp4')
    } else {
      ipcRenderer.invoke('get-app-path').then(appPath => {
        const p = window.require('path')
        const fullPath = 'media://' + p.join(appPath, 'public', 'assets', 'background.mp4').replace(/\\/g, '/')
        setVideoSrc(fullPath)
      })
    }
  }, [])

  useEffect(() => {
    setDownloading(false)
    setProgress(0)
    setDone(false)
  }, [selected])

  function handlePlay() {
    if (done) return
    setDownloading(true)
    setProgress(0)
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2
      if (p >= 100) {
        p = 100
        setProgress(100)
        setDone(true)
        clearInterval(interval)
      } else {
        setProgress(Math.round(p))
      }
    }, 120)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="w-screen h-screen flex select-none overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', background: '#111' }}>

      <div className="flex flex-col flex-shrink-0" style={{ width: '190px', background: '#0e0e0e', borderRight: '1px solid #222' }}>

        <div className="px-4 py-4" style={{ borderBottom: '1px solid #222' }}>
          <div className="text-white font-black text-sm leading-tight">BLOCKFORSALE</div>
          <div className="font-black text-sm leading-tight" style={{ color: '#e8192c' }}>CLIENT</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {EVENTS.map(ev => (
            <div
              key={ev.id}
              onClick={() => { setSelected(ev); setTab('Jugar') }}
              className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all"
              style={{
                background: selected.id === ev.id ? '#1a1a1a' : 'transparent',
                borderLeft: `3px solid ${selected.id === ev.id ? ev.color : 'transparent'}`,
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs"
                style={{ background: selected.id === ev.id ? ev.color + '22' : '#1a1a1a', color: ev.color, border: `1px solid ${selected.id === ev.id ? ev.color + '55' : '#2a2a2a'}` }}>
                {ev.short}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-tight truncate"
                  style={{ color: selected.id === ev.id ? '#fff' : '#888' }}>
                  {ev.name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: selected.id === ev.id ? ev.color : '#444' }}>
                  {ev.status === 'open' ? '● Abierto' : '⏳ Próximo'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #222' }}>
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <span className="text-xs" style={{ color: '#555' }}>Ajustes</span>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-end gap-3 px-3 pb-3 pt-2 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
            style={{ borderTop: '1px solid #222' }}
          >
            <SkinViewer username={profile?.name} />
            <div className="pb-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: '#ddd' }}>{profile?.name || 'Jugador'}</div>
              <div className="text-[10px]" style={{ color: profile?.offline ? '#666' : '#e8192c' }}>
                {profile?.offline ? 'Offline' : '● Premium'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid #222', backdropFilter: 'blur(10px)', WebkitAppRegion: 'drag' }}>
          <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-3 text-sm font-medium transition-all"
                style={{ color: tab === t ? '#fff' : '#555', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: tab === t ? `2px solid ${selected.color}` : '2px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#e94545' }} />
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#e9a045' }} />
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#45c245' }} />
          </div>
        </div>

        {tab === 'Jugar' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">

            {/* Video de fondo — solo si animaciones activas */}
            {videoSrc && animationsEnabled && (
              <video
                key={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'cover', opacity: 0.5 }}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            )}

            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)' }} />

            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-wider"
                style={{ background: selected.color + '22', color: selected.color, border: `1px solid ${selected.color}44` }}>
                {selected.status === 'open' ? `● ABIERTO — ${selected.date}` : `⏳ PRÓXIMO — ${selected.date}`}
              </div>

              <h1 className="font-black text-6xl text-white mb-4 leading-tight"
                style={{ textShadow: '0 4px 32px rgba(0,0,0,0.9)' }}>
                {selected.name}
              </h1>

              <p className="text-base mb-10 max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {selected.description}
              </p>

              <button
                onClick={handlePlay}
                disabled={selected.status !== 'open' || (downloading && !done)}
                className="font-black py-4 px-16 rounded-xl text-base tracking-widest transition-all active:scale-95"
                style={{
                  background: selected.status !== 'open'
                    ? '#2a2a2a'
                    : done
                    ? selected.color
                    : downloading
                    ? '#1a1a1a'
                    : selected.color,
                  color: selected.status !== 'open' ? '#444' : '#fff',
                  border: 'none',
                  cursor: selected.status !== 'open' || (downloading && !done) ? 'not-allowed' : 'pointer',
                  boxShadow: selected.status === 'open' && !downloading ? `0 6px 32px ${selected.color}55` : 'none',
                  minWidth: '200px',
                }}
              >
                {selected.status !== 'open'
                  ? 'PRÓXIMAMENTE'
                  : done
                  ? '▶ JUGAR'
                  : downloading
                  ? `DESCARGANDO ${progress}%`
                  : 'JUGAR'}
              </button>

              <div
                className="mt-6 transition-all duration-300 overflow-hidden"
                style={{ width: '280px', maxHeight: downloading ? '40px' : '0px', opacity: downloading ? 1 : 0 }}
              >
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%`, background: selected.color }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {done ? 'Instalación completa' : 'Descargando mods...'}
                  </span>
                  <span className="text-xs font-medium" style={{ color: selected.color }}>{progress}%</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {tab === 'Aspectos' && (
          <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ background: '#111' }}>
            <div style={{ fontSize: '40px' }}>🎨</div>
            <div className="text-white font-bold text-lg">Aspectos</div>
            <div className="text-sm text-center max-w-xs" style={{ color: '#555' }}>
              Personalizá tu experiencia en {selected.name}. Próximamente disponible.
            </div>
          </div>
        )}

        {tab === 'Notas de actualización' && (
          <div className="flex-1 overflow-y-auto p-8" style={{ background: '#111' }}>
            <h2 className="text-white font-bold text-xl mb-6">{selected.name}</h2>
            <div className="space-y-4">
              {[
                'Instancia inicial del evento configurada y lista para descargar.',
                'Actualizaciones automáticas al abrir el launcher.',
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: selected.color }} />
                  <span className="text-sm leading-relaxed" style={{ color: '#aaa' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}