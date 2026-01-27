# Tea CLI Notes

## Overview
`tea` is the command-line interface for Gitea. It is used to interact with issues, pull requests, releases, and other Gitea features directly from the terminal.

## Authentication
If the agent cannot authenticate, check for an existing login:
```bash
tea login list
```
If missing, add it (interactive mode not supported for agents, rely on user-provided config/token):
```bash
# User must provide token or pre-configure
```

## Best Practices for Agents
1.  **JSON Output**: Always use `--output json` where possible for easier parsing.
    ```bash
    tea issue list --output json
    ```
2.  **Context**: Ensure you are in the correct repo or use `--repo <owner>/<name>`.
3.  **Non-Interactive**: Avoid commands that prompt for input (e.g., plain `tea login` without args).

## Common Commands
-   **List Issues**: `tea issue list`
-   **Create Issue**: `tea issue create --title "Title" --body "Description"`
-   **List PRs**: `tea pr list`
-   **Checkout PR**: `tea pr checkout <index>`
