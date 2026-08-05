'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk Notifikasi Pop-up
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'success' | 'error'>('error');
  
  const router = useRouter();

  const triggerNotif = (msg: string, type: 'success' | 'error') => {
    setNotifMsg(msg);
    setNotifType(type);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      // Jika gagal daftar (misal: email sudah dipakai)
      triggerNotif("Gagal mendaftar! Email mungkin sudah terdaftar.", 'error');
      setLoading(false);
    } else {
      // Jika berhasil daftar
      triggerNotif("Pendaftaran berhasil! Mengalihkan ke halaman login...", 'success');
      // Delay 1.5 detik agar user sempat membaca notif
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Pop-up Notifikasi */}
      {showNotif && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-5 py-4 rounded-xl shadow-2xl flex items-center justify-center space-x-3 animate-bounce text-white ${notifType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notifType === 'success' ? (
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
          <span className="font-semibold text-sm md:text-base">{notifMsg}</span>
        </div>
      )}

      {/* Bagian Kiri (Hero) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-900 text-white flex flex-col justify-between p-8 md:p-12">
        <h1 className="text-2xl font-bold text-indigo-400">📖 Qur'an Tracker</h1>
        <div className="text-center my-8">
          <p className="text-4xl md:text-5xl mb-4 text-indigo-300" style={{fontFamily: 'Amiri, serif'}}>اقْرَأْ</p>
          <p className="text-base md:text-xl font-light italic hidden sm:block">"Bacalah dengan nama Tuhanmu yang menciptakan."</p>
        </div>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Qur'an Tracker</div>
      </div>

      {/* Bagian Kanan (Form) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-md py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Buat Akun Baru ✨</h2>
          <p className="text-gray-500 mb-8">Mulai perjalanan tilawah harian Anda.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" 
                placeholder="Nama Anda" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" 
                placeholder="email@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" 
                placeholder="Minimal 6 karakter" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun? <Link href="/login" className="font-semibold text-indigo-600">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}