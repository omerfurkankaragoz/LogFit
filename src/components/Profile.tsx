// src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Edit, Save, LogOut } from 'lucide-react';

interface ProfileProps {
  session: Session;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { user } = session;

        const { data, error, status } = await supabase
          .from('profiles')
          .select(`full_name, avatar_url, age, height, weight`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setFullName(data.full_name || user.email || '');
          setAvatarUrl(data.avatar_url);
          setAge(data.age || '');
          setHeight(data.height || '');
          setWeight(data.weight || '');
        }
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        full_name: fullName,
        age: age === '' ? null : age,
        height: height === '' ? null : height,
        weight: weight === '' ? null : weight,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      setEditMode(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const renderInfoRow = (label: string, value: string | number | null, unit: string = '') => (
    <div className="flex justify-between items-center">
        <span className="text-system-label-secondary">{label}</span>
        <span className="text-system-label font-medium">{value || '-'} {value ? unit : ''}</span>
    </div>
  );

  const renderEditRow = (label: string, value: string | number, onChange: (val: any) => void, type: string = 'text', placeholder: string = '') => (
    <div className="flex justify-between items-center">
        <span className="text-system-label-secondary">{label}</span>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            className="w-1/2 bg-transparent text-system-label text-right font-medium focus:outline-none"
        />
    </div>
  );

  return (
    <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold text-system-label pt-4">Profil</h1>

        {/* Profil Bilgileri Kartı */}
        <div className="flex flex-col items-center space-y-3 p-6 bg-system-background-secondary rounded-xl">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'U'}&background=2C2C2E&color=fff`}
            alt="Avatar"
            className="w-24 h-24 rounded-full shadow-lg"
          />
          <h2 className="text-2xl font-bold text-system-label">{fullName || 'Kullanıcı'}</h2>
          <p className="text-md text-system-label-secondary">{session.user.email}</p>
        </div>

        {/* Kişisel Bilgiler Kartı */}
        <div className="bg-system-background-secondary rounded-xl divide-y divide-system-separator">
            <div className="p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-system-label">Bilgilerim</h2>
                <button onClick={editMode ? handleUpdateProfile : () => setEditMode(true)} className="text-system-blue text-lg">
                    {editMode ? 'Kaydet' : 'Düzenle'}
                </button>
            </div>
            <div className="p-4 space-y-4">
                {editMode ? renderEditRow('Ad Soyad', fullName || '', setFullName, 'text', 'Ad Soyad') : renderInfoRow('Ad Soyad', fullName)}
            </div>
             <div className="p-4 space-y-4">
                {editMode ? renderEditRow('Yaş', age, setAge, 'number', 'Yaş') : renderInfoRow('Yaş', age)}
            </div>
             <div className="p-4 space-y-4">
                {editMode ? renderEditRow('Boy', height, setHeight, 'number', 'cm') : renderInfoRow('Boy', height, 'cm')}
            </div>
             <div className="p-4 space-y-4">
                {editMode ? renderEditRow('Kilo', weight, setWeight, 'number', 'kg') : renderInfoRow('Kilo', weight, 'kg')}
            </div>
        </div>

        {/* Çıkış Yap Butonu */}
        <div className="bg-system-background-secondary rounded-xl">
            <button onClick={onLogout} className="w-full p-4 text-system-red text-center text-lg flex items-center justify-center gap-2">
                <LogOut size={20} />
                <span>Çıkış Yap</span>
            </button>
        </div>
    </div>
  );
};

export default Profile;