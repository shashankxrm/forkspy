"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from '../hooks/useRequireAuth';
import {Header} from '../components/Header';
import { GitHubRepoCard } from '../components/github-repo-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface Repository {
  _id: string;
  repoUrl: string;
}

export default function Dashboard() {
  const { data: session, status } = useRequireAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    if (status !== 'authenticated' || !session?.accessToken) return;
    
    try {
      setError(null);
      const response = await fetch("/api/repos/get", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.accessToken}`,
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        if (response.status === 401) {
          console.log("Session status:", status);
          console.log("Session data:", session);
        }
        return;
      }
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      setError("Failed to fetch repositories");
      console.error("Error fetching repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user && session?.accessToken) {
      fetchRepositories();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setError("Please sign in to view repositories");
    }
  }, [status, session]);

  const addRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated' || !session?.accessToken) {
      setError("Please sign in to add repositories");
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/repos/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `token ${session.accessToken}`,
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      setRepoUrl("");
      fetchRepositories();
    } catch (error) {
      setError("Failed to add repository");
      console.error("Error adding repository:", error);
    }
  };

  const handleTrackToggle = async (repoId: string, isTracked: boolean) => {
    if (status !== 'authenticated' || !session?.accessToken) {
      setError("Please sign in to manage repositories");
      return;
    }

    try {
      setError(null);
      const response = await fetch(isTracked 
        ? `/api/repos/delete?repoId=${repoId}` 
        : '/api/repos/add', {
        method: isTracked ? 'DELETE' : 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `token ${session.accessToken}`,
        },
        body: isTracked ? undefined : JSON.stringify({ repoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      fetchRepositories();
    } catch (error) {
      setError(`Failed to ${isTracked ? 'untrack' : 'track'} repository`);
      console.error(`Error ${isTracked ? 'untracking' : 'tracking'} repository:`, error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <Header />
      </div>

      {/* Container div to maintain consistent left alignment */}
      <div className="max-w-[90%] mx-auto space-y-6">
        <form onSubmit={addRepository} className="flex justify-center w-full">
        <div className="grid w-full max-w-2xl items-center gap-1.5">
          <Label htmlFor="repoUrl">Enter Repository URL to start tracking</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="repoUrl"
              type="text"
              placeholder="https://github.com/username/repo-name"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="border p-2 flex-1 rounded text-black dark:text-white"
            />
            <Button type="submit" className="dark:text-black px-4 py-2 rounded whitespace-nowrap">
              Add Repository
            </Button>
          </div>
        </div>
      </form>

        <div>
          <h2 className="text-xl font-bold mb-4">Tracked Repositories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {repositories
              .slice()
              .reverse()
              .map((repo) => (
                <GitHubRepoCard
                  key={repo._id}
                  repo={repo}
                  onTrackToggle={handleTrackToggle}
                  isTracked={true}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
);
}