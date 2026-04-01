import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { loginMicrosoft, saveProfile, loadProfile } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const settingsData = JSON.parse(localStorage.getItem('bfs_settings') || '{}')
  const animationsEnabled = settingsData.animationsEnabled !== false

  useEffect(() => {
    const profile = loadProfile()
    if (profile) navigate('/events')
  }, [])

  useEffect(() => {
    if (!animationsEnabled) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }))
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232, 25, 44, ${p.alpha})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [animationsEnabled])

  async function handleMicrosoftLogin() {
    setStatus('loading')
    setErrorMsg('')
    const result = await loginMicrosoft()
    if (result.success) {
      saveProfile(result.profile)
      navigate('/events')
    } else {
      setStatus('error')
      setErrorMsg(result.error || 'Error al iniciar sesión')
    }
  }

  function handleOfflineLogin() {
    saveProfile({ name: 'Jugador', uuid: 'offline', accessToken: null, offline: true })
    navigate('/events')
  }

  return (
    <div className="w-screen h-screen bg-[#0d0000] flex flex-col items-center justify-center select-none relative overflow-hidden">

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,25,44,0.12) 0%, transparent 70%)' }} />

      <div className="absolute left-0 top-0 w-0.5 h-full pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #e8192c55, transparent)' }} />

      <div className="relative z-10 mb-10 text-center">
        <div className="inline-block bg-[#1a0000] border border-[#e8192c44] text-[#e8192c] text-[10px] px-3 py-1 rounded-full mb-4 tracking-widest">
          v1.0.1 — EVENTS EDITION
        </div>
        <h1 className="font-black text-7xl text-white tracking-tight leading-none">BLOCKFORSALE</h1>
        <h2 className="text-6xl font-black tracking-tight leading-none mt-1"
          style={{ color: '#e8192c', textShadow: '0 0 40px rgba(232,25,44,0.6), 0 0 80px rgba(232,25,44,0.3)' }}>
          CLIENT
        </h2>
        <p className="text-[#7a3535] text-sm mt-4 tracking-wide">Cliente oficial de BlockForSale Events</p>
        <p className="text-[#4a2a2a] text-xs mt-1">Premium & No Premium</p>
      </div>

      <div className="relative z-10 w-80 flex flex-col gap-3"
        style={{ background: 'rgba(15,0,0,0.85)', border: '1px solid #2a0a0a', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(10px)' }}>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, #e8192c88, transparent)' }} />

        {status === 'error' && (
          <div className="bg-[#1a0000] border border-[#e8192c44] rounded-lg px-3 py-2 text-[#e8192c] text-xs text-center">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleMicrosoftLogin}
          disabled={status === 'loading'}
          className="text-white font-bold py-3 rounded-lg transition-all text-sm tracking-wide hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #e8192c, #a01020)', boxShadow: '0 4px 24px rgba(232,25,44,0.35)' }}
        >
          {status === 'loading' ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Iniciando sesión...
            </>
          ) : 'Iniciar sesión con Microsoft'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#2a0a0a]" />
          <span className="text-[#3a1a1a] text-xs">o</span>
          <div className="flex-1 h-px bg-[#2a0a0a]" />
        </div>

        <button
          onClick={handleOfflineLogin}
          disabled={status === 'loading'}
          className="border border-[#2a0a0a] hover:border-[#e8192c] text-[#6a3535] hover:text-[#e8192c] font-medium py-3 rounded-lg transition-all text-sm hover:bg-[#1a0000]"
        >
          Continuar sin cuenta (offline)
        </button>

        <p className="text-[#3a1a1a] text-[10px] text-center mt-2">
          Al continuar aceptás los términos de BlockForSale Events
        </p>
      </div>
    </div>
  )
}