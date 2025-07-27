"use client"

import { Button } from "@/components/ui/button"
import { ContributorItem } from "./contributor-item"

interface FullForksListProps {
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
  onBack: () => void
}

export function FullForksList({ recentForks, onBack }: FullForksListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">All Recent Forks</h4>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onBack}>
          Back
        </Button>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {recentForks.map((fork, index) => (
          <ContributorItem 
            key={index} 
            contributor={{
              username: fork.username,
              avatar: fork.avatar,
              commitHash: fork.commitHash,
              prNumber: null, // Forks don't have PR numbers
              timeAgo: `forked ${fork.forkedAgo}`,
              totalCommits: fork.totalCommits,
              repoOwner: fork.repoOwner,
              repoName: fork.repoName,
            }} 
          />
        ))}
      </div>
    </div>
  )
}
