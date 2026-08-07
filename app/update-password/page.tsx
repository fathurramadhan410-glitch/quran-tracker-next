'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (!error) {
      setShowModal(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Password Diperbarui!</h4>
            <p className="text-gray-500 mb-6 text-sm">Password Anda telah berhasil diubah. Mengalihkan ke dashboard...</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white flex flex-col justify-between p-8 md:p-12">
        <h1 className="text-2xl font-bold text-emerald-400">📖 Qur'an Tracker</h1>
        <div className="text-center my-8">
          <p className="text-4xl md:text-5xl mb-4 text-emerald-300">🔒</p>
          <p className="text-base md:text-xl font-light italic hidden sm:block">"Buat password baru yang mudah Anda ingat."</p>
        </div>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Qur'an Tracker</div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-md py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password 🔑</h2>
          <p className="text-gray-500 mb-8">Masukkan password baru Anda di bawah ini.</p>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" 
                placeholder="Minimal 6 karakter" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-2">
              {loading ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}