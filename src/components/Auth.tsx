// src/components/Auth.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // Yeni: Şifre doğrulaması için
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.error_description || err.message || 'Google ile giriş sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || 'Misafir girişi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);

      // Yeni: Şifre ve şifre tekrarı kontrolü
      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        setMessage('Kayıt başarılı! Lütfen e-postanıza gönderilen doğrulama bağlantısına tıklayarak hesabınızı etkinleştirin.');
      } else if (data.session) {
        setMessage('Kayıt başarılı, giriş yapılıyor...');
      }

    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setMessage('Hesabınız doğrulanmamış. Lütfen e-postanıza gönderilen doğrulama bağlantısına tıklayarak hesabınızı etkinleştirin.');
        } else {
          throw signInError;
        }
      }

    } catch (err: any) {
      setError(err.message || 'Giriş sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="text-center w-full max-w-sm">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          LogFit
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Antrenmanlarınızı kaydetmek ve gelişiminizi izlemek için giriş yapın.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {/* Giriş/Kayıt Formu */}
        <>
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="E-posta Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {authMode === 'signup' && ( // Yeni: Sadece kaydol modunda göster
              <input
                type="password"
                placeholder="Şifreyi Tekrar Girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {authMode === 'login' ? (
              <button
                onClick={handleEmailSignIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <LogIn size={24} />
                )}
                Giriş Yap
              </button>
            ) : (
              <button
                onClick={handleEmailSignUp}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <UserPlus size={24} />
                )}
                Kaydol
              </button>
            )}
          </div>

          <div className="text-center mb-6">
            {authMode === 'login' ? (
              <p className="text-gray-600 dark:text-gray-400">
                Hesabın yok mu?{' '}
                <button onClick={() => setAuthMode('signup')} className="text-blue-600 hover:underline">
                  Kaydol
                </button>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Zaten bir hesabın var mı?{' '}
                <button onClick={() => setAuthMode('login')} className="text-blue-600 hover:underline">
                  Giriş Yap
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">Veya</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-3 mx-auto mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Google ile Giriş Yap
          </button>

          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <LogIn size={24} />
            )}
            Misafir Girişi Yap
          </button>
        </>
      </div>
    </div>
  );
};

export default Auth;