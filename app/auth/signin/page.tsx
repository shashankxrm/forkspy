"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn, ClientSafeProvider } from "next-auth/react";
import { SignInCard } from '../../../components/SignInCard';

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  if (!providers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl mb-4">Sign in to your account</h1>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <SignInCard onSignIn={() => signIn(provider.id, { callbackUrl: '/', prompt: 'login' })} />
        </div>
      ))}
    </div>
  );
}
