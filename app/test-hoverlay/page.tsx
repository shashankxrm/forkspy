"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { GitHubRepoCard } from "@/components/github-repo-card"

interface TrackedRepo {
  _id: string
  repoUrl: string
}

export default function TestHoverlayPage() {
  const { data: session } = useSession()
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetchTrackedRepos()
    }
  }, [session])

  const fetchTrackedRepos = async () => {
    try {
      const response = await fetch('/api/repos/get')
      if (response.ok) {
        const data = await response.json()
        setTrackedRepos(data.repositories || [])
      }
    } catch (error) {
      console.error('Failed to fetch tracked repos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackToggle = async (repoId: string, isTracked: boolean) => {
    // This is just for testing - implement proper tracking logic as needed
    console.log('Track toggle:', { repoId, isTracked })
  }

  if (!session) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Test Hoverlay Integration</h1>
        <p>Please sign in to test the hoverlay functionality.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Test Hoverlay Integration</h1>
        <p>Loading repositories...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Hoverlay Integration</h1>
      <p className="text-muted-foreground mb-6">
        Hover over repository cards to see the hoverlay with activity and fork data.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trackedRepos.map((repo) => (
          <GitHubRepoCard
            key={repo._id}
            repo={repo}
            onTrackToggle={handleTrackToggle}
            isTracked={true}
          />
        ))}
      </div>

      {trackedRepos.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No tracked repositories found. Add some repositories from the dashboard to test the hoverlay.
        </p>
      )}
    </div>
  )
}
