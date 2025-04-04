import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ProfileMenu } from "./Profile-menu"

// Extend Window interface to include our custom property
declare global {
  interface Window {
    handleGitHubLogoutComplete?: () => void;
  }
}

export function Header() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      // Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        // Also clear .github.com cookies if possible
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.github.com";
      }

      // First sign out from NextAuth without redirect
      await signOut({ redirect: false });

      // Open GitHub logout in a new tab
      window.open('https://github.com/logout', '_blank');

      // Redirect the main app to signin page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error("Error during sign out:", error);
      // If there's an error, redirect to signin page
      window.location.href = "/auth/signin";
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground text-xl">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* You can add a search input here if needed */}</div>
          <nav className="flex items-center">
            {session?.user ? (
              <ProfileMenu user={{
                name: session.user.name || "User",
                email: session.user.email || "No email",
                image: session.user.image || ""
              }} onSignOut={handleSignOut} />
            ) : (
              <Link href="/api/auth/signin" className="transition-colors hover:text-foreground/80 text-foreground">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}