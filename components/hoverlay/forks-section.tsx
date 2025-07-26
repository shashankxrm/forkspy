"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ForkItem } from "./fork-item"

interface ForksSectionProps {
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
  onViewMore: () => void
}

export function ForksSection({ recentForks, onViewMore }: ForksSectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {recentForks.slice(0, 5).map((fork, index) => (
          <ForkItem key={index} fork={fork} />
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
