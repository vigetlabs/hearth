# Intern 2026 Group Project

### System Dependencies
The following software should be installed in order to run this application locally.

#### Docker and Docker Compose
Docker is required to run the local development environment. Docker Compose will be used to orchestrate the application services, including the Rails API and PostgreSQL database.

To check if Docker is installed, run:

```
docker --version
docker compose version
```

If Docker is not installed, follow the instructions depending on operating system:
- [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/) 
- [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/) 
- [Install Docker Desktop on Linux](https://docs.docker.com/desktop/setup/install/linux/) 

#### Node.js

Node.js is required for the Vite + React TypeScript frontend. The frontend will be run outside of Docker during local development. To check if Node.js is installed run:

```
node --version
```


This project uses Node.js `24.16.0`. If your version does not match, install or switch the correct version using a Node version manager such as `nvm` or `asdf`.

#### Pre-commit

This project uses `pre-commit` `4.5.1` to run checks before commits, such as tests, linting, formatting, or security checks. To check if `pre-commit` is installed run:

```
pre-commit --version
```

If `pre-commit` is not installed, install version `4.5.1` using one of the following methods:

```
pip install pre-commit==4.5.1
```

#### Just

This project uses `just` as a command runner for common development tasks. The available commands are defined in the project's `justfile` at the root level. To check if `just` is installed, run:

```
just --version
```

If `just` is not installed, install it using your favorite system package manager. Please refer to [just documentation](https://github.com/casey/just). 

### Local Development Setup

#### Environment Variables

This project uses environment variables to configure each part of the local development environment. Each major directory has its own `.env` file:

- `api/.env`
- `client/.env`
- `services/.env`

Example environment files are included in each directory. To set up your local environment variables, copy each `.env.example` file into a corresponding `.env` file:

```
cp api/.env.example api/.env
cp client/.env.example client/.env
cp services/.env.example services/.env
```

After copying the example files, review the values in each `.env` file and update them if needed for your local setup. (Refer to 1Password or owners of the repository).

#### Start the Development Environment

From the project root, you can start the Ruby on Rails API and PostgreSQL database Docker services by running the following command:

```
just build
just up
```

The `just build` command builds the local Docker images, and `just up` starts the development services.

In a separate terminal, install the frontend dependencies:

```
cd client
npm install
```

Then start the frontend development server:

```
./dev-start.sh

```

The local development environment should now be fully running. Another option to quickly start the frontend development server once the frontend dependencies have been installed is to run `just vite` at the project root.

#### Pre-commit Setup

This project uses pre-commit hooks to help ensure code quality. To install the pre-commit project hooks, run the following command from the root of the repository:

```
just setup-precommit
```

After installation, the hooks will run automatically when you create a commit. You can also run the checks manually at any time:

```
just check
```

Before committing, ensure that the development services are running, as the hooks rely on them to run the checks.
