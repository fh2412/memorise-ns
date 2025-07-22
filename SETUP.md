-----

# Memorise Frontend: Installation and Setup

This document guides you through setting up and running the frontend Angular project for Memorise.

## Prerequisites

Before you begin, ensure you have the following:

  * **Git**: For cloning the repository. You can download it from [git-scm.com](https://git-scm.com/).
  * **Node.js and npm**: Required for running Angular applications. We recommend using Node.js version 22.

## 1\. Check Node.js Version

First, let's check your current Node.js version. Open your terminal or command prompt and run:

```bash
node -v
```

If your Node.js version is not 22, or if Node.js is not installed, proceed to the next step.

## 2\. Install Node.js Version 22 (using nvm)

If your Node.js version is not 22, or if Node.js is not installed, it's recommended to use Node Version Manager (nvm) to manage multiple Node.js versions. This allows you to easily switch between different Node.js versions for various projects without conflicts.

**Important:** If you have an existing Node.js installation (and it's not version 22), it's best to uninstall it before installing nvm to avoid potential conflicts.

### Uninstalling Existing Node.js

  * **Windows:**
    1.  Go to `Control Panel` \> `Programs` \> `Programs and Features`.
    2.  Find "Node.js" in the list, right-click, and select "Uninstall".
    3.  You might also need to manually delete any remaining Node.js files in `%PROGRAMFILES%\nodejs` or `%APPDATA%\npm`.
  * **Linux:**
      * If installed via a package manager (e.g., `apt`, `yum`):
        ```bash
        sudo apt-get purge nodejs npm # For Debian/Ubuntu
        sudo yum remove nodejs npm # For CentOS/RHEL
        ```
      * If installed from source or a tarball, you'll need to remove the installation directory and any associated symlinks.

### Installing nvm

#### On Linux

1.  Open your terminal.
2.  Download and run the nvm installation script:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```
    (Note: The version `v0.39.7` is a placeholder. Always check the official nvm GitHub repository for the latest version: [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)).
3.  After installation, close and reopen your terminal, or source your shell's profile file (e.g., `source ~/.bashrc` or `source ~/.zshrc`) for nvm to be available.
4.  Verify nvm installation:
    ```bash
    nvm --version
    ```

#### On Windows

For Windows, it's recommended to use `nvm-windows`.

1.  Go to the `nvm-windows` releases page: [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2.  Download the `nvm-setup.zip` file for the latest release.
3.  Unzip the file and run the `nvm-setup.exe` installer. Follow the prompts.
4.  Open a **new** command prompt or PowerShell window (as an administrator if prompted).
5.  Verify nvm installation:
    ```bash
    nvm version
    ```

### Installing Node.js Version 22 using nvm

Once nvm is installed, you can easily install Node.js version 22:

```bash
nvm install 22
```

Then, tell nvm to use version 22 for your current shell:

```bash
nvm use 22
```

You can verify the Node.js version again:

```bash
node -v
```

It should now display `v22.x.x` (or a similar version number for Node.js 22).

## 3\. Branch the Git Repository

Follow the standard contribution workflow to set up your local repository:

### Contribution Workflow

1.  **Fork the repository** on GitHub.
2.  **Clone your forked repository** to your local machine:
    ```bash
    git clone https://github.com/<your-github-username>/MemoriseNs.git
    cd MemoriseNs
    ```
3.  **Create a new branch** for your feature or bug fix, branching off from the `dev` branch:
    ```bash
    git checkout dev
    git checkout -b feature/<your-feature-name>
    # or
    git checkout -b bugfix/<issue-number>-short-description
    ```
4.  **Make your changes**, adhering to the project's coding standards and best practices.
5.  **Commit your changes** with clear and concise commit messages:
    ```bash
    git add .
    git commit -m "feat(your-feature): Implement the core functionality"
    # or
    git commit -m "fix(ui): Resolve the layout issue on mobile"
    ```
    *Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.*
6.  **Push your branch** to your forked repository on GitHub:
    ```bash
    git push origin <your-feature-branch-name>
    ```
7.  **Create a Pull Request (PR)** to the `dev` branch of the main repository.
      * Provide a clear and descriptive title for your PR.
      * Explain the purpose of your changes and any relevant context.
      * Reference any related issues.
8.  **Code Review**: Your PR will be reviewed by other contributors. Be prepared to address any feedback and make necessary changes.
9.  **Merging**: Once your PR is approved, it will be merged into the `dev` branch.
10. **Deployment to Main**: Periodically, changes from the `dev` branch will be merged into the `main` branch, triggering the deployment to Google Cloud.

## 4\. Install Packages

Once you have cloned the repository and are on your desired branch, navigate into the `frontend` directory and install the necessary npm packages:

```bash
cd frontend
npm install
```

This command will download and install all the dependencies listed in the `package.json` file.

-----
