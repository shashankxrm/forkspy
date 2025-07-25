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
  }
  repoName: string
  showFullDetails?: boolean
}

export function ForkItem({ fork, repoName, showFullDetails = false }: ForkItemProps) {
  const handleUserClick = () => {
    window.open(`https://github.com/${fork.username}`, "_blank")
  }

  const handleCommitClick = () => {
    if (fork.commitHash) {
      window.open(`https://github.com/${repoName}/commit/${fork.commitHash}`, "_blank")
    }
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <UserAvatar username={fork.username} onClick={handleUserClick} />
        <div>
          <button
            onClick={handleUserClick}
            className="text-xs font-medium hover:text-blue-600 hover:underline transition-colors"
          >
            {fork.username}
          </button>
          <p className="text-xs text-muted-foreground">{fork.totalCommits} commits</p>
        </div>
      </div>
      <div className="text-right text-xs">
        <p className="text-muted-foreground">forked {fork.forkedAgo}</p>
        {fork.commitHash ? (
          <div className="flex items-center gap-1 justify-end mt-1">
            <button onClick={handleCommitClick} className="hover:bg-muted transition-colors">
              <Badge variant="outline" className="text-xs h-4 px-1 hover:border-blue-500">
                <GitCommit className="h-2 w-2 mr-1" />
                {fork.commitHash}
              </Badge>
            </button>
            <span className="text-muted-foreground">{fork.commitAgo}</span>
          </div>
        ) : (
          <p className="text-muted-foreground mt-1">no commits</p>
        )}
      </div>
    </div>
  )
}
