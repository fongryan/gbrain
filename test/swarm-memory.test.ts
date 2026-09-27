import {test} from 'node:test';import assert from 'node:assert/strict';
import {createSwarmMemory} from '../src/extensions/swarm-memory.ts';
test('source-bound writes read back by a different worker and group',()=>{
 const rows:Array<{id:number;fact:string;source:string}>=[];
 const memory=createSwarmMemory({remember(fact,_entity,source){const row={id:rows.length+1,fact,source};rows.push(row);return {state:'committed',id:row.id}},recall(){return {facts:rows}}});
 const written=memory.write('fixture','worker A','invented policy',[{fact:'Human review before refund',topic:'approval',tags:['human']},{fact:'Shipping status draft',topic:'workflow',tags:['shipping']}]);
 const result=memory.recall('fixture','worker B',written);
 assert.equal(result.facts.length,2);assert.equal(result.group.kind,'split');
 assert.throws(()=>memory.recall('fixture','worker A',written),/Independent reader/);
 rows[0]!.source='different source';assert.throws(()=>memory.recall('fixture','worker B',written),/mismatch/);
});
