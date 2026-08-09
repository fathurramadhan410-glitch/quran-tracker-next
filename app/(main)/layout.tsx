'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      setUser(profile);

      // Cek Status Maintenance
      const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
      if (settings) {
        setMaintenanceMode(settings.is_maintenance);
        setMaintenanceMsg(settings.maintenance_message);
      }

      // Jika Maintenance AKTIF dan user BUKAN developer, tendang ke halaman maintenance
      if (settings?.is_maintenance && !profile?.is_developer) {
        router.push('/maintenance');
        return;
      }

      setLoading(false);

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      const checkAndNotify = async () => {
        const today = new Date().toLocaleDateString('en-CA');
        const { data: att } = await supabase
          .from('attendances')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('date', today)
          .maybeSingle();

        if (!att && Notification.permission === 'granted') {
          new Notification("⏰ Pengingat Tilawah Qur'an Tracker", {
            body: "Sudahkah Anda membaca Al-Qur'an hari ini? Jangan lupa input bacaan dan absen Anda! (Abaikan pesan ini jika sudah membaca)",
          });
        }
      };
      checkAndNotify();
      const intervalId = setInterval(checkAndNotify, 3600000);
      return () => clearInterval(intervalId);
    }
  };

  useEffect(() => {
    fetchUser();
    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [router]);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      });
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      alert("Untuk menginstall aplikasi:\n1. Tap ikon Menu/Share di browser.\n2. Pilih 'Tambahkan ke Layar Utama'.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400 dark:text-gray-500">Memuat aplikasi...</div>;

  // Cek apakah user adalah Admin atau Developer
  const isPrivileged = user?.is_admin || user?.is_developer;

  const navLinkClass = (href: string) => 
    `flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 ${
      pathname === href 
        ? 'bg-white/20 text-white font-bold dark:bg-white/10 dark:text-white' 
        : 'text-emerald-100 hover:bg-white/10 hover:text-white font-medium dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
    }`;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-slate-900">
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 border-r border-emerald-700/50 flex flex-col h-screen flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 dark:from-slate-950 dark:to-slate-950 dark:border-slate-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between border-b border-emerald-700/50 px-6 flex-shrink-0 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="text-lg font-bold text-white dark:text-indigo-400">Qur'an Tracker</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-emerald-200 hover:text-white dark:text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className={navLinkClass('/dashboard')}>
            <span className="text-xl">📊</span> Dashboard
          </Link>
          <Link href="/attendance" onClick={() => setSidebarOpen(false)} className={navLinkClass('/attendance')}>
            <span className="text-xl">📅</span> Kehadiran
          </Link>
          <Link href="/target" onClick={() => setSidebarOpen(false)} className={navLinkClass('/target')}>
            <span className="text-xl">🎯</span> Target Khatam
          </Link>
          
          {!isPrivileged && (
            <Link href="/quiz" onClick={() => setSidebarOpen(false)} className={navLinkClass('/quiz')}>
              <span className="text-xl">🧠</span> Quiz Harian
            </Link>
          )}

          <Link href="/leaderboard" onClick={() => setSidebarOpen(false)} className={navLinkClass('/leaderboard')}>
            <span className="text-xl">🏆</span> Papan Peringkat
          </Link>
          <Link href="/quran" onClick={() => setSidebarOpen(false)} className={navLinkClass('/quran')}>
            <span className="text-xl">📖</span> Baca Al-Qur'an
          </Link>
          <Link href="/profile" onClick={() => setSidebarOpen(false)} className={navLinkClass('/profile')}>
            <span className="text-xl">⚙️</span> Profil
          </Link>
          
          {/* Menu Admin & Developer */}
          {isPrivileged && (
            <div className="pt-6 mt-6 border-t border-emerald-700/50 dark:border-slate-800">
              <p className="px-4 text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-2 dark:text-gray-500">Menu Admin</p>
              <div className="space-y-1">
                <Link href="/admin/participants" onClick={() => setSidebarOpen(false)} className={navLinkClass('/admin/participants')}>
                  <span className="text-xl">👥</span> Data Peserta
                </Link>
                <Link href="/admin/rekap" onClick={() => setSidebarOpen(false)} className={navLinkClass('/admin/rekap')}>
                  <span className="text-xl">📋</span> Rekap Kehadiran
                </Link>
              </div>
            </div>
          )}

          {/* Menu Khusus Developer */}
          {user?.is_developer && (
            <div className="pt-6 mt-6 border-t border-emerald-700/50 dark:border-slate-800">
              <p className="px-4 text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 dark:text-purple-400">Menu Developer</p>
              <div className="space-y-1">
                <Link href="/developer/system" onClick={() => setSidebarOpen(false)} className={navLinkClass('/developer/system')}>
                  <span className="text-xl">🛠️</span> Manajemen Sistem
                </Link>
              </div>
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-emerald-700/50 flex-shrink-0 dark:border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-200 hover:bg-red-500/80 hover:text-white font-medium transition dark:text-red-400 dark:hover:bg-red-500/10">
            <span className="text-xl">🚪</span> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 relative z-10 dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none dark:text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="font-bold text-lg md:text-xl text-gray-900 truncate dark:text-white">
              {user?.is_developer ? '👑 Developer Mode' : 'Dashboard Tilawah'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {isInstallable && (
              <button onClick={handleInstallClick} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition" title="Ganti Tema">
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>

            <div className="flex items-center space-x-3 relative">
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-3 focus:outline-none group">
                <span className="text-sm font-semibold text-gray-600 hidden sm:inline group-hover:text-gray-900 transition dark:text-gray-300 dark:group-hover:text-white">{user?.name}</span>
                
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt="Foto" className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-md ring-2 ring-white dark:ring-slate-900">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <p className="font-bold text-lg truncate">{user?.name}</p>
                    <p className="text-xs text-indigo-100 truncate">{user?.email}</p>
                    <span className="mt-2 inline-block bg-white/20 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                      {user?.is_developer ? '👑 Developer / Super Admin' : user?.is_admin ? '👑 Admin / Guru' : '🎓 Santri'}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <button onClick={() => router.push('/profile')} className="w-full bg-indigo-50 text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
                      ⚙️ Lihat & Edit Profil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-900" onClick={() => setProfileMenuOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  );
}