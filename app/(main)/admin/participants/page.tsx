'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Helper function untuk warna pastel acak berdasarkan nama
const getPastelColor = (name: string) => {
  const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Helper function untuk mendapatkan inisial
const getInitials = (name: string) => {
  if (!name) return '?';
  const words = name.split(' ');
  return words.map((w) => w.charAt(0)).join('').substring(0, 2).toUpperCase();
};

// Komponen kecil untuk menangani data kosong
const EmptyData = () => <span className="text-gray-400 text-xs italic">Belum diisi</span>;

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
  
  // State untuk Modal Pop-up Sukses
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
      setResetUser(null); 
      setSuccessMsg(`Password untuk murid ${resetUser.name} telah berhasil diperbarui. Silakan infokan password baru tersebut kepada murid.`);
      setShowSuccessModal(true); 
    } else {
      alert("Gagal mengubah password: " + data.error);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>;

  return (
    <div className="space-y-6 relative" onClick={() => setOpenActionId(null)}>
      
      {/* Notif Toast */}
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

      {/* Card Modern untuk Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">👥 Manajemen Data Peserta</h2>
          <p className="text-sm text-gray-500 mt-1">Total {users.length} pengguna terdaftar.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Foto & Nama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Kontak & Alamat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pekerjaan & Pendidikan</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition align-middle">
                  
                  {/* Kolom 1: Foto & Nama */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {u.profile_photo_url ? (
                        <img 
                          src={u.profile_photo_url} 
                          alt={u.name} 
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0 shadow-sm" 
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-800 font-bold text-lg flex-shrink-0 shadow-sm border border-gray-100" 
                          style={{ backgroundColor: getPastelColor(u.name || 'User') }}
                        >
                          {getInitials(u.name || 'U')}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">{u.name}</h3>
                          {u.is_admin && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Admin</span>}
                          {!u.is_active && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Nonaktif</span>}
                          {u.bypass_reading_block && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Izin Siang</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Kolom 2: Kontak & Alamat */}
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-[200px] align-middle">
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      {u.phone_number ? <span>{u.phone_number}</span> : <EmptyData />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>🏠</span>
                      {u.address ? <span>{u.address}</span> : <EmptyData />}
                    </div>
                  </td>

                  {/* Kolom 3: Pekerjaan & Pendidikan */}
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-[150px] align-middle">
                    <div className="flex items-center gap-2">
                      <span>💼</span>
                      {u.occupation ? <span>{u.occupation}</span> : <EmptyData />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>🎓</span>
                      {u.education ? <span>{u.education}</span> : <EmptyData />}
                    </div>
                  </td>

                  {/* Kolom 4: Aksi (Dropdown) */}
                  <td className="px-6 py-4 whitespace-nowrap text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setOpenActionId(openActionId === u.id ? null : u.id)}
                      className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
                      title="Menu Aksi"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openActionId === u.id && (
                      <div className="absolute right-6 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                        <button 
                          onClick={() => { setResetUser(u); setOpenActionId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-gray-50 border-b border-gray-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6M9 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                          Ganti Password
                        </button>

                        <button 
                          onClick={() => toggleBypass(u.id, u.bypass_reading_block)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 border-b border-gray-50 transition ${u.bypass_reading_block ? 'text-orange-600' : 'text-blue-600'}`}
                        >
                          {u.bypass_reading_block ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                          )}
                          {u.bypass_reading_block ? 'Tutup Akses Baca Siang' : 'Buka Akses Baca Siang'}
                        </button>

                        <button 
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition ${u.is_active ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {u.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          )}
                          {u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
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