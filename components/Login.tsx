import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max (50 * 100ms)
    
    const initGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('[Login] Google library failed to load after timeout');
          setError('ไม่สามารถโหลด Google Sign-In ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
          setIsLoading(false);
          return;
        }
        setTimeout(initGoogleSignIn, 100);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
          });
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('[Login] Google init error', err);
        setError('ไม่สามารถเริ่มระบบ Google Sign-In ได้');
        setIsLoading(false);
      }
    };

    const t = setTimeout(initGoogleSignIn, 100);
    return () => clearTimeout(t);
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      const googleIdToken = response.credential;

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const authToken = import.meta.env.VITE_AUTH_TOKEN;

      const url = new URL(apiUrl);
      url.searchParams.set('token', authToken);
      url.searchParams.set('action', 'verify');
      url.searchParams.set('app_id', 'ksp-sociallog');
      url.searchParams.set('credential', googleIdToken);

      const verifyResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      const data = await verifyResponse.json();
      console.log('[Login] verify response', data);
      console.log('[Login] user data', data.user);
      console.log('[Login] employee data', data.employee);

      if (data.ok && data.user) {
        // Map backend user to local User shape
        const u = data.user;
        console.log('[Login] Checking avatar fields:', {
          Picture: u.Picture,
          picture: u.picture,
          avatarUrl: u.avatarUrl,
          Avatar: u.Avatar,
          ImageURL: u.ImageURL,
          PhotoURL: u.PhotoURL,
        });
        
        const mapped: User = {
          id: u.UserID || u.id || u.sub || (u.Email || u.email) || 'unknown',
          name: u.Name || u.FullName || u.name || u.Email || u.email || 'User',
          email: u.Email || u.email || '',
          avatarUrl: u.Picture || u.picture || u.avatarUrl || u.Avatar || u.ImageURL || u.PhotoURL || undefined,
          employeeCode: data.employee?.EmployeeCode || data.employee?.employee_code || undefined,
        };

        console.log('[Login] Mapped user:', mapped);
        onLogin(mapped);
      } else {
        throw new Error(data.error || 'การยืนยันตัวตนล้มเหลว');
      }
    } catch (err: any) {
      console.error('[Login] error', err);
      setError(err.message || 'ไม่สามารถเข้าสู่ระบบได้');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.85.567-4.167a6 6 0 002.433 12.033z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">SocialLog AI</h1>
          <p className="text-slate-500">ระบบบันทึกงานโพสต์สำหรับทีม</p>
        </div>

        <div className="space-y-6">
          {isLoading && (
            <div className="text-sm text-slate-500">กำลังโหลดระบบเข้าสู่ระบบ...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="relative">
            <div ref={googleButtonRef} className="w-full min-h-[44px] flex items-center justify-center"></div>
            {!isLoading && !isProcessing && !googleButtonRef.current && (
              <div className="text-sm text-slate-500 mt-2">หากไม่เห็นปุ่ม Google กรุณารีเฟรชหน้า</div>
            )}
            
            {/* Loading overlay when processing login */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-600 font-medium">กำลังเข้าสู่ระบบ...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400">This app uses Google Sign-In for authentication.</p>
      </div>
    </div>
  );
};