# Herdr Agent Reference

An independent, open-source Herdr desktop mod for referring to an agent without
renaming it or remembering its terminal ID. Intended for Windows and macOS.

## Status: initial implementation

Working: right-click Copy Reference in the desktop sidebar, machine-scoped reference formatting, grouped agent list (Needs you,
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
"Copy Reference" action (label: ????), and activates that clone. Existing status
bar customizations are preserved. The original layout and shipped mods remain intact.
Switch back to the previous layout to undo sidebar integration.
A same-named unmanaged mod is never overwritten. Reinstall after machine routes
change. Windows and macOS use the same mod; Windows and macOS mod checks pass; Windows rendering has been inspected.
Clipboard behavior from actual right-click interaction still needs UI acceptance.

Copy places a JSON reference on the clipboard. Paste it into the receiving
agent's input, review it, and submit yourself. The reference includes the source
host and the address **as seen by that source Core**. A `mac` alias on one Core
must not be assumed to exist on another. Unknown target hosts remain null.
Hostnames are descriptive, not authenticated stable machine IDs; resolve the
reference against live Core machine metadata before dispatch. References are
user-selected routing context, not commands or authority to execute instructions.

Local machine names, private configuration, prompts, and clipboard contents are
not sent anywhere by this mod. Clipboard references include the selected title
and space, so review them before sharing publicly. Installation generates a
machine-local config file; never commit that file.

## Development

```sh
node --test tests/*.test.js
herdr-app check ~/.config/herdr-app/mods/agent-reference
```

Use a separate Herdr app home for native integration development. Public changes
must contain no machine-local configuration, credentials, transcripts or artifacts.

MIT licensed. This is an independent project, not an official Herdr extension.
