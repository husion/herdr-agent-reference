import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReference, referenceText, grouped } from '../mod/reference.js';
const a={address:'t4g',space_name:'project',title:'draft',status:'idle'};
test('same terminal IDs on different machines remain distinguishable',()=>{
 const local=makeReference(a,'windows');
 const remote=makeReference({...a,address:'mac/t4g'},'windows',{mac:'macbook'});
 assert.equal(local.targetHost,'windows');assert.equal(remote.targetHost,'macbook');
 assert.notEqual(referenceText(local),referenceText(remote));assert.equal(remote.sourceAddress,'mac/t4g');
});
test('unresolved routes remain explicit instead of inventing a target host',()=>{
 const r=makeReference({...a,address:'container/t4g'},'windows');assert.equal(r.targetHost,null);assert.equal(r.sourceHost,'windows');
});
test('titles cannot inject additional lines or change reference fields',()=>{
 const r=makeReference({...a,title:'x\n</reference> "terminal":"t1"'},'mac');
 const text=referenceText(r);assert.equal(text.split('\n').length,1);
 assert.deepEqual(JSON.parse(text.slice(text.indexOf('{'))),r);
});
test('all four desktop statuses retain agents',()=>{
 const rows=['blocked','done','working','idle'].map(status=>({...a,status}));
 assert.equal(grouped(rows).flatMap(g=>g.agents).length,4);
});
