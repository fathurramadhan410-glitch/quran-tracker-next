'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SystemManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // UBAH: .single() menjadi .maybeSingle() agar tidak crash jika data kosong
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
        if (data) {
          setIsMaintenance(data.is_maintenance);
          setMessage(data.maintenance_message);
        }
      } catch (e) {
        console.error("Error fetching settings");
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleToggleMaintenance = async () => {
    setSubmitting(true);
    const newState = !isMaintenance;
    
    const { error } = await supabase
      .from('app_settings')
      .update({ is_maintenance: newState })
      .eq('id', 1);

    if (!error) {
      setIsMaintenance(newState);
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 3000);
    }
    setSubmitting(false);
  };

  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('app_settings').update({ maintenance_message: message }).eq('id', 1);
    setSubmitting(false);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat pengaturan sistem...</div>;

  return (
    <div className="space-y-6 relative max-w-3xl mx-auto">
      
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <span className="font-semibold text-sm">Pengaturan sistem berhasil disimpan!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          ⚙️ Manajemen Sistem
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Kontrol akses aplikasi dan mode pemeliharaan (Maintenance).</p>

        <div className={`p-6 rounded-xl border-2 ${isMaintenance ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' : 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className={`font-bold text-lg ${isMaintenance ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                {isMaintenance ? '🚫 Mode Maintenance AKTIF' : '✅ Sistem Berjalan Normal'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isMaintenance ? 'Semua user (kecuali Developer) tidak dapat login atau mengakses aplikasi.' : 'Semua user dapat mengakses aplikasi secara normal.'}
              </p>
            </div>
            <button 
              onClick={handleToggleMaintenance}
              disabled={submitting}
              className={`${isMaintenance ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-3 rounded-xl font-bold transition shadow-md w-full sm:w-auto disabled:opacity-50`}
            >
              {submitting ? 'Memproses...' : (isMaintenance ? 'Matikan Maintenance' : 'Aktifkan Maintenance')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveMessage} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan Maintenance (Opsional)</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Contoh: Aplikasi sedang update fitur baru. Coba lagi pukul 20.00 WITA"
            />
          </div>
          <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition text-sm disabled:opacity-50">
            Simpan Pesan
          </button>
        </form>
      </div>

    </div>
  );
}