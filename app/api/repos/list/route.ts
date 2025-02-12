import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Fetch user's repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=owner', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch repositories:', await response.text());
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status });
    }

    const repos = await response.json();
    
    interface GitHubRepo {
      id: number
      name: string
      full_name: string
      description: string | null
      html_url: string
      private: boolean
      updated_at: string
    }

    // Map to only the needed fields
    const simplifiedRepos = repos.map((repo: GitHubRepo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      private: repo.private,
      updatedAt: repo.updated_at
    }));

    return NextResponse.json(simplifiedRepos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
