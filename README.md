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
"Copy ref" action, and activates that clone. Existing status
bar customizations are preserved. The original layout and shipped mods remain intact.
Switch back to the previous layout to undo sidebar integration.
A same-named unmanaged mod is never overwritten. Reinstall after machine routes
change. Windows and macOS use the same mod; Windows and macOS mod checks pass; Windows rendering has been inspected.
Clipboard behavior from actual right-click interaction still needs UI acceptance.

Copy places a compact reference on the clipboard:

```text
@agent(macbook/t4g)
@agent(desktop/mac/t4g)
@agent(desktop/dev-linux/t2)
```

The first segment identifies the source Core host. Remaining segments are the
address **as seen by that source Core**; `desktop/mac/t4g` means resolve `mac/t4g`
from `desktop`, not from the receiving machine. This is a human/agent-readable
project convention, not a built-in Herdr mention or executable command. Hostnames
are descriptive rather than authenticated global IDs. Resolve against live Core
metadata before dispatch. Segments use percent encoding for special characters.
Titles, space names and program metadata are deliberately omitted.

Paste into the receiving agent's draft, review, and submit yourself. Nothing is
automatically sent. The context menu uses the same 12.8px text and 31px row height
as Herdr's space context menu. Both the context action and panel button say Copy ref.

This mod sends no data over the network. Installation generates a machine-local
config file; never commit that file.

## Development

```sh
node --test tests/*.test.js
herdr-app check ~/.config/herdr-app/mods/agent-reference
```

Use a separate Herdr app home for native integration development. Public changes
must contain no machine-local configuration, credentials, transcripts or artifacts.

MIT licensed. This is an independent project, not an official Herdr extension.
