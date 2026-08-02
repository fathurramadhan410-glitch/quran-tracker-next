'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TargetPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTarget, setActiveTarget] = useState<any>(null);
  const [allTargets, setAllTargets] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);
  const [remainingToday, setRemainingToday] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setProfile(profileData);

    // Ambil SEMUA target (untuk riwayat)
    const { data: targetsData } = await supabase
      .from('targets')
      .select('*')
      .order('created_at', { ascending: false });
    setAllTargets(targetsData || []);

    // Ambil target yang AKTIF
    const { data: targetData } = await supabase
      .from('targets')
      .select('*')
      .eq('is_active', true)
      .single();

    if (targetData) {
      setActiveTarget(targetData);

      // Cek apakah user sudah join
      const { data: joined } = await supabase
        .from('target_participants')
        .select('id')
        .eq('target_id', targetData.id)
        .eq('user_id', session.user.id)
        .single();
      setIsJoined(!!joined);

      // Ambil daftar peserta beserta profilnya
      const { data: participantsData } = await supabase
        .from('target_participants')
        .select('user_id, profiles:user_id(name, current_page, total_points, current_streak)')
        .eq('target_id', targetData.id);
      
      const validParticipants = participantsData?.filter(p => p.profiles) || [];
      setParticipants(validParticipants);

      const usersCount = validParticipants.length || 1;

      // Kalkulasi Pintar
      const start = new Date(targetData.start_date);
      const end = new Date(targetData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyTargetPages = Math.ceil(604 / totalDays);
      const pagesPerPerson = Math.ceil(dailyTargetPages / usersCount);

      setCalculation({
        totalDays,
        dailyTargetPages,
        dailyTargetJuz: dailyTargetPages / 20,
        usersCount,
        pagesPerPerson,
        sheetsPerPerson: Math.ceil(pagesPerPerson / 2)
      });

      // Ambil log bacaan hari ini
      const userIds = validParticipants.map(p => p.user_id) || [];
      const { data: logsToday } = await supabase
        .from('reading_logs')
        .select('*, profiles:user_id(name)')
        .in('user_id', userIds)
        .eq('log_date', today);

      const totalReadToday = logsToday?.reduce((acc, log) => acc + log.pages_read, 0) || 0;
      const remainingPages = Math.max(0, dailyTargetPages - totalReadToday);

      setRemainingToday({
        totalReadToday,
        remainingPages,
        logs: logsToday || []
      });
    } else {
      setActiveTarget(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerNotif = (msg: string) => {
    setNotifMsg(msg);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  const handleJoin = async () => {
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !activeTarget) return;

    await supabase.from('target_participants').insert({
      target_id: activeTarget.id,
      user_id: session.user.id
    });

    setSubmitting(false);
    triggerNotif("Berhasil bergabung dengan target khatam!");
    fetchData();
  };

  const handleCreateTarget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Nonaktifkan target lama
    await supabase.from('targets').update({ is_active: false }).eq('is_active', true);

    // Buat target baru
    const { data: newTarget } = await supabase.from('targets').insert({
      name: formData.get('name'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      khatam_date: formData.get('khatam_date'),
      is_active: true
    }).select().single();

    // Auto-join admin ke target baru
    const { data: { session } } = await supabase.auth.getSession();
    if (session && newTarget) {
      await supabase.from('target_participants').insert({
        target_id: newTarget.id,
        user_id: session.user.id
      });
    }

    setSubmitting(false);
    triggerNotif("Target baru berhasil dibuat!");
    (e.target as HTMLFormElement).reset();
    fetchData();
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data target...</div>;

  const progressPercent = calculation && remainingToday 
    ? Math.min(100, Math.round((remainingToday.totalReadToday / calculation.dailyTargetPages) * 100)) 
    : 0;

  return (
    <div className="space-y-6 relative">
      
      {/* Pop-up Notifikasi */}
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-semibold text-sm md:text-base">{notifMsg}</span>
        </div>
      )}

      <div className={`grid ${profile?.is_admin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        
        {/* Panel Kiri: Form Admin & Riwayat Target */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Form Buat Target (Hanya Admin) */}
          {profile?.is_admin && (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span>🛠️</span> Panel Admin
              </h3>
              <p className="text-sm text-slate-400 mb-6">Buat target khatam baru untuk santri.</p>
              <form onSubmit={handleCreateTarget} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">Nama Target</label>
                  <input type="text" name="name" required placeholder="Misal: Khatam Ramadhan" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder-slate-500" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">Tgl Mulai</label>
                    <input type="date" name="start_date" required style={{ colorScheme: 'dark' }} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">Tgl Selesai</label>
                    <input type="date" name="end_date" required style={{ colorScheme: 'dark' }} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">Tgl Khatam</label>
                    <input type="date" name="khatam_date" required style={{ colorScheme: 'dark' }} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 cursor-pointer transition shadow-lg">
                  {submitting ? 'Memproses...' : '🚀 Buat Target Sekarang'}
                </button>
              </form>
            </div>
          )}

          {/* Riwayat Target (Admin & Murid) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📜 Riwayat Target
            </h3>
            <div className="space-y-3">
              {allTargets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 text-sm">{t.name}</span>
                    {t.is_active ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Aktif</span>
                    ) : (
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">Selesai</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Khatam: {new Date(t.khatam_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
              {allTargets.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Belum ada target dibuat.</p>}
            </div>
          </div>
        </div>

        {/* Panel Kanan: Info Target Aktif & Peserta */}
        <div className={profile?.is_admin ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          {activeTarget ? (
            <>
              {/* Kartu Info Target */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">Target Aktif</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{activeTarget.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {new Date(activeTarget.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} → {new Date(activeTarget.khatam_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {isJoined ? (
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Peserta Aktif
                  </span>
                ) : (
                  <button onClick={handleJoin} disabled={submitting} className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition text-sm font-bold cursor-pointer shadow-md">
                    Ikuti Target Ini
                  </button>
                )}
              </div>

              {/* Kalkulasi Pintar */}
              {calculation && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Kalkulasi Tugas Harian</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl shadow-lg text-white">
                      <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider">Total Hari</p>
                      <h3 className="text-2xl font-bold mt-1">{calculation.totalDays}</h3>
                      <p className="text-xs text-blue-200">Hari Mengaji</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-400 to-purple-600 p-4 rounded-xl shadow-lg text-white">
                      <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider">Target Jamaah</p>
                      <h3 className="text-2xl font-bold mt-1">{calculation.dailyTargetPages}</h3>
                      <p className="text-xs text-indigo-200">Halaman/Hari</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-4 rounded-xl shadow-lg text-white">
                      <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider">Peserta</p>
                      <h3 className="text-2xl font-bold mt-1">{calculation.usersCount}</h3>
                      <p className="text-xs text-emerald-200">Orang Aktif</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-4 rounded-xl shadow-lg text-white">
                      <p className="text-amber-100 text-[10px] uppercase font-bold tracking-wider">Jatah Anda</p>
                      <h3 className="text-2xl font-bold mt-1">{calculation.pagesPerPerson}</h3>
                      <p className="text-xs text-amber-200">Halaman/Hari</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl text-center text-indigo-800 font-medium text-sm border border-indigo-100">
                    💡 Setiap orang wajib membaca minimal <span className="font-bold">{calculation.pagesPerPerson} halaman</span> ({calculation.sheetsPerPerson} lembar) per hari agar target khatam tepat waktu.
                  </div>
                </div>
              )}

              {/* Progres Bacaan Hari Ini */}
              {remainingToday && calculation && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">⚠️ Progres Bacaan Hari Ini</h3>
                  <p className="text-sm text-gray-500 mb-4">Pantau kontribusi jamaah secara real-time.</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${progressPercent}%` }}
                    >
                      {progressPercent > 10 && <span className="text-[10px] font-bold text-white">{progressPercent}%</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                      <p className="text-green-600 text-xs font-bold uppercase">Sudah Dibaca</p>
                      <h3 className="text-2xl font-bold text-green-700 mt-1">{remainingToday.totalReadToday} <span className="text-sm font-normal">Hal</span></h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                      <p className="text-red-600 text-xs font-bold uppercase">Sisa Target</p>
                      <h3 className="text-2xl font-bold text-red-700 mt-1">{remainingToday.remainingPages} <span className="text-sm font-normal">Hal</span></h3>
                    </div>
                  </div>

                  {remainingToday.logs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-800 mb-3">✨ Kontribusi Hari Ini:</h4>
                      <ul className="space-y-2">
                        {remainingToday.logs.map((log: any) => (
                          <li key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                {log.profiles?.name?.charAt(0) || 'A'}
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{log.profiles?.name || 'Anggota'}</span>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">Hal. {log.start_page} - {log.end_page}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* DAFTAR PESERTA AKTIF (ADMIN & MURID) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👥 Daftar Peserta Target ({participants.length} Orang)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Santri</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Halaman Saat Ini</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Streak</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Poin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((p: any) => (
                        <tr key={p.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                {p.profiles?.name?.charAt(0) || 'A'}
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{p.profiles?.name || 'Anggota'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {p.profiles?.current_page || 1} / 604
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            🔥 {p.profiles?.current_streak || 0} Hari
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            ⭐ {p.profiles?.total_points || 0} Poin
                          </td>
                        </tr>
                      ))}
                      {participants.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Belum ada santri yang bergabung.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-800 text-xl font-bold">Belum ada target khatam aktif</p>
              {profile?.is_admin ? (
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Silakan buat target baru menggunakan form di sebelah kiri untuk memulai.</p>
              ) : (
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Mohon tunggu Admin/Guru untuk membuat target khatam baru. Semangat menunggu!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}