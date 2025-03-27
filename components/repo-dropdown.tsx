import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDownIcon, GitForkIcon, CheckIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  url: string
  private: boolean
  updatedAt: string
}

interface RepoDropdownProps {
  onSelect: (repos: Repository[]) => void
}

export function RepoDropdown({ onSelect }: RepoDropdownProps) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/repos/list")
        if (!response.ok) {
          throw new Error("Failed to fetch repositories")
        }
        const data = await response.json()
        setRepos(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load repositories")
        console.error("Error fetching repositories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepos(prev => {
      const isSelected = prev.some(r => r.id === repo.id)
      if (isSelected) {
        return prev.filter(r => r.id !== repo.id)
      } else {
        return [...prev, repo]
      }
    })
  }

  const handleConfirm = () => {
    if (selectedRepos.length > 0) {
      onSelect(selectedRepos)
      setShowDialog(false)
      setSelectedRepos([])
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading repositories...</div>
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        <AlertDialog open={true} onOpenChange={() => setError(null)}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold">
                Error
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogAction 
                onClick={() => setError(null)}
                className="bg-primary hover:bg-primary/90"
              >
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full max-w-[280px] md:max-w-[400px] lg:max-w-[700px] px-3 py-2 text-sm bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors">
            <span className="truncate">
              {selectedRepos.length > 0 
                ? `${selectedRepos.length} repositor${selectedRepos.length > 1 ? 'ies' : 'y'} selected`
                : "Select repositories"}
            </span>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] md:w-[400px] lg:w-[700px] p-3" align="start">
          <div className="rounded-lg border">
            <div className="flex items-center px-3 border-b">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 px-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <ScrollArea className="max-h-[300px] overflow-auto p-1">
              {filteredRepos.length === 0 ? (
                <div className="py-6 text-sm text-center text-muted-foreground">
                  No repositories found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className="w-full px-4 py-2 flex items-start gap-3 hover:bg-accent rounded-sm group text-left"
                    >
                      <GitForkIcon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent-foreground/10 hover:scrollbar-thumb-accent-foreground/20">
                        <div className="flex items-center gap-2 w-fit min-w-full">
                          <span className="font-medium whitespace-nowrap">
                            <span className="block md:hidden">{repo.name}</span>
                            <span className="hidden md:block">{repo.fullName}</span>
                          </span>
                          {selectedRepos.some(r => r.id === repo.id) && (
                            <CheckIcon className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                        {repo.description && (
                          <div className="text-xs text-muted-foreground whitespace-normal break-words">
                            {repo.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''} selected
                </span>
                <Button 
                  onClick={() => setShowDialog(true)}
                  disabled={selectedRepos.length === 0}
                  className="px-4"
                >
                  Track Selected
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Track Repositories
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Are you sure you want to track {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''}? 
              This will set up webhooks and track all forks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setSelectedRepos([])}
              className="mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Yes, track repositories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}