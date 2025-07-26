"use client"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, GitFork, Circle, Clock } from "lucide-react"
import { Hoverlay } from "./hoverlay/hoverlay"
import { GitHubRepo } from "@/types/github-repo"

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

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const [isHoverlayVisible, setIsHoverlayVisible] = useState(false)
  const [hoverlayData, setHoverlayData] = useState<HoverlayData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  const fetchHoverlayData = async () => {
    if (hoverlayData || isLoading) return // Don't fetch if already have data or currently loading
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/hoverlay?repo=${repo.name}`)
      if (response.ok) {
        const data = await response.json()
        setHoverlayData(data)
      }
    } catch (error) {
      console.error('Failed to fetch hoverlay data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMouseEnter = () => {
    // Only show on desktop (hover-capable devices)
    if (window.matchMedia("(hover: hover)").matches) {
      clearTimeout(hoverTimeoutRef.current)
      setIsHoverlayVisible(true)
      fetchHoverlayData() // Fetch data when hover starts
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

  return (
    <>
      <Card
        ref={cardRef}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                {repo.name}
              </CardTitle>
              <CardDescription className="text-sm">{repo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Circle
                  className="h-3 w-3 fill-current"
                  style={{ color: repo.language === "TypeScript" ? "#3178c6" : "#f1e05a" }}
                />
                <span>{repo.language}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{repo.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                <span>{repo.forks_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {hoverlayData && (
        <Hoverlay
          repo={{
            id: repo.id,
            name: repo.name,
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

interface GitHubRepoHoverlayProps {
  repos: GitHubRepo[]
}

export default function GitHubRepoHoverlay({ repos }: GitHubRepoHoverlayProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">GitHub Repositories</h1>
          <p className="text-muted-foreground">
            Hover over a repository card to see recent activity and forks (desktop only)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  )
}