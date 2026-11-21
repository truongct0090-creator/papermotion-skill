#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { findChromium } from './browser.ts';
const argv=process.argv.slice(2); const args:Record<string,string>={};
for(let i=0;i<argv.length;i++){const k=argv[i];if(k.startsWith('--'))args[k.slice(2)]=argv[++i]??'';}
const output=resolve(args.output||'out/paper-underlay.png');
const server=await createServer({configFile:resolve('vite.config.ts'),server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false,watch:null},logLevel:'error'});
let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
try{
  await server.listen();const base=server.resolvedUrls?.local?.[0];if(!base)throw new Error('Vite did not expose a local URL.');
  browser=await chromium.launch({executablePath:findChromium(),headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  page.on('pageerror',e=>{throw e;});
  await page.goto(new URL('/thumbnail.html',base).toString(),{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Boolean((window as unknown as {thumbnailReady?:boolean}).thumbnailReady),null,{timeout:30000});
  const data=await page.evaluate(()=>(window as unknown as {renderPaperUnderlay:()=>string}).renderPaperUnderlay());
  const png=Buffer.from(data.slice(data.indexOf(',')+1),'base64');
  if(png.toString('hex',0,8)!=='89504e470d0a1a0a')throw new Error('PaperMotion did not return a PNG.');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);if(width!==3840||height!==2160)throw new Error(`Unexpected underlay dimensions: ${width}x${height}`);
  await mkdir(dirname(output),{recursive:true});await writeFile(output,png);
  console.log(`Created transparent PaperMotion underlay ${output} (${width}x${height})`);
}finally{await browser?.close();await server.close();}
