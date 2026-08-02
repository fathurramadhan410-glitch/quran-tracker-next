'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Bagian Kiri */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white flex flex-col justify-between p-8 md:p-12">
        <h1 className="text-2xl font-bold text-emerald-400">📖 Qur'an Tracker</h1>
        <div className="text-center my-8">
          <p className="text-3xl md:text-5xl mb-4 text-emerald-300" style={{fontFamily: 'Amiri, serif'}}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <p className="text-base md:text-xl font-light italic hidden sm:block">"Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."</p>
        </div>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Qur'an Tracker</div>
      </div>

      {/* Bagian Kanan (Form) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-md py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang Kembali 👋</h2>
          <p className="text-gray-500 mb-8">Silakan masuk untuk melanjutkan tilawah.</p>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" 
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" 
                placeholder="******" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun? <Link href="/register" className="font-semibold text-emerald-600">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}