import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const AuthButton = () => {
    const { data: session } = useSession();
  return (
    <div>
        {session?.user?.email ? (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
    </div>
  )
}

export default AuthButton