'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vaults } from '@/lib/api';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await vaults.join(code.trim());
      // Redirect to vault page
      const vault = res.data.vault || res.data;
      router.push(`/vault/${vault.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to join vault. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleJoin} className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Join a Vault</h1>
        <p className="text-sm text-white/60 mb-4">Enter the invite code you received to join a vault.</p>

        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Invite code"
          className="input mb-4"
        />

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading || !code.trim()}>
          {loading ? 'Joining...' : 'Join Vault'}
        </button>
      </form>
    </div>
  );
}
