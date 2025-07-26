"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Eye, Calendar } from "lucide-react"
import type { GitHubRepo } from "../types/github-repo"
import { useSession } from "next-auth/react"
import { Hoverlay } from "./hoverlay/hoverlay"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HoverlayData {
  recentActivity: {
    forksLast24h: number
    contributors: Array<{
      username: string
      avatar: string
      commitHash: string | null
      prNumber: number | null
      timeAgo: string | null
      totalCommits: number
      repoOwner: string
      repoName: string
    }>
  }
  recentForks: Array<{
    username: string
    commits: number
    totalCommits: number
    forkedAgo: string
    commitHash: string | null
    commitAgo: string | null
    repoOwner: string
    repoName: string
  }>
}

interface RepoCardProps {
  repo: {
    _id: string
    repoUrl: string
  }
  onTrackToggle: (repoId: string, isTracked: boolean) => void
  isTracked: boolean
}

export function GitHubRepoCard({ repo, onTrackToggle, isTracked }: RepoCardProps) {
  const { data: session } = useSession()
  const [repoDetails, setRepoDetails] = useState<GitHubRepo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHoverlayVisible, setIsHoverlayVisible] = useState(false)
  const [hoverlayData, setHoverlayData] = useState<HoverlayData | null>(null)
  const [isLoadingHoverlay, setIsLoadingHoverlay] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  const fetchHoverlayData = async () => {
    if (!repoDetails || hoverlayData || isLoadingHoverlay) return
    
    setIsLoadingHoverlay(true)
    try {
      const response = await fetch(`/api/hoverlay?repo=${repoDetails.name}`)
      if (response.ok) {
        const data = await response.json()
        setHoverlayData(data)
      }
    } catch (error) {
      console.error('Failed to fetch hoverlay data:', error)
    } finally {
      setIsLoadingHoverlay(false)
    }
  }

  const handleMouseEnter = () => {
    // Only show on desktop (hover-capable devices)
    if (window.matchMedia("(hover: hover)").matches) {
      clearTimeout(hoverTimeoutRef.current)
      setIsHoverlayVisible(true)
      fetchHoverlayData()
    }
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoverlayVisible(false)
    }, 300)
  }

  const handleHoverlayMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current)
  }

  const handleHoverlayMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoverlayVisible(false)
    }, 300)
  }

  useEffect(() => {
    const fetchRepoDetails = async () => {
      if (!session?.accessToken) return
      try {
        const [owner, name] = repo.repoUrl.split('/')
        const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch repository details')
        }
        
        const data = await response.json()
        setRepoDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository details')
      } finally {
        setLoading(false)
      }
    }

    fetchRepoDetails()
  }, [repo.repoUrl, session?.accessToken])

  const handleTrackToggle = () => {
    onTrackToggle(repo._id, isTracked) // Pass the current tracking state
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <div className="animate-pulse p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <CardFooter>
  {isTracked ? (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Untrack Repository
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will untrack the repository and remove all associated webhooks. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleTrackToggle}>
            Yes, untrack repository
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Button onClick={handleTrackToggle} variant="default" className="w-full">
      Track Repository
    </Button>
  )}
</CardFooter>
        </Card>
    )
  }

  if (error || !repoDetails) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-red-500">
            Error loading repository: {repo.repoUrl}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card 
        ref={cardRef}
        className="w-full max-w-md hover:shadow-md transition-shadow cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={repoDetails.owner.avatar_url} alt={repoDetails.owner.login} />
            <AvatarFallback>{repoDetails.owner.login[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{repoDetails.name}</h2>
            <p className="text-sm text-muted-foreground">{repoDetails.owner.login}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm line-clamp-3">{repoDetails.description}</p>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {repoDetails.stargazers_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {repoDetails.forks_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {repoDetails.watchers_count.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{repoDetails.language}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(repoDetails.updated_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          {isTracked ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Untrack Repository
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will untrack the repository and remove all associated webhooks. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTrackToggle}>
                    Yes, untrack repository
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleTrackToggle} variant="default" className="w-full">
              Track Repository
            </Button>
          )}
        </CardFooter>
      </Card>

      {hoverlayData && repoDetails && (
        <Hoverlay
          repo={{
            id: repoDetails.id,
            name: repoDetails.name,
            recentActivity: hoverlayData.recentActivity,
            recentForks: hoverlayData.recentForks,
          }}
          triggerRef={cardRef}
          isVisible={isHoverlayVisible}
          onClose={() => setIsHoverlayVisible(false)}
          onMouseEnter={handleHoverlayMouseEnter}
          onMouseLeave={handleHoverlayMouseLeave}
        />
      )}
    </>
  )
}
