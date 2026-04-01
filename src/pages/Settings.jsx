import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile, logout } from '../utils/auth'

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('bfs_settings') || '{}')
  } catch { return {} }
}

function saveSettings(s) {
  localStorage.setItem('bfs_settings', JSON.stringify(s))
}

export default function Settings() {
  const navigate = useNavigate()
  const profile = loadProfile()

  const [settings, setSettings] = useState({
    javaPath: '',
    ramMin: 2,
    ramMax: 4,
    resWidth: 1280,
    resHeight: 720,
    animationsEnabled: true,
    ...loadSettings()
  })

  const [saved, setSaved] = useState(false)

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="w-screen h-screen flex select-none overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', background: '#111' }}>

      {/* SIDEBAR */}
      <div className="flex flex-col flex-shrink-0" style={{ width: '190px', background: '#0e0e0e', borderRight: '1px solid #222' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #222' }}>
          <div className="text-white font-black text-sm leading-tight">BLOCKFORSALE</div>
          <div className="font-black text-sm leading-tight" style={{ color: '#e8192c' }}>CLIENT</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div
            onClick={() => navigate('/events')}
            className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all hover:bg-[#1a1a1a]"
            style={{ borderLeft: '3px solid transparent' }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs"
              style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}>
              ←
            </div>
            <div className="text-xs font-semibold" style={{ color: '#888' }}>Volver</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #222' }}>
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors"
            style={{ background: '#1a1a1a', borderLeft: '3px solid #e8192c' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8192c" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#e8192c' }}>Ajustes</span>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-end gap-3 px-3 pb-3 pt-2 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
            style={{ borderTop: '1px solid #222' }}
          >
            <img
              src={`https://visage.surgeplay.com/bust/64/${profile?.name || 'Steve'}`}
              alt="skin"
              style={{ width: '48px', height: '64px', imageRendering: 'pixelated', objectFit: 'contain' }}
              onError={e => { e.target.src = 'https://visage.surgeplay.com/bust/64/Steve' }}
            />
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

        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: '#0e0e0e', borderBottom: '1px solid #222', WebkitAppRegion: 'drag' }}>
          <span className="text-white font-bold text-lg" style={{ WebkitAppRegion: 'no-drag' }}>Ajustes</span>
          <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#e94545' }} />
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#e9a045' }} />
            <div className="w-3 h-3 rounded-full cursor-pointer" style={{ background: '#45c245' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ background: '#111' }}>
          <div style={{ maxWidth: '560px' }} className="flex flex-col gap-6">

            <section>
              <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#e8192c' }}>JAVA</div>
              <div className="flex flex-col gap-4 p-4 rounded-xl" style={{ background: '#0e0e0e', border: '1px solid #222' }}>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: '#888' }}>Ruta de Java (dejar vacío para detectar automáticamente)</label>
                  <input
                    type="text"
                    value={settings.javaPath}
                    onChange={e => update('javaPath', e.target.value)}
                    placeholder="C:\Program Files\Java\jdk-21\bin\java.exe"
                    style={{
                      width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '8px', padding: '8px 12px', color: '#ddd',
                      fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif'
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: '#888' }}>
                    RAM mínima — <span style={{ color: '#e8192c' }}>{settings.ramMin} GB</span>
                  </label>
                  <input type="range" min="1" max="8" step="1" value={settings.ramMin}
                    onChange={e => update('ramMin', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#e8192c' }} />
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: '#888' }}>
                    RAM máxima — <span style={{ color: '#e8192c' }}>{settings.ramMax} GB</span>
                  </label>
                  <input type="range" min="2" max="16" step="1" value={settings.ramMax}
                    onChange={e => update('ramMax', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#e8192c' }} />
                </div>

              </div>
            </section>

            <section>
              <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#e8192c' }}>PANTALLA</div>
              <div className="flex flex-col gap-4 p-4 rounded-xl" style={{ background: '#0e0e0e', border: '1px solid #222' }}>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs mb-2 block" style={{ color: '#888' }}>Ancho</label>
                    <input
                      type="number"
                      value={settings.resWidth}
                      onChange={e => update('resWidth', Number(e.target.value))}
                      style={{
                        width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                        borderRadius: '8px', padding: '8px 12px', color: '#ddd',
                        fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-2 block" style={{ color: '#888' }}>Alto</label>
                    <input
                      type="number"
                      value={settings.resHeight}
                      onChange={e => update('resHeight', Number(e.target.value))}
                      style={{
                        width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                        borderRadius: '8px', padding: '8px 12px', color: '#ddd',
                        fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif'
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: '1280×720', w: 1280, h: 720 },
                    { label: '1920×1080', w: 1920, h: 1080 },
                    { label: '2560×1440', w: 2560, h: 1440 },
                  ].map(r => (
                    <button
                      key={r.label}
                      onClick={() => { update('resWidth', r.w); update('resHeight', r.h) }}
                      style={{
                        background: settings.resWidth === r.w && settings.resHeight === r.h ? '#e8192c22' : '#1a1a1a',
                        border: `1px solid ${settings.resWidth === r.w && settings.resHeight === r.h ? '#e8192c' : '#2a2a2a'}`,
                        color: settings.resWidth === r.w && settings.resHeight === r.h ? '#e8192c' : '#666',
                        borderRadius: '6px', padding: '4px 12px', fontSize: '11px',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#e8192c' }}>LAUNCHER</div>
              <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: '#0e0e0e', border: '1px solid #222' }}>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#ddd' }}>Animaciones</div>
                    <div className="text-xs mt-0.5" style={{ color: '#555' }}>Partículas en login y video de fondo en eventos</div>
                  </div>
                  <div
                    onClick={() => update('animationsEnabled', !settings.animationsEnabled)}
                    className="cursor-pointer flex-shrink-0"
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px',
                      background: settings.animationsEnabled ? '#e8192c' : '#2a2a2a',
                      position: 'relative', transition: 'background 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: settings.animationsEnabled ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s'
                    }} />
                  </div>
                </div>

              </div>
            </section>

            <section>
              <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#e8192c' }}>CUENTA</div>
              <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: '#0e0e0e', border: '1px solid #222' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#ddd' }}>{profile?.name || 'Jugador'}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#555' }}>
                      {profile?.offline ? 'Cuenta offline' : 'Cuenta Microsoft / Premium'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#1a0000', border: '1px solid #3a0a0a',
                      color: '#e8192c', borderRadius: '8px', padding: '6px 16px',
                      fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      fontWeight: '600'
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </section>

            {/* Botón guardar */}
            <button
              onClick={handleSave}
              style={{
                background: saved ? '#1a4a1a' : '#e8192c',
                border: `1px solid ${saved ? '#2a6a2a' : '#e8192c'}`,
                color: '#fff', borderRadius: '10px', padding: '12px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
                transition: 'all 0.2s'
              }}
            >
              {saved ? '✓ GUARDADO' : 'GUARDAR CAMBIOS'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}