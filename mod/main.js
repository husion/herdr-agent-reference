import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { agents, theme, run } from "herdr";
import { SOURCE_HOST, MACHINE_HOSTS } from "./config.js";
import { grouped, makeReference, referenceText } from "./reference.js";
const labels = { blocked: "Needs you", done: "Done", working: "Working", idle: "Idle" };
export default class AgentReferences extends View {
  init() { this.copied = null; }
  render() {
    const t = theme();
    return v_flex().w_full().h(420).min_h(0).p(10).gap(8).bg(t.surface)
      .child(div().text_size(15).text_color(t.foreground).child("Agent references"))
      .child(div().text_size(11).text_color(t.dim).child("Copy a reference, then paste it into your draft. Native text dragging awaits a Herdr API."))
      .child(v_flex().flex_1().min_h(0).overflow_y_scrollbar().gap(10)
        .children(grouped(agents()).filter(g => g.agents.length).map(g => v_flex().gap(4)
          .child(div().text_size(12).text_color(t[g.status] ?? t.dim).child(`${labels[g.status]} ${g.agents.length}`))
          .children(g.agents.map(a => h_flex().id(`agent-ref-${a.address}`).gap(6).items_center().p(6).rounded(6).bg(t.raised)
            .child(v_flex().flex_1().min_w(0)
              .child(div().text_size(12).text_color(t.foreground).child(a.title || a.tab_name || a.address))
              .child(div().text_size(10).text_color(t.dim).child(`${a.space_name} / ${a.address}`)))
            .child(div().id(`copy-ref-${a.address}`).px(8).py(4).rounded(4).cursor_pointer().text_color(t.foreground)
              .tooltip("Copy machine-scoped reference; does not send or change focus")
              .on_click((_e, cx) => {
                cx.write_to_clipboard(referenceText(makeReference(a, SOURCE_HOST, MACHINE_HOSTS)));
                this.copied = a.address; cx.notify();
              }).child(this.copied === a.address ? "Copied" : "Copy"))
            .child(div().id(`open-ref-${a.address}`).px(6).py(4).cursor_pointer().text_color(t.dim)
              .on_click(() => run("agent.focus", { terminal: a.address })).child("Open")))))));
  }
}
