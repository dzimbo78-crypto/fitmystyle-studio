import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bodyDimensions} from '../site/family-scene.mjs';
test('preview proportions convert measured body cm to metres',()=>{assert.deepEqual(bodyDimensions({group:'adult',measurements:{height:180,chest:100,waist:80,hip:104}}),{height:1.8,chest:1,waist:.8,hip:1.04})});
test('infant and child fallback do not populate missing actual measurements',()=>{const p={group:'infant',measurements:{}};assert.equal(bodyDimensions(p).height,.68);assert.equal(bodyDimensions({group:'child'}).height,1.1);assert.deepEqual(p.measurements,{})});
test('invalid extreme values cannot break projection',()=>{const d=bodyDimensions({measurements:{height:Infinity,chest:-5,waist:'bad',hip:999}});assert.ok(Object.values(d).every(Number.isFinite));assert.equal(d.height,2.3);assert.equal(d.chest,.25);assert.equal(d.hip,1.9)});
