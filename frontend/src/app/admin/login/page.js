'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi, ClientApiError } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SlowServerNotice } from '@/components/admin/SlowServerNotice';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await clientApi.post('/api/admin/auth/login', { email, password });
      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      setLoading(false);
      if (err instanceof ClientApiError && err.status === 429) {
        setErrorMessage('Too many failed attempts. Please wait 15 minutes before retrying.');
      } else {
        setErrorMessage('Invalid email or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <SlowServerNotice />
      <div className="w-full max-w-md border border-navy bg-cream p-8">
        {/* Header Spec Block */}
        <div className="border-b border-navy pb-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-navy">
              DATA VALO SYSTEM
            </span>
            <span className="bg-sand border border-rule-soft px-2 py-0.5 font-mono text-[10px] text-navy">
              ADMIN GATE
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-navy">
            Operator Authentication
          </h1>
          <p className="font-sans text-xs text-navy-soft mt-1">
            Restricted access. Internal administrators and instructors only.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 border border-error bg-cream p-3 text-xs font-mono text-error flex items-start gap-2"
          >
            <span className="font-bold">[ERROR]</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="admin-email"
            label="Admin Email"
            index="01"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@datavalosystem.com"
            disabled={loading}
            className="w-full font-mono text-sm"
          />

          <Input
            id="admin-password"
            label="Password"
            index="02"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={loading}
            className="w-full font-mono text-sm"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 font-mono text-xs font-bold uppercase"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHORIZE SESSION →'}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-rule-soft text-center font-mono text-[10px] text-navy-soft">
          SESSION TIMEOUT: 8 HOURS · ENCRYPTION: JOSE HS256
        </div>
      </div>
    </div>
  );
}
