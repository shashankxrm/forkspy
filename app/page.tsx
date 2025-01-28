"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from '../hooks/useRequireAuth';
import Header from '../components/Header';

interface Repository {
  _id: string;
  repoUrl: string;
}

export default function Dashboard() {
  const session = useRequireAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);

  const fetchRepositories = async () => {
    const response = await fetch("/api/repos/get");
    if (!response.ok) {
      console.error("Failed to fetch repositories");
      return;
    }
    const data = await response.json();
    setRepositories(data);
  };

  useEffect(() => {
    if (session) {
      fetchRepositories();
    }
  }, [session]);

  const addRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/repos/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding repository:", errorData);
        alert(`Failed to add repository: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      alert("Repository added successfully!");
      console.log("Added Repository:", data);
      fetchRepositories(); // Refresh the list
      setRepoUrl(""); // Reset the input field
    } catch (error) {
      console.error("Error adding repository:", error);
      alert("An error occurred while adding the repository.");
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Header />
      </div>

      <form onSubmit={addRepository} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter GitHub repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="border p-2 flex-1 rounded"
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
          <li key={repo._id}>
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {repo.repoUrl}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}