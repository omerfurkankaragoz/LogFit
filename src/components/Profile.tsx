// src/components/Profile.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Edit, Save, LogOut, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProfileProps {
  session: Session;
  onLogout: () => void;
}

interface Measurement {
  id?: number; 
  created_at: string;
  weight: number;
}

// VKİ Hesaplama Fonksiyonu
const calculateBMI = (weight: number | null, height: number | null) => {
  if (!weight || !height || height === 0) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// VKİ Kategorisi ve Rengi Belirleme
const getBMICategory = (bmi: number | null) => {
  if (bmi === null) return { category: 'Veri Yok', color: 'bg-system-label-tertiary', textColor: 'text-system-label' };
  if (bmi < 18.5) return { category: 'Zayıf', color: 'bg-system-blue', textColor: 'text-white' };
  if (bmi < 25) return { category: 'Normal', color: 'bg-system-green', textColor: 'text-white' };
  if (bmi < 30) return { category: 'Fazla Kilolu', color: 'bg-system-yellow', textColor: 'text-black' };
  return { category: 'Obez', color: 'bg-system-red', textColor: 'text-white' };
};

const Profile: React.FC<ProfileProps> = ({ session, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [editMode, setEditMode] = useState(false);
  
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState<number | ''>('');
  const [newHeight, setNewHeight] = useState<number | ''>('');

  const bmi = useMemo(() => calculateBMI(typeof weight === 'number' ? weight : null, typeof height === 'number' ? height : null), [weight, height]);
  const bmiInfo = getBMICategory(bmi);

  const chartData = useMemo(() => {
    const latestMeasurementsByDay: { [key: string]: Measurement } = {};
    measurements.forEach(m => {
        const day = format(parseISO(m.created_at), 'yyyy-MM-dd');
        latestMeasurementsByDay[day] = m;
    });
    const uniqueMeasurements = Object.values(latestMeasurementsByDay);
    uniqueMeasurements.sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime());
    return uniqueMeasurements.map(m => ({
      date: format(parseISO(m.created_at), 'dd MMM', { locale: tr }),
      weight: m.weight,
    }));
  }, [measurements]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { user } = session;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url, age, height, weight`)
        .eq('id', user.id)
        .single();
      if (profileError && profileError.status !== 406) throw profileError;
      if (profileData) {
        setFullName(profileData.full_name || user.email || '');
        setAvatarUrl(profileData.avatar_url);
        setAge(profileData.age || '');
        setHeight(profileData.height || '');
        setWeight(profileData.weight || '');
        setNewHeight(profileData.height || '');
        setNewWeight(profileData.weight || '');
      }
      const { data: measurementsData, error: measurementsError } = await supabase
          .from('measurements')
          .select('id, created_at, weight')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
      if (measurementsError) throw measurementsError;
      if(measurementsData) setMeasurements(measurementsData);
    } catch (error: any) {
      console.error("Profil verisi çekilirken hata:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [session]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;
      const updates = { id: user.id, full_name: fullName, age: age === '' ? null : age, updated_at: new Date() };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      setEditMode(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async () => {
    if (newWeight === '' || newHeight === '') {
        alert('Lütfen boy ve kilo değerlerini girin.');
        return;
    }
    try {
        setLoading(true);
        const { user } = session;
        const from = startOfDay(new Date()).toISOString();
        const to = endOfDay(new Date()).toISOString();
        const { data: existingMeasurements, error: selectError } = await supabase
            .from('measurements')
            .select('id')
            .eq('user_id', user.id)
            .gte('created_at', from)
            .lte('created_at', to);
        if(selectError) throw selectError;
        if (existingMeasurements && existingMeasurements.length > 0) {
            const { error } = await supabase.from('measurements').update({ weight: newWeight, height: newHeight, created_at: new Date().toISOString() }).eq('id', existingMeasurements[0].id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('measurements').insert({ user_id: user.id, weight: newWeight, height: newHeight });
            if (error) throw error;
        }
        const { error: updateProfileError } = await supabase.from('profiles').update({ weight: newWeight, height: newHeight, updated_at: new Date() }).eq('id', user.id);
        if (updateProfileError) throw updateProfileError;
        await fetchProfileData();
        setModalOpen(false);
    } catch (error: any) {
      console.error("Ölçüm eklenirken hata:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const renderInfoRow = (label: string, value: string | number | null, unit: string = '') => ( <div className="flex justify-between items-center"> <span className="text-system-label-secondary">{label}</span> <span className="text-system-label font-medium">{value || '-'} {value ? unit : ''}</span> </div> );
  const renderEditRow = (label: string, value: string | number, onChange: (val: any) => void, type: string = 'text', placeholder: string = '') => ( <div className="flex justify-between items-center"> <span className="text-system-label-secondary">{label}</span> <input type={type} value={value} onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} placeholder={placeholder} className="w-1/2 bg-transparent text-system-label text-right font-medium focus:outline-none" /> </div> );

  return (
    <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold text-system-label pt-4">Profil</h1>
        <div className="flex flex-col items-center space-y-3 p-6 bg-system-background-secondary rounded-xl">
          <img src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'U'}&background=2C2C2E&color=fff`} alt="Avatar" className="w-24 h-24 rounded-full shadow-lg" />
          <h2 className="text-2xl font-bold text-system-label">{fullName || 'Kullanıcı'}</h2>
          <p className="text-md text-system-label-secondary">{session.user.email}</p>
        </div>
        <div className="bg-system-background-secondary rounded-xl divide-y divide-system-separator">
            <div className="p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-system-label">Bilgilerim</h2>
                <button onClick={editMode ? handleUpdateProfile : () => setEditMode(true)} className="text-system-blue text-lg"> {loading && editMode ? 'Kaydediliyor...' : editMode ? 'Kaydet' : 'Düzenle'} </button>
            </div>
            <div className="p-4 space-y-4"> {editMode ? renderEditRow('Ad Soyad', fullName || '', setFullName, 'text', 'Ad Soyad') : renderInfoRow('Ad Soyad', fullName)} </div>
             <div className="p-4 space-y-4"> {editMode ? renderEditRow('Yaş', age, setAge, 'number', 'Yaş') : renderInfoRow('Yaş', age)} </div>
             <div className="p-4 space-y-4"> {renderInfoRow('Boy', height, 'cm')} </div>
             <div className="p-4 space-y-4"> {renderInfoRow('Kilo', weight, 'kg')} </div>
        </div>
        <div className="bg-system-background-secondary rounded-xl">
            <div className="p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-system-label">Vücut Ölçüleri</h2>
                <button onClick={() => setModalOpen(true)} className="text-system-blue text-lg flex items-center gap-1"> <Plus size={20}/> Ekle </button>
            </div>
            {height && weight ? (
            <div className='p-4 space-y-4'>
                <div className="text-center">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${bmiInfo.color} ${bmiInfo.textColor}`}>{bmiInfo.category}</span>
                    <p className="text-6xl font-bold text-system-label mt-2">{bmi ? bmi.toFixed(1) : '-'}</p>
                    <p className="text-system-label-secondary text-sm">Vücut Kitle Endeksi</p>
                </div>
                <div className="relative w-full flex rounded-full h-2.5 bg-system-background-tertiary overflow-hidden">
                    <div className="w-1/4 bg-system-blue"></div>
                    <div className="w-1/4 bg-system-green"></div>
                    <div className="w-1/4 bg-system-yellow"></div>
                    <div className="w-1/4 bg-system-red"></div>
                    {bmi && ( <div className="absolute h-full flex items-center" style={{ left: `calc(${Math.min(100, (bmi/40)*100)}% - 2px)` }}> <div className="w-1 h-4 bg-white rounded-full shadow-lg border-2 border-system-background-secondary"></div> </div> )}
                </div>
                {chartData.length > 0 && (
                    <div className="h-64 w-full pt-4 pb-4">
                        <h3 className="text-md font-semibold text-system-label-secondary mb-3 text-center">Kilo Değişimi (kg)</h3>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(84 84 88 / 0.6)" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'rgb(235 235 245 / 0.6)' }} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: 'rgb(235 235 245 / 0.6)' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(44, 44, 46, 0.8)', borderColor: 'rgb(84 84 88 / 0.6)', borderRadius: '12px' }}/>
                                <Line type="monotone" dataKey="weight" stroke="#0A84FF" strokeWidth={2.5} dot={{ fill: '#0A84FF', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
             ) : ( <p className="text-center text-system-label-secondary py-8 px-4">VKİ ve grafik için lütfen ilk ölçümünüzü ekleyin.</p> )}
        </div>
        <div className="bg-system-background-secondary rounded-xl">
            <button onClick={onLogout} className="w-full p-4 text-system-red text-center text-lg flex items-center justify-center gap-2"> <LogOut size={20} /> <span>Çıkış Yap</span> </button>
        </div>
        {isModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-sm bg-system-background-secondary rounded-2xl p-6 m-4 space-y-4 shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-system-label">Yeni Ölçüm Ekle</h2>
                        <button onClick={() => setModalOpen(false)} className="p-1"> <X size={24} className="text-system-label-secondary"/> </button>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-system-label-secondary">Kilo (kg)</label>
                        <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Örn: 75.5" className="mt-1 w-full p-3 bg-system-background-tertiary text-system-label rounded-lg focus:outline-none focus:ring-2 focus:ring-system-blue" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-system-label-secondary">Boy (cm)</label>
                        <input type="number" value={newHeight} onChange={(e) => setNewHeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Örn: 180" className="mt-1 w-full p-3 bg-system-background-tertiary text-system-label rounded-lg focus:outline-none focus:ring-2 focus:ring-system-blue" />
                    </div>
                    <button onClick={handleAddMeasurement} disabled={loading} className="w-full py-3 bg-system-blue text-white rounded-xl font-semibold text-lg disabled:opacity-50"> {loading ? 'Kaydediliyor...' : 'Kaydet'} </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Profile;