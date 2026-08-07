'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Kirim link reset password ke email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);
    setShowModal(true); // Tampilkan modal sukses/gagal
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Tautan Terkirim!</h4>
            <p className="text-gray-500 mb-6 text-sm">Cek folder Inbox atau Spam di email Anda. Klik tautan yang kami kirim untuk mereset password Anda.</p>
            <Link href="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-700 transition text-sm inline-block">
              Kembali ke Login
            </Link>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white flex flex-col justify-between p-8 md:p-12">
        <h1 className="text-2xl font-bold text-emerald-400">📖 Qur'an Tracker</h1>
        <div className="text-center my-8">
          <p className="text-4xl md:text-5xl mb-4 text-emerald-300">🔑</p>
          <p className="text-base md:text-xl font-light italic hidden sm:block">"Jangan biarkan password terlupakan menghentikan tilawahmu."</p>
        </div>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Qur'an Tracker</div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-md py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Lupa Password? 🤔</h2>
          <p className="text-gray-500 mb-8">Masukkan email Anda. Kami akan mengirimkan tautan untuk mereset password Anda.</p>
          
          {/* Catatan Lupa Email */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg text-sm text-yellow-700">
            <p className="font-bold mb-1">Lupa Email?</p>
            <p>Jika Anda jugaa lupa email yang dipakai, silakan hubungi Guru/Admin untuk memastikan email terdaftar di akun Anda.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Terdaftar</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" 
                placeholder="email@example.com" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-2">
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Ingat password? <Link href="/login" className="font-semibold text-emerald-600">Kembali Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}