'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminParticipantsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // State untuk Modal Reset Password
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  
  // State baru untuk Modal Pop-up Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }
    setResetting(true);

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: resetUser.id, newPassword })
    });

    const data = await res.json();
    setResetting(false);
    setNewPassword('');

    if (data.success) {
      setResetUser(null); // Tutup modal input password
      setSuccessMsg(`Password untuk murid ${resetUser.name} telah berhasil diperbarui. Silakan infokan password baru tersebut kepada murid.`);
      setShowSuccessModal(true); // Tampilkan modal sukses
    } else {
      alert("Gagal mengubah password: " + data.error);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>;

  return (
    <div className="space-y-6 relative" onClick={() => setOpenActionId(null)}>
      
      {/* Notif Toast (Untuk Aktif/Nonaktif) */}
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2">
          <span className="font-semibold text-sm">{notifMsg}</span>
        </div>
      )}

      {/* Modal Pop-up Sukses Reset Password */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Password Berhasil Diubah!</h4>
            <p className="text-gray-500 mb-6 text-sm">{successMsg}</p>
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="bg-indigo-600 text-white px-8 py-2 rounded-full font-semibold hover:bg-indigo-700 transition text-sm"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal Input Reset Password */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setResetUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6M9 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h4>
            <p className="text-gray-500 mb-6 text-sm">Masukkan password baru untuk: <br/><span className="font-bold text-gray-700">{resetUser.name}</span></p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" 
                placeholder="Masukkan password baru (min 6 char)" 
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetUser(null)} className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-200 transition">
                  Batal
                </button>
                <button type="submit" disabled={resetting} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition">
                  {resetting ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
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
                          onClick={() => { setResetUser(u); setOpenActionId(null); }}
                          className="w-full block px-4 py-3 text-xs font-medium text-indigo-600 hover:bg-gray-50 border-b border-gray-100"
                        >
                          🔑 Ganti Password
                        </button>

                        <button 
                          onClick={() => toggleBypass(u.id, u.bypass_reading_block)}
                          className={`w-full block px-4 py-3 text-xs font-medium hover:bg-gray-50 border-b border-gray-100 ${u.bypass_reading_block ? 'text-orange-600' : 'text-blue-600'}`}
                        >
                          {u.bypass_reading_block ? '🔒 Tutup Akses Baca Siang' : '🔓 Buka Akses Baca Siang'}
                        </button>

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