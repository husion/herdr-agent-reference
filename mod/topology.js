// A directed graph of explicitly registered connections. Discovery never grants access.
export function topology(snapshots) {
  const nodes = new Map(), edges = new Map();
  for (const { core, machines } of snapshots) {
    if (!core?.id) continue;
    nodes.set(core.id, { ...nodes.get(core.id), ...core });
    const outgoing = [];
    for (const m of machines ?? []) {
      if (!m.id || !m.name || m.temporary) continue;
      if (!nodes.has(m.id)) nodes.set(m.id, { id: m.id, host: m.host });
      if (m.id !== core.id) outgoing.push({ id: m.id, name: m.name, connected: m.state === 'connected' });
    }
    edges.set(core.id, outgoing);
  }
  return { nodes, edges };
}

// Local aliases belong to their source vertex, never to a global name table.
export function route(graph, from, to) {
  if (!graph.nodes.has(from) || !graph.nodes.has(to)) return null;
  const queue = [{ id: from, path: [] }], seen = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (item.id === to) return item.path;
    for (const edge of graph.edges.get(item.id) ?? []) {
      if (!edge.connected || seen.has(edge.id)) continue;
      seen.add(edge.id);
      queue.push({ id: edge.id, path: [...item.path, edge.name] });
    }
  }
  return null;
}

export function resolveAgent(graph, observer, address) {
  if (typeof address !== 'string') return null;
  const parts = address.split('/'), terminal = parts.pop();
  if (!/^t[a-z0-9]+$/.test(terminal ?? '')) return null;
  let id = observer;
  for (const segment of parts) {
    const matches = (graph.edges.get(id) ?? []).filter(e => e.name === segment || e.id === segment);
    if (matches.length !== 1) return null;
    id = matches[0].id;
  }
  return graph.nodes.has(id) ? { id, terminal } : null;
}

export function communication(graph, observer, sourceAddress, targetAddress) {
  const source = resolveAgent(graph, observer, sourceAddress);
  const target = resolveAgent(graph, observer, targetAddress);
  if (!source || !target) return null;
  const forward = route(graph, source.id, target.id), back = route(graph, target.id, source.id);
  return {
    source, target,
    send: forward === null ? null : [...forward, target.terminal].join('/'),
    reply: back === null ? null : [...back, source.terminal].join('/'),
  };
}
