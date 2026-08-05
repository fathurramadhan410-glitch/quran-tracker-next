'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminRekapPage() {
  const [loading, setLoading] = useState(true);
  const [hadirToday, setHadirToday] = useState<any[]>([]);
  const [izinToday, setIzinToday] = useState<any[]>([]);
  const [allAttendances, setAllAttendances] = useState<any[]>([]);

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const fetchData = async () => {
    setLoading(true);
    
    const { data: todayData } = await supabase
      .from('attendances')
      .select('*, profiles:user_id(name)')
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

  // Fungsi Generate PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Judul PDF
    doc.setFontSize(18);
    doc.text("Laporan Rekap Kehadiran Santri", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);

    // Data Tabel
    const tableColumn = ["Nama Santri", "Tanggal", "Status", "Alasan"];
    const tableRows: any[] = [];

    allAttendances.forEach(att => {
      const attData = [
        att.profiles?.name || '-',
        new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        att.status === 'hadir' ? 'Hadir' : 'Izin',
        att.reason || '-'
      ];
      tableRows.push(attData);
    });

    // Generate Tabel ke PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] } // Warna ungu Indigo
    });

    doc.save(`Laporan_Kehadiran_${today}.pdf`);
  };

  if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Memuat rekap kehadiran...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header & Tombol Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Rekap Kehadiran</h1>
        <button 
          onClick={handleExportPDF}
          className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hadir Hari Ini</h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-green-500/20 dark:text-green-400">{hadirToday.length} Santri</span>
          </div>
          <div className="space-y-3">
            {hadirToday.map((att) => (
              <div key={att.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl dark:bg-slate-700">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                  {att.profiles?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-sm block dark:text-white">{att.profiles?.name}</span>
                </div>
                <span className="ml-auto text-green-600 text-sm font-bold dark:text-green-400">✔️ Hadir</span>
              </div>
            ))}
            {hadirToday.length === 0 && <p className="text-gray-500 text-sm text-center py-4 dark:text-gray-400">Belum ada yang absen hadir hari ini.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Izin / Sakit Hari Ini</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-yellow-500/20 dark:text-yellow-400">{izinToday.length} Santri</span>
          </div>
          <div className="space-y-3">
            {izinToday.map((att) => (
              <div key={att.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-xl dark:bg-slate-700">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold uppercase text-sm flex-shrink-0">
                  {att.profiles?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm block dark:text-white">{att.profiles?.name}</span>
                  <span className="text-xs text-gray-500 italic dark:text-gray-400">Alasan: "{att.reason}"</span>
                </div>
                <span className="text-yellow-600 text-sm font-bold dark:text-yellow-400">📝 Izin</span>
              </div>
            ))}
            {izinToday.length === 0 && <p className="text-gray-500 text-sm text-center py-4 dark:text-gray-400">Alhamdulillah, tidak ada yang izin hari ini.</p>}
          </div>
        </div>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Riwayat 20 Absensi Terakhir</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Nama Santri</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Alasan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-slate-800 dark:divide-slate-700">
              {allAttendances.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{att.profiles?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {att.status === 'hadir' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">Hadir</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">Izin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400">{att.reason || '-'}</td>
                </tr>
              ))}
              {allAttendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm dark:text-gray-400">Belum ada riwayat absensi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}