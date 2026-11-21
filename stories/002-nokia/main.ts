import {
  Mixer, Stage, Camera, fillGradient, tearWipe, ramp, vignette, grain, circlePoly,
  instrument, note, triad, drawProps, drawRidge, drawSky, blink,
  type Paper, type RidgeSpec, type Stereo,
} from '../../src';
import { createCitySkyline, createGrassland, meadowWind, nightSky } from '../shared/environment';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';
import { STORY_TIMING } from './voiceoverTiming';

const W = 1920, H = 1080, DURATION = STORY_TIMING.duration_sec;
const TEXT_SAFE_ZONE = { left: 80, right: 780, top: 70, bottom: 440 };
const PROP_SAFE_LEFT = TEXT_SAFE_ZONE.right + 20;

function sceneIndexAt(t: number): number {
  let index = 0;
  for (let i = 1; i < STORY_TIMING.lines.length; i++) {
    if (t >= STORY_TIMING.lines[i].start_sec) index = i;
    else break;
  }
  return Math.min(STORY_TIMING.lines.length - 1, index);
}
const TITLES = [
  'MỘT THỜI NOKIA THỐNG TRỊ','CHIẾC ĐIỆN THOẠI QUỐC DÂN','NGƯỜI KHỔNG LỒ TRÊN ĐỈNH CAO',
  'RỒI IPHONE XUẤT HIỆN','ANDROID THAY ĐỔI CUỘC CHƠI','SYMBIAN BẮT ĐẦU CHẬM LẠI',
  'NOKIA ĐỨNG TRƯỚC LỰA CHỌN','CANH BẠC WINDOWS PHONE','MỘT THƯƠNG VỤ KHÉP LẠI KỶ NGUYÊN',
  'NOKIA KHÔNG BIẾN MẤT',
  'NHỮNG NỖ LỰC CUỐI CÙNG',
  'BỘ MÁY BÊN TRONG CHẬM LẠI',
  'ĐỐI THỦ TĂNG TỐC',
  'THAY ĐỔI TỪ TRÊN ĐỈNH',
  'LỜI CẢNH BÁO CUỐI CÙNG',
];
const SUBTITLES = [
  'Từ biểu tượng điện thoại đến cú trượt dài\ntrong kỷ nguyên smartphone',
  '3310, 1110, 1200 — ký ức của cả một thế hệ',
  'Năm 2007: khoảng 437 triệu thiết bị di động được bán ra',
  'Năm 2007, chiếc iPhone đầu tiên mở ra một cách dùng điện thoại mới',
  'Cuộc đua chuyển từ phần cứng sang hệ sinh thái',
  'Một nền tảng thành công không đồng nghĩa sẽ mãi phù hợp',
  'Năm 2011, Nokia phải chọn một con đường mới',
  'Lumia đẹp, nhưng ứng dụng và hệ sinh thái là bài toán khác',
  'Microsoft hoàn tất thương vụ vào tháng 4 năm 2014',
  'Một công ty có thể đổi hướng, nhưng ký ức thì còn ở lại',
  'N97 và N8 cho thấy nỗ lực đổi mới phần cứng của Nokia',
  'Cấu trúc phát triển phức tạp khiến quyết định đến chậm',
  'Apple và Android liên tục mở rộng khoảng cách',
  'Stephen Elop tiếp quản Nokia trong giai đoạn khó khăn',
  'Burning Platform cảnh báo một cuộc khủng hoảng chiến lược',
];
const PALETTES: [string,string][] = [
  ['#23344a','#d2a77d'],['#e7d7bd','#b7c9c3'],['#d8e2df','#a9b9aa'],['#111827','#34425c'],
  ['#d8eadc','#8eb6a0'],['#d9d7c9','#8b9aa4'],['#342d38','#d27c50'],['#c9d8e4','#7d9bb3'],
  ['#d6d2ca','#818c9c'],['#e8dfd0','#aab7ad'],
  ['#c8d6d2','#758c8b'],['#d4d0c4','#8c8178'],['#d7e1e7','#899eae'],
  ['#d7c9b9','#9a8d85'],['#3a3540','#b16c4e'],
];


function wrapText(paper: Paper, value: string, size: number, maxWidth: number): string[] {
  const ctx = paper.context;
  ctx.save();
  ctx.font = `800 ${size}px "Be Vietnam Pro", sans-serif`;
  const lines: string[] = [];
  for (const paragraph of value.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
  }
  ctx.restore();
  return lines;
}

function outlinedText(paper: Paper, value: string, x: number, y: number, size: number, subtitle = false, maxWidth = 650): number {
  const ctx = paper.context;
  const lines = wrapText(paper, value, size, maxWidth);
  const lineHeight = Math.round(size * (subtitle ? 1.38 : 1.22));
  ctx.save();
  ctx.font = `800 ${size}px "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = subtitle ? 4.5 : 7;
  ctx.strokeStyle = '#17151a';
  ctx.fillStyle = '#fff9ed';
  lines.forEach((line, i) => {
    const baseline = y + i * lineHeight;
    ctx.strokeText(line, x, baseline);
    ctx.fillText(line, x, baseline);
  });
  ctx.restore();
  return lines.length;
}

function rounded(paper: Paper, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string): void {
  const ctx = paper.context;
  const rr = Math.min(r, w / 2, h / 2), pts: { x: number; y: number }[] = [];
  const corners = [
    { x: x + w - rr, y: y + rr, a: -Math.PI / 2 },
    { x: x + w - rr, y: y + h - rr, a: 0 },
    { x: x + rr, y: y + h - rr, a: Math.PI / 2 },
    { x: x + rr, y: y + rr, a: Math.PI },
  ];
  for (const c of corners) for (let i = 0; i <= 4; i++) {
    const a = c.a + i / 4 * Math.PI / 2;
    pts.push({ x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr });
  }
  const seed = Math.abs(Math.round(x * 13 + y * 7 + w * 3 + h * 5)) + 1;
  paper.piece(pts, fill, { seed, tear: 2.4, shadow: 7, texture: 0.42 });
  if (stroke) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath(); ctx.lineWidth = 3; ctx.strokeStyle = stroke; ctx.stroke(); ctx.restore();
  }
}
function phone(paper: Paper, x: number, y: number, scale: number, color: string, smart=false): void {
  paper.sheet({
    shadow: 12,
    rim: { color: 'rgba(255,244,224,0.8)', width: 2.5 },
    shade: { color: 'rgba(22,26,30,0.32)', width: 4 },
    texture: 0.5,
  }, () => {
    const ctx = paper.context;
    ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
    rounded(paper,0,0,220,390,30,color,'#30343a');
    rounded(paper,18,38,184,smart?270:190,12,smart?'#263b50':'#b8d1c1');
    if (smart) {
      const colors=['#e7a45d','#8bb5a0','#d17b67','#7b91b8','#d7bd76','#9d86a8'];
      for(let i=0;i<6;i++) rounded(paper,31+(i%3)*55,55+Math.floor(i/3)*76,42,58,7,colors[i]);
    } else {
      ctx.fillStyle='#263d35'; ctx.font='bold 31px monospace'; ctx.textAlign='center';
      ctx.fillText('NOKIA',110,125); ctx.font='23px monospace'; ctx.fillText('12:08',110,165);
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) paper.piece(
        circlePoly({x:62+j*48,y:270+i*35},12,14),'#d8d8d0',{seed:8100+i*3+j,tear:1.2,shadow:2},
      );
    }
    rounded(paper,78,smart?330:250,64,18,9,'#d6d8d6');
    ctx.restore();
  });
}

/**
 * Fly a torn-paper sheet into a prop group. Direction is deterministic per prop,
 * so the scene feels varied but renders identically on every frame and machine.
 */
function paperFlyIn(
  paper: Paper, t: number, at: number, duration: number,
  bounds: { x: number; y: number; w: number; h: number },
  draw: () => void, seed: number,
): void {
  if (bounds.x < PROP_SAFE_LEFT) throw new Error('Prop reveal enters the protected title/subtitle column.');
  const progress = Math.max(0, Math.min(1, (t - at) / duration));
  if (progress <= 0) return;
  if (progress >= 1) { draw(); return; }
  const { x, y, w, h } = bounds;
  const ctx = paper.context;
  const mode = seed % 4;
  const vertical = mode >= 2;
  const reverse = mode === 1 || mode === 3;
  const edge = Array.from({ length: 17 }, (_, i) => {
    const along = i / 16;
    const wobble = Math.sin(i * 1.91 + seed) * 7 + Math.sin(i * 0.63 + seed * 0.7) * 4;
    return vertical
      ? { x: x + along * w, y: y + (reverse ? 1 - progress : progress) * h + wobble }
      : { x: x + (reverse ? 1 - progress : progress) * w + wobble, y: y + along * h };
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(PROP_SAFE_LEFT, 0, W - PROP_SAFE_LEFT, H);
  ctx.clip();
  ctx.beginPath();
  if (!vertical && !reverse) {
    ctx.moveTo(x - 18, y - 18); ctx.lineTo(edge[0].x, edge[0].y);
    for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.lineTo(x - 18, y + h + 18);
  } else if (!vertical && reverse) {
    ctx.moveTo(x + w + 18, y - 18); ctx.lineTo(edge[0].x, edge[0].y);
    for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.lineTo(x + w + 18, y + h + 18);
  } else if (vertical && !reverse) {
    ctx.moveTo(x - 18, y - 18); ctx.lineTo(x + w + 18, y - 18);
    ctx.lineTo(edge[edge.length - 1].x, edge[edge.length - 1].y);
    for (let i = edge.length - 2; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
  } else {
    ctx.moveTo(x - 18, y + h + 18); ctx.lineTo(x + w + 18, y + h + 18);
    ctx.lineTo(edge[edge.length - 1].x, edge[edge.length - 1].y);
    for (let i = edge.length - 2; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
  }
  ctx.closePath(); ctx.clip(); draw(); ctx.restore();
  const flapDistance = (1 - progress) * 64 + 8;
  const flap = edge.map(p => ({
    x: Math.max(PROP_SAFE_LEFT + 4, p.x + (vertical ? 0 : reverse ? flapDistance : -flapDistance)),
    y: p.y + (vertical ? reverse ? -flapDistance : flapDistance : 0),
  }));
  paper.piece([...edge, ...flap.reverse()], '#f3ecdf', { seed, tear: 3.6, shadow: 12, texture: 0.48 });
  if (progress < 0.88) {
    for (let i = 0; i < 2; i++) {
      const p = edge[Math.min(15, 3 + i * 9)];
      const drift = (1 - progress) * (34 + i * 16);
      const cx = Math.max(PROP_SAFE_LEFT + 16, p.x + (vertical ? (i ? 1 : -1) * drift : reverse ? drift : -drift));
      const cy = p.y + (vertical ? reverse ? -drift : drift : (i ? 1 : -1) * drift * 0.45);
      paper.piece([{ x: cx - 14, y: cy - 5 }, { x: cx + 13, y: cy - 9 }, { x: cx + 9, y: cy + 8 }, { x: cx - 11, y: cy + 6 }], '#eee5d6', { seed: seed + i + 1, tear: 3.2, shadow: 7, texture: 0.5 });
    }
  }
}
export class NokiaPilotScene extends Stage {
  private readonly skyline: ReturnType<typeof createCitySkyline>;
  private readonly ridges: RidgeSpec[];
  private readonly camera: Camera;
  private readonly cat: Cat;
  private readonly dayEnvironment: ReturnType<typeof createGrassland>;
  private readonly nightEnvironment: ReturnType<typeof createGrassland>;
  private readonly stars = nightSky(8100, { x: 960, y: 620 });
  private lastScene = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas,{duration:DURATION,preroll:0.5,fps:30});
    this.paper.light={x:-0.6,y:0.8};
    this.paper.edgeColor='rgba(255,246,232,0.28)';
    this.paper.shadowColor='rgba(24,18,24,0.34)';
    this.world.ground=()=>890;
    this.world.wind=meadowWind(8101,0.22);
    this.cat=new Cat(this.world,470,890,SIGNATURE_CAT_LOOK);
    this.dayEnvironment=createGrassland(8102,-1600,6200,()=>890,{
      sky:'#9fc5dc',cloud:'#fff8ec',cloudShade:'#d6e4e8',farHill:'#91a9a0',midHill:'#748f7c',nearHill:'#526c58',ground:'#465b42',
      grass:[['#435b3d','#7d9556'],['#536d43','#9eaa63']],treeTrunk:'#6a503e',treeLeaves:['#607b4d','#7f995c','#a2ad69'],treeLight:'#f6d9a1',
      flowers:['#fff4df','#f3d8a4','#e6a56e'],rock:['#a99a82','#8f8779'],
    });
    this.nightEnvironment=createGrassland(8112,-1600,6200,()=>890,{
      sky:'#111a31',cloud:'#35415b',cloudShade:'#202b43',farHill:'#29334b',midHill:'#202b40',nearHill:'#182338',ground:'#111a2a',
      grass:[['#172238','#29334a'],['#1d2a3d','#354157']],treeTrunk:'#242b3d',treeLeaves:['#26334a','#303b52','#3a4358'],treeLight:'#69758a',
      flowers:['#8d91a7','#727e9b','#a18e9c'],rock:['#30394b','#252f42'],
    });
    this.camera=new Camera(W/2,{width:W,height:H,stiffness:4,damping:4,handheld:0});
    this.camera.zoom=1.15;
    this.camera.cut({x:W/2,y:H/2,zoom:1.15,handheld:0});
    this.skyline=createCitySkyline(5100,-700,2700,{
      far:['#aab4b0','#a0aca8'],mid:['#788b88','#82918c'],near:['#53696b','#5e7472'],
      farWindow:'#e8d4a7',midWindow:'#e8c78b',nearWindow:'#f0d49a',
    });
    const earth=['#b7a38a','#b9a18a','#9ca9a0','#29374b','#8eaa9a','#a9aaa0','#9d8270','#8fa7b8','#9da7a5','#b5a58f','#9ba99f','#a99b8c','#8ea3ad','#a99b91','#473e49'];
    this.ridges=earth.map((color,i)=>({seed:6200+i,base:835,amp:32,freq:0.0018+i*0.00003,color,tear:3,shadow:8}));
  }

  protected update(t:number,dt:number):void {
    const scene=sceneIndexAt(t);
    Object.assign(this.cat.intent,CAT_REST,{speed:scene===14?26:82,tail:0.82,blink:blink(t,[1.1,4.8,8.5,13.2,18.7,24.1,31.5,38.4,47.2,56.8,65.3,74.6,83.1,92.2]),look:{x:this.cat.x+220,y:560}});
    if(scene!==this.lastScene){
      if(!this.cat.airborne)this.cat.jump({x:this.cat.x+265,y:890},145);
      this.lastScene=scene;
    }
    if(scene===14){const finalStart=STORY_TIMING.lines[STORY_TIMING.lines.length-1]?.start_sec ?? 0;this.cat.intent.speed=0;this.cat.intent.sit=ramp(t,finalStart+0.7,finalStart+3.7);this.cat.intent.look={x:this.cat.x+180,y:250};}
    this.cat.update(dt);
  }

  protected lateUpdate(t:number,dt:number):void {
    this.camera.update(this.cat.x+500,dt,t,610);
  }

  probe():Record<string,unknown>{
    const i=sceneIndexAt(this.time);
    return {...super.probe(),story:'nokia-pilot',scene:i+1,sceneTitle:TITLES[i]};
  }

  protected draw(t:number,frame:number):void {
    const index=sceneIndexAt(t),local=t-STORY_TIMING.lines[index].start_sec;
    if(index>0&&local<0.85){
      this.drawScene(index-1,t);
      tearWipe(this.ctx,ramp(local,0,0.85),()=>this.drawScene(index,t),{
        seed:2100+index*19,angle:index%2?Math.PI/2:0,tear:30,paper:'#f1eadc',
      });
    } else this.drawScene(index,t);
    vignette(this.ctx,[35,28,20],0.18,0.5);
    grain(this.ctx,frame,0.045);
  }

  private drawScene(index:number,t:number):void {
    const ctx=this.ctx,[top,bottom]=PALETTES[index];
    const paper=this.paper;
    const sceneLocal=t-STORY_TIMING.lines[index].start_sec;
    const beat=(segment:number,within=0)=>{const cue=STORY_TIMING.lines[index].segments[Math.min(segment,STORY_TIMING.lines[index].segments.length-1)];return cue.start_sec-STORY_TIMING.lines[index].start_sec+cue.duration_sec*within;};
    fillGradient(ctx,[[0,top],[1,bottom]]);
    const isNight = index===0 || index===3 || index===6;
    if(isNight){
      drawSky(ctx,this.stars,{t,turn:t*0.0015,twinkle:0.38});
      this.drawMoon(1500,250);
      this.camera.layer(paper,0.045,v=>drawProps(paper,this.nightEnvironment.clouds,v.from,v.to,()=>0,t));
    } else {
      this.camera.layer(paper,0.045,v=>drawProps(paper,this.dayEnvironment.clouds,v.from,v.to,()=>0,t));
    }
    paper.piece([{x:0,y:850},{x:W,y:850},{x:W,y:H+80},{x:0,y:H+80}],index===3?'#d8d7d2':'#d6c8b5',{seed:6300+index,tear:3,shadow:0,texture:0.35});
    this.camera.layer(paper,0.14,v=>drawProps(paper,this.skyline.far,v.from,v.to,()=>0,t));
    this.camera.layer(paper,0.4,v=>drawProps(paper,this.skyline.mid,v.from,v.to,()=>0,t));
    this.camera.layer(paper,0.8,v=>drawProps(paper,this.skyline.near,v.from,v.to,()=>0,t));
    this.camera.layer(paper,1,v=>drawRidge(paper,this.ridges[index],v.from,v.to,1120));
    ctx.globalAlpha=0.22+0.02*Math.sin(t*1.8);ctx.fillStyle='rgba(255,255,255,0.24)';ctx.beginPath();ctx.arc(1570,260,230,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    paper.piece([{x:0,y:870},{x:W,y:870},{x:W,y:H+20},{x:0,y:H+20}],'rgba(35,48,56,0.08)',{seed:6390+index,tear:1.5,shadow:0,texture:0.18});
    if(index===3) paper.piece([{x:0,y:820},{x:W,y:820},{x:W,y:1080},{x:0,y:1080}],'#f8f5ed',{seed:8403,tear:2.5,shadow:0,texture:0.35});
    const titleLines = outlinedText(paper,TITLES[index],110,142,52,false,650);
    outlinedText(paper,SUBTITLES[index],114,142+titleLines*64+10,27,true,650);

    // Both title and subtitle are protected together. Prop bounds, flying paper edges,
    // and their shadows remain to the right of the typography column.
    if(index===0){
      paperFlyIn(paper,sceneLocal,beat(0,0.72),0.9,{x:820,y:155,w:900,h:230},()=>{
        for(let col=0;col<4;col++)phone(paper,865+col*205,180,0.62,['#28343a','#47605c','#8b8e88','#394d63'][col]);
        rounded(paper,820,360,900,22,8,'#775b45');
      },8400);
      paperFlyIn(paper,sceneLocal,beat(1,0.62),0.9,{x:820,y:405,w:900,h:440},()=>{
        for(let col=0;col<4;col++)phone(paper,865+col*205,425,0.62,['#28343a','#47605c','#8b8e88','#394d63'][col]);
        rounded(paper,820,825,900,25,8,'#765b45');
      },8401);
    } else if(index===1){
      paperFlyIn(paper,sceneLocal,beat(0,0.75),0.8,{x:860,y:260,w:810,h:620},()=>{
        rounded(paper,870,650,780,36,12,'#8b6046');rounded(paper,930,680,34,190,8,'#76513e');rounded(paper,1550,680,34,190,8,'#76513e');
        phone(paper,1080,275,1.18,'#263b42');
      },8410);
      paperFlyIn(paper,sceneLocal,beat(1,0.70),0.7,{x:1370,y:340,w:280,h:210},()=>{
        rounded(paper,1370,350,250,180,18,'#263d35');
        outlinedText(paper,'SNAKE',1420,420,34);
        for(let i=0;i<7;i++)rounded(paper,1410+i*24,460+Math.sin(i*0.8)*18,18,18,4,'#9bcf82');
      },8411);
    } else if(index===2){
      paperFlyIn(paper,sceneLocal,beat(0,0.65),0.9,{x:820,y:345,w:900,h:470},()=>{
        rounded(paper,820,360,900,450,24,'#e9e4d8','#7c8985');
      },8420);
      paperFlyIn(paper,sceneLocal,beat(1,0.15),0.9,{x:865,y:420,w:810,h:380},()=>{
        for(let i=0;i<5;i++){rounded(paper,875+i*155,430,110,260,12,['#4b5d65','#788b82','#465b75','#9a8e7d','#536b60'][i]);rounded(paper,895+i*155,455,70,120,7,'#b9d1c7');}
        for(let i=0;i<4;i++){rounded(paper,900+i*190,760,150,80,8,'#b98d62');outlinedText(paper,'NOKIA',930+i*190,808,20);}
      },8421);
    } else if(index===3){
      paperFlyIn(paper,sceneLocal,beat(0,0.72),0.9,{x:1170,y:285,w:430,h:570},()=>{
        rounded(paper,1180,300,390,550,54,'#17191e','#747d8a');
        rounded(paper,1204,340,342,455,28,'#8db1c4');
        outlinedText(paper,'hello',1290,580,44);
        paper.piece(circlePoly({x:1375,y:820},18,18),'#f1f2f0',{seed:8203,tear:1.4,shadow:3});
      },8430);
      paperFlyIn(paper,sceneLocal,beat(1,0.15),0.6,{x:1310,y:875,w:180,h:70},()=>outlinedText(paper,'2007',1330,900,28),8431);
    } else if(index===4){
      paperFlyIn(paper,sceneLocal,beat(0,0.30),1.0,{x:885,y:295,w:825,h:535},()=>{
        const colors=['#7da98a','#d39a59','#7896b6','#b67d72','#8f82a8','#c3ad6d','#6d9c98','#b18d72','#8295a9'];
        for(let i=0;i<9;i++){rounded(paper,900+(i%3)*205,310+Math.floor(i/3)*175,165,140,18,colors[i]);paper.piece(circlePoly({x:982+(i%3)*205,y:380+Math.floor(i/3)*175},25,18),'rgba(255,255,255,0.8)',{seed:8300+i,tear:1.2,shadow:2});}
      },8440);
      paperFlyIn(paper,sceneLocal,beat(1,0.62),0.7,{x:1050,y:870,w:430,h:85},()=>outlinedText(paper,'ANDROID',1070,900,58),8441);
    } else if(index===5){
      paperFlyIn(paper,sceneLocal,beat(0,0.75),0.9,{x:1160,y:270,w:390,h:540},()=>phone(paper,1180,285,1.2,'#4c555a'),8450);
      paperFlyIn(paper,sceneLocal,beat(1,0.20),0.8,{x:1210,y:330,w:310,h:350},()=>{
        rounded(paper,1225,345,270,310,8,'#d4ddd5');
        for(let i=0;i<7;i++)rounded(paper,1245,365+i*39,230,29,5,i%2?'#a7b6b1':'#8ea69d');
      },8451);
      paperFlyIn(paper,sceneLocal,beat(1,0.78),0.7,{x:875,y:300,w:710,h:600},()=>{
        ctx.strokeStyle='#c16d4e';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(890,320);ctx.bezierCurveTo(1110,190,1050,780,1560,680);ctx.stroke();
        outlinedText(paper,'TOO COMPLEX?',900,820,40);
      },8452);
    } else if(index===6){
      paperFlyIn(paper,sceneLocal,beat(0,0.12),0.9,{x:840,y:350,w:880,h:440},()=>{
        rounded(paper,860,380,850,380,26,'#423e43');
        for(let i=0;i<5;i++)rounded(paper,920+i*145,500,110,170,10,'#d1c9b9');
      },8460);
      paperFlyIn(paper,sceneLocal,beat(1,0.42),0.8,{x:1000,y:125,w:360,h:280},()=>{
        paper.piece([{x:1020,y:380},{x:1130,y:140},{x:1240,y:380}],'#f2a45f',{seed:8406,tear:3,shadow:9,texture:0.4});
        outlinedText(paper,'NEW OS?',1260,285,42);
      },8461);
      paperFlyIn(paper,sceneLocal,beat(1,0.80),0.7,{x:1000,y:800,w:600,h:80},()=>outlinedText(paper,'WHICH WAY?',1030,840,34),8462);
    } else if(index===7){
      paperFlyIn(paper,sceneLocal,beat(0,0.18),0.9,{x:1000,y:260,w:600,h:550},()=>{
        phone(paper,1020,280,1.18,'#4b5d69',true);phone(paper,1370,340,0.95,'#263f54',true);
      },8470);
      paperFlyIn(paper,sceneLocal,beat(0,0.72),0.7,{x:870,y:770,w:760,h:190},()=>{
        outlinedText(paper,'WINDOWS PHONE',1120,900,42);rounded(paper,870,790,760,18,8,'#657d8a');
      },8471);
    } else if(index===8){
      paperFlyIn(paper,sceneLocal,beat(0,0.15),0.9,{x:885,y:310,w:810,h:490},()=>{
        rounded(paper,900,330,360,440,20,'#d8dedb','#667a82');
        rounded(paper,1320,330,360,440,20,'#d8dedb','#667a82');
        for(let i=0;i<8;i++)rounded(paper,930+(i%2)*165,380+Math.floor(i/2)*82,120,54,8,i%2?'#d9a46d':'#91aaa2');
      },8480);
      paperFlyIn(paper,sceneLocal,beat(1,0.22),0.7,{x:960,y:450,w:680,h:100},()=>{
        outlinedText(paper,'APP STORE',980,490,40);outlinedText(paper,'ECOSYSTEM',1350,490,36);
      },8481);
      paperFlyIn(paper,sceneLocal,beat(1,0.72),0.7,{x:1160,y:580,w:270,h:300},()=>{
        ctx.strokeStyle='#8a684e';ctx.lineWidth=34;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1170,610);ctx.lineTo(1380,610);ctx.stroke();
        outlinedText(paper,'2014',1190,850,36);
      },8482);
    } else if(index===9){
      // Scene 10 — Nokia remains in memory: an archival display, not a generic phone lineup.
      paperFlyIn(paper,sceneLocal,beat(0,0.65),0.9,{x:850,y:245,w:820,h:610},()=>{
        rounded(paper,870,265,780,560,24,'#8b725c','#5c5148');
        rounded(paper,900,295,720,500,12,'#e7dfd0','#a99a85');
        rounded(paper,930,325,660,420,8,'#c6b59b');
        for(let i=0;i<3;i++){
          rounded(paper,965+i*205,390,150,270,12,'#6d756e','#4a514d');
          rounded(paper,980+i*205,415,120,170,8,'#b8c9b7');
          outlinedText(paper,['3310','N95','LUMIA'][i],978+i*205,625,25);
        }
      },8490);
      paperFlyIn(paper,sceneLocal,beat(1,0.35),0.8,{x:1020,y:835,w:650,h:85},()=>{
        outlinedText(paper,'A PART OF OUR HISTORY',1040,890,34);
      },8491);
    } else if(index===10){
      // Scene 11 — N97 and N8: show the two distinct devices and their hardware features.
      paperFlyIn(paper,sceneLocal,beat(0,0.18),0.9,{x:850,y:240,w:820,h:600},()=>{
        rounded(paper,875,260,360,520,28,'#d7d1c4','#716e67');
        rounded(paper,1260,260,360,520,28,'#d7d1c4','#716e67');
        phone(paper,925,300,1.05,'#3c4b50',true);
        phone(paper,1310,300,1.05,'#56636a',true);
        rounded(paper,970,705,170,46,8,'#39474b');
        rounded(paper,1350,705,170,46,8,'#39474b');
        outlinedText(paper,'N97',1010,738,28);
        outlinedText(paper,'N8',1400,738,28);
      },8510);
      paperFlyIn(paper,sceneLocal,beat(1,0.35),0.7,{x:1040,y:835,w:610,h:90},()=>{
        // Camera lens detail calls out the hardware-first response.
        paper.piece(circlePoly({x:1160,y:870},35,28),'#26343a',{seed:8512,tear:2,shadow:7});
        paper.piece(circlePoly({x:1160,y:870},17,22),'#8fa6a5',{seed:8513,tear:1.3,shadow:2});
        outlinedText(paper,'BETTER HARDWARE',1220,884,30);
      },8511);
    } else if(index===11){
      // Scene 12 — slow internal coordination across product, software, QA and leadership.
      paperFlyIn(paper,sceneLocal,beat(0,0.12),0.9,{x:840,y:215,w:900,h:650},()=>{
        const nodes=[
          {x:900,y:300,w:260,h:130,label:'PRODUCT',color:'#b8a18a'},
          {x:1320,y:300,w:260,h:130,label:'SOFTWARE',color:'#8fa7b8'},
          {x:900,y:585,w:260,h:130,label:'TESTING',color:'#a3b39d'},
          {x:1320,y:585,w:260,h:130,label:'LEADERSHIP',color:'#c49b83'},
        ];
        ctx.save();ctx.strokeStyle='#6e6258';ctx.lineWidth=12;
        ctx.beginPath();ctx.moveTo(1160,365);ctx.lineTo(1320,365);ctx.moveTo(1030,430);ctx.lineTo(1030,585);ctx.moveTo(1450,430);ctx.lineTo(1450,585);ctx.moveTo(1160,650);ctx.lineTo(1320,650);ctx.stroke();ctx.restore();
        for(const n of nodes){
          rounded(paper,n.x,n.y,n.w,n.h,18,n.color,'#625b54');
          outlinedText(paper,n.label,n.x+24,n.y+78,27,false,n.w-42);
        }
        rounded(paper,1190,455,120,105,12,'#6c5b4e');
        outlinedText(paper,'WAIT',1205,520,25);
      },8520);
      paperFlyIn(paper,sceneLocal,beat(1,0.42),0.7,{x:980,y:835,w:700,h:80},()=>{
        outlinedText(paper,'DECISIONS ARRIVE TOO LATE',1000,885,30);
      },8521);
    } else if(index===12){
      // Scene 13 — competitors accelerate: one iPhone, an expanding Android field and app growth.
      paperFlyIn(paper,sceneLocal,beat(0,0.12),0.85,{x:850,y:235,w:870,h:610},()=>{
        rounded(paper,885,270,260,500,40,'#252b32','#77828a');
        rounded(paper,905,310,220,390,24,'#9eb8c5');
        outlinedText(paper,'iOS',970,535,48);
        const colors=['#7397b1','#8eaa91','#c18d72','#8c83a8','#c4ae75','#719c9a'];
        for(let i=0;i<6;i++){
          const x=1190+(i%3)*165,y=300+Math.floor(i/3)*230;
          rounded(paper,x,y,135,195,18,'#303b43');
          rounded(paper,x+10,y+12,115,165,10,colors[i]);
          for(let j=0;j<3;j++)rounded(paper,x+22+j*30,y+38,20,24,5,'#f1e8d9');
        }
        ctx.save();ctx.strokeStyle='#bd7957';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(1180,795);ctx.lineTo(1640,795);ctx.lineTo(1600,760);ctx.moveTo(1640,795);ctx.lineTo(1600,830);ctx.stroke();ctx.restore();
      },8530);
      paperFlyIn(paper,sceneLocal,beat(1,0.45),0.7,{x:1030,y:865,w:650,h:75},()=>{
        outlinedText(paper,'APPS • DEVICES • SPEED',1050,910,32);
      },8531);
    } else if(index===13){
      // Scene 14 — leadership transition in 2010; symbolic boardroom, no fabricated portrait.
      paperFlyIn(paper,sceneLocal,beat(0,0.12),0.9,{x:850,y:220,w:850,h:650},()=>{
        rounded(paper,900,260,760,390,18,'#b7aa99','#75695f');
        rounded(paper,930,290,700,330,8,'#d8d0c2');
        rounded(paper,1120,365,320,125,12,'#4d5b62');
        outlinedText(paper,'NOKIA',1200,445,48);
        // Anonymous executive silhouette seen from behind, deliberately not a real likeness.
        paper.piece(circlePoly({x:1280,y:555},52,32),'#4a4a4b',{seed:8540,tear:2.5,shadow:5});
        paper.piece([{x:1190,y:825},{x:1210,y:635},{x:1250,y:600},{x:1310,y:600},{x:1350,y:635},{x:1370,y:825}],'#394650',{seed:8541,tear:3,shadow:9,texture:0.5});
        for(let i=0;i<4;i++){
          rounded(paper,950+i*155,700,110,95,10,'#8d918a');
          paper.piece(circlePoly({x:1005+i*155,y:682},28,24),'#756e65',{seed:8542+i,tear:1.8,shadow:3});
        }
      },8543);
      paperFlyIn(paper,sceneLocal,beat(1,0.35),0.7,{x:1110,y:865,w:460,h:75},()=>{
        outlinedText(paper,'2010 • NEW CEO',1130,910,32);
      },8544);
    } else if(index===14){
      // Scene 15 — Burning Platform warning: a paper oil rig and a phone in the danger zone.
      paperFlyIn(paper,sceneLocal,beat(0,0.08),0.85,{x:850,y:185,w:900,h:700},()=>{
        rounded(paper,900,700,780,48,10,'#5b514c');
        // Platform legs and derrick.
        paper.piece([{x:1010,y:700},{x:1090,y:700},{x:1130,y:400},{x:1050,y:400}],'#5a6260',{seed:8550,tear:2.8,shadow:6});
        paper.piece([{x:1450,y:700},{x:1530,y:700},{x:1490,y:400},{x:1410,y:400}],'#5a6260',{seed:8551,tear:2.8,shadow:6});
        paper.piece([{x:1060,y:410},{x:1190,y:210},{x:1370,y:410}],'#6c716d',{seed:8552,tear:3,shadow:7});
        paper.piece([{x:1185,y:410},{x:1195,y:210},{x:1215,y:210},{x:1225,y:410}],'#555e5b',{seed:8553,tear:2,shadow:4});
        ctx.save();ctx.strokeStyle='#d77a43';ctx.lineWidth=25;ctx.lineCap='round';
        for(let i=0;i<5;i++){
          const x=1060+i*105,base=410+(i%2)*35;
          ctx.beginPath();ctx.moveTo(x,base);ctx.bezierCurveTo(x-55,base-70,x+50,base-105,x+8,base-190);ctx.stroke();
        }
        ctx.strokeStyle='#f1bd69';ctx.lineWidth=11;
        ctx.beginPath();ctx.moveTo(1150,385);ctx.bezierCurveTo(1100,320,1230,285,1200,205);ctx.stroke();ctx.restore();
        phone(paper,1500,455,0.65,'#313b43',true);
      },8554);
      paperFlyIn(paper,sceneLocal,beat(1,0.18),0.7,{x:890,y:875,w:800,h:70},()=>{
        rounded(paper,920,860,740,62,10,'#eee0c9','#a16a4b');
        outlinedText(paper,'BURNING PLATFORM',950,905,34);
      },8555);
    }
    this.camera.layer(paper,1,()=>this.cat.draw(paper));
  }

  private drawMoon(x:number,y:number):void {
    const ctx=this.ctx;
    const glow=ctx.createRadialGradient(x,y,70,x,y,390);
    glow.addColorStop(0,'rgba(238,232,205,0.30)');glow.addColorStop(1,'rgba(238,232,205,0)');
    ctx.fillStyle=glow;ctx.fillRect(x-410,y-410,820,820);
    this.paper.piece(circlePoly({x,y},98,44),'#fbf2d9',{seed:900,tear:2.5,shadow:0,texture:0.18});
    [[-28,-18,17],[25,20,22],[-8,42,12],[38,-32,9]].forEach(([dx,dy,r],i)=>this.paper.piece(circlePoly({x:x+dx,y:y+dy},r,16),'#e8dfc5',{seed:910+i,tear:1.1,shadow:0,edge:false}));
  }

  soundtrack(sampleRate:number):Stereo{
    const mix=new Mixer(this.videoLength,sampleRate)
      .bus('music',{gain:0.55,reverb:0.28})
      .bus('ambience',{gain:0.22,reverb:0.16});
    const roots=[note('C4'),note('A3'),note('F3'),note('G3')];
    for(let s=0;s<STORY_TIMING.lines.length;s++){
      const sceneStart=STORY_TIMING.lines[s].start_sec;
      const nextStart=STORY_TIMING.lines[s+1]?.start_sec ?? DURATION;
      const sceneDuration=Math.max(0.1,nextStart-sceneStart);
      const root=roots[Math.floor(s/3)%roots.length];
      for(const [i,n] of triad(root,'major',0).entries()){
        mix.add('music',sceneStart,instrument.pad(n-12,sceneDuration,sampleRate,{
          seed:2400+s*7+i,cutoff:s>=6?560:920,attack:0.9,release:1.1,
        }),{gain:0.12,pan:(i-1)*0.32});
      }
      mix.add('music',sceneStart+0.7,instrument.harp(root+12,sampleRate,{seed:2600+s,decay:1.05}),{gain:0.11,pan:s%2?0.25:-0.25});
      if(sceneDuration>4.5)mix.add('music',sceneStart+4.2,instrument.harp(root+19,sampleRate,{seed:2700+s,decay:0.72}),{gain:0.065,pan:s%2?-0.2:0.2});
      mix.add('ambience',sceneStart,instrument.pad(root-24,sceneDuration,sampleRate,{seed:2800+s,cutoff:420,attack:0.8,release:0.8}),{gain:0.075});
      if(s===0||s===1||s===3||s===6||s===7||s===9)mix.add('ambience',sceneStart+0.18,instrument.chime(root+24,sampleRate),{gain:0.09,pan:0.2});
    }
    return mix.render({reverb:{room:0.58,damp:0.62},master:-2,ceiling:-1,fadeIn:0.8,fadeOut:1.5});
  }
}
