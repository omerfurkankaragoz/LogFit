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
      {/* Bu stil bloğu, sayısal inputlardaki okları gizler */}
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
        <div className="flex flex-col items-center space-y-4">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'User'}&background=random`}
            alt="Avatar"
            className="w-24 h-24 rounded-full shadow-lg"
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{fullName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Kişisel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Yaş</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="numeric-input-no-spinner mt-1 w-full p-2 border rounded-md bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{age || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Boy (cm)</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  className="numeric-input-no-spinner mt-1 w-full p-2 border rounded-md bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{height || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Kilo (kg)</label>
              {editMode ? (
                <input 
                  type="number" 
                  inputMode="numeric" 
                  value={weight} 
                  onChange={(e) => setWeight(Number(e.target.value))} 
                  className="numeric-input-no-spinner mt-1 w-full p-2 border rounded-md bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{weight || '-'}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          {editMode ? (
            <button onClick={handleUpdateProfile} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Save size={20} /> Kaydet
            </button>
          ) : (
            <button onClick={() => setEditMode(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <Edit size={20} /> Düzenle
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
