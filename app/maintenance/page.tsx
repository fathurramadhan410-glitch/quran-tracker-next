'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const [message, setMessage] = useState('Aplikasi sedang dalam pemeliharaan (Maintenance). Silakan coba lagi nanti.');
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
        if (data && data.maintenance_message) {
          setMessage(data.maintenance_message);
        }
      } catch (e) {
        // Biarkan pesan default
      }
    };
    fetchSettings();
  }, []);

  const handleCheckStatus = async () => {
    try {
      const { data: settings } = await supabase.from('app_settings').select('is_maintenance').eq('id', 1).maybeSingle();
      if (!settings?.is_maintenance) {
        router.push('/dashboard');
      } else {
        alert("Sistem masih dalam pemeliharaan. Silakan coba lagi nanti.");
      }
    } catch (e) {
      alert("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 animate-pulse-glow" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 max-w-md">
        <div className="text-7xl mb-6 animate-bounce">🛠️</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Sedang Dalam Pemeliharaan</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleCheckStatus} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
            Cek Status Sistem
          </button>
          <button onClick={handleLogout} className="bg-white/5 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition border border-white/10">
            Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}