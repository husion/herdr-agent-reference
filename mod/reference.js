// Addresses are scoped to the source Core. Never interpret a remote alias globally.
export const GROUPS = ['blocked', 'done', 'working', 'idle'];
export function makeReference(agent, sourceHost, machineHosts = {}) {
  if (!agent || !/^t[a-z0-9]+$/.test(agent.address.split('/').at(-1))) throw new Error('Invalid agent address');
  const at = agent.address.lastIndexOf('/');
  const route = at < 0 ? null : agent.address.slice(0, at);
  const target = route === null ? sourceHost : machineHosts[route] ?? null;
  return { version: 1, sourceHost, sourceAddress: agent.address,
    targetHost: target, terminal: agent.address.slice(at + 1),
    space: agent.space_name ?? '', title: agent.title || agent.tab_name || '',
    agent: agent.program?.name ?? agent.app ?? '' };
}
export function referenceText(reference) {
  // Keep the source Core scope: aliases and bare terminal IDs are not global.
  // Titles, space names and program names are unnecessary for addressing.
  const path = [reference.sourceHost, ...reference.sourceAddress.split('/')]
    .map(value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()))
    .join('/');
  return `agent(${path})`;
}
export function grouped(agents) {
  return GROUPS.map(status => ({ status, agents: agents.filter(a => a.status === status) }));
}
