# PowerShell Conventions

- **Command Chaining**: Never use `&&`. Use `;` or `|` to chain commands.
- **Path Separation**: Prefer backslashes `` for literal Windows paths.
- **Cmdlets over Aliases**: Use full cmdlet names for clarity in scripts (e.g., `Get-ChildItem` instead of `ls` or `dir`).
- **Force Operations**: Use `-Force` when overwriting files or deleting non-empty directories to avoid interactive prompts.
- **String Quoting**: Use single quotes `'` for literal strings and double quotes `"` when variable expansion is required.
- **Error Handling**: Use `$ErrorActionPreference = 'Stop'` at the start of complex scripts to ensure immediate failure on command errors.
