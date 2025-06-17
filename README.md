# MemoriseNs

This project is an Angular application, initially generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.8 and subsequently updated to version 20.

**Important Note:** Starting with Angular version 18, new components are generated as standalone components by default. This project reflects this change, with newer components adhering to the standalone architecture and older ones updated to standalone step by step.

## Installation

To install all necessary dependencies, run the following command in your project directory:

```bash
npm install
```
For a detailed description on how to get the project running visit: [Memorise Frontend SETUP](https://github.com/fh2412/memorise-ns/blob/dev/SETUP.md)

## Development Server

For local development, use the Angular CLI to serve the application:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your web browser. The application will automatically reload upon saving changes to the source files. To open the applocation directly wit hthe serve command use the option '-o'

## Code Generation

Utilize the Angular CLI to quickly scaffold various Angular elements:

```bash
ng generate component <component-name>
ng generate directive <directive-name>
ng generate pipe <pipe-name>
ng generate service <service-name>
ng generate class <class-name>
ng generate guard <guard-name>
ng generate interface <interface-name>
ng generate enum <enum-name>
ng generate module <module-name>
```

Replace `<element-name>` with the desired name for the respective Angular element.

## Building the Application

To build the project for deployment, execute the following command:

```bash
ng build
```

The generated build artifacts will be located in the `dist/` directory.

## Running Unit Tests

Execute unit tests using the Karma test runner:

```bash
ng test
```

For more information about Karma, visit [https://karma-runner.github.io](https://karma-runner.github.io).

## Running End-to-End Tests

To perform end-to-end (E2E) tests, you'll need to install a suitable E2E testing framework. Once configured, you can typically run the tests using a command like:

```bash
ng e2e
```

Refer to the documentation of your chosen E2E testing framework for specific setup and execution instructions.

## Project Description and Technology Stack

For a detailed overview of the project's purpose, features, and the technologies utilized, please refer to the following document:

[Project Description and Technology Stack](https://docs.google.com/document/d/1vy7KSREsDJl_k5IybEkP4BqWAN-W7Gf5tUZFfNsggB8/edit?usp=sharing)


## Contributing to the Project

We welcome contributions from the community! To ensure a smooth collaboration, please follow these guidelines:

### Recommended Branching Structure

We are adopting a branching strategy based on the common Gitflow workflow, adapted for our deployment process:

* **`main`**: This branch contains the production-ready code. Any commits to `main` are automatically deployed to Google Cloud via a GitHub Action. **Do not directly commit to this branch.**
* **`dev`**: This is the integration branch for ongoing development. New features and bug fixes should be merged into this branch.
* **`feature/<your-feature-name>`**: For each new feature you are working on, create a dedicated branch branching off from `dev`. Use a descriptive name for your feature.
* **`bugfix/<issue-number>-short-description`**: For bug fixes, create a dedicated branch branching off from `dev`. Include the issue number (if applicable) and a short description of the fix.

### Contribution Workflow

1.  **Fork the repository** on GitHub.
2.  **Clone your forked repository** to your local machine:
    ```bash
    git clone [https://github.com/](https://github.com/)<your-github-username>/MemoriseNs.git
    cd MemoriseNs
    ```
3.  **Create a new branch** for your feature or bug fix, branching off from the `dev` branch:
    ```bash
    git checkout dev
    git checkout -b feature/<your-feature-name>
    # or
    git checkout -b bugfix/<issue-number>-short-description>
    ```
4.  **Make your changes**, adhering to the project's coding standards and best practices.
5.  **Commit your changes** with clear and concise commit messages:
    ```bash
    git add .
    git commit -m "feat(your-feature): Implement the core functionality"
    # or
    git commit -m "fix(ui): Resolve the layout issue on mobile"
    ```
    Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.
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

### Important Notes

* **Keep your branches up-to-date**: Before starting new work, always pull the latest changes from the `dev` branch:
    ```bash
    git checkout dev
    git pull origin dev
    ```
    And if you've been working on a feature branch for a while, rebase it onto the latest `dev`:
    ```bash
    git checkout <your-feature-branch-name>
    git rebase dev
    ```
* **Test your changes thoroughly**: Ensure your contributions do not introduce regressions and include relevant unit and integration tests.
* **Communicate**: If you have any questions or need clarification, feel free to open an issue or reach out to the project maintainers.

Thank you for your contributions!
```
