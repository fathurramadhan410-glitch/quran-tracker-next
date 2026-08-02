'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRank, setCurrentUserRank] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Ambil Top 10 Users (id ditambahkan untuk cek user yang sedang login)
      const { data: topData } = await supabase
        .from('profiles')
        .select('id, name, total_points, current_streak, total_pages_read')
        .order('total_points', { ascending: false })
        .limit(10);
      
      setTopUsers(topData || []);

      // Ambil Data User Yang Sedang Login
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUser(userData);

      // Hitung Peringkat User Saat Ini
      if (userData) {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .gt('total_points', userData.total_points);
        
        setCurrentUserRank((count || 0) + 1);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat papan peringkat...</div>;

  return (
    <div className="space-y-8">
      
      {/* Header Judul Mewah */}
      <div className="text-center">
        <div className="inline-block mb-4">
          <svg className="w-16 h-16 mx-auto text-yellow-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
            <path fillRule="evenodd" d="M10 1a1 1 0 011 1v14a1 1 0 11-2 0V2a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600">
          Papan Peringkat Pejuang Tilawah
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Konsistensi hari ini, kebahagiaan di akhirat nanti.</p>
      </div>

      {/* Kartu Peringkat Anda Saat Ini */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 border border-white/10">
        <div className="text-center md:text-left">
          <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Peringkat Anda Saat Ini</p>
          <h3 className="text-4xl md:text-5xl font-extrabold mt-1 flex items-center justify-center md:justify-start gap-2">
            #{currentUserRank}
          </h3>
          <p className="text-sm text-indigo-100 mt-1">{currentUser?.name}</p>
        </div>
        <div className="text-center md:text-right bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
          <p className="text-indigo-200 text-xs uppercase">Total Poin Akumulatif</p>
          <h3 className="text-3xl font-extrabold text-white">⭐ {currentUser?.total_points || 0}</h3>
        </div>
      </div>

      {/* Daftar Top 10 */}
      <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-4">
          {topUsers.map((user, index) => {
            const isCurrentUser = currentUser?.id === user.id;
            
            return (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-300 shadow-md' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-200 border-2 border-gray-300 shadow-sm' :
                  index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-100 border-2 border-orange-300 shadow-sm' :
                  'bg-gray-50 border border-gray-100'
                } ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
              >
                <div className="flex items-center space-x-4 md:space-x-6">
                  {/* Peringkat / Medali */}
                  <div className="flex flex-col items-center justify-center w-12 md:w-16">
                    {index === 0 ? (
                      <span className="text-4xl md:text-5xl drop-shadow-md">👑</span>
                    ) : index === 1 ? (
                      <span className="text-3xl md:text-4xl drop-shadow-sm">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-3xl md:text-4xl drop-shadow-sm">🥉</span>
                    ) : (
                      <span className="text-xl md:text-2xl font-bold text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Inisial Nama & Avatar */}
                  <div className="relative">
                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center text-white font-bold uppercase text-lg md:text-xl shadow-md ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                      'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>
                      {user.name?.charAt(0) || 'A'}
                    </div>
                    {isCurrentUser && (
                      <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-full border border-white">YOU</span>
                    )}
                  </div>
                  
                  {/* Nama & Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-gray-900 text-sm md:text-lg ${index === 0 ? 'text-amber-700' : ''}`}>{user.name}</p>
                      {index === 0 && (
                        <span className="hidden sm:inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                          🍗 Reward Khataman: 2 Porsi Makan!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10a4 4 0 114 4c-.5 0-1 0-1 .5 0 1 1 2 2 2 1 0 3-1 3-1z"></path></svg>
                        🔥 {user.current_streak} Hari
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        📖 {user.total_pages_read} Hal
                      </p>
                    </div>
                    {/* Badge Khusus untuk Mobile */}
                    {index === 0 && (
                      <span className="sm:hidden inline-block mt-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        🍗 2 Porsi Makan
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Poin */}
                <div className="text-right pl-2">
                  <p className={`font-extrabold text-lg md:text-2xl ${index === 0 ? 'text-amber-600' : 'text-yellow-600'}`}>
                    {user.total_points}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Poin</p>
                </div>
              </div>
            );
          })}
          
          {topUsers.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada data papan peringkat.</div>}
        </div>
      </div>

    </div>
  );
}