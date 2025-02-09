"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';


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
  // const [testLoading, setTestLoading] = useState(false);

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

  // const simulateFork = async (repoUrl: string) => {
  //   try {
  //     setTestLoading(true);
  //     const response = await fetch("/api/test/simulate-fork", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ repoUrl }),
  //     });

  //     const data = await response.json();
  //     if (!response.ok) {
  //       setError(data.error);
  //       return;
  //     }

  //     alert("Fork event simulated! Check your email.");
  //   } catch (error) {
  //     console.error("Error simulating fork:", error);
  //     setError("Failed to simulate fork event");
  //   } finally {
  //     setTestLoading(false);
  //   }
  // };

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Header />
      </div>

      <form onSubmit={addRepository} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter GitHub repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="border p-2 flex-1 rounded text-black dark:text-white "
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Repository
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Tracked Repositories</h2>
      <ul className="list-disc pl-5">
        {repositories.map((repo) => (
          <div key={repo._id} className="p-4 mb-4 bg-white rounded-lg shadow text-black">
            <p className="text-lg font-medium">{repo.repoUrl}</p>
            {/* {process.env.NODE_ENV === 'development' && (
              // <button
              //   onClick={() => simulateFork(repo.repoUrl)}
              //   disabled={testLoading}
              //   className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              // >
              //   {testLoading ? "Simulating..." : "Test Fork Notification"}
              // </button>
            )} */}
          </div>
        ))}
      </ul>
    </div>
  );
}