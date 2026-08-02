'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRekapPage() {
  const [loading, setLoading] = useState(true);
  const [hadirToday, setHadirToday] = useState<any[]>([]);
  const [izinToday, setIzinToday] = useState<any[]>([]);
  const [allAttendances, setAllAttendances] = useState<any[]>([]);

  // Perhitungan Tanggal yang 100% Akurat
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const fetchData = async () => {
    setLoading(true);
    
    const { data: todayData } = await supabase
      .from('attendances')
      .select('*, profiles:user_id(name, email)')
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (todayData) {
      setHadirToday(todayData.filter((d: any) => d.status === 'hadir'));
      setIzinToday(todayData.filter((d: any) => d.status === 'izin'));
    }

    const { data: historyData } = await supabase
      .from('attendances')
      .select('*, profiles:user_id(name)')
      .order('date', { ascending: false })
      .limit(20);

    setAllAttendances(historyData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat rekap kehadiran...</div>;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Hadir Hari Ini</h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{hadirToday.length} Santri</span>
          </div>
          <div className="space-y-3">
            {hadirToday.map((att) => (
              <div key={att.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                  {att.profiles?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-sm block">{att.profiles?.name}</span>
                  <span className="text-xs text-gray-400">{att.profiles?.email}</span>
                </div>
                <span className="ml-auto text-green-600 text-sm font-bold">✔️ Hadir</span>
              </div>
            ))}
            {hadirToday.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Belum ada yang absen hadir hari ini.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Izin / Sakit Hari Ini</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">{izinToday.length} Santri</span>
          </div>
          <div className="space-y-3">
            {izinToday.map((att) => (
              <div key={att.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold uppercase text-sm flex-shrink-0">
                  {att.profiles?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm block">{att.profiles?.name}</span>
                  <span className="text-xs text-gray-500 italic">Alasan: "{att.reason}"</span>
                </div>
                <span className="text-yellow-600 text-sm font-bold">📝 Izin</span>
              </div>
            ))}
            {izinToday.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Alhamdulillah, tidak ada yang izin hari ini.</p>}
          </div>
        </div>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat 20 Absensi Terakhir</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Santri</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alasan (Jika Izin)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {allAttendances.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{att.profiles?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {att.status === 'hadir' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hadir</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Izin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-[200px]">{att.reason || '-'}</td>
                </tr>
              ))}
              {allAttendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">Belum ada riwayat absensi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}