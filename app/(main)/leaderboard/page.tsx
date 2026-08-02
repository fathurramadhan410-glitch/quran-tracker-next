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

      // 1. Ambil Top 10 Users
      const { data: topData } = await supabase
        .from('profiles')
        .select('name, total_points, current_streak, total_pages_read')
        .order('total_points', { ascending: false })
        .limit(10);
      
      setTopUsers(topData || []);

      // 2. Ambil Data User Yang Sedang Login
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUser(userData);

      // 3. Hitung Peringkat User Saat Ini
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
    <div className="space-y-6">
      
      {/* Kartu Peringkat Anda Saat Ini */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-indigo-200 text-sm uppercase tracking-wider font-bold">Peringkat Anda Saat Ini</p>
          <h3 className="text-3xl md:text-4xl font-extrabold mt-1">Peringkat #{currentUserRank}</h3>
        </div>
        <div className="text-center md:text-right bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
          <p className="text-indigo-200 text-sm">Total Poin</p>
          <h3 className="text-3xl font-extrabold text-white">⭐ {currentUser?.total_points || 0}</h3>
        </div>
      </div>

      {/* Daftar Top 10 */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          🏆 Top 10 Pejuang Tilawah
        </h3>
        
        <div className="space-y-4">
          {topUsers.map((user, index) => {
            const isCurrentUser = currentUser?.id === user.id; // Asumsi ID bisa diakses jika diperlukan, tapi kita select tanpa id di atas. 
            // Kita bandingkan dengan nama dan poin untuk tes, atau ubah query select di atas jadi select('*')
            
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-xl transition hover:shadow-md ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border border-yellow-200' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                  index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-100 border border-orange-200' :
                  'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Peringkat / Medali */}
                  <span className="text-2xl font-bold w-10 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-gray-500 text-xl">{index + 1}</span>}
                  </span>
                  
                  {/* Inisial Nama */}
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                    {user.name?.charAt(0) || 'A'}
                  </div>
                  
                  {/* Nama & Streak */}
                  <div>
                    <p className="font-bold text-gray-900 text-sm md:text-base">{user.name}</p>
                    <p className="text-xs text-gray-500">🔥 {user.current_streak} Hari | 📖 {user.total_pages_read} Hal</p>
                  </div>
                </div>
                
                {/* Poin */}
                <div className="text-right">
                  <p className="font-extrabold text-yellow-600 text-lg md:text-xl">⭐ {user.total_points}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Poin</p>
                </div>
              </div>
            );
          })}
          
          {topUsers.length === 0 && <p className="text-gray-500 text-center py-4">Belum ada data papan peringkat.</p>}
        </div>
      </div>

    </div>
  );
}