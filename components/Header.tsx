import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react';


const Header = () => {
    const { data: session } = useSession();
  return (
    <div className="mt-1 flex flex-row justify-end">
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
    </div>
  )
}

export default Header