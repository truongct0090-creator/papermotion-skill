import { Paper } from '../paper/Paper';
import type { V } from '../core/math';

type Input = { title: string; kicker: string; subtitle: string; imageDataUrl?: string };
const W = 3840, H = 2160;
const BG = '#B08088', PAPER = '#F7E8D2', INK = '#30232B', RED = '#713B49';
const canvas = document.querySelector<HTMLCanvasElement>('#thumbnail')!;
const ctx = canvas.getContext('2d', { alpha: false })!;
const paper = new Paper(ctx);
paper.light = { x: -0.7, y: -0.65 };
paper.edgeColor = 'rgba(255,250,239,.42)';
paper.shadowColor = 'rgba(42,20,31,.38)';

function hash(s: string): number { let h=2166136261; for (const c of s) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
function polygon(points: number[][]): V[] { return points.map(([x,y])=>({x,y})); }
function blob(points: number[][], color: string, seed: number, shadow=22, tear=5): void {
  paper.blob(polygon(points), color, { seed, tear, shadow, texture: .34, edge: true, rim: { color: 'rgba(255,247,228,.24)', width: 3 }, shade: { color: 'rgba(45,25,32,.12)', width: 4 } });
}
function textWidth(text: string, font: string): number { ctx.save(); ctx.font=font; const w=ctx.measureText(text).width; ctx.restore(); return w; }
function wrapTitle(text: string, font: string, maxWidth: number): string[] {
  const paragraphs=text.replace(/\\n/g,'\n').split('\n');
  const out:string[]=[];
  for(const paragraph of paragraphs){
    const words=paragraph.trim().split(/\s+/).filter(Boolean); let line='';
    for(const word of words){ const next=line?line+' '+word:word;
      if(line && textWidth(next,font)>maxWidth){out.push(line);line=word;} else line=next;
    }
    if(line) out.push(line);
  }
  return out;
}
function tornStrip(x:number, baseline:number, text:string, font:string, color:string, seed:number, padX=54, padY=32):void {
  ctx.save(); ctx.font=font; const width=ctx.measureText(text).width; ctx.restore();
  const left=x, right=x+width+padX*2, top=baseline-120-padY, bottom=baseline+34+padY;
  paper.sheet({shadow:17,texture:.38,edge:true,rim:{color:'rgba(255,255,255,.38)',width:2},shade:{color:'rgba(66,37,44,.12)',width:3}},()=>{
    paper.blob(polygon([[left,top+10],[left+width*.34,top],[right-20,top+7],[right,top+32],[right-5,bottom-18],[right-34,bottom],[left+width*.58,bottom+7],[left+8,bottom-8],[left-8,baseline-24]]),PAPER,{seed,tear:5,shadow:0,texture:.24,edge:true});
    paper.text(text,{x:x+padX,y:baseline},{font,color});
  });
}
function drawHeadline(title:string,kicker:string,subtitle:string):void {
  const left=180, maxWidth=1435;
  tornStrip(left+12,354,kicker.toLocaleUpperCase('vi-VN'),'700 48px "Noto Sans", sans-serif',RED,21,42,22);
  let size=196, lines:string[]=[];
  while(size>=126){const f=`800 ${size}px "Noto Sans", sans-serif`; lines=wrapTitle(title,f,maxWidth); if(lines.length<=4 && lines.length*size*1.22<=1040) break; size-=4;}
  const font=`800 ${size}px "Noto Sans", sans-serif`;
  const lineH=Math.round(size*1.22); let y=650;
  lines.slice(0,4).forEach((line,i)=>{tornStrip(left,y,line,font,i===0?INK:RED,100+i,44,24);y+=lineH;});
  if(subtitle.trim()){
    const sf='600 48px "Noto Sans", sans-serif'; const subs=wrapTitle(subtitle,sf,1370).slice(0,2);
    let sy=Math.min(Math.max(y+46,1590),1850);
    subs.forEach((line,i)=>{tornStrip(left+12,sy,line,sf,INK,310+i,34,18);sy+=76;});
  }
}
function coverRect(img:HTMLImageElement,x:number,y:number,w:number,h:number):void {
  const scale=Math.max(w/img.width,h/img.height), sw=img.width*scale, sh=img.height*scale;
  ctx.drawImage(img,x+(w-sw)/2,y+(h-sh)/2,sw,sh);
}
function drawPhoto(img:HTMLImageElement):void {
  const cut=polygon([[2050,360],[3320,275],[3540,440],[3485,1510],[3260,1690],[2110,1580],[1940,1360],[1980,560]]);
  blob([[1900,300],[3340,220],[3650,480],[3550,1610],[3290,1800],[1930,1670],[1770,1380],[1820,480]],'#E8D6BF',501,32,8);
  paper.clip(cut,()=>coverRect(img,1960,300,1570,1370));
  ctx.save(); ctx.beginPath(); cut.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath();
  ctx.strokeStyle='rgba(255,246,225,.92)';ctx.lineWidth=20;ctx.stroke();ctx.restore();
  // Separate foreground paper layers give the subject a tactile collage depth.
  blob([[1780,1120],[2220,1050],[2330,1160],[2260,1530],[1880,1590],[1720,1430]],'#B75F63',512,18,7);
  blob([[3110,250],[3550,330],[3610,650],[3440,760],[3190,600]],'#F3E2C9',513,18,6);
  blob([[2900,1430],[3480,1320],[3590,1510],[3450,1810],[3020,1770]],'#8B4B58',514,22,7);
}
function drawAbstract(title:string):void {
  const h=hash(title), accents=['#B85F64','#E3B879','#6E8790','#8B6C83','#9A985F'];
  const accent=accents[h%accents.length], accent2=accents[(h>>>5)%accents.length];
  blob([[1960,400],[2900,230],[3540,540],[3480,1420],[3160,1710],[2200,1570],[1840,1160]],'#E8D6BF',610,30,8);
  blob([[2220,520],[2960,410],[3330,710],[3190,1320],[2760,1510],[2210,1240],[2050,830]],accent,611,25,7);
  blob([[2450,680],[3000,580],[3200,830],[3060,1250],[2670,1370],[2310,1110]],accent2,612,18,6);
  // A topic-derived word keeps the fallback specific without baking in a single product or story.
  const words=title.toLocaleUpperCase('vi-VN').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(w=>w.length>2 && !['NHƯ','THẾ','NÀO','CỦA','NHỮNG','MỘT','ĐÃ','VÀ','LÀ','THE','HOW','WHY','WHAT'].includes(w));
  const heroWord=(words[0]||'BÍ MẬT').slice(0,16);
  const fs=heroWord.length>10?126:heroWord.length>7?156:190;
  paper.sheet({shadow:24,texture:.42,edge:true,rim:{color:'rgba(255,255,255,.38)',width:4}},()=>{
    paper.blob(polygon([[2050,850],[3240,760],[3350,920],[3260,1190],[2100,1280],[1960,1100]]),PAPER,{seed:620,tear:8,shadow:0,texture:.3});
    paper.text(heroWord,{x:2670,y:1090},{font:`800 ${fs}px "Noto Sans", sans-serif`,color:INK,align:'center'});
  });
  // Small cut-paper marks make each fallback composition feel hand assembled.
  blob([[1850,520],[2090,440],[2180,560],[2050,730],[1870,690]],'#F6E9D5',621,14,5);
  blob([[3270,1280],[3530,1190],[3610,1350],[3450,1510],[3280,1450]],'#F4E5D0',622,14,5);
}
function drawBackground():void {
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  // restrained paper grain, deterministic between runs
  let seed=hash('motmot-paper');const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<12500;i++){const x=rand()*W,y=rand()*H,a=.025+rand()*.045;ctx.fillStyle=`rgba(255,244,225,${a})`;ctx.fillRect(x,y,1+rand()*3,1);}
  blob([[110,150],[1160,130],[1230,175],[1170,220],[150,230]],'#C99DA0',3,0,3);
}
async function render(input:Input):Promise<string>{
  canvas.width=W;canvas.height=H;ctx.setTransform(1,0,0,1,0,0);paper.setFrame(0);
  drawBackground();
  if(input.imageDataUrl){
    const img=new Image();img.src=input.imageDataUrl;await img.decode();drawPhoto(img);
  }else drawAbstract(input.title);
  // Layered paper scraps and a quiet paper label anchor the right composition.
  blob([[1780,1780],[2320,1740],[2440,1850],[2340,1980],[1850,1990],[1730,1900]],'#F0DFC7',710,14,5);
  blob([[3320,1800],[3610,1740],[3690,1880],[3550,2020],[3330,1980]],'#D5B3A7',711,14,5);
  drawHeadline(input.title.trim(),input.kicker.trim(),input.subtitle.trim());
  return canvas.toDataURL('image/png');
}
(window as unknown as {renderThumbnail:(input:Input)=>Promise<string>}).renderThumbnail=render;
(window as unknown as {thumbnailReady:boolean}).thumbnailReady=true;
