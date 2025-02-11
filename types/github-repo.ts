export interface GitHubRepo {
  id: number;
    name: string;
  full_name: string;
  owner: {
    login: string
    avatar_url: string
  }
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  updated_at: string
}

export interface GitHubRepoCardProps {
  repo: GitHubRepo
  onTrackToggle: (repoId: number, isTracked: boolean) => void
  isTracked: boolean
}

