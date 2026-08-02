'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      .single();

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
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('attendances').insert({
      user_id: session.user.id,
      date: selectedDate,
      status: 'hadir'
    });

    setSubmitting(false);
    if (!error) {
      triggerNotif(`Alhamdulillah, kehadiran tanggal ${selectedDate} berhasil dicatat!`);
      fetchData(selectedDate);
    }
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

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data kehadiran...</div>;

  return (
    <div className="space-y-6 relative">
      
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-semibold text-sm md:text-base">{notifMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-emerald-100 text-xs md:text-sm">Total Hadir</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">✅ {totalHadir}</h3>
          <p className="text-xs text-emerald-200 mt-1">Hari</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <p className="text-amber-100 text-xs md:text-sm">Total Izin</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">📝 {totalIzin}</h3>
          <p className="text-xs text-amber-200 mt-1">Hari</p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Absensi</h3>
        
        {/* Input Kalender */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal Absensi</label>
          <input 
            type="date" 
            value={selectedDate} 
            max={today} // Tidak bisa pilih tanggal future
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1">Gunakan ini jika Anda lupa absen di hari sebelumnya.</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-4">Status absensi untuk tanggal: <span className="font-bold text-gray-700">{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
          
          {dateAttendance ? (
            dateAttendance.status === 'hadir' ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center text-green-700 font-medium">
                ✅ Alhamdulillah, Anda sudah menandai kehadiran di tanggal ini.
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center text-yellow-700 font-medium">
                📝 Anda izin di tanggal ini. Alasan: "{dateAttendance.reason}"
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-600 mb-4 text-center text-sm">Klik tombol di bawah jika Anda membaca Al-Qur'an di tanggal tersebut.</p>
                <button 
                  onClick={handleCheckIn} 
                  disabled={submitting}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 cursor-pointer"
                >
                  ✔️ Tandai Hadir
                </button>
              </div>

              <div className="flex flex-col p-6 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-600 mb-2 text-center text-sm">Tidak sempat membaca? Silakan isi alasan:</p>
                <form onSubmit={handleIzin} className="flex flex-col flex-1">
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3} 
                    required
                    placeholder="Contoh: Sakit, banyak kerjaan, dll" 
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 mb-3 text-gray-900 text-sm"
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    📝 Kirim Alasan Izin
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat 10 Absensi Terakhir</h3>
        <div className="space-y-3">
          {attendances.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-lg ${att.status === 'hadir' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <span className="text-base md:text-lg font-bold">{new Date(att.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(att.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm md:text-base">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {att.status === 'hadir' ? (
                    <p className="text-xs md:text-sm text-green-600">Status: Hadir</p>
                  ) : (
                    <p className="text-xs md:text-sm text-yellow-600">Status: Izin ({att.reason})</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {attendances.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Belum ada riwayat absensi.</p>}
        </div>
      </div>

    </div>
  );
}