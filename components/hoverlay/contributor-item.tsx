"use client"

import { Badge } from "@/components/ui/badge"
import { GitCommit } from "lucide-react"
import { UserAvatar } from "./user-avatar"

interface ContributorItemProps {
  contributor: {
    username: string
    avatar: string
    commitHash: string | null
    prNumber: number | null
    timeAgo: string | null
    totalCommits: number
    repoOwner: string
    repoName: string
  }
}

export function ContributorItem({ contributor }: ContributorItemProps) {
  const handleUserClick = () => {
    window.open(`https://github.com/${contributor.username}`, "_blank")
  }

  const handleCommitClick = () => {
    if (contributor.commitHash) {
      window.open(`https://github.com/${contributor.repoOwner}/${contributor.repoName}/commit/${contributor.commitHash}`, "_blank")
    }
  }

  const handlePRClick = () => {
    if (contributor.prNumber) {
      window.open(`https://github.com/${contributor.repoOwner}/${contributor.repoName}/pull/${contributor.prNumber}`, "_blank")
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <UserAvatar username={contributor.username} avatar={contributor.avatar} onClick={handleUserClick} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleUserClick}
            className="text-xs font-medium truncate hover:text-blue-600 hover:underline transition-colors"
          >
            {contributor.username}
          </button>
          <span className="text-xs text-muted-foreground">{contributor.totalCommits} commits</span>
        </div>
        {(contributor.commitHash || contributor.timeAgo) && (
          <div className="flex items-center gap-2 mt-1">
            {contributor.commitHash && (
              <button onClick={handleCommitClick} className="hover:bg-muted transition-colors">
                <Badge variant="outline" className="text-xs h-4 px-1 hover:border-blue-500">
                  <GitCommit className="h-2 w-2 mr-1" />
                  {contributor.commitHash}
                </Badge>
              </button>
            )}
            {contributor.timeAgo && (
              <span className="text-xs text-muted-foreground mt-[5px]">{contributor.timeAgo}</span>
            )}
            {contributor.prNumber && (
              <button onClick={handlePRClick} className="hover:bg-muted transition-colors">
                <Badge variant="secondary" className="text-xs h-4 px-1 hover:bg-blue-100 hover:text-blue-800">
                  #{contributor.prNumber}
                </Badge>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
