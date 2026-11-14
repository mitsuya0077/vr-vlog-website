import { EmailMessage } from 'cloudflare:email';

const TO='info@vrvlog.fun';
const FROM='forms@notify.vrvlog.fun';
const ORIGINS=new Set(['https://vrvlog.fun']);
const encoder=new TextEncoder();
const base64=s=>btoa(String.fromCharCode(...encoder.encode(s)));
const mailAddress=/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/;

export function validate(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('入力内容をご確認ください。');
  const fields={};
  for(const [key,max] of Object.entries({name:120,email:254,url:1000,period:120,description:3000,website:200})){
    if(value[key]!==undefined&&typeof value[key]!=='string')throw Error('入力形式が正しくありません。');
    fields[key]=(value[key]||'').trim();
    if(fields[key].length>max)throw Error('入力内容が長すぎます。');
  }
  if(!fields.name||!fields.description||!mailAddress.test(fields.email)||/[\r\n]/.test(fields.email))throw Error('お名前・メールアドレス・内容を確認してください。');
  if(value.consent!==true)throw Error('入力情報の利用への同意が必要です。');
  if(fields.url){let u;try{u=new URL(fields.url);}catch{throw Error('URLを確認してください。');}if(u.protocol!=='https:'||u.username||u.password)throw Error('URLはHTTPSの公開ページをご指定ください。');}
  if(!['advertising','contact'].includes(value.kind))throw Error('問い合わせの種類が正しくありません。');
  fields.kind=value.kind;
  return fields;
}

export function mime(fields,id){
  const topic=fields.kind==='advertising'?'広告出稿':'お問い合わせ';
  const subject=`[${topic}] ${id}`;
  const text=`VR Vlog のフォームからお問い合わせを受信しました。\n受付番号: ${id}\n\nお名前・ショップ名: ${fields.name}\n返信先: ${fields.email}\nURL: ${fields.url||'未記入'}\n希望時期: ${fields.period||'未記入'}\n\n${fields.description}\n\n---\nこのメールに返信すると、フォームに入力された返信先へ送られます。\n掲載条件・入稿・支払いはメールで調整してください。\nフォームの内容は送信者が入力した情報です。`;
  return [`From: VR Vlog Forms <${FROM}>`,`To: ${TO}`,`Reply-To: ${fields.email}`,`Subject: =?UTF-8?B?${base64(subject)}?=`,`Date: ${new Date().toUTCString()}`,`Message-ID: <${id}@notify.vrvlog.fun>`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',base64(text).match(/.{1,76}/g).join('\r\n')].join('\r\n');
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('Origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
    if(ORIGINS.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type';}
    const respond=(status,body)=>new Response(JSON.stringify(body),{status,headers});
    if(url.pathname==='/health'&&request.method==='GET')return respond(200,{service:'vrvlog-inquiries',ready:!!env.MAIL&&!!env.CONTACT_LIMITER});
    if(url.pathname!=='/api/inquiries')return respond(404,{error:'Not found'});
    if(!ORIGINS.has(origin))return respond(403,{error:'公式サイトのフォームをご利用ください。'});
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(request.method!=='POST')return respond(405,{error:'Method not allowed'});
    if(!env.MAIL||!env.CONTACT_LIMITER)return respond(503,{error:'現在フォームを利用できません。info@vrvlog.fun へご連絡ください。'});
    if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return respond(415,{error:'入力形式が正しくありません。'});
    const client=request.headers.get('CF-Connecting-IP');
    if(!client)return respond(400,{error:'送信元を確認できません。'});
    if(!(await env.CONTACT_LIMITER.limit({key:client})).success)return respond(429,{error:'送信が続いています。少し時間をおいてお試しください。'});
    let fields;
    try{
      const reader=request.body?.getReader();if(!reader)return respond(400,{error:'入力内容がありません。'});
      const chunks=[];let size=0;
      while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>20000){await reader.cancel();return respond(413,{error:'入力内容が長すぎます。'});}chunks.push(part.value);}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      fields=validate(JSON.parse(new TextDecoder().decode(bytes)));
    }catch(e){return respond(400,{error:e instanceof SyntaxError?'入力内容をご確認ください。':e.message});}
    if(fields.website)return respond(400,{error:'入力内容をご確認ください。'});
    const id=crypto.randomUUID();
    try{await env.MAIL.send(new EmailMessage(FROM,TO,mime(fields,id)));}
    catch{console.error('inquiry_delivery_failed',id);return respond(502,{error:'メールを送信できませんでした。時間をおいて再度お試しいただくか、info@vrvlog.fun へご連絡ください。'});}
    return respond(200,{ok:true,id});
  }
};
