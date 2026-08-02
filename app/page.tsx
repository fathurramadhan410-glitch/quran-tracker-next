import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📖</span>
              <span className="font-bold text-xl text-emerald-600">Qur'an Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition">Masuk</Link>
              <Link href="/register" className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">Daftar Sekarang</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (Ajakan) */}
      <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <p className="text-3xl md:text-4xl text-emerald-300 mb-6" style={{ fontFamily: 'Amiri, serif' }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Rutinkan Tilawah, <br />Wujudkan Kebiasaan Baik.
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto mb-10 font-light">
            Sistem Informasi Pemantau Rutinitas Baca Al-Qur'an. Pantau progres harian Anda, capai target khatam bersama jamaah, dan bangun konsistensi tilawah dengan teknologi digital.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-white text-emerald-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-100 transition shadow-lg transform hover:-translate-y-0.5">
              Mulai Sekarang - Gratis
            </Link>
            <Link href="#fitur" className="border-2 border-emerald-400 text-emerald-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition">
              Pelajari Fitur
            </Link>
          </div>
        </div>
      </div>

      {/* Latar Belakang Sistem */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Latar Belakang Sistem</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Di era digital saat ini, banyak umat Islam yang kesulitan menjaga konsistensi dalam membaca Al-Qur'an akibat kesibukan harian. Kurangnya sistem pemantauan yang terstruktur membuat target khatam sering kali tertunda. 
            <span className="font-semibold text-emerald-700"> Qur'an Tracker</span> hadir sebagai solusi inovatif untuk menjembatani kebutuhan spiritual dan teknologi, membantu individu maupun kelompok (halaqah) dalam memantau, mengelola, dan memotivasi diri untuk istiqamah dalam tilawah.
          </p>
        </div>
      </section>

      {/* Tentang Sistem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Tentang Sistem</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Apa itu Qur'an Tracker?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Qur'an Tracker adalah platform digital terintegrasi yang dirancang khusus untuk membantu santri, mahasiswa, maupun masyarakat umum dalam memantau rutinitas baca Al-Qur'an mereka.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <span>Mencatat progress bacaan harian secara otomatis dan akurat.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <span>Menyediakan sistem absensi tilawah untuk menjaga komitmen.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <span>Fitur target khatam berjamaah dengan pembagian tugas cerdas.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-indigo-600 p-8 rounded-3xl shadow-2xl text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Visi & Misi</h3>
              <p className="mb-4 text-emerald-50">
                <span className="font-semibold">Visi:</span> Menjadi katalisator utama dalam mewujudkan generasi Qur'ani yang istiqamah.
              </p>
              <p className="text-emerald-50">
                <span className="font-semibold">Misi:</span> Memanfaatkan teknologi digital untuk mempermudah pemantauan, meningkatkan motivasi, dan memperkuat ukhuwah islamiyah dalam tilawah berjamaah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section id="fitur" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan Aplikasi</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Dirancang dengan teknologi modern untuk memberikan pengalaman terbaik dalam memantau rutinitas Al-Qur'an Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pencatatan & Statistik</h3>
              <p className="text-gray-500">Catat bacaan harian Anda (halaman & juz) secara otomatis. Sistem menghitung poin, streak (hari beruntun), dan total capaian.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl mb-6">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Target Khatam Berjamaah</h3>
              <p className="text-gray-500">Buat target khatam bersama kelompok. Sistem cerdas membagi tugas harian secara otomatis agar target 1 juz per hari tercapai.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl mb-6">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistem Kehadiran (Absensi)</h3>
              <p className="text-gray-500">Tandai kehadiran harian. Jika berhalangan, sampaikan alasan izin langsung melalui aplikasi untuk menjaga komitmen bersama.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-6">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Papan Peringkat & Lencana</h3>
              <p className="text-gray-500">Gamifikasi untuk menumbuhkan semangat kompetisi yang sehat. Kumpulkan poin, dapatkan lencana, dan lihat peringkat Anda.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">📖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mushaf Al-Qur'an Digital</h3>
              <p className="text-gray-500">Aplikasi dilengkapi dengan Al-Qur'an full 30 juz. Pilih mode baca per halaman (seperti mushaf fisik) atau per ayat dengan tampilan elegan.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-3xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Panel Admin & Manajemen</h3>
              <p className="text-gray-500">Fitur khusus Guru/Pengelola untuk memantau seluruh aktivitas santri, mengelola target, absensi manual, dan menonaktifkan akun.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Kontak Kami */}
      <section id="kontak" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">Jika Anda memiliki pertanyaan, saran, atau ingin berkolaborasi dalam pengembangan sistem ini, jangan ragu untuk menghubungi kami.</p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <div className="flex items-center justify-center gap-3 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-xl">✉️</span>
                <a href="mailto:fathurramadhan410@gmail.com" className="hover:text-emerald-300 transition">fathurramadhan410@gmail.com</a>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-xl">📍</span>
                <span>Politeknik Negeri Banjarmasin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-xl">📖</span>
            <span className="font-bold text-white">Qur'an Tracker</span>
          </div>
          <p className="text-sm">&copy; 2026 Fathur Ramadhan | Politeknik Negeri Banjarmasin</p>
        </div>
      </footer>

    </div>
  );
}