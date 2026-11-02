import test from 'node:test';import assert from 'node:assert/strict';
import {generateDemoProducts,buildFamily,recommend,validateProduct,parseCSV,customDesignSvg} from '../src/core.mjs';
const products=generateDemoProducts();
test('demo wardrobe generated without external calls',()=>assert.equal(products.length,432));
test('family of 4 mapped to four people',()=>assert.equal(buildFamily(2,2).length,4));
test('recommendations contain full matching family',()=>{
 const looks=recommend({members:buildFamily(2,2),style:'everyday',palette:'sage',budget:300,count:6},products);
 assert.ok(looks.length>=2);assert.ok(looks.every(x=>x.complete));assert.ok(looks.every(x=>x.items.length===4));
});
test('recommender deterministic',()=>assert.deepEqual(recommend({members:buildFamily(2,1)},products),recommend({members:buildFamily(2,1)},products)));
test('without catalog results are missing and never fabricated',()=>{const x=recommend({members:buildFamily(2,2),onlyImported:true},products);assert.ok(x.every(y=>!y.complete))});
test('reject javascript URLs',()=>assert.throws(()=>validateProduct({name:'Tee',role:'woman',style:'everyday',color:'cream',price:10,url:'javascript:alert(1)'})));
test('parse CSV with escaped commas',()=>assert.equal(parseCSV('name,role,style,color,price,sourceUrl\n"Top, light",woman,everyday,cream,18,https://store.example/top').length,1));
test('SVG printed content escaped',()=>assert.ok(customDesignSvg({text:'<script>alert(1)</script>'}).includes('&lt;SCRIPT&gt;')));
test('all demo products clearly lack purchase links',()=>assert.ok(products.every(p=>p.status==='demo'&&p.sourceUrl==='')));
test('imported real listing URL is preserved',()=>{
 const x=validateProduct({name:'Linen set',role:'man',style:'holiday',color:'sage',price:35,source:'Example partner',sourceUrl:'https://shop.example/product'});
 assert.equal(x.status,'external');assert.equal(x.sourceUrl,'https://shop.example/product');
});
test('palette is recognized even when missing in import',()=>{
 const x=validateProduct({name:'Cotton set',role:'child',style:'everyday',color:'forest',price:21});assert.equal(x.palette,'sage');
});
test('extremely restrictive budget is marked as over budget not a fake discount',()=>{
 const x=recommend({members:buildFamily(2,5),budget:1},products);assert.ok(x.every(y=>!y.withinBudget));
});
test('semicolon delimited EU CSV accepted',()=>assert.equal(parseCSV('name;role;style;color;price\nLinen;woman;holiday;cream;39').length,1));
test('UTF-8 BOM CSV accepted',()=>assert.equal(parseCSV('\uFEFFname,role,style,color,price\nCotton,man,everyday,sage,44').length,1));
test('external image is HTTPS-only',()=>assert.throws(()=>validateProduct({name:'x',role:'woman',style:'holiday',color:'cream',price:20,imageUrl:'javascript:alert(1)'})));
test('external product image is retained',()=>assert.equal(validateProduct({name:'x',role:'woman',style:'holiday',color:'cream',price:20,imageUrl:'https://shop.example/photo.jpg'}).imageUrl,'https://shop.example/photo.jpg'));