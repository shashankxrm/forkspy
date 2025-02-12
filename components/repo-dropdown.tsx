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
import { useEffect, useState } from "react"

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
    const selectedRepo = repos.find(repo => repo.fullName === value)
    if (selectedRepo) {
      onSelect(selectedRepo)
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading repositories...</div>
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a repository" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Repositories</SelectLabel>
          {repos.map((repo) => (
            <SelectItem key={repo.id} value={repo.fullName}>
              <div className="flex flex-col gap-1">
                <div>{repo.fullName}</div>
                {repo.description && (
                  <div className="text-xs text-muted-foreground">
                    {repo.description}
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
