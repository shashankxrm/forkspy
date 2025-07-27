"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ContributorItem } from "./contributor-item"

interface ForksSectionProps {
  recentForks: Array<{
    username: string
    avatar: string
    commits: number
    totalCommits: number
    forkedAgo: string
    commitHash: string | null
    commitAgo: string | null
    repoOwner: string
    repoName: string
  }>
  onViewMore: () => void
}

export function ForksSection({ recentForks, onViewMore }: ForksSectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {recentForks.slice(0, 5).map((fork, index) => (
          <ContributorItem 
            key={index} 
            contributor={{
              username: fork.username,
              avatar: fork.avatar,
              commitHash: fork.commitHash,
              prNumber: null, // Forks don't have PR numbers
              timeAgo: fork.forkedAgo,
              totalCommits: fork.totalCommits,
              repoOwner: fork.repoOwner,
              repoName: fork.repoName,
            }} 
          />
        ))}
      </div>

      {recentForks.length > 5 && (
        <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={onViewMore}>
          View more ({recentForks.length - 5} more)
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  )
}
