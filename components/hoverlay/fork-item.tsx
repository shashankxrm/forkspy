"use client"

import { Badge } from "@/components/ui/badge"
import { GitCommit } from "lucide-react"
import { UserAvatar } from "./user-avatar"

interface ForkItemProps {
  fork: {
    username: string
    commits: number
    totalCommits: number
    forkedAgo: string
    commitHash: string | null
    commitAgo: string | null
    repoOwner: string
    repoName: string
  }
}

export function ForkItem({ fork }: ForkItemProps) {
  const handleUserClick = () => {
    window.open(`https://github.com/${fork.username}`, "_blank")
  }

  const handleCommitClick = () => {
    if (fork.commitHash) {
      window.open(`https://github.com/${fork.repoOwner}/${fork.repoName}/commit/${fork.commitHash}`, "_blank")
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <UserAvatar username={fork.username} onClick={handleUserClick} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleUserClick}
            className="text-xs font-medium truncate hover:text-blue-600 hover:underline transition-colors"
          >
            {fork.username}
          </button>
          <span className="text-xs text-muted-foreground">{fork.totalCommits} commits</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {fork.commitHash && (
              <button onClick={handleCommitClick} className="hover:bg-muted transition-colors">
                <Badge variant="outline" className="text-xs h-4 px-1 hover:border-blue-500">
                  <GitCommit className="h-2 w-2 mr-1" />
                  {fork.commitHash}
                </Badge>
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>forked {fork.forkedAgo}</div>
            {fork.commitAgo && <div>{fork.commitAgo}</div>}
          </div>
        </div>
        {!fork.commitHash && (
          <div className="text-xs text-muted-foreground mt-1">no commits</div>
        )}
      </div>
    </div>
  )
}
