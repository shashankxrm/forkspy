# Project Overview
Build an MVP of "ForkSpy," a GitHub Fork Monitoring System. The MVP should focus on the following core functionalities:
1. Authenticate users using GitHub OAuth.
2. Allow users to add one or more GitHub repositories they own for tracking.
3. Fetch and display the list of forks for a selected repository, including:
   - Fork owner's username.
   - Fork creation date.
   - Fork URL.
4. Notify the user about new forks in real time via a notification or dashboard update.

# Technical Requirements
- **Frontend**: Next.js with Tailwind CSS for styling.
- **Backend**: Use Node.js (with Express) or Next.js API routes for server-side logic.
- **Database**: Use MongoDB to store user data, tracked repositories, and fork details.
- **GitHub API**: Use the GitHub REST API (or GraphQL if needed) for all GitHub-related operations.
- **Real-Time Updates**: Use WebSockets or Server-Sent Events (SSE) for real-time notifications.

# Step-by-Step Implementation
1. **Authentication**: 
   - Implement GitHub OAuth login using `@octokit/auth` or `passport-github`.
   - Store user tokens securely (e.g., JWT or in the database).
2. **Add Repository for Tracking**:
   - Create a form where users can input their repository URL.
   - Validate the URL and save repository data to MongoDB.
3. **Fetch Forks**:
   - Use the GitHub API to fetch forks of a tracked repository.
   - Save fork details (username, URL, created_at) to MongoDB.
4. **Real-Time Notifications**:
   - Implement WebSocket or SSE to notify the user of new forks.
   - Create a backend service to poll GitHub APIs at intervals to check for new forks.
5. **Frontend Dashboard**:
   - Show a list of tracked repositories with the latest fork count.
   - Display fork details (username, URL, date) for a selected repository.

# Additional Notes
- Ensure proper error handling for API calls (e.g., rate limits or invalid tokens).
- Use environment variables to store sensitive credentials (e.g., GitHub client ID, secret).
- Include a basic UI for the dashboard with Tailwind CSS.

# Project Structure
- **Pages**:
  - `/`: Login page with GitHub OAuth button.
  - `/dashboard`: Main dashboard listing tracked repositories.
  - `/repository/[id]`: Repository-specific page showing forks.
- **API Routes** (if using Next.js API):
  - `/api/auth`: Handle GitHub OAuth login.
  - `/api/add-repo`: Add a repository for tracking.
  - `/api/get-forks`: Fetch forks for a repository.
  - `/api/notifications`: Handle real-time updates.

# Start with this:
1. Create the Next.js app with Tailwind CSS.
2. Implement GitHub OAuth.
3. Build the UI for adding repositories.
4. Write backend logic to fetch and save forks using the GitHub API.
