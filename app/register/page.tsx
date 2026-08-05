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
  
  // State untuk Modal Pop-up
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMsg, setModalMsg] = useState('');
  
  const router = useRouter();

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
      setModalType('error');
      setModalMsg("Email mungkin sudah terdaftar atau format tidak valid.");
      setShowModal(true);
      setLoading(false);
    } else {
      setModalType('success');
      setModalMsg("Pendaftaran berhasil! Mengalihkan ke halaman login...");
      setShowModal(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Modal Pop-up Notifikasi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-bounce">
            {modalType === 'success' ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h4>
                <p className="text-gray-500 mb-6 text-sm">{modalMsg}</p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Registrasi Gagal!</h4>
                <p className="text-gray-500 mb-6 text-sm">{modalMsg}</p>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
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