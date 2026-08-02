'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminParticipantsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
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

  const toggleActive = async (userId: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
    triggerNotif(`Akun berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
    fetchData();
  };

  const manualAttendance = async (userId: string, userName: string) => {
    // Cek apakah sudah absen hari ini
    const { data: existing } = await supabase
      .from('attendances')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      triggerNotif(`${userName} sudah absen hari ini.`);
      return;
    }

    await supabase.from('attendances').insert({
      user_id: userId,
      date: today,
      status: 'hadir'
    });
    triggerNotif(`Berhasil menandai ${userName} hadir hari ini!`);
    fetchData(); // Refresh data untuk update UI jika perlu
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>;

  return (
    <div className="space-y-6 relative">
      
      {/* Pop-up Notifikasi */}
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <span className="font-semibold text-sm">{notifMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">👥 Manajemen Data Peserta</h2>
          <p className="text-sm text-gray-500 mt-1">Total {users.length} pengguna terdaftar.</p>
        </div>

        {/* Wrapper untuk Scroll Horizontal di HP */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Peserta</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Alamat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pendidikan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Handphone</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  
                  {/* Kolom Foto & Nama */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {u.profile_photo_url ? (
                        <img src={u.profile_photo_url} className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg uppercase flex-shrink-0">
                          {u.name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-sm">{u.name}</h3>
                          {u.is_admin && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Admin</span>}
                          {!u.is_active && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Nonaktif</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Kolom Alamat */}
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-[200px]">
                    {u.address || '-'}
                  </td>

                  {/* Kolom Pendidikan */}
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-[150px]">
                    {u.education || '-'}
                  </td>

                  {/* Kolom No. Handphone */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {u.phone_number || '-'}
                  </td>

                  {/* Kolom Aksi */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button 
                        onClick={() => manualAttendance(u.id, u.name)} 
                        className="bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-100 transition border border-green-100 whitespace-nowrap"
                      >
                        ✔️ Tandai Hadir
                      </button>
                      <button 
                        onClick={() => toggleActive(u.id, u.is_active)} 
                        className={`${u.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100'} text-xs font-bold px-4 py-2 rounded-lg transition border whitespace-nowrap`}
                      >
                        {u.is_active ? '🚫 Nonaktifkan' : '✅ Aktifkan'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">Belum ada peserta terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}