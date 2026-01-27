# OS Command Protocol

## Objective
Ensure safe, predictable, and transparent execution of operating system commands by the AI agent.

## Core Rules

1.  **Verification First**: Before manipulating files or directories, verify their existence and state (e.g., `ls`, `Get-ChildItem`).
2.  **No Destructive Defaults**: Never use destructive flags (like `-Force` or `--force`) unless explicitly dealing with a known, isolated artifact (e.g., a test file created by the agent).
3.  **Output Management**:
    -   Use `> /dev/null` or equivalent to silence verbose tools if the output is not needed.
    -   Use `head` or `tail` to preview massive files.
4.  **Platform Specifics**:
    -   **Windows**: Use `pwsh` (PowerShell Core) syntax. Escape properly.
    -   **Linux/Mac**: Use standard `bash` syntax.

## "SafeToAutoRun" Criteria
Set `SafeToAutoRun: true` ONLY if:
1.  The command is purely read-only (`ls`, `cat`, `grep`).
2.  The command affects ONLY files created *during the current session/task* (e.g., temporary test files).
3.  The command has zero risk of side effects on the user's broader system.
