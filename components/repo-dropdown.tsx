import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"

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
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/repos/list')
        if (!response.ok) {
          throw new Error('Failed to fetch repositories')
        }
        const data = await response.json()
        setRepos(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load repositories')
        console.error('Error fetching repositories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const handleValueChange = (value: string) => {
    // Find the repository from our repos array instead of parsing JSON
    const repo = repos.find(r => r.fullName === value)
    if (repo) {
      setSelectedRepo(repo)
      setSelectedValue(value)
      setShowDialog(true)
    }
  }

  const handleConfirm = () => {
    if (selectedRepo) {
      onSelect(selectedRepo)
      setShowDialog(false)
      setSelectedRepo(null)
      setSelectedValue('')
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
    <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full max-w-[280px] md:max-w-[400px] lg:max-w-[700px]">
          <SelectValue placeholder="Select a repository" className="truncate" />
        </SelectTrigger>
        <SelectContent 
        className="w-[280px] md:w-[400px] lg:w-[700px]"
        onPointerDownOutside={(e) => {
          // Prevent closing when interacting with search on mobile
          if (e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
          <div className="px-3 pb-2">
          <div 
            className="search-container"
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search repositories..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
          </div>
        </div>
          <SelectGroup>
            <SelectLabel>Your Repositories</SelectLabel>
            {filteredRepos.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No repositories found
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <SelectItem 
                  key={repo.id} 
                  value={repo.fullName} 
                  className="overflow-x-auto custom-scrollbar hover:cursor-pointer"
                >
                  <div className="flex flex-col gap-1 min-w-full">
                    <div className="whitespace-nowrap">{repo.fullName}</div>
                    {repo.description && (
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {repo.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Track Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to track {selectedRepo?.fullName}? This will set up webhooks and track all forks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRepo(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Yes, track repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
  )
}
