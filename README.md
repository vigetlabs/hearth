# Hearth

## System Dependencies
The following software should be installed in order to run this application locally.

### Docker and Docker Compose
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

### Node.js

Node.js is required for the Vite + React TypeScript frontend. The frontend will be run outside of Docker during local development. To check if Node.js is installed run:

```
node --version
```


This project uses Node.js `24.16.0`. If your version does not match, install or switch the correct version using a Node version manager such as `nvm` or `asdf`.

### Pre-commit

This project uses `pre-commit` `4.5.1` to run checks before commits, such as tests, linting, formatting, or security checks. To check if `pre-commit` is installed run:

```
pre-commit --version
```

If `pre-commit` is not installed, install version `4.5.1` using one of the following methods:

```
pip install pre-commit==4.5.1
```

### Just

This project uses `just` as a command runner for common development tasks. The available commands are defined in the project's `justfile` at the root level. To check if `just` is installed, run:

```
just --version
```

If `just` is not installed, install it using your favorite system package manager. Please refer to [just documentation](https://github.com/casey/just). 

### Optional: Nix Development Shell

This project includes a Nix development shell through `flake.nix` and `shell.nix`. If you have Nix installed with flakes enabled, you can enter the project shell with the required development tools by running the following command from the project root:

```
nix develop
```

The Nix shell provides tooling such as Ruby, Rails, Node.js, TypeScript, `just`, `pre-commit`, and `tig`.

## Local Development Setup

### Environment Variables

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

### Start the Development Environment

From the project root, you can start the Ruby on Rails API and PostgreSQL database Docker services by running the following command:

```
just build
just api
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

The local development environment should now be fully running. Another option to quickly start the frontend development server once the frontend dependencies have been installed is to run `just client` at the project root.


### Pre-commit Setup

This project uses pre-commit hooks to help ensure code quality. To install the pre-commit project hooks, run the following command from the root of the repository:

```
just setup-precommit
```

After installation, the hooks will run automatically when you create a commit. You can also run the checks manually to check unstaged + untracked files at any time:

```
just check
```

Before committing, ensure that the development services are running, as the hooks rely on them to run the checks.

## Local Development Testing 

### Action Cable Testing

This project uses Action Cable to enable live synchronization with calendar events. Due to the nature of web sockets requiring other external users performing the intended action in order to accurately determine whether or not a web socket feature is correctly working, it can be difficult to test the current local implementation without pushing to some public staging server. To solve this, the local development environment supports setting up public [Cloudflare Tunnels](https://developers.cloudflare.com/tunnel/) to allow other users to access the development environment. This will provide the correct environment to enable multiple external users to test web socket feature functionality.

In order to set up the Cloudflare Tunnels, first stop both the Vite server and Docker compose services. Once the servers have stopped, clean any existing containers by running `just reset`. Now start a Cloudflare Tunnel with one of the following options:

1. Ensure [cloudflared command-line client](https://github.com/cloudflare/cloudflared). Then run the following commands:
```
cloudflared tunnel --url http://localhost:5173
```

2. If you have access to Nix shells, you can run the following commands:
```
// enter a shell with access to cloudflared command-line client package
just cloudflared-shell

// start a cloudflared tunnel for http://localhost:5173
just cloudflared-tunnel
```

Once the tunnel is running, it will provide a public URL. In the `api/.env` file, set the value through `PUBLIC_APP_URL=<public-tunnel-url>`. Then start up the servers as normal:

```
// api
just build
just api

// client
./dev-start
```

Before sharing and/or accessing the public tunnel URL, ensure the following are set in the Hearth Google OAuth Credentials:
- "Authorized JavaScript Origins" section has the tunnel URL in its URIs list
- "Authorized Redirect URIs" section has `<tunnel-url>/api/v1/users/auth/google_oauth2/callback` in its URIs list

At this point, the tunnel URL should work as it would in a local development environment, allowing users to test out the web sockets. Once done with the cloudflare tunnel, ensure to clean up by setting the `PUBLIC_APP_URL` variable to nothing and removing the URIs in the Google console, as Cloudflare Tunnel URLs change each time a tunnel is started.
