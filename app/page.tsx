"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';
import { GitHubRepoCard } from '../components/github-repo-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useWindowSize } from '../hooks/useWindowSize';
//import { LoadingSpinner } from '../components/loading-spinner-light';
import { LoadingScannerDark} from "../components/loading-scanner-dark";
import { LoadingCircuitLight } from "../components/loading-scanner-light";


interface Repository {
  _id: string;
  repoUrl: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useRequireAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5); // Number of repositories to display initially
  const [isDarkMode, setIsDarkMode] = useState(false);
  const size = useWindowSize();

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
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && session?.accessToken) {
      fetchRepositories();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setError("Please sign in to view repositories");
    }
  }, [status, session]);

  useEffect(() => {
    if (size.width && size.width >= 640) {
      setVisibleCount(repositories.length); // Show all repositories on non-mobile devices
    }
  }, [size.width, repositories.length]);

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

  const showMoreRepositories = () => {
    setVisibleCount((prevCount) => prevCount + 10); // Load 10 more repositories
  };

  if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {isDarkMode ? (
        <LoadingScannerDark size="lg" />
      ) : (
        <LoadingCircuitLight size="lg" />
      )}
    </div>
  );
}


  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <Header />
      </div>

      {/* Container div to maintain consistent left alignment */}
      <div className="max-w-[90%] mx-auto space-y-6">
        <form onSubmit={addRepository} className="flex justify-center w-full">
          <div className="grid w-full max-w-2xl items-center gap-1.5">
            <Label htmlFor="repoUrl">Enter Repository URL to start tracking</Label>
            <div className="flex flex-col md:flex-row w-full md:space-x-2 space-y-1 md:space-y-0 md:items-center">
              <Input
                id="repoUrl"
                type="text"
                placeholder="https://github.com/username/repo-name"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="border p-2 flex-1 rounded text-black dark:text-white max-w-sm"
              />
              <Button type="submit" className="px-4 py-2 rounded whitespace-nowrap max-w-32">
                Add Repository
              </Button>
            </div>
          </div>
        </form>

        <div>
          <h2 className="text-xl font-bold mb-4">Tracked Repositories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {repositories
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, visibleCount)
              .map((repo) => (
                <GitHubRepoCard
                  key={repo._id}
                  repo={repo}
                  onTrackToggle={handleTrackToggle}
                  isTracked={true}
                />
              ))}
          </div>
          {visibleCount < repositories.length && (
            <div className="flex justify-center mt-4 sm:hidden">
              <Button onClick={showMoreRepositories} className="px-4 py-2 rounded">
                Show More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}