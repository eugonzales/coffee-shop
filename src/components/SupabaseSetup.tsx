import React from 'react';

const SupabaseSetup: React.FC = () => (
  <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-900">
    <section className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">mia.kape setup</p>
      <h1 className="mt-3 font-serif text-3xl">Connect your Supabase project</h1>
      <p className="mt-4 leading-7 text-stone-600">
        Add your project URL and public publishable key to <code>.env.local</code>, then restart the dev server.
        Run <code>supabase/schema.sql</code> in your project’s SQL Editor first.
      </p>
      <pre className="mt-6 overflow-x-auto rounded bg-stone-100 p-4 text-sm">
        <code>{'VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key'}</code>
      </pre>
      <p className="mt-5 text-sm text-stone-600">
        Never put your database password or service-role key in this frontend app.
      </p>
    </section>
  </main>
);

export default SupabaseSetup;
