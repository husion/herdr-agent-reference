import test from 'node:test';
import assert from 'node:assert/strict';
import { topology, route, communication } from '../mod/topology.js';
const machine = (id, name, state = 'connected') => ({ id, name, state });
const snapshots = () => [
  { core: { id: 'M' }, machines: [machine('P', 'pc'), machine('D', 'dev')] },
  { core: { id: 'P' }, machines: [machine('M', 'mac'), machine('W', 'wsl')] },
  { core: { id: 'D' }, machines: [machine('M', 'mac')] },
  { core: { id: 'W' }, machines: [machine('P', 'windows')] },
];
test('deduplicate by Core ID, terminate cycles, and preserve directed local aliases', () => {
  const g = topology(snapshots());
  assert.equal(g.nodes.size, 4);
  assert.deepEqual(route(g, 'D', 'W'), ['mac', 'pc', 'wsl']);
  assert.deepEqual(route(g, 'W', 'D'), ['windows', 'mac', 'dev']);
  assert.equal(route(g, 'D', 'missing'), null);
});
test('focused remote agent is the origin, not the desktop observing it', () => {
  const g = topology(snapshots());
  const r = communication(g, 'M', 'dev/t30', 'pc/wsl/t2');
  assert.equal(r.send, 'mac/pc/wsl/t2');
  assert.equal(r.reply, 'windows/mac/dev/t30');
  assert.equal(communication(g, 'M', 'dev/t2', 'dev/t30').send, 't30');
});
test('never invent reverse edges; offline paths and unknown origins remain unavailable', () => {
  const s = snapshots(); s[3].machines = [];
  const r = communication(topology(s), 'M', 'dev/t30', 'pc/wsl/t2');
  assert.equal(r.reply, null); assert.ok(r.send);
  s[1].machines[1].state = 'disconnected';
  assert.equal(route(topology(s), 'D', 'W'), null);
  assert.equal(communication(topology(s), 'M', null, 't2'), null);
});
test('same aliases on different machines and renames do not merge identities', () => {
  const s = snapshots(); s[3].machines[0].name = 'pc';
  const g = topology(s);
  assert.equal(communication(g, 'M', 'dev/t30', 'pc/wsl/t2').reply, 'pc/mac/dev/t30');
  assert.equal(communication(g, 'M', 'D/t30', 'P/W/t2').send, 'mac/pc/wsl/t2');
});
