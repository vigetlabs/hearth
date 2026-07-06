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

