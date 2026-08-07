'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [dateAttendance, setDateAttendance] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalIzin, setTotalIzin] = useState(0);
  const [reason, setReason] = useState('');
  
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const today = new Date().toLocaleDateString('en-CA');

  const fetchData = async (date: string) => {
    if (!date) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Cek absensi di tanggal yang dipilih
    const { data: dateData } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .maybeSingle();

    setDateAttendance(dateData);

    // Ambil riwayat absensi
    const { data: historyData } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .limit(10);

    setAttendances(historyData || []);

    // Hitung statistik
    const { data: hadirData } = await supabase
      .from('attendances')
      .select('id', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('status', 'hadir');
      
    const { data: izinData } = await supabase
      .from('attendances')
      .select('id', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('status', 'izin');

    setTotalHadir(hadirData?.length || 0);
    setTotalIzin(izinData?.length || 0);
    setLoading(false);
  };

  useEffect(() => {
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) fetchData(selectedDate);
  }, [selectedDate]);

  const triggerNotif = (msg: string) => {
    setNotifMsg(msg);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  const handleCheckIn = async () => {
    setScanning(true);
    
    setTimeout(async () => {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('attendances').insert({
        user_id: session.user.id,
        date: selectedDate,
        status: 'hadir'
      });

      setScanning(false);
      setSubmitting(false);
      if (!error) {
        triggerNotif(`Sidik jari terverifikasi! Kehadiran tanggal ${selectedDate} berhasil dicatat.`);
        fetchData(selectedDate);
      }
    }, 2000);
  };

  const handleIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return alert("Alasan izin harus diisi.");
    
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('attendances').insert({
      user_id: session.user.id,
      date: selectedDate,
      status: 'izin',
      reason: reason
    });

    setReason('');
    setSubmitting(false);
    if (!error) {
      triggerNotif(`Izin tanggal ${selectedDate} tersimpan.`);
      fetchData(selectedDate);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium">Memuat data kehadiran...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Notifikasi Pop-up Kotak Modern */}
      {showNotif && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 flex items-start gap-4 animate-slide-down dark:bg-slate-800">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="flex-1 pt-1">
            <h4 className="font-bold text-sm text-green-800 dark:text-green-400">Berhasil</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notifMsg}</p>
          </div>
        </div>
      )}

      {/* Header Judul Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">📅 Sistem Kehadiran</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Pantau konsistensi tilawah harian Anda.</p>
        </div>
      </div>

      {/* Kartu Statistik Premium (Glassmorphism) */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Hadir</p>
            <h3 className="text-3xl md:text-4xl font-extrabold mt-2">{totalHadir} <span className="text-lg font-medium">Hari</span></h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">Total Izin</p>
            <h3 className="text-3xl md:text-4xl font-extrabold mt-2">{totalIzin} <span className="text-lg font-medium">Hari</span></h3>
          </div>
        </div>
      </div>

      {/* Kartu Form Absensi Modern */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 dark:bg-slate-800 dark:border-slate-700">
        
        {/* Pemilih Tanggal (Kalender) Premium */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-gray-400">Pilih Tanggal Absensi</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <input 
              type="date" 
              value={selectedDate} 
              max={today} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium transition dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:[color-scheme:dark]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 dark:text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Gunakan ini jika Anda lupa absen di hari sebelumnya.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-8 dark:border-slate-700">
          <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">Status absensi untuk tanggal: <span className="font-bold text-gray-700 dark:text-white">{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
          
          {dateAttendance ? (
            <div className={`p-6 rounded-2xl text-center font-medium flex flex-col items-center gap-3 ${dateAttendance.status === 'hadir' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'}`}>
              {dateAttendance.status === 'hadir' ? (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              )}
              <div>
                <p className="font-bold text-lg">{dateAttendance.status === 'hadir' ? 'Alhamdulillah, Anda Hadir!' : 'Anda Izin'}</p>
                {dateAttendance.reason && <p className="text-xs mt-1 italic">Alasan: "{dateAttendance.reason}"</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tombol Sidik Jari Modern Sultan Class */}
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-2xl dark:bg-slate-700/50 dark:border-slate-600">
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-sm font-medium">Sentuh sensor di bawah untuk verifikasi kehadiran</p>
                
                <button 
                  onClick={handleCheckIn} 
                  disabled={scanning || submitting}
                  className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${scanning ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 dark:bg-slate-800'} ${!scanning && 'hover:scale-105'} cursor-pointer disabled:cursor-wait border border-gray-100 dark:border-slate-600`}
                >
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-500/20 dark:border-t-indigo-400"></div>
                    </div>
                  )}
                  
                  <svg className={`w-12 h-12 transition-colors ${scanning ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.256-.512M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm10-4a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </button>
                
                <p className="mt-6 text-xs text-gray-400 font-medium tracking-wider uppercase dark:text-gray-500">
                  {scanning ? 'Memindai Sidik Jari...' : 'Tap untuk Absen'}
                </p>
              </div>

              {/* Form Izin Modern */}
              <div className="flex flex-col p-8 bg-gray-50 border border-gray-200 rounded-2xl dark:bg-slate-700/50 dark:border-slate-600">
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-center text-sm font-medium">Berhalangan hadir? Isi alasan izin:</p>
                <form onSubmit={handleIzin} className="flex flex-col flex-1">
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3} 
                    required
                    placeholder="Contoh: Sakit, banyak kerjaan, dll" 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 mb-4 text-gray-900 text-sm transition dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-white text-red-600 border-2 border-red-200 py-3 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 dark:bg-slate-800 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10"
                  >
                    📝 Kirim Alasan Izin
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Riwayat Kehadiran Elegan */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 mb-6 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          Riwayat 10 Absensi Terakhir
        </h3>
        <div className="space-y-3">
          {attendances.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-sm transition dark:bg-slate-700/50 dark:border-slate-600">
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-xl ${att.status === 'hadir' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                  <span className="text-lg font-bold">{new Date(att.date).getDate()}</span>
                  <span className="text-[9px] uppercase font-bold">{new Date(att.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm dark:text-white">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {att.status === 'hadir' ? (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">Hadir</p>
                  ) : (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-0.5">Izin: {att.reason}</p>
                  )}
                </div>
              </div>
              {att.status === 'hadir' ? (
                <span className="text-green-500 text-xl">✔️</span>
              ) : (
                <span className="text-yellow-500 text-xl">📝</span>
              )}
            </div>
          ))}
          {attendances.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              Belum ada riwayat absensi.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}