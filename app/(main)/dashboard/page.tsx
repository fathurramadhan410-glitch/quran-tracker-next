'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [juz, setJuz] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk Pop-up Notifikasi
  const [showNotif, setShowNotif] = useState(false);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const { data: logsData } = await supabase
      .from('reading_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setProfile(profileData);
    setLogs(logsData || []);
    setStartPage(profileData?.current_page || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const pagesRead = endPage - startPage + 1;
    if (pagesRead <= 0) {
      alert("Halaman akhir harus lebih besar atau sama dengan halaman awal!");
      setSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Hitung streak
    let newStreak = profile.current_streak;
    if (profile.last_read_date) {
        const lastRead = new Date(profile.last_read_date);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastRead.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
    } else {
        newStreak = 1;
    }

    // 1. Insert Log
    await supabase.from('reading_logs').insert({
      user_id: session.user.id,
      log_date: today,
      start_page: startPage,
      end_page: endPage,
      pages_read: pagesRead,
      juz: juz,
      notes: notes
    });

    // 2. Update Profile
    await supabase.from('profiles').update({
      current_page: endPage,
      total_pages_read: profile.total_pages_read + pagesRead,
      current_streak: newStreak,
      longest_streak: newStreak > profile.longest_streak ? newStreak : profile.longest_streak,
      last_read_date: today,
      total_points: profile.total_points + (pagesRead * 10)
    }).eq('id', session.user.id);

    setNotes('');
    setEndPage(startPage);
    setSubmitting(false);
    fetchData(); // Refresh data
    
    // Tampilkan Pop-up Notifikasi & hilangkan setelah 3 detik
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data...</div>;

  return (
    <div className="space-y-6 relative">
      
      {/* Pop-up Notifikasi (Muncul di atas) */}
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-semibold text-sm md:text-base">MasyaAllah, bacaan berhasil dicatat!</span>
        </div>
      )}

      {/* Kartu Statistik (Desain Modern Gradient) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-indigo-100 text-xs md:text-sm">Halaman Saat Ini</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">{profile.current_page} / 604</h3>
          <p className="text-xs text-indigo-200 mt-1">Juz {Math.ceil(profile.current_page / 20)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-emerald-100 text-xs md:text-sm">Total Dibaca</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">{profile.total_pages_read}</h3>
          <p className="text-xs text-emerald-200 mt-1">Halaman</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-orange-100 text-xs md:text-sm">Streak Beruntun</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">🔥 {profile.current_streak}</h3>
          <p className="text-xs text-orange-200 mt-1">Hari</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-pink-100 text-xs md:text-sm">Total Poin</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">⭐ {profile.total_points}</h3>
          <p className="text-xs text-pink-200 mt-1">Poin Akhirat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Catat Bacaan Hari Ini</h3>
          <form onSubmit={handleLog} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Juz Ke-</label>
              <select value={juz} onChange={(e) => setJuz(Number(e.target.value))} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white">
                {Array.from({length: 30}, (_, i) => i + 1).map(j => <option key={j} value={j}>Juz {j}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Halaman Awal</label>
                <input type="number" value={startPage} onChange={(e) => setStartPage(Number(e.target.value))} required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Halaman Akhir</label>
                <input type="number" value={endPage} onChange={(e) => setEndPage(Number(e.target.value))} required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"></textarea>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition">
              {submitting ? 'Menyimpan...' : 'Simpan Log Bacaan'}
            </button>
          </form>
        </div>

        {/* Riwayat Bacaan */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat 5 Bacaan Terakhir</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900 text-sm md:text-base">Hal. {log.start_page} - {log.end_page}</span>
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full">Juz {log.juz}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">{new Date(log.log_date).toLocaleDateString('id-ID')}</span>
                </div>
                {log.notes && <p className="text-sm text-gray-600 mt-1">{log.notes}</p>}
              </div>
            ))}
            {logs.length === 0 && <p className="text-gray-500 text-sm">Belum ada catatan bacaan.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}