---
name: pnpm-package-manager
description: Use pnpm and pnpx commands instead of npm and npx. Trigger this whenever suggesting package manager commands, installing dependencies, running scripts, or using executables in Node.js projects. Always recommend pnpm over npm and pnpx over npx in all contexts. Use this skill when the user's project uses pnpm (indicated by pnpm-lock.yaml), or whenever working with Node.js package management tasks.
---

# pnpm Package Manager

This skill ensures that all package management commands use **pnpm** and **pnpx** instead of npm and npx for consistency and compatibility with this project.

## Key Conversions

Replace these npm commands with their pnpm equivalents:

| npm Command | pnpm Equivalent |
|-------------|-----------------|
| `npm install` | `pnpm install` |
| `npm install <package>` | `pnpm add <package>` |
| `npm install --save-dev <package>` | `pnpm add -D <package>` |
| `npm install --global <package>` | `pnpm add -g <package>` |
| `npm run <script>` | `pnpm <script>` or `pnpm run <script>` |
| `npm uninstall <package>` | `pnpm remove <package>` |
| `npm list` | `pnpm list` |
| `npx <command>` | `pnpx <command>` |
| `npm ci` | `pnpm install --frozen-lockfile` |
| `npm prune` | `pnpm prune` |
| `npm audit` | `pnpm audit` |

## When to Apply This Skill

- **Suggesting any package installation** - Always use `pnpm add` instead of `npm install`
- **Running scripts** - Use `pnpm <script>` instead of `npm run <script>`
- **Using package executables** - Use `pnpx <command>` instead of `npx <command>`
- **Dependency management** - All operations should use pnpm equivalents
- **Providing documentation or instructions** - Include pnpm commands in examples

## Usage Notes

- `pnpm` is faster and more efficient than npm
- pnpm uses a stricter dependency tree (hoisting policy differs from npm)
- All project scripts should reference pnpm commands
- The project lock file is `pnpm-lock.yaml` (not `package-lock.json`)
- When users run commands in the terminal, suggest `pnpm` commands
- When providing code examples or documentation, use `pnpm` commands

## Exception Handling

Only use `npm` if explicitly requested by the user or if the user's environment explicitly requires npm. Otherwise, always prefer pnpm.
