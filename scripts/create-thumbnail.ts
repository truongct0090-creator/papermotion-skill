#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { findChromium } from './browser.ts';

function args(argv:string[]):Record<string,string>{
  const out:Record<string,string>={};for(let i=0;i<argv.length;i++){const k=argv[i];if(!k.startsWith('--'))continue;out[k.slice(2)]=argv[++i]??'';}return out;
}
async function imageData(url:string):Promise<string>{
  if(!url)return '';
  let current=new URL(url);
  if(current.protocol!=='https:')throw new Error('Hero image URL must use HTTPS.');
  let response:Response|undefined;
  for(let i=0;i<4;i++){
    response=await fetch(current,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{'user-agent':'PaperMotion-Thumbnail/3.0'}});
    if(response.status>=300&&response.status<400){
      const next=response.headers.get('location');if(!next)throw new Error('Hero image redirect has no location.');
      current=new URL(next,current);if(current.protocol!=='https:')throw new Error('Hero image redirects must remain HTTPS.');continue;
    }
    break;
  }
  if(!response?.ok)throw new Error(`Hero image request failed: HTTP ${response?.status??'unknown'}`);
  const type=response.headers.get('content-type')??'';
  if(!type.toLowerCase().startsWith('image/'))throw new Error(`Hero URL did not return an image (content-type: ${type||'missing'}).`);
  const declared=Number(response.headers.get('content-length')??0);if(declared>20*1024*1024)throw new Error('Hero image exceeds 20 MB.');
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>20*1024*1024)throw new Error('Hero image exceeds 20 MB.');
  return `data:${type};base64,${bytes.toString('base64')}`;
}
const a=args(process.argv.slice(2));
if(!a.title?.trim())throw new Error('--title is required.');
const input={title:a.title.replace(/\\n/g,'\n'),kicker:a.kicker||'CÂU CHUYỆN',subtitle:a.subtitle||'',imageDataUrl:await imageData(a['image-url']||'')};
const output=resolve(a.output||'out/thumbnail.png');
const server=await createServer({configFile:resolve('vite.config.ts'),server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false,watch:null},logLevel:'error'});
let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
try{
  await server.listen();const base=server.resolvedUrls?.local?.[0];if(!base)throw new Error('Vite did not expose a local URL.');
  browser=await chromium.launch({executablePath:findChromium(),headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  page.on('pageerror',e=>{throw e;});
  await page.goto(new URL('/thumbnail.html',base).toString(),{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Boolean((window as unknown as {thumbnailReady?:boolean}).thumbnailReady),null,{timeout:30000});
  const data=await page.evaluate(async (value:typeof input)=>(window as unknown as {renderThumbnail:(v:typeof input)=>Promise<string>}).renderThumbnail(value),input);
  const png=Buffer.from(data.slice(data.indexOf(',')+1),'base64');
  if(png.toString('hex',0,8)!=='89504e470d0a1a0a')throw new Error('Renderer did not return a PNG.');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);if(width!==3840||height!==2160)throw new Error(`Unexpected output dimensions: ${width}x${height}`);
  await mkdir(dirname(output),{recursive:true});await writeFile(output,png);
  console.log(`Created ${output} (${width}x${height}, 16:9, PaperMotion PNG)`);
}finally{await browser?.close();await server.close();}
