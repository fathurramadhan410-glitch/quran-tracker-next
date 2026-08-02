'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function QuranReaderPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Mode & Sumber
  const [viewMode, setViewMode] = useState<'page' | 'ayah'>('page');
  const [sourceType, setSourceType] = useState<'surah' | 'juz'>('surah');
  const [sourceList, setSourceList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState('');

  // Konten
  const [allAyahs, setAllAyahs] = useState<any[]>([]);
  const [pageContentHtml, setPageContentHtml] = useState('');
  const [currentMushafPage, setCurrentMushafPage] = useState(1);
  const [contentTitle, setContentTitle] = useState('');

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('reading_mode, current_page')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
        setViewMode(profileData?.reading_mode || 'page');
        setCurrentMushafPage(profileData?.current_page || 1);
      }
      
      // Fetch daftar surah
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        if (data.code === 200) {
          setSourceList(data.data.map((s: any) => ({
            id: s.number,
            label: `${s.number}. ${s.englishName} (${s.name})`
          })));
        }
      } catch (error) {
        console.error('Error fetching surah list:', error);
      }
    };

    getInitialData();
  }, []);

  const convertToArabicNumber = (num: number) => {
    return num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const changeSourceType = (type: 'surah' | 'juz') => {
    setSourceType(type);
    setSelectedItem('');
    setAllAyahs([]);
    setPageContentHtml('');
    setContentTitle('');

    if (type === 'juz') {
      setSourceList(Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        label: `Juz ${i + 1}`
      })));
    } else {
      // Re-fetch surah list
      fetch('https://api.alquran.cloud/v1/surah')
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) {
            setSourceList(data.data.map((s: any) => ({
              id: s.number,
              label: `${s.number}. ${s.englishName} (${s.name})`
            })));
          }
        });
    }
  };

  const fetchData = async () => {
    if (!selectedItem) return;
    setLoading(true);
    setAllAyahs([]);
    setPageContentHtml('');

    try {
      const url = sourceType === 'surah'
        ? `https://api.alquran.cloud/v1/surah/${selectedItem}/quran-uthmani`
        : `https://api.alquran.cloud/v1/juz/${selectedItem}/quran-uthmani`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 200) {
        const ayahs = data.data.ayahs;
        setAllAyahs(ayahs);

        if (sourceType === 'surah') {
          setContentTitle(`${data.data.englishName} - ${data.data.name}`);
        } else {
          setContentTitle(`Juz ${selectedItem}`);
        }

        if (viewMode === 'page') {
          // Cari halaman awal dari surah/juz yang dipilih
          const firstPage = ayahs[0].page;
          setCurrentMushafPage(firstPage);
          fetchMushafPage(firstPage);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchMushafPage = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`);
      const data = await res.json();

      if (data.code === 200) {
        // Gabungkan semua ayat menjadi 1 paragraf HTML panjang dengan nomor ayat inline
        let htmlString = '';
        data.data.ayahs.forEach((ayah: any) => {
          const num = convertToArabicNumber(ayah.numberInSurah);
          const text = ayah.text.trim();
          htmlString += `${text} <span class="ayah-marker">${num}</span> `;
        });
        setPageContentHtml(htmlString);

        const firstAyah = data.data.ayahs[0];
        const lastAyah = data.data.ayahs[data.data.ayahs.length - 1];
        setContentTitle(`Halaman ${pageNum} (${firstAyah.surah.englishName} - ${lastAyah.surah.englishName})`);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (currentMushafPage < 604) {
      const newPage = currentMushafPage + 1;
      setCurrentMushafPage(newPage);
      fetchMushafPage(newPage);
    }
  };

  const prevPage = () => {
    if (currentMushafPage > 1) {
      const newPage = currentMushafPage - 1;
      setCurrentMushafPage(newPage);
      fetchMushafPage(newPage);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toolbar Atas */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Pilih Sumber: Surah / Juz */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => changeSourceType('surah')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 md:flex-none ${sourceType === 'surah' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}
          >
            Surah
          </button>
          <button 
            onClick={() => changeSourceType('juz')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 md:flex-none ${sourceType === 'juz' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}
          >
            Juz
          </button>
        </div>

        {/* Dropdown Pilihan */}
        <div className="w-full md:w-72">
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)} 
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-sm bg-gray-50"
          >
            <option value="">-- Pilih {sourceType === 'surah' ? 'Surah' : 'Juz'} --</option>
            {sourceList.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        {/* Tombol Muat & Navigasi Halaman */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={fetchData} 
            disabled={!selectedItem || loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition text-sm font-bold disabled:opacity-50 cursor-pointer shadow"
          >
            {loading ? 'Memuat...' : 'Muat Bacaan'}
          </button>
          
          {viewMode === 'page' && pageContentHtml && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button onClick={prevPage} disabled={currentMushafPage <= 1 || loading} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <span className="text-xs font-bold text-gray-600 px-2">Hal. {currentMushafPage}/604</span>
              <button onClick={nextPage} disabled={currentMushafPage >= 604 || loading} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Mode Baca */}
      <div className="text-right text-xs text-gray-400 px-2">
        Mode Aktif: <span className="font-bold uppercase text-emerald-600">{viewMode === 'page' ? 'Per Halaman (Real Mushaf)' : 'Per Baris (Ayat)'}</span>
      </div>

      {/* Area Tampilan Al-Qur'an (Bingkai Mushaf) */}
      <div className="bg-[#fffdf5] dark:bg-[#1a1a1a] rounded-2xl shadow-xl p-4 md:p-12 min-h-[70vh] border-4 border-double border-emerald-800/30 relative overflow-hidden">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/70 dark:bg-black/70 z-10 rounded-2xl">
            <svg className="animate-spin h-12 w-12 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Header Surah/Juz */}
        {contentTitle && !loading && (
          <div className="text-center mb-8 border-b border-emerald-800/20 pb-4">
            <h3 className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-400">{contentTitle}</h3>
          </div>
        )}

        {/* Tampilan Mode Per Halaman (Real Mushaf Full) */}
        {viewMode === 'page' && pageContentHtml && !loading && (
          <div className="flex flex-col h-full justify-between">
            {/* text-justify agar teks memenuhi sisi kanan-kiri (seperti mushaf) */}
            <div 
              className="font-quran text-justify text-right text-2xl md:text-3xl leading-[4rem] md:leading-[5.5rem] text-gray-900 dark:text-gray-100 tracking-wide" 
              dir="rtl" 
              dangerouslySetInnerHTML={{ __html: pageContentHtml }}
            />
            <div className="text-center mt-8 text-gray-400 dark:text-gray-600 text-xs">
              <span>Halaman {currentMushafPage} dari 604</span>
            </div>
          </div>
        )}

        {/* Tampilan Mode Per Baris (Scroll) */}
        {viewMode === 'ayah' && allAyahs.length > 0 && !loading && (
          <div className="text-right">
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
              {allAyahs.map((ayah) => (
                <div key={ayah.number} className="flex items-start justify-end space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 mt-4">
                    <span className="ayah-marker-static flex items-center justify-center w-10 h-10 text-sm font-bold text-emerald-600">
                      {convertToArabicNumber(ayah.numberInSurah)}
                    </span>
                  </div>
                  <p className="font-quran text-right text-2xl md:text-3xl leading-[4rem] md:leading-[5rem] text-gray-900 dark:text-gray-100 tracking-wide flex-1" dir="rtl">
                    {ayah.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pesan Default */}
        {!contentTitle && !loading && (
          <div className="flex flex-col justify-center items-center h-full text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">Silakan pilih Surah atau Juz untuk mulai membaca.</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-2">Aplikasi akan menyesuaikan tampilan dengan pengaturan profil Anda.</p>
          </div>
        )}
      </div>

      {/* CSS Khusus untuk Font & Marker Quran */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        .font-quran {
          font-family: 'Scheherazade New', serif;
          text-align: justify;
          text-align-last: right;
        }
        .ayah-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.2rem;
          height: 2.2rem;
          font-size: 1rem;
          margin: 0 0.4rem;
          vertical-align: middle;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="%2310b981" stroke-width="6"/><circle cx="50" cy="50" r="28" fill="none" stroke="%2310b981" stroke-width="2"/></svg>');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          color: #10b981;
          font-weight: bold;
        }
        .ayah-marker-static {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="%2310b981" stroke-width="6"/><circle cx="50" cy="50" r="28" fill="none" stroke="%2310b981" stroke-width="2"/></svg>');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
      `}</style>
    </div>
  );
}