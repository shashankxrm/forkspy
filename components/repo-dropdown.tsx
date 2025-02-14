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
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { CheckIcon, ChevronDownIcon, GitForkIcon } from "lucide-react"

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
  onSelect: (repo: Repository) => void
}

export function RepoDropdown({ onSelect }: RepoDropdownProps) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>("")
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

  const handleValueChange = (value: string) => {
    const repo = repos.find((r) => r.fullName.toLowerCase() === value.toLowerCase())
    if (!repo) return

    setSelectedRepo(repo)
    setSelectedValue(value)
    setShowDialog(true)
  }

  const handleConfirm = () => {
    if (selectedRepo) {
      onSelect(selectedRepo)
      setShowDialog(false)
      setSelectedRepo(null)
      setSelectedValue("")
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading repositories...</div>
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full max-w-[280px] md:max-w-[400px] lg:max-w-[700px] px-3 py-2 text-sm bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors">
            <span className="truncate">{selectedValue || "Select a repository"}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] md:w-[400px] lg:w-[700px] p-0" align="start">
          <div className="rounded-lg border shadow-md">
            <Command>
  <CommandInput
    placeholder="Search repositories..."
    value={searchQuery}
    onValueChange={setSearchQuery}
    className="border-none focus:ring-0 h-11"
  />
  <CommandList className="max-h-[300px] overflow-auto">
    <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
      No repositories found.
    </CommandEmpty>
    {filteredRepos.map((repo) => (
      <CommandItem
        key={repo.id}
        onSelect={() => handleValueChange(repo.fullName)}
        className="px-4 py-2 cursor-pointer hover:bg-accent group"
      >
        <div className="flex items-start gap-3 min-w-full">
          <GitForkIcon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent-foreground/10 hover:scrollbar-thumb-accent-foreground/20">
            <div className="flex items-center gap-2 w-fit min-w-full">
              <span className="font-medium whitespace-nowrap">{repo.fullName}</span>
              {selectedValue === repo.fullName && (
                <CheckIcon className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            {repo.description && (
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {repo.description}
              </div>
            )}
          </div>
        </div>
      </CommandItem>
    ))}
  </CommandList>
</Command>

          </div>
        </PopoverContent>
      </Popover>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Track Repository
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Are you sure you want to track <span className="font-medium text-foreground">{selectedRepo?.fullName}</span>? 
              This will set up webhooks and track all forks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setSelectedRepo(null)}
              className="mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Yes, track repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}