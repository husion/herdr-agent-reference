import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { agents, theme, run, props, closeOverlay, openOverlay, focused, hc, notify } from "herdr";
import { grouped } from "./reference.js";
import { topology, communication } from "./topology.js";
async function readJSON(args) {
  const r = await hc(args);
  if (r.code !== 0) throw new Error(r.stderr || "Cannot read machine connections");
  return JSON.parse(r.stdout);
}
async function directedReference(source, target) {
  const [status, local] = await Promise.all([readJSON(["server", "status"]), readJSON(["machine", "ls"])]);
  const snapshots = [{ core: status.core, machines: local.machines }];
  await Promise.all(local.machines.filter(m => !m.temporary && m.state === "connected").map(async m => {
    try {
      const r = await readJSON(["exec", "--on", m.name, "--timeout", "10", "--", "hc", "machine", "ls"]);
      snapshots.push({ core: { id: m.id, name: m.host }, machines: r.machines });
    } catch (_) { /* A missing table is unknown; never invent its reverse edges. */ }
  }));
  const graph = topology(snapshots);
  const pair = communication(graph, status.core.id, source, target.address);
  if (!pair || !pair.send || !pair.reply) throw new Error("Cannot verify both routes from the current agent. Check machine connections.");
  return `agent(${pair.target.id}/${pair.target.terminal})\nSend from current agent: hc send ${pair.send} "<message>"\nReply from target: hc send ${pair.reply} "<report>"`;
}
const labels = { blocked: "Needs you", done: "Done", working: "Working", idle: "Idle" };
export default class AgentReferences extends View {
  init() { this.copied = null; this.copying = false; }
  copy(target, cx, popup = false) {
    if (this.copying) return;
    const source = focused()?.agent || focused()?.terminal;
    this.copying = true; cx.notify();
    cx.spawn(async cx => {
      try {
        const text = await directedReference(source, target);
        cx.write_to_clipboard(text); this.copied = target.address;
        if (popup) closeOverlay(props().overlay);
      } catch (e) { notify({ title: "Reference unavailable", body: String(e.message || e), level: "error" }); }
      finally { this.copying = false; cx.notify(); }
    });
  }
  render() {
    const t = theme();
    const target = props()?.referenceTarget;
    if (target) return v_flex().p(5).bg(t.popover).text_size(12.8).child(div().id("copy-agent-reference").px(8).h(31).flex().items_center().rounded(7)
      .text_color(t.foreground).hover(el => el.bg(t.hover)).cursor_pointer()
      .on_click((_e, cx) => {
        this.copy(target, cx, true);
      }).child(this.copying ? "Reading routes…" : "Copy ref"));
    return v_flex().w_full().h(420).min_h(0).p(10).gap(8).bg(t.surface)
      .child(div().text_size(15).text_color(t.foreground).child("Agent references"))
      .child(div().text_size(11).text_color(t.dim).child("Copy a target and return route from the currently focused agent."))
      .child(v_flex().flex_1().min_h(0).overflow_y_scrollbar().gap(10)
        .children(grouped(agents()).filter(g => g.agents.length).map(g => v_flex().gap(4)
          .child(div().text_size(12).text_color(t[g.status] ?? t.dim).child(`${labels[g.status]} ${g.agents.length}`))
          .children(g.agents.map(a => h_flex().id(`agent-ref-${a.address}`).on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "agent-reference", kind: "popup", width: 140, props: { referenceTarget: a } }); }).gap(6).items_center().p(6).rounded(6).bg(t.raised)
            .child(v_flex().flex_1().min_w(0)
              .child(div().text_size(12).text_color(t.foreground).child(a.title || a.tab_name || a.address))
              .child(div().text_size(10).text_color(t.dim).child(`${a.space_name} / ${a.address}`)))
            .child(div().id(`copy-ref-${a.address}`).px(8).py(4).rounded(4).cursor_pointer().text_color(t.foreground)
              .tooltip("Copy send and reply routes from the focused agent; does not send")
              .on_click((_e, cx) => {
                this.copy(a, cx);
              }).child(this.copying ? "Reading…" : this.copied === a.address ? "Copied" : "Copy ref"))
            .child(div().id(`open-ref-${a.address}`).px(6).py(4).cursor_pointer().text_color(t.dim)
              .on_click(() => run("agent.focus", { terminal: a.address })).child("Open")))))));
  }
}
