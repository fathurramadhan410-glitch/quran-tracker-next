'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUser(profile);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Memuat...</div>;

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed z-30 w-64 bg-gray-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between border-b border-gray-700 px-4">
          <span className="text-xl font-bold text-emerald-400">Qur'an Tracker</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">📊 Dashboard</Link>
          <Link href="/attendance" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">📅 Kehadiran</Link>
          <Link href="/target" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">🎯 Target Khatam</Link>
          <Link href="/leaderboard" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">🏆 Papan Peringkat</Link>
          <Link href="/quran" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">📖 Baca Al-Qur'an</Link>
          <Link href="/profile" onClick={() => setSidebarOpen(false)} className="block py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">⚙️ Profil</Link>
          
                    {user?.is_admin && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Menu Admin</p>
              <Link href="/admin/participants" onClick={() => setSidebarOpen(false)} className="flex items-center py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">👥 Data Peserta</Link>
              <Link href="/admin/rekap" onClick={() => setSidebarOpen(false)} className="flex items-center py-2.5 px-4 rounded hover:bg-gray-700 text-gray-300">📋 Rekap Kehadiran</Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full text-left py-2.5 px-4 rounded hover:bg-red-600 text-gray-300 hover:text-white">🚪 Keluar</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="font-semibold text-lg md:text-xl text-gray-800 truncate">Dashboard Tilawah</h2>
          </div>
          
          <div className="flex items-center space-x-3 relative">
            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-3 focus:outline-none">
              <span className="text-sm font-medium text-gray-600 hidden sm:inline">{user?.name}</span>
              
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Foto" className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center gap-4">
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} className="w-14 h-14 rounded-full border-2 border-white/50 object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold uppercase border-2 border-white/50">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-lg truncate">{user?.name}</p>
                    <p className="text-xs text-indigo-100 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  {user?.phone_number && <p className="text-gray-600 flex items-center gap-2">📞 {user.phone_number}</p>}
                  {user?.occupation && <p className="text-gray-600 flex items-center gap-2">💼 {user.occupation}</p>}
                  {user?.address && <p className="text-gray-600 flex items-center gap-2">🏠 {user.address}</p>}
                  <button onClick={() => router.push('/profile')} className="w-full mt-3 bg-indigo-50 text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition">
                    ⚙️ Lihat & Edit Profil
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50" onClick={() => setProfileMenuOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  );
}