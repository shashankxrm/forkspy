import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GitHubFork {
  full_name: string;
  owner: {
    login: string;
  };
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');

    if (!repo) {
      return NextResponse.json({ error: "Repo parameter required" }, { status: 400 });
    }

    // Get the authenticated user's GitHub username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
    }

    const userData = await userResponse.json();
    const authenticatedUsername = userData.login;

    const headers = {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    };

    // Get repository details to check if it's a fork
    const repoDetailsResponse = await fetch(
      `https://api.github.com/repos/${authenticatedUsername}/${repo}`,
      { headers }
    );

    if (!repoDetailsResponse.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const repoDetails = await repoDetailsResponse.json();
    
    // Determine the source repository based on fork status
    let sourceOwner = authenticatedUsername;
    let sourceRepo = repo;
    
    if (repoDetails.fork && repoDetails.parent) {
      // If this is a fork, use the parent (original) repository for data
      sourceOwner = repoDetails.parent.owner.login;
      sourceRepo = repoDetails.parent.name;
    }
    // If it's not a fork (original repo), use the authenticated user's repo

    // Fetch repository contributors (recent activity) - from source repository
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${sourceOwner}/${sourceRepo}/contributors?per_page=5`,
      { headers }
    );

    // Fetch repository forks with additional details - from source repository
    const forksResponse = await fetch(
      `https://api.github.com/repos/${sourceOwner}/${sourceRepo}/forks?sort=newest&per_page=20`,
      { headers }
    );

    if (!contributorsResponse.ok || !forksResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repository data" }, { status: 500 });
    }

    const contributors = await contributorsResponse.json();
    const forks = await forksResponse.json();

    // Process contributors data
    const recentActivity = {
      forksLast24h: forks.length, // This is an approximation; GitHub API doesn't provide 24h filter
      contributors: await Promise.all(
        contributors.slice(0, 5).map(async (contributor: GitHubContributor) => {
          // Fetch recent commits for this contributor from the source repository
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${sourceOwner}/${sourceRepo}/commits?author=${contributor.login}&per_page=1`,
            { headers }
          );

          let commitHash: string | null = null;
          let timeAgo: string | null = null;
          const prNumber: number | null = null;

          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            if (commits.length > 0) {
              commitHash = commits[0].sha.substring(0, 7);
              timeAgo = getTimeAgo(new Date(commits[0].commit.author.date));
            }
          }

          return {
            username: contributor.login,
            avatar: contributor.avatar_url,
            commitHash,
            prNumber, // Would need additional API call to get recent PRs
            timeAgo,
            totalCommits: contributor.contributions,
            repoOwner: sourceOwner,
            repoName: sourceRepo,
          };
        })
      ),
    };

    // Process forks data
    const recentForks = await Promise.all(
      forks.slice(0, 20).map(async (fork: GitHubFork) => {
        // Get commits from this fork user to the source repository
        const userCommitsResponse = await fetch(
          `https://api.github.com/repos/${sourceOwner}/${sourceRepo}/commits?author=${fork.owner.login}&per_page=100`,
          { headers }
        );

        let commitHash: string | null = null;
        let commitAgo: string | null = null;
        let totalCommits = 0;

        if (userCommitsResponse.ok) {
          const userCommits = await userCommitsResponse.json();
          totalCommits = userCommits.length;
          
          if (userCommits.length > 0) {
            // Get the latest commit from this user
            commitHash = userCommits[0].sha.substring(0, 7);
            commitAgo = getTimeAgo(new Date(userCommits[0].commit.author.date));
          }
        }

        return {
          username: fork.owner.login,
          commits: totalCommits, // This is now the total commits from this user to the source repo
          totalCommits: totalCommits,
          forkedAgo: getTimeAgo(new Date(fork.created_at)),
          commitHash,
          commitAgo,
          repoOwner: sourceOwner,
          repoName: sourceRepo,
        };
      })
    );

    return NextResponse.json({
      recentActivity,
      recentForks,
    });

  } catch (error) {
    console.error("Error fetching hoverlay data:", error);
    return NextResponse.json({ error: "Failed to fetch hoverlay data" }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}
