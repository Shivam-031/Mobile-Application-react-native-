'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('accessToken');
    router.replace(token ? '/dashboard' : '/login');
  }, []);
  return null;
}
