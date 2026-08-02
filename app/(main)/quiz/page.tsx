'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Definisikan tipe data untuk Soal agar TypeScript tidak error
type Question = {
  q: string;
  a: string[];
  correct: number;
};

// Bank Soal Ilmu Tajwid & Al-Qur'an
const allQuestions: Question[] = [
  { q: "Hukum bacaan Nun Mati bertemu huruf Ba (ب) disebut...", a: ["Ikhfa", "Iqlab", "Idgham", "Izhar"], correct: 1 },
  { q: "Jumlah huruf Izhar Syafawi (Mim Mati) adalah...", a: ["6 huruf", "15 huruf", "5 huruf", "26 huruf"], correct: 0 },
  { q: "Mad Thabi'i (Mad Asli) diukur dengan panjang...", a: ["1 harakat", "2 harakat", "4 harakat", "6 harakat"], correct: 1 },
  { q: "Huruf Qalqalah Kubra terdapat pada...", a: ["Awal kata", "Tengah kata", "Akhir kata dan dibaca waqaf", "Awal dan akhir kata"], correct: 2 },
  { q: "Hukum bacaan Nun Mati atau Tanwin bertemu huruf Ha (ح) disebut...", a: ["Izhar Halqi", "Ikhfa Haqiqi", "Idgham Bighunnah", "Iqlab"], correct: 0 },
  { q: "Tanda baca yang menunjukkan Idgham Bighunnah adalah...", a: ["ي ن م و", "ل ر", "ب", "أ هـ ع ح غ خ"], correct: 0 },
  { q: "Membaca Mad Wajib Muttashil dipanjangkan sepanjang...", a: ["2 harakat", "4 harakat", "5 harakat", "6 harakat"], correct: 1 },
  { q: "Ghunnah paling tebal terdapat pada hukum bacaan...", a: ["Izhar", "Ikhfa", "Iqlab", "Idgham Syamsiyyah"], correct: 2 },
  { q: "Alif Lam Syamsiyyah dibaca...", a: ["Jelas (Izhar)", "Dimasukkan (Idgham)", "Samar (Ikhfa)", "Dipantulkan (Qalqalah)"], correct: 1 },
  { q: "Surah pertama dalam Al-Qur'an adalah...", a: ["Al-Baqarah", "An-Nas", "Al-Fatihah", "Al-Ikhlas"], correct: 2 },
  { q: "Jumlah surah dalam Al-Qur'an adalah...", a: ["114", "30", "604", "6666"], correct: 0 },
  { q: "Hukum bacaan ketika Nun Bertasydid (نّ) adalah...", a: ["Izhar", "Wajib Ghunnah", "Qalqalah", "Mad"], correct: 1 },
  { q: "Panjang bacaan Mad Lazim Harfi Mukhaffal adalah...", a: ["2 harakat", "4 harakat", "6 harakat", "Tidak dipanjangkan"], correct: 0 },
  { q: "Ayat Al-Qur'an yang paling pendek terdapat di surah...", a: ["Al-Kautsar", "Al-Ikhlas", "Al-Fatihah", "An-Nasr"], correct: 0 },
  { q: "Hukum Mim Sukun bertemu Mim adalah...", a: ["Ikhfa Syafawi", "Idgham Mithlain", "Izhar Syafawi", "Iqlab"], correct: 1 },
];

// Fungsi untuk mengacak soal berdasarkan tanggal hari ini
const getDailyQuestions = (): Question[] => {
  const today = new Date();
  const seed = Number(today.getDate().toString() + (today.getMonth() + 1).toString());
  
  let arr = [...allQuestions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % arr.length;
    // Tukar posisi array secara aman tanpa error TypeScript
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr.slice(0, 10);
};

export default function QuizPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayAttempt, setTodayAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  
  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    const fetchQuizData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Gunakan maybeSingle() agar tidak error jika data belum ada
      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      setTodayAttempt(attempt);
      setQuestions(getDailyQuestions());
      setLoading(false);
    };

    fetchQuizData();
  }, [today]);

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) score += 10;
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error: attemptError } = await supabase.from('quiz_attempts').insert({
      user_id: session.user.id,
      date: today,
      score: score
    });

    if (!attemptError) {
      const { data: profile } = await supabase.from('profiles').select('quiz_points').eq('id', session.user.id).maybeSingle();
      await supabase.from('profiles').update({
        quiz_points: (profile?.quiz_points || 0) + score
      }).eq('id', session.user.id);
      
      setTodayAttempt({ score });
      setShowResult(true);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat soal quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold">🧠 Quiz Harian Tajwid & Al-Qur'an</h2>
        <p className="text-blue-100 mt-2 text-sm">10 Soal Acak Setiap Hari. Dapat 10 Poin per jawaban benar!</p>
      </div>

      {todayAttempt ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-6xl mb-4">{todayAttempt.score >= 80 ? '🏆' : todayAttempt.score >= 50 ? '👍' : '📖'}</div>
          <h3 className="text-xl font-bold text-gray-800">Quiz Hari Ini Selesai!</h3>
          <p className="text-gray-500 mt-2">Skor Anda: <span className="font-bold text-indigo-600 text-2xl">{todayAttempt.score} Poin</span></p>
          <p className="text-xs text-gray-400 mt-4">Anda sudah mengerjakan quiz hari ini. Kembali besok untuk soal baru!</p>
        </div>
      ) : showResult ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800">Jawaban Terkirim!</h3>
          <p className="text-gray-500 mt-2">Skor Anda: <span className="font-bold text-green-600 text-2xl">{todayAttempt?.score} Poin</span></p>
          <p className="text-xs text-gray-400 mt-4">Poin sudah masuk ke Papan Peringkat Quiz.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="pb-4 border-b border-gray-100 last:border-0">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">
                {qIndex + 1}. {q.q}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.a.map((option, oIndex) => (
                  <label 
                    key={oIndex} 
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${answers[qIndex] === oIndex ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${qIndex}`} 
                      checked={answers[qIndex] === oIndex} 
                      onChange={() => handleAnswer(qIndex, oIndex)} 
                      className="w-4 h-4 text-indigo-600 hidden"
                      required
                    />
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${answers[qIndex] === oIndex ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-400 text-gray-400'}`}>
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            type="submit" 
            disabled={submitting || Object.keys(answers).length < 10} 
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {submitting ? 'Mengirim...' : 'Kirim Jawaban & Lihat Skor'}
          </button>
          {Object.keys(answers).length < 10 && <p className="text-xs text-center text-red-500">Mohon jawab semua 10 soal.</p>}
        </form>
      )}
    </div>
  );
}