"use client";

import { useEffect, useState } from "react";
// Update paths to start from root
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Header } from '@/components/Header';
import { GitHubRepoCard } from '@/components/github-repo-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWindowSize } from '@/hooks/useWindowSize';
import { LoadingScannerDark } from "@/components/loading-scanner-dark";
import { LoadingCircuitLight } from "@/components/loading-scanner-light";
import { RepoDropdown } from "@/components/repo-dropdown";


interface Repository {
  _id: string;
  repoUrl: string;
  createdAt: string;
}

const LoadingOverlay = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex items-center justify-center h-full">
        <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
          {isDarkMode ? (
            <LoadingScannerDark size="lg" />
          ) : (
            <LoadingCircuitLight size="lg" />
          )}
          <p className="text-foreground">Processing your request...</p>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useRequireAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5); // Number of repositories to display initially
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const size = useWindowSize();

  const fetchRepositories = async () => {
    if (status !== 'authenticated' || !session?.accessToken) return;
    
    try {
      setError(null);
      const response = await fetch("/api/repos/get/", {
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
      setLoading(true);
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

    setIsProcessing(true); // Show loading overlay
    try {
      setError(null);
      const response = await fetch("/api/repos/add/", {
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
      await fetchRepositories();
    } catch (error) {
      setError("Failed to add repository");
      console.error("Error adding repository:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrackToggle = async (repoId: string, isTracked: boolean) => {
    if (status !== 'authenticated' || !session?.accessToken) {
      setError("Please sign in to manage repositories");
      return;
    }
    setIsProcessing(true); // Show loading overlay
    try {
      setError(null);
      const response = await fetch(isTracked 
        ? `/api/repos/delete/?repoId=${repoId}` 
        : '/api/repos/add/', {
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

      await fetchRepositories();
    } catch (error) {
      setError(`Failed to ${isTracked ? 'untrack' : 'track'} repository`);
      console.error(`Error ${isTracked ? 'untracking' : 'tracking'} repository:`, error);
    } finally {
      setIsProcessing(false); // hide loading overlay
    }
  };

  const showMoreRepositories = () => {
    setVisibleCount((prevCount) => prevCount + 10); // Load 10 more repositories
  };

  if (loading || status === 'loading') {
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
  


  return (
    <div className="relative min-h-screen">
      {isProcessing && <LoadingOverlay isDarkMode={isDarkMode} />}
      <div className="p-6 md:p-10 z-0">
        <div className="flex justify-between items-center mb-6">
          <Header />
        </div>
        {/* Show error alert at the top if there's an error */}
        {error && (
          <div className="max-w-[90%] mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

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

          {/* OR divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Repository Dropdown */}
          <div className="flex justify-center w-full">
            <div className="grid w-full max-w-2xl items-center gap-1.5">
              <Label>Select from your repositories</Label>
              <RepoDropdown 
                onSelect={async (repos) => {
                  setIsProcessing(true);
                  try {
                    // Create an array of promises for each repository
                    const promises = repos.map(repo => 
                      fetch("/api/repos/add", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          'Authorization': `token ${session?.accessToken}`,
                        },
                        body: JSON.stringify({ repoUrl: repo.url }),
                      })
                    );
                    
                    // Process all repository additions in parallel
                    await Promise.all(promises);
                    // Refresh the repository list after all are added
                    await fetchRepositories();
                  } catch (error) {
                    setError("Failed to add some repositories");
                    console.error("Error adding repositories:", error);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Tracked Repositories</h2>
            {repositories.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                <p className="text-center text-gray-500">No repositories tracked. Add repositories to start tracking.</p>
                </div>
            ) : (
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
            )}
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
    </div>
  );
}