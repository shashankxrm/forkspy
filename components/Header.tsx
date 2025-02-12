import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ProfileMenu } from "./Profile-menu"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground text-xl">
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
              }} onSignOut={() => signOut()} />
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