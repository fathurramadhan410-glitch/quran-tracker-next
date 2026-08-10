'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [activeTab, setActiveTab] = useState('data');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      let { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      
      // AUTO-RECOVERY: Jika profil tidak ada, buatkan otomatis!
      if (!data) {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'Pengguna',
            is_active: true
          })
          .select('*')
          .single();
          
        if (!error && newProfile) {
          data = newProfile;
        }
      }

      setProfile(data);
      setName(data?.name || '');
      setPhone(data?.phone_number || '');
      setAddress(data?.address || '');
      setOccupation(data?.occupation || '');
      setEducation(data?.education || '');
      setEmail(session.user.email || '');
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const triggerNotif = (msg: string) => {
    setNotifMsg(msg);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('profiles').update({
      name, phone_number: phone, address, occupation, education
    }).eq('id', session.user.id);

    setSubmitting(false);
    if (!error) {
      triggerNotif("Data diri berhasil diperbarui!");
      window.dispatchEvent(new Event('profile-updated'));
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset!);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.secure_url) {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from('profiles').update({ profile_photo_url: data.secure_url }).eq('id', session!.user.id);
        setProfile({ ...profile, profile_photo_url: data.secure_url });
        triggerNotif("Foto profil berhasil diunggah!");
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        triggerNotif("Gagal mengunggah foto. Coba lagi.");
      }
    } catch (err) {
      triggerNotif("Terjadi error saat mengunggah.");
    }
    setSubmitting(false);
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const updates: any = {};
    if (email !== profile.email) updates.email = email;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length === 0) {
      triggerNotif("Tidak ada perubahan email/password.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);
    setSubmitting(false);
    setNewPassword('');
    
    if (!error) {
      triggerNotif("Email/Password berhasil diperbarui. Silakan login kembali.");
    } else {
      triggerNotif(error.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Memuat profil...</div>;

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-bold">Data profil tidak dapat dimuat.</p>
        <p className="text-gray-500 text-sm mt-2">Silakan pastikan Anda sudah menjalankan SQL Trigger di Supabase.</p>
        <button onClick={() => router.push('/login')} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">Keluar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      
      {showNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-semibold text-sm">{notifMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-8 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} className="w-28 h-28 rounded-full border-4 border-white/20 object-cover shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-5xl font-bold border-4 border-white/20 shadow-2xl">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">{profile?.name}</h2>
            <p className="text-indigo-200 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {profile?.email}
            </p>
            <div className="mt-3 flex justify-center sm:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile?.is_admin ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'}`}>
                {profile?.is_admin ? '👑 Admin / Guru' : '🎓 Santri'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile?.is_active ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30' : 'bg-red-400/20 text-red-300 border border-red-400/30'}`}>
                {profile?.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button onClick={() => setActiveTab('data')} className={`flex-1 py-5 text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'data' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Data Diri
          </button>
          <button onClick={() => setActiveTab('photo')} className={`flex-1 py-5 text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'photo' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Foto Profil
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex-1 py-5 text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'security' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Keamanan
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'data' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">No. Handphone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Domisili</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pekerjaan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Riwayat Pendidikan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    </div>
                    <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'photo' && (
            <div className="text-center space-y-6 py-8 max-w-md mx-auto">
              <div className="mx-auto w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner mb-6 bg-gray-50 flex items-center justify-center">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-gray-300">{name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left flex gap-3">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <p className="text-sm font-bold text-blue-800">Informasi Upload</p>
                  <p className="text-xs text-blue-600 mt-1">Format yang didukung: JPG, PNG, JPEG. Ukuran maksimal: 2MB. Foto akan disimpan aman di Cloudinary.</p>
                </div>
              </div>

              <div className="relative">
                <input type="file" accept="image/*" onChange={handleUploadPhoto} disabled={submitting} id="file-upload" className="hidden" />
                <label htmlFor="file-upload" className={`${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} text-white py-4 px-8 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2`}>
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  )}
                  {submitting ? 'Mengunggah...' : 'Pilih Foto Baru'}
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdateSecurity} className="space-y-6 py-4 max-w-md mx-auto">
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-left flex gap-3 mb-6">
                <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <div>
                  <p className="text-sm font-bold text-yellow-800">Peringatan Keamanan</p>
                  <p className="text-xs text-yellow-700 mt-1">Jika Anda mengubah email atau password, sistem akan otomatis keluar (logout) untuk verifikasi kredensial baru Anda.</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 rounded-xl font-bold hover:from-red-600 hover:to-orange-700 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6L9 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                  )}
                  {submitting ? 'Memperbarui...' : 'Update Keamanan Akun'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}