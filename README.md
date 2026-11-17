# Herdr Agent Reference

An independent, open-source Herdr desktop mod for referring to an agent without
renaming it or remembering its terminal ID. Intended for Windows and macOS.

## Status: initial implementation

Working: right-click Copy Reference in the desktop sidebar, source-aware send/reply reference formatting, grouped agent list (Needs you,
Done, Working, Idle), Copy and Open actions, and an installer that preserves
shipped mods. **Dragging an agent into a terminal draft is not implemented.**
Current installed Herdr mod APIs expose file dragging, but not text payloads.
See [the native drag proposal](docs/native-drag.md). This project does not
misrepresent a file attachment or automatic command execution as a text drag.

## Install

Requires Python 3, Herdr, and hc on PATH:

```sh
python scripts/install.py --sidebar
herdr-app do mod.open --name agent-reference
```

On Windows use `py -3 scripts/install.py`. If commands are not on PATH, pass
`--herdr /path/to/herdr-app` and `--hc /path/to/hc`. Installation writes only
`~/.config/herdr-app/mods/agent-reference`. With `--sidebar`, it also creates a
user-owned clone of the active agents mod and layout, adds a right-click
"Copy ref" action, and activates that clone. Existing status
bar customizations are preserved. The original layout and shipped mods remain intact.
Switch back to the previous layout to undo sidebar integration.
A same-named unmanaged mod is never overwritten. Copy rereads live machine routes. Windows and macOS use the same mod; Windows and macOS mod checks pass; Windows rendering has been inspected.
Clipboard behavior from actual right-click interaction still needs UI acceptance.

Copy now reads the current Core's registered machines and each connected machine's
registration table. The currently focused agent is the sender; the row being copied
is the target. It puts a stable target identity and two source-relative commands on
the clipboard:

```text
agent(<target-core-id>/t2)
Send from current agent: hc send mac/wsl/t2 "<message>"
Reply from target: hc send pc/dev/t30 "<report>"
```

The routes use local aliases at each hop, calculated independently in each direction.
Nodes are deduplicated by Core ID, including hosts whose Windows and WSL hostname
is identical. Cycles terminate. Missing tables, offline connections or a missing
focused agent produce an explicit error, not an invented return route. Nothing is
sent, executed at the target agent, or pasted into its draft automatically. Registration
metadata is read when copying; no periodic routing announcements or new permissions
are created. A copied reference is a snapshot: copy again after topology changes.

## Explicit transit connections

`scripts/bridge.py` is a byte-transparent SSH adapter for `hc machine add --via`.
It runs an explicitly supplied argv on an existing SSH host and forwards stdin/stdout
without a shell timeout or output buffering. It never discovers or registers a machine
on its own. Check the target Core ID before adding; reuse existing IDs rather than
adding duplicate aliases. Do not infer reverse authorization from a forward connection.

For a Windows SSH hop it uses the existing `py -3` on that host to preserve the exact
native argv; PowerShell 5 otherwise corrupts quoted shell probes. For a Unix hop it
quotes the remote argv with POSIX rules. It uses existing SSH credentials, BatchMode
and a connection timeout, with no agent forwarding or copied credentials.

Registering an explicit transit connection lets the existing desktop and mobile clients
load that Core's real layout, events and terminals. It does not extend Core's `on`
syntax or recursively aggregate terminal lists. Newly added network nodes require an
explicit registration; this is not automatic topology discovery. Installation paths and
machine-specific transport arguments remain outside this repository.

Paste into the receiving agent's draft, review, and submit yourself. The native
right-click action and panel button remain Copy ref. Native text dragging remains
unimplemented.

## Development

```sh
node --test tests/*.test.js
herdr-app check ~/.config/herdr-app/mods/agent-reference
```

Use a separate Herdr app home for native integration development. Public changes
must contain no machine-local configuration, credentials, transcripts or artifacts.

MIT licensed. This is an independent project, not an official Herdr extension.
