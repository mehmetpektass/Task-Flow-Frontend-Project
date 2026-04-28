'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth } from '../../../lib/auth';
import { User } from '../../../types';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const userRaw = params.get('user');
    if (token && userRaw) {
      const user: User = JSON.parse(decodeURIComponent(userRaw));
      setAuth(token, user);
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Giriş yapılıyor...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}