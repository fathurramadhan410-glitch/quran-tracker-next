'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type LeaderboardUser = {
  id: string;
  name: string;
  total_points: number;
  current_streak: number;
  total_pages_read: number;
};

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jamaah' | 'quiz'>('jamaah');
  
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRank, setCurrentUserRank] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      setCurrentUser(userData);

      if (activeTab === 'quiz') {
        const { data: allData } = await supabase
          .from('profiles')
          .select('id, name, quiz_points, current_streak')
          .order('quiz_points', { ascending: false })
          .limit(10);
        
        const mappedQuizData: LeaderboardUser[] = (allData || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          total_points: u.quiz_points || 0,
          current_streak: u.current_streak || 0,
          total_pages_read: 0
        }));

        setTopUsers(mappedQuizData);

        if (userData) {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .gt('quiz_points', userData.quiz_points || 0);
          setCurrentUserRank((count || 0) + 1);
        }

      } else {
        const { data: activeTarget } = await supabase
          .from('targets')
          .select('id, start_date')
          .eq('is_active', true)
          .maybeSingle();

        if (activeTarget) {
          const { data: participants } = await supabase
            .from('target_participants')
            .select('user_id, profiles:user_id(name, current_streak)')
            .eq('target_id', activeTarget.id);

          if (participants && participants.length > 0) {
            const participantIds = participants.map((p: any) => p.user_id);
            const { data: targetLogs } = await supabase
              .from('reading_logs')
              .select('user_id, pages_read')
              .in('user_id', participantIds)
              .gte('log_date', activeTarget.start_date);

            const pointsMap: Record<string, number> = {};
            targetLogs?.forEach((log: any) => {
              pointsMap[log.user_id] = (pointsMap[log.user_id] || 0) + (log.pages_read * 10);
            });

            const jamaahList: LeaderboardUser[] = participants.map((p: any) => ({
              id: p.user_id,
              name: p.profiles?.name || 'Anggota',
              current_streak: p.profiles?.current_streak || 0,
              total_pages_read: 0,
              total_points: pointsMap[p.user_id] || 0
            }));

            jamaahList.sort((a, b) => b.total_points - a.total_points);
            setTopUsers(jamaahList.slice(0, 10));

            const myPoints = pointsMap[session.user.id] || 0;
            let rank = 1;
            jamaahList.forEach(u => { if (u.total_points > myPoints) rank++; });
            setCurrentUserRank(rank);
          } else {
            setTopUsers([]); 
            setCurrentUserRank(0);
          }
        } else {
          setTopUsers([]); 
          setCurrentUserRank(0);
        }
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [activeTab]);

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat papan peringkat...</div>;

  return (
    <div className="space-y-8">
      
      <div className="text-center">
        <div className="inline-block mb-4">
          <svg className="w-16 h-16 mx-auto text-yellow-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
            <path fillRule="evenodd" d="M10 1a1 1 0 011 1v14a1 1 0 11-2 0V2a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600">
          Papan Peringkat
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Konsistensi hari ini, kebahagiaan di akhirat nanti.</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl shadow-sm">
          <button onClick={() => setActiveTab('jamaah')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'jamaah' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            📖 Tilawah Jamaah
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'quiz' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            🧠 Quiz Harian
          </button>
        </div>
      </div>

      {currentUserRank > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 border border-white/10">
          <div className="text-center md:text-left">
            <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Peringkat Anda di Tab {activeTab === 'jamaah' ? 'Tilawah' : 'Quiz'}</p>
            <h3 className="text-4xl md:text-5xl font-extrabold mt-1">#{currentUserRank}</h3>
            <p className="text-sm text-indigo-100 mt-1">{currentUser?.name}</p>
          </div>
          <div className="text-center md:text-right bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
            <p className="text-indigo-200 text-xs uppercase">Total Poin</p>
            <h3 className="text-3xl font-extrabold text-white">
              ⭐ {topUsers.find(u => u.id === currentUser?.id)?.total_points || 0}
            </h3>
          </div>
        </div>
      )}

      <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-gray-100">
        {activeTab === 'jamaah' && (
          <div className="mb-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-700 text-center">
            💡 Poin dihitung otomatis dari bacaan sejak target dimulai.
          </div>
        )}
        
        <div className="space-y-4">
          {topUsers.map((user, index) => {
            const isCurrentUser = currentUser?.id === user.id;
            
            return (
              <div key={user.id || index} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-300 shadow-md' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-200 border-2 border-gray-300 shadow-sm' :
                index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-100 border-2 border-orange-300 shadow-sm' :
                'bg-gray-50 border border-gray-100'
              } ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                <div className="flex items-center space-x-4 md:space-x-6">
                  <div className="flex flex-col items-center justify-center w-12 md:w-16">
                    {index === 0 ? <span className="text-4xl md:text-5xl drop-shadow-md">👑</span> : index === 1 ? <span className="text-3xl md:text-4xl drop-shadow-sm">🥈</span> : index === 2 ? <span className="text-3xl md:text-4xl drop-shadow-sm">🥉</span> : <span className="text-xl md:text-2xl font-bold text-gray-400">{index + 1}</span>}
                  </div>
                  <div className="relative">
                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center text-white font-bold uppercase text-lg md:text-xl shadow-md ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>{user.name?.charAt(0) || 'A'}</div>
                    {isCurrentUser && <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-full border border-white">YOU</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-gray-900 text-sm md:text-lg ${index === 0 ? 'text-amber-700' : ''}`}>{user.name}</p>
                      {index === 0 && activeTab === 'jamaah' && <span className="hidden sm:inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">🍗 2 Porsi Makan</span>}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">🔥 {user.current_streak} Hari</p>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <p className={`font-extrabold text-lg md:text-2xl ${index === 0 ? 'text-amber-600' : 'text-yellow-600'}`}>{user.total_points}</p>
                  <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Poin</p>
                </div>
              </div>
            );
          })}
          {topUsers.length === 0 && <div className="text-center py-8 text-gray-500">{activeTab === 'jamaah' ? 'Belum ada peserta yang ikut target aktif.' : 'Belum ada yang mengerjakan quiz.'}</div>}
        </div>
      </div>

    </div>
  );
}