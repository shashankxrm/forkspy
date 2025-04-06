import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Image from 'next/image';

interface SignInCardProps {
  onSignIn: () => void
}

export function SignInCard({ onSignIn }: SignInCardProps) {
  return (
    <Card className="w-[380px]" data-testid="sign-in-card">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/forkspy-light.png"
            width="80"
            height="80"
            alt="logo"
            className="dark:hidden"
          />
          <Image
            src="/forkspy-dark.png"
            width="80"
            height="80"
            alt="logo"
            className="hidden dark:block"
          />
        </div>
        <CardTitle className="text-2xl font-bold">ForkSpy</CardTitle>
        <CardDescription>Track GitHub repository forks with ease</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onSignIn} data-testid="sign-in-button">
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        <p>ForkSpy requires access to your GitHub account to track repository forks.</p>
      </CardFooter>
    </Card>
  )
}

