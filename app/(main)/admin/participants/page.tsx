'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminParticipantsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

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
    setOpenActionId(null);
    fetchData();
  };

  const toggleBypass = async (userId: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ bypass_reading_block: !currentStatus }).eq('id', userId);
    triggerNotif(`Akses baca siang berhasil ${!currentStatus ? 'DIBUKA' : 'DITUTUP'}!`);
    setOpenActionId(null);
    fetchData();
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>;

  return (
    <div className="space-y-6 relative" onClick={() => setOpenActionId(null)}>
      
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Foto & Nama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Kontak & Alamat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pekerjaan & Pendidikan</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">{u.name}</h3>
                          {u.is_admin && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Admin</span>}
                          {!u.is_active && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Nonaktif</span>}
                          {u.bypass_reading_block && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Izin Siang</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-[200px]">
                    📞 {u.phone_number || '-'} <br/> 🏠 {u.address || '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-[150px]">
                    💼 {u.occupation || '-'} <br/> 🎓 {u.education || '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setOpenActionId(openActionId === u.id ? null : u.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                    >
                      ⚙️ Aksi
                    </button>

                    {openActionId === u.id && (
                      <div className="absolute right-6 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-left">
                        <button 
                          onClick={() => toggleBypass(u.id, u.bypass_reading_block)}
                          className={`w-full block px-4 py-3 text-xs font-medium hover:bg-gray-50 ${u.bypass_reading_block ? 'text-orange-600' : 'text-blue-600'}`}
                        >
                          {u.bypass_reading_block ? '🔒 Tutup Akses Baca Siang' : '🔓 Buka Akses Baca Siang'}
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button 
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`w-full block px-4 py-3 text-xs font-medium hover:bg-gray-50 ${u.is_active ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {u.is_active ? '🚫 Nonaktifkan Akun' : '✅ Aktifkan Akun'}
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">Belum ada peserta terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}