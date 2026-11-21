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
  const kickerText=kicker.toLocaleUpperCase('vi-VN'); let kickerSize=48;
  while(kickerSize>28 && textWidth(kickerText,`700 ${kickerSize}px "Noto Sans", sans-serif`)>maxWidth) kickerSize-=2;
  tornStrip(left+12,354,kickerText,`700 ${kickerSize}px "Noto Sans", sans-serif`,RED,21,42,22);
  let size=196, lines:string[]=[];
  while(size>=126){const f=`800 ${size}px "Noto Sans", sans-serif`; lines=wrapTitle(title,f,maxWidth); if(lines.length<=4 && lines.length*size*1.22<=1040) break; size-=4;}
  const font=`800 ${size}px "Noto Sans", sans-serif`;
  const titleLines=lines.slice(0,4);
  drawTitleSheet(titleLines,font,size);
  const lineH=Math.round(size*1.22); const y=690+Math.max(0,titleLines.length-1)*lineH+size*.55;
  if(subtitle.trim()){
    const sf='600 48px "Noto Sans", sans-serif'; const subs=wrapTitle(subtitle,sf,1370).slice(0,2);
    let sy=Math.min(Math.max(y+110,1590),1850);
    subs.forEach((line,i)=>{tornStrip(left+12,sy,line,sf,INK,310+i,34,18);sy+=76;});
  }
}
function coverRect(img:HTMLImageElement,x:number,y:number,w:number,h:number):void {
  const scale=Math.max(w/img.width,h/img.height), sw=img.width*scale, sh=img.height*scale;
  ctx.drawImage(img,x+(w-sw)/2,y+(h-sh)/2,sw,sh);
}

function drawTitleSheet(lines:string[],font:string,size:number):void {
  const padX=58, padY=54, lineH=Math.round(size*1.22), left=180, firstBaseline=690;
  ctx.save();ctx.font=font;
  const widths=lines.map(line=>ctx.measureText(line).width);
  ctx.restore();
  const maxW=Math.max(...widths), top=firstBaseline-size-padY, bottom=firstBaseline+(lines.length-1)*lineH+48+padY;
  const right=left+maxW+padX*2;
  // One merged silhouette for the COMPLETE headline, including the final punctuation.
  paper.sheet({shadow:28,texture:.34,edge:true,rim:{color:'rgba(255,255,255,.52)',width:5},shade:{color:'rgba(50,20,35,.24)',width:7}},()=>{
    paper.blob(polygon([[left-14,top+24],[left+maxW*.24,top+4],[left+maxW*.68,top+12],[right-18,top],[right+8,top+38],[right-4,bottom-24],[right-34,bottom+6],[left+maxW*.72,bottom-2],[left+maxW*.31,bottom+10],[left-18,bottom-12],[left-30,firstBaseline+lineH*.35]]),PAPER,{seed:401,tear:7,shadow:0,texture:.22,edge:true});
    lines.forEach((line,i)=>{
      const y=firstBaseline+i*lineH;
      const color=i===0?'#FFD15C':'#542B3C';
      // Layered offset lettering creates a visible extruded 3D edge, not just a flat drop shadow.
      paper.text(line,{x:left+padX+18,y:y+18},{font,color:'#321B2A'});
      paper.text(line,{x:left+padX+12,y:y+12},{font,color:'#713B49'});
      paper.text(line,{x:left+padX+6,y:y+6},{font,color:'#A34F55'});
      ctx.save();ctx.font=font;ctx.textBaseline='alphabetic';ctx.textAlign='left';
      ctx.lineJoin='round';ctx.lineWidth=Math.max(7,size*.035);ctx.strokeStyle='rgba(61,27,42,.95)';ctx.strokeText(line,left+padX,y);
      ctx.restore();
      paper.text(line,{x:left+padX,y},{font,color});
    });
  });
}
function drawNokiaComparison():void {
  // Left: recognizable classic Nokia candybar handset with screen, navigation key and physical keypad.
  paper.sheet({shadow:34,texture:.28,edge:true,rim:{color:'rgba(255,255,255,.42)',width:5},shade:{color:'rgba(5,12,18,.35)',width:8}},()=>{
    paper.blob(polygon([[2160,570],[2280,500],[2630,530],[2720,650],[2690,1460],[2580,1580],[2210,1550],[2110,1440],[2110,700]]),'#27323A',{seed:801,tear:5,shadow:0,texture:.22});
    paper.blob(polygon([[2205,660],[2610,650],[2620,1000],[2195,1010]]),'#AAB4A7',{seed:802,tear:3,shadow:0,texture:.12});
    paper.blob(polygon([[2235,695],[2580,690],[2585,955],[2225,960]]),'#8DA58F',{seed:803,tear:2,shadow:0,texture:.08});
    paper.blob(polygon([[2260,1050],[2580,1040],[2600,1430],[2240,1440]]),'#35434A',{seed:804,tear:4,shadow:0,texture:.18});
  });
  ctx.save();
  // Screen details and the classic physical keypad.
  ctx.fillStyle='rgba(25,48,43,.9)';ctx.font='700 54px "Noto Sans",sans-serif';ctx.textAlign='center';ctx.fillText('NOKIA',2405,790);
  ctx.fillStyle='rgba(230,240,211,.9)';ctx.font='500 28px "Noto Sans",sans-serif';ctx.fillText('Connecting people',2405,842);
  ctx.fillStyle='#C9D0C5';ctx.beginPath();ctx.roundRect(2310,1015,190,78,22);ctx.fill();ctx.fillStyle='#25313A';ctx.beginPath();ctx.arc(2405,1054,30,0,Math.PI*2);ctx.fill();
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const x=2265+col*105,y=1140+row*78;ctx.fillStyle='#9DA7A2';ctx.beginPath();ctx.roundRect(x,y,82,54,16);ctx.fill();
    ctx.fillStyle='#27323A';ctx.font='700 27px "Noto Sans",sans-serif';ctx.textAlign='center';ctx.fillText(String(row*3+col+1),x+41,y+36);
  }
  ctx.restore();
  // Right: intentionally anonymous, almost-black modern phone. Defocus and low contrast conceal its identity.
  ctx.save();ctx.shadowColor='rgba(0,0,0,.72)';ctx.shadowBlur=48;ctx.shadowOffsetY=30;
  const grad=ctx.createLinearGradient(2920,520,3450,1580);grad.addColorStop(0,'#17191D');grad.addColorStop(.5,'#08090C');grad.addColorStop(1,'#202126');
  ctx.fillStyle=grad;ctx.globalAlpha=.88;ctx.beginPath();ctx.roundRect(2940,520,520,1080,82);ctx.fill();ctx.restore();
  ctx.save();ctx.filter='blur(11px)';ctx.globalAlpha=.35;
  ctx.fillStyle='#565A62';ctx.beginPath();ctx.roundRect(2990,570,165,170,34);ctx.fill();
  for(const [x,y] of [[3035,615],[3110,615],[3035,685]]){ctx.fillStyle='#0A0B0E';ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  // Large question mark is the only crisp clue on the obscured phone.
  ctx.save();ctx.shadowColor='rgba(255,210,100,.75)';ctx.shadowBlur=42;ctx.fillStyle='#F7E7C8';
  ctx.font='900 390px "Noto Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',3200,1080);ctx.restore();
  blob([[2800,1630],[3500,1590],[3610,1710],[3490,1840],[2860,1810]],'#D5B3A7',805,20,7);
  ctx.save();ctx.font='700 48px "Noto Sans",sans-serif';ctx.fillStyle='#542B3C';ctx.textAlign='center';ctx.fillText('QUÁ KHỨ',2400,1790);ctx.fillText('TƯƠNG LAI?',3200,1790);ctx.restore();
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
  if(/\\bNOKIA\\b/i.test(input.title)) drawNokiaComparison();
  else if(input.imageDataUrl){
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
