// src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Edit, Save, User } from 'lucide-react';

interface ProfileProps {
  session: Session;
}

const Profile: React.FC<ProfileProps> = ({ session }) => {
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

          if (!data.full_name || data.age === null || data.height === null || data.weight === null) {
            setEditMode(true);
          }
        } else if (status === 406) {
            setFullName('');
            setAge('');
            setHeight('');
            setWeight('');
            setEditMode(true);
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

      if (error) {
        throw error;
      }
      alert('Profil güncellendi!');
      setEditMode(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <>
      <style>{`
        .numeric-input-no-spinner::-webkit-outer-spin-button,
        .numeric-input-no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .numeric-input-no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center space-y-4 pt-4">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'User'}&background=random`}
            alt="Avatar"
            className="w-28 h-28 rounded-full shadow-lg border-2 border-blue-500"
          />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{fullName || 'Profilinizi Tamamlayın'}</h2>
          <p className="text-md text-gray-500 dark:text-gray-400">{session.user.email || 'Misafir Kullanıcı'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">Kişisel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tam Adınız</label>
              {editMode ? (
                <input 
                  type="text" 
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Adınız Soyadınız"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 p-2">{fullName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Yaş</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="numeric-input-no-spinner w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 p-2">{age || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Boy (cm)</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  className="numeric-input-no-spinner w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 p-2">{height || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Kilo (kg)</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={weight} 
                  onChange={(e) => setWeight(Number(e.target.value))} 
                  className="numeric-input-no-spinner w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 p-2">{weight || '-'}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          {editMode ? (
            <button onClick={handleUpdateProfile} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md">
              <Save size={20} /> Kaydet
            </button>
          ) : (
            <button onClick={() => setEditMode(true)} className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out active:scale-95 shadow-md">
              <Edit size={20} /> Düzenle
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;