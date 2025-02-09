import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface SignInCardProps {
  onSignIn: () => void
}

export function SignInCard({ onSignIn }: SignInCardProps) {
  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-primary"
          >
            <path d="M18 8c0 2.5-1 4-2 6-1.5 2-3 3-6 3s-4.5-1-6-3c-1-2-2-3.5-2-6 0-4 3-7 8-7s8 3 8 7z" />
            <path d="M18 18c-1 1.5-3 3-6 3s-5-1.5-6-3" />
            <path d="M3 7v6" />
            <path d="M21 7v6" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">ForkSpy</CardTitle>
        <CardDescription>Track GitHub repository forks with ease</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onSignIn}>
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

