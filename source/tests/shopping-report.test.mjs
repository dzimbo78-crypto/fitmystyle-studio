import test from 'node:test';import assert from 'node:assert/strict';import {reportHTML,compareLooks} from '../src/shopping-report.mjs';
const one={total:35,match:91,complete:true,sourceCount:1,items:[{member:{label:'Mum',size:'M'},product:{name:'<script>alert(1)</script>',status:'external',source:'Partner',sourceUrl:'https://example.com/p',sku:'s1',price:35,stock:'unknown',shipping:null}}]};
const two={...one,total:20,match:70,sourceCount:0,items:[]};
test('printable report does not execute HTML from imported product',()=>{const html=reportHTML(one);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))});
test('printable report is explicit no order was placed',()=>{const html=reportHTML(one);assert.ok(html.includes('To nie jest potwierdzenie zamówienia'));assert.ok(html.includes('nie dokonano')||html.includes('Nie dokonano'))});
test('reports known merchant and unknown shipping',()=>{const html=reportHTML(one);assert.ok(html.includes('Partner'));assert.ok(html.includes('koszt niepotwierdzony'))});
test('comparison reports cost difference',()=>{const d=compareLooks(one,two);assert.equal(d.priceDifference,-15);assert.equal(d.first.match,91)});
test('comparison cannot proceed with undefined look',()=>assert.throws(()=>compareLooks(one,undefined)));