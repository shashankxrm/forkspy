



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="public/forkspy-dark.png" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">ForkSpy</h1>

  <p align="center">
  <p>A Github fork tracking tool.</p>
    <br />
    <a href="https://github.com/shashankxrm/forkspy/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#">View Demo</a>
    &middot;
    <a href="mailto:shashankreddy0608@gmail.com">Report Bug</a>
    &middot;
    <a href="mailto:shashankreddy0608@gmail.com">Request Feature</a>
    <br />
    <br />
    <img src="https://github.com/shashankxrm/forkspy/actions/workflows/test.yml/badge.svg" alt="CI/CD Pipeline" />
    <img src="https://codecov.io/gh/shashankxrm/forkspy/branch/main/graph/badge.svg" alt="Coverage" />
    <img src="https://img.shields.io/github/license/shashankxrm/forkspy" alt="License" />
    <img src="https://img.shields.io/github/stars/shashankxrm/forkspy" alt="Stars" />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#docker">Docker Development</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<img src="public/dashboard.png" />

ForkSpy is a GitHub repository tracking tool that notifies users when their tracked repositories are forked. It helps developers stay informed about their project's reach and impact by providing real-time email notifications whenever a fork occurs.

Here's why you should use forkspy:
* Stay Informed Instantly – Get real-time email notifications whenever someone forks your repository. No more manually checking GitHub!
* See how your open-source work spreads and attracts contributors. Identify which projects are gaining traction.
* Simply sign in with GitHub, select the repositories you want to track, and let ForkSpy handle the rest.
*  Engage with developers who fork your project and encourage contributions to improve your codebase.

### Built With

* NextJS
* TailwindCSS
* OAuth
* TypeScript
* ShadCN
* MongoDB
* ReactIcons




<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy follow these simple example steps.


<!-- USAGE EXAMPLES -->
## Use Cases

🚀 Open Source Project Growth – Track forks to measure your project's popularity and identify contributors who might collaborate.

📢 Community Engagement – Get notified when someone forks your repo and reach out to them for discussions, PRs, or feedback.

💼 Portfolio Monitoring – Keep an eye on how your personal or professional projects are spreading across the GitHub ecosystem.

👨‍💻 Team & Organization Insights – Companies and teams can monitor which repositories are being forked the most to prioritize development efforts.

📊 Trend Analysis – Identify which types of projects gain traction and adjust your development focus accordingly.


<!-- TESTING -->
## Testing

ForkSpy has a comprehensive test suite using Vitest for unit testing and React Testing Library for component testing. Tests cover:

* Utility functions
* Custom hooks
* API routes
* Component behavior
* Error handling

### Running Tests Locally

```bash
# Install dependencies
npm install

# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### CI/CD

We use GitHub Actions for continuous integration. Every pull request and push to the main branch triggers:

1. **Test Suite** - All unit and integration tests
2. **Linting** - Code quality checks with ESLint
3. **Build** - Application build verification
4. **Coverage** - Test coverage reporting

The CI/CD badge at the top of this README shows the current pipeline status for the main branch.

To see detailed test reports and coverage, check the "Actions" tab in the GitHub repository.


<!-- DOCKER -->
## Docker Development

ForkSpy supports Docker for development, making it easy to run the application in a consistent environment without worrying about local dependencies.

### Prerequisites

- Docker Desktop (recommended) or Docker Engine
- Docker Compose v2.0+

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/shashankxrm/forkspy.git
   cd forkspy
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local .env
   # Edit .env with your actual values (GitHub OAuth, MongoDB, etc.)
   ```

3. **Start the development environment**
   ```bash
   npm run docker:dev
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser
   - The application will automatically reload when you make code changes

### Docker Commands

```bash
# Start development environment
npm run docker:dev

# Build Docker image
npm run docker:dev:build

# Stop all containers
npm run docker:stop

# View running containers
docker ps

# View application logs
docker logs forkspy-app
```

### Features

- **Hot Reloading**: Code changes are automatically reflected in the browser
- **Volume Mounting**: Your local code is mounted into the container for development
- **Environment Variables**: Uses your local `.env` file for configuration
- **MongoDB Atlas**: Connects to your MongoDB Atlas cluster (no local database needed)

### Troubleshooting

If you encounter issues:

1. **Port conflicts**: Make sure port 3000 is not in use by other applications
2. **Environment variables**: Ensure your `.env` file has all required variables
3. **Docker daemon**: Make sure Docker Desktop is running
4. **Clean rebuild**: Run `npm run docker:dev:build` to rebuild the image

For more detailed Docker documentation, see [DOCKER.md](./DOCKER.md).


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request







<!-- CONTACT -->
## Contact

LinkedIn: [Shashank Reddy](https://www.linkedin.com/in/shashankxrm)
Mail:[shashankreddy0608@gmail.com](mailto:shashankreddy0608@gmail.com)

Project Live Link: [https://forkspy.vercel.app](https://forkspy.vercel.app)






