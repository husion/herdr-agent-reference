# Native agent-reference dragging

Goal: drag an agent row into a terminal's active composer. Insert a reference at
the cursor, preserve existing text, and never send Enter or change clipboard.
Support Windows and macOS with the same mod API.

## Current boundary

The installed `gpui-kit.d.ts` exposes `drag_paths(paths, {on})` and file `on_drop`.
It does not expose a general text drag source. File drags carry path semantics
and may transfer files across machines: they must not be abused for references.
A mod cannot reliably identify an arbitrary terminal application's input area.

## Proposed upstream API (not available today)

1. Expose a native text drag source on mod elements, with a plain-text payload,
   an optional preview label, and a bounded maximum size.
2. Terminal drops use the existing safe paste/bracketed-paste path without Enter.
   Explicitly target the terminal under the drop, including peek and floating
   terminal views, rather than the last focused/source pane.
3. Keep the drop payload immutable for the duration of a drag. Escape/cancel,
   mouse release outside a supported target, or an ended target changes nothing.
4. Avoid side effects on ordinary row clicks, focus, clipboard and agent status.
5. Consider an opaque machine/terminal identity API so references can be resolved
   across Core aliases. Until then, retain sourceHost/sourceAddress and do not
   silently reinterpret bare IDs on the receiver's machine.

API names/signatures are intentionally unspecified until discussed with upstream.
The initial mod only uses documented APIs; no fake drag adapter is shipped.

## Acceptance tests

- Windows and macOS: actual drag into Codex and Claude draft inputs; existing
  multiline text survives, no submission occurs.
- Local-to-local, remote-to-local, local-to-remote, different remote aliases and
  equal terminal IDs on different machines.
- Split panes, floating terminal, peek view, disappearing source/target.
- Cancel, ordinary click, repeated drag, long/Unicode/control-character titles.
- Terminal programs that do not offer a composer: standard text paste semantics
  must be documented; the mod cannot promise to locate a semantic input widget.

Herdr contribution policy asks for an issue discussing missing APIs before larger
changes. Keep the custom list as this independent mod; propose only a focused
native drag capability upstream. No issue or upstream PR has been submitted yet.
