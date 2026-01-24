---
name: powershell-expert
description: Expert-level PowerShell assistance for system administration and development tasks.
---

# Instructions
1. **Discovery**: Use `Get-Command` to verify tool availability.
2. **Environment**: Manage environment variables using the `$env:` provider.
3. **Registry**: Use the `HKLM:` and `HKCU:` drives for registry operations if permitted.
4. **Automation**: When automating tasks, prefer `New-Item`, `Remove-Item`, and `Copy-Item` with appropriate `-Recurse` and `-Force` flags.
5. **Output**: Format complex data using `Format-Table` or `ConvertTo-Json` for readability.
