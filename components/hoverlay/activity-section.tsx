"use client"
import { GitFork } from "lucide-react"
import { ContributorItem } from "./contributor-item"

interface ActivitySectionProps {
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
}

export function ActivitySection({ recentActivity }: ActivitySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GitFork className="h-3 w-3" />
        <span>{recentActivity.forksLast24h} forks in the last 24 hours</span>
      </div>

      <div className="space-y-2">
        {recentActivity.contributors.map((contributor, index) => (
          <ContributorItem key={index} contributor={contributor} />
        ))}
      </div>
    </div>
  )
}
