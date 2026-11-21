import {
  Mixer, Stage, Camera, fillGradient, tearWipe, ramp, vignette, grain, circlePoly,
  instrument, note, triad, drawProps, drawRidge, drawSky, blink,
  type Paper, type RidgeSpec, type Stereo,
} from '../../src';
import { createCitySkyline, createGrassland, meadowWind, nightSky } from '../shared/environment';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';

const W = 1920, H = 1080, SCENE_SECONDS = 9.2, DURATION = 100;
const TITLES = [
  'MỘT THỜI NOKIA THỐNG TRỊ','CHIẾC ĐIỆN THOẠI QUỐC DÂN','NGƯỜI KHỔNG LỒ TRÊN ĐỈNH CAO',
  'RỒI IPHONE XUẤT HIỆN','ANDROID THAY ĐỔI CUỘC CHƠI','SYMBIAN BẮT ĐẦU CHẬM LẠI',
  'NOKIA ĐỨNG TRƯỚC LỰA CHỌN','CANH BẠC WINDOWS PHONE','MỘT THƯƠNG VỤ KHÉP LẠI KỶ NGUYÊN',
  'NOKIA KHÔNG BIẾN MẤT',
];
const SUBTITLES = [
  'Từ biểu tượng điện thoại đến cú trượt dài trong kỷ nguyên smartphone',
  '3310, 1110, 1200 — ký ức của cả một thế hệ',
  'Năm 2007: khoảng 437 triệu thiết bị di động được bán ra',
  'Năm 2007, chiếc iPhone đầu tiên mở ra một cách dùng điện thoại mới',
  'Cuộc đua chuyển từ phần cứng sang hệ sinh thái',
  'Một nền tảng thành công không đồng nghĩa sẽ mãi phù hợp',
  'Năm 2011, Nokia phải chọn một con đường mới',
  'Lumia đẹp, nhưng ứng dụng và hệ sinh thái là bài toán khác',
  'Microsoft hoàn tất thương vụ vào tháng 4 năm 2014',
  'Một công ty có thể đổi hướng, nhưng ký ức thì còn ở lại',
];
const PALETTES: [string,string][] = [
  ['#23344a','#d2a77d'],['#e7d7bd','#b7c9c3'],['#d8e2df','#a9b9aa'],['#111827','#34425c'],
  ['#d8eadc','#8eb6a0'],['#d9d7c9','#8b9aa4'],['#342d38','#d27c50'],['#c9d8e4','#7d9bb3'],
  ['#d6d2ca','#818c9c'],['#e8dfd0','#aab7ad'],
];


function wrapText(paper: Paper, value: string, size: number, maxWidth: number): string[] {
  const ctx = paper.context;
  ctx.save();
  ctx.font = `800 ${size}px "Be Vietnam Pro", sans-serif`;
  const words = value.split(/\\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
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
 * Reveal a prop group with a local torn-paper edge.
 * All prop bounds stay to the right of the fixed title/subtitle safe zone.
 * Once revealed, the group remains drawn for the rest of the scene.
 */
function tornReveal(
  paper: Paper, t: number, at: number, duration: number,
  bounds: { x: number; y: number; w: number; h: number },
  draw: () => void, seed: number,
): void {
  const progress = Math.max(0, Math.min(1, (t - at) / duration));
  if (progress <= 0) return;
  if (progress >= 1) { draw(); return; }

  const { x, y, w, h } = bounds;
  const ctx = paper.context;
  const edge = Array.from({ length: 17 }, (_, i) => {
    const yy = y + (i / 16) * h;
    const wobble = Math.sin(i * 1.91 + seed) * 7 + Math.sin(i * 0.63 + seed * 0.7) * 4;
    return { x: x + w * progress + wobble, y: yy };
  });

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 16);
  ctx.lineTo(edge[0].x, edge[0].y);
  for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i].x, edge[i].y);
  ctx.lineTo(x - 16, y + h + 16);
  ctx.closePath();
  ctx.clip();
  draw();
  ctx.restore();

  const strip = [...edge, ...edge.slice().reverse().map(p => ({ x: p.x + 13, y: p.y }))];
  paper.piece(strip, '#f3ecdf', { seed, tear: 2.8, shadow: 8, texture: 0.32 });
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
    const earth=['#b7a38a','#b9a18a','#9ca9a0','#29374b','#8eaa9a','#a9aaa0','#9d8270','#8fa7b8','#9da7a5','#b5a58f'];
    this.ridges=earth.map((color,i)=>({seed:6200+i,base:835,amp:32,freq:0.0018+i*0.00003,color,tear:3,shadow:8}));
  }

  protected update(t:number,dt:number):void {
    const scene=Math.min(9,Math.floor(t/SCENE_SECONDS));
    Object.assign(this.cat.intent,CAT_REST,{speed:scene===9?26:82,tail:0.82,blink:blink(t,[1.1,4.8,8.5,13.2,18.7,24.1,31.5,38.4,47.2,56.8,65.3,74.6,83.1,92.2]),look:{x:this.cat.x+220,y:560}});
    if(scene!==this.lastScene){
      if(!this.cat.airborne)this.cat.jump({x:this.cat.x+265,y:890},145);
      this.lastScene=scene;
    }
    if(scene===9){this.cat.intent.speed=0;this.cat.intent.sit=ramp(t,92,95);this.cat.intent.look={x:this.cat.x+180,y:250};}
    this.cat.update(dt);
  }

  protected lateUpdate(t:number,dt:number):void {
    this.camera.update(this.cat.x+500,dt,t,610);
  }

  probe():Record<string,unknown>{
    const i=Math.min(9,Math.floor(this.time/SCENE_SECONDS));
    return {...super.probe(),story:'nokia-pilot',scene:i+1,sceneTitle:TITLES[i]};
  }

  protected draw(t:number,frame:number):void {
    const index=Math.min(9,Math.floor(t/SCENE_SECONDS)),local=t-index*SCENE_SECONDS;
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

    // Fixed text-safe zone: x=0..780. Prop groups enter only in x>=800,
    // are revealed on the spoken beat, and remain visible until the scene cut.
    if(index===0){
      tornReveal(paper,t,1.1,0.9,{x:820,y:155,w:900,h:230},()=>{
        for(let col=0;col<4;col++)phone(paper,865+col*205,180,0.62,['#28343a','#47605c','#8b8e88','#394d63'][col]);
        rounded(paper,820,360,900,22,8,'#775b45');
      },8400);
      tornReveal(paper,t,3.4,0.9,{x:820,y:405,w:900,h:440},()=>{
        for(let col=0;col<4;col++)phone(paper,865+col*205,425,0.62,['#28343a','#47605c','#8b8e88','#394d63'][col]);
        rounded(paper,820,825,900,25,8,'#765b45');
      },8401);
    } else if(index===1){
      tornReveal(paper,t,10.5,0.8,{x:860,y:260,w:810,h:620},()=>{
        rounded(paper,870,650,780,36,12,'#8b6046');rounded(paper,930,680,34,190,8,'#76513e');rounded(paper,1550,680,34,190,8,'#76513e');
        phone(paper,1080,275,1.18,'#263b42');
      },8410);
      tornReveal(paper,t,13.0,0.7,{x:1370,y:340,w:280,h:210},()=>{
        rounded(paper,1370,350,250,180,18,'#263d35');
        outlinedText(paper,'SNAKE',1420,420,34);
        for(let i=0;i<7;i++)rounded(paper,1410+i*24,460+Math.sin(i*0.8)*18,18,18,4,'#9bcf82');
      },8411);
    } else if(index===2){
      tornReveal(paper,t,20.0,0.9,{x:820,y:345,w:900,h:470},()=>{
        rounded(paper,820,360,900,450,24,'#e9e4d8','#7c8985');
      },8420);
      tornReveal(paper,t,22.4,0.9,{x:865,y:420,w:810,h:380},()=>{
        for(let i=0;i<5;i++){rounded(paper,875+i*155,430,110,260,12,['#4b5d65','#788b82','#465b75','#9a8e7d','#536b60'][i]);rounded(paper,895+i*155,455,70,120,7,'#b9d1c7');}
        for(let i=0;i<4;i++){rounded(paper,900+i*190,760,150,80,8,'#b98d62');outlinedText(paper,'NOKIA',930+i*190,808,20);}
      },8421);
    } else if(index===3){
      tornReveal(paper,t,29.0,0.9,{x:1170,y:285,w:430,h:570},()=>{
        rounded(paper,1180,300,390,550,54,'#17191e','#747d8a');
        rounded(paper,1204,340,342,455,28,'#8db1c4');
        outlinedText(paper,'hello',1290,580,44);
        paper.piece(circlePoly({x:1375,y:820},18,18),'#f1f2f0',{seed:8203,tear:1.4,shadow:3});
      },8430);
      tornReveal(paper,t,30.1,0.6,{x:1310,y:875,w:180,h:70},()=>outlinedText(paper,'2007',1330,900,28),8431);
    } else if(index===4){
      tornReveal(paper,t,38.2,1.0,{x:885,y:295,w:825,h:535},()=>{
        const colors=['#7da98a','#d39a59','#7896b6','#b67d72','#8f82a8','#c3ad6d','#6d9c98','#b18d72','#8295a9'];
        for(let i=0;i<9;i++){rounded(paper,900+(i%3)*205,310+Math.floor(i/3)*175,165,140,18,colors[i]);paper.piece(circlePoly({x:982+(i%3)*205,y:380+Math.floor(i/3)*175},25,18),'rgba(255,255,255,0.8)',{seed:8300+i,tear:1.2,shadow:2});}
      },8440);
      tornReveal(paper,t,42.1,0.7,{x:1050,y:870,w:430,h:85},()=>outlinedText(paper,'ANDROID',1070,900,58),8441);
    } else if(index===5){
      tornReveal(paper,t,47.2,0.9,{x:1160,y:270,w:390,h:540},()=>phone(paper,1180,285,1.2,'#4c555a'),8450);
      tornReveal(paper,t,50.0,0.8,{x:1210,y:330,w:310,h:350},()=>{
        rounded(paper,1225,345,270,310,8,'#d4ddd5');
        for(let i=0;i<7;i++)rounded(paper,1245,365+i*39,230,29,5,i%2?'#a7b6b1':'#8ea69d');
      },8451);
      tornReveal(paper,t,52.5,0.7,{x:875,y:300,w:710,h:600},()=>{
        ctx.strokeStyle='#c16d4e';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(890,320);ctx.bezierCurveTo(1110,190,1050,780,1560,680);ctx.stroke();
        outlinedText(paper,'TOO COMPLEX?',900,820,40);
      },8452);
    } else if(index===6){
      tornReveal(paper,t,56.5,0.9,{x:840,y:350,w:880,h:440},()=>{
        rounded(paper,860,380,850,380,26,'#423e43');
        for(let i=0;i<5;i++)rounded(paper,920+i*145,500,110,170,10,'#d1c9b9');
      },8460);
      tornReveal(paper,t,60.0,0.8,{x:1000,y:125,w:360,h:280},()=>{
        paper.piece([{x:1020,y:380},{x:1130,y:140},{x:1240,y:380}],'#f2a45f',{seed:8406,tear:3,shadow:9,texture:0.4});
        outlinedText(paper,'2011',1270,285,48);
      },8461);
      tornReveal(paper,t,61.2,0.7,{x:1000,y:800,w:600,h:80},()=>outlinedText(paper,'BURNING PLATFORM',1030,840,34),8462);
    } else if(index===7){
      tornReveal(paper,t,66.4,0.9,{x:1000,y:260,w:600,h:550},()=>{
        phone(paper,1020,280,1.18,'#4b5d69',true);phone(paper,1370,340,0.95,'#263f54',true);
      },8470);
      tornReveal(paper,t,69.2,0.7,{x:870,y:770,w:760,h:190},()=>{
        outlinedText(paper,'LUMIA',1160,900,52);rounded(paper,870,790,760,18,8,'#657d8a');
      },8471);
    } else if(index===8){
      tornReveal(paper,t,75.0,0.9,{x:885,y:310,w:810,h:490},()=>{
        rounded(paper,900,330,360,440,20,'#d8dedb','#667a82');
        rounded(paper,1320,330,360,440,20,'#d8dedb','#667a82');
      },8480);
      tornReveal(paper,t,77.5,0.7,{x:960,y:450,w:680,h:100},()=>{
        outlinedText(paper,'NOKIA',980,490,46);outlinedText(paper,'MICROSOFT',1350,490,38);
      },8481);
      tornReveal(paper,t,79.2,0.7,{x:1160,y:580,w:270,h:300},()=>{
        ctx.strokeStyle='#8a684e';ctx.lineWidth=34;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1170,610);ctx.lineTo(1380,610);ctx.stroke();
        outlinedText(paper,'2014',1190,850,36);
      },8482);
    } else {
      tornReveal(paper,t,84.0,0.9,{x:835,y:335,w:930,h:480},()=>{
        rounded(paper,850,355,900,440,28,'#e9e4d9','#8c938b');
      },8490);
      tornReveal(paper,t,85.0,1.0,{x:885,y:390,w:840,h:410},()=>{
        for(let i=0;i<4;i++)phone(paper,900+i*205,410,0.7,['#394a50','#4d6261','#7d7c70','#46596c'][i]);
      },8491);
      tornReveal(paper,t,87.0,0.7,{x:930,y:820,w:620,h:90},()=>outlinedText(paper,'A PART OF OUR HISTORY',950,850,36),8492);
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
    for(let s=0;s<10;s++){
      const sceneDuration=s===9?DURATION-s*SCENE_SECONDS:SCENE_SECONDS;
      const root=roots[Math.floor(s/3)%roots.length];
      for(const [i,n] of triad(root,'major',0).entries()){
        mix.add('music',s*SCENE_SECONDS,instrument.pad(n-12,sceneDuration,sampleRate,{
          seed:2400+s*7+i,cutoff:s>=6?560:920,attack:0.9,release:1.1,
        }),{gain:0.12,pan:(i-1)*0.32});
      }
      mix.add('music',s*SCENE_SECONDS+0.7,instrument.harp(root+12,sampleRate,{seed:2600+s,decay:1.05}),{gain:0.11,pan:s%2?0.25:-0.25});
      mix.add('music',s*SCENE_SECONDS+4.2,instrument.harp(root+19,sampleRate,{seed:2700+s,decay:0.72}),{gain:0.065,pan:s%2?-0.2:0.2});
      mix.add('ambience',s*SCENE_SECONDS,instrument.pad(root-24,sceneDuration,sampleRate,{seed:2800+s,cutoff:420,attack:0.8,release:0.8}),{gain:0.075});
      if(s===0||s===1||s===3||s===6||s===7||s===9)mix.add('ambience',s*SCENE_SECONDS+0.18,instrument.chime(root+24,sampleRate),{gain:0.09,pan:0.2});
    }
    return mix.render({reverb:{room:0.58,damp:0.62},master:-2,ceiling:-1,fadeIn:0.8,fadeOut:1.5});
  }
}
