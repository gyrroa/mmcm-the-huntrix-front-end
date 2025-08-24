import { Suspense } from 'react';
import AuthClient from './AuthClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <AuthClient />
    </Suspense>
  );
}