# Explicit transit and directed references

2026-11-17 · Codex.

- Kept Core 0.1.21 and desktop 0.1.16 unchanged. Added explicit existing-credential transports: Mac → WSL via Windows; Windows → dev, Pi, zgo and Minis via Mac. Registration checked Core IDs; existing direct identities were reused.
- Each desktop lists the other machine's actual spaces/agents once. Mac lists WSL; Windows lists dev. Empty machines remain machine entries with no invented sessions.
- Used a persistent raw SSH stream, not `hc exec`, which buffers output and has an execution deadline. Windows probes required preserving shell quotes through Python's native argv construction.
- Live directed graph calculation matched independently successful terminal reads in both directions: dev → mac/wsl and WSL → pc/dev. No test messages were sent to user agents.
- 9 JavaScript tests and 2 bridge quoting tests passed. Both Mac and Windows `herdr-app check` passed for the reference mod and sidebar clone. Mac native screenshot reviewed; live desktop lists checked for duplicate space IDs.
- Copy click/clipboard end-to-end acceptance remains for the user: the native UI automation surface could not acquire the Mac window. Validation covers the actual metadata graph, route resolution and native mod loading, not a simulated claim of clipboard interaction.
- Windows GUI was unavailable during deployment. Reopened it in the existing interactive user session with a temporary scheduled launch task, then removed that task; no Core or user agent was stopped.
- Minis subsequently became SSH-unreachable; its registered entry correctly remains offline. An unavailable connection is not treated as an empty successful query or a usable return route.
- The installer preserves original shipped mods/layouts and activates a managed clone. All credentials, bridge profiles, runtime IDs and screenshots remain outside Git.
