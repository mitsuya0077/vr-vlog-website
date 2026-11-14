import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('worker.mjs',import.meta.url),'utf8').replace("import { EmailMessage } from 'cloudflare:email';",'class EmailMessage { constructor(from,to,raw){Object.assign(this,{from,to,raw});} }');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const valid={kind:'advertising',name:'動作確認 ショップ',email:'mouri0077@gmail.com',url:'https://vrvlog.fun/vrchat/',period:'相談',description:'日本語でお問い合わせの動作を確認します。',consent:true,website:''};
let sent=[],limited=false,fail=false;
const env={MAIL:{send:async m=>{if(fail)throw Error('private provider error');sent.push(m);}},CONTACT_LIMITER:{limit:async()=>({success:!limited})}};
const req=(body=valid,options={})=>new Request('https://example.workers.dev/api/inquiries',{method:'POST',headers:{Origin:'https://vrvlog.fun','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...options.headers},body:typeof body==='string'?body:JSON.stringify(body)});
let response=await worker.fetch(req(),env);assert.equal(response.status,200);assert.equal(sent.length,1);assert.equal(sent[0].to,'info@vrvlog.fun');assert.equal(sent[0].from,'forms@notify.vrvlog.fun');assert.match(sent[0].raw,/Reply-To: mouri0077@gmail.com\r\n/);assert.match(Buffer.from(sent[0].raw.split('\r\n\r\n')[1].replaceAll('\r\n',''),'base64').toString('utf8'),/日本語でお問い合わせ/);
for(const bad of [{email:'a@example.com\r\nBcc: other@example.com'},{url:'javascript:alert(1)'},{url:'https://user:pass@example.com'},{consent:false},{kind:'unknown'},{description:'x'.repeat(3001)},{name:17},{website:'spam'}]){response=await worker.fetch(req({...valid,...bad}),env);assert.equal(response.status,400);}
response=await worker.fetch(req('{'),env);assert.equal(response.status,400);
response=await worker.fetch(req('x'.repeat(20001)),env);assert.equal(response.status,413);
response=await worker.fetch(req(valid,{headers:{Origin:'https://untrusted.example'}}),env);assert.equal(response.status,403);assert.equal(response.headers.get('Access-Control-Allow-Origin'),null);
limited=true;response=await worker.fetch(req(),env);assert.equal(response.status,429);limited=false;
response=await worker.fetch(req(),{});assert.equal(response.status,503);
fail=true;response=await worker.fetch(req(),env);assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/private provider error/);
assert.equal(sent.length,1);console.log('PASS: delivery target, Reply-To, Japanese MIME, input validation, header injection, origin, size limit, rate limit, missing bindings and delivery failure.');
