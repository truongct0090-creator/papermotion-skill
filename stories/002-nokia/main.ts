import {
  Mixer, Stage, fillGradient, tearWipe, ramp, vignette, grain,
  instrument, note, triad, type Stereo,
} from '../../src';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';

const W = 1920, H = 1080, SCENE_SECONDS = 12, DURATION = 120;
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

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string): void {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fillStyle=fill; ctx.fill();
  if (stroke) { ctx.lineWidth=5; ctx.strokeStyle=stroke; ctx.stroke(); }
}
function phone(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string, smart=false): void {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  ctx.shadowColor='rgba(25,30,38,0.25)'; ctx.shadowBlur=24; ctx.shadowOffsetY=16;
  rounded(ctx,0,0,220,390,30,color,'#30343a'); ctx.shadowColor='transparent';
  rounded(ctx,18,38,184,smart?270:190,12,smart?'#263b50':'#b8d1c1');
  if (smart) {
    const colors=['#e7a45d','#8bb5a0','#d17b67','#7b91b8','#d7bd76','#9d86a8'];
    for(let i=0;i<6;i++) rounded(ctx,31+(i%3)*55,55+Math.floor(i/3)*76,42,58,7,colors[i]);
  } else {
    ctx.fillStyle='#263d35'; ctx.font='bold 31px monospace'; ctx.textAlign='center';
    ctx.fillText('NOKIA',110,125); ctx.font='23px monospace'; ctx.fillText('12:08',110,165);
    for(let i=0;i<3;i++) for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(62+j*48,270+i*35,12,0,Math.PI*2);ctx.fillStyle='#d8d8d0';ctx.fill();}
  }
  rounded(ctx,78,smart?330:250,64,18,9,'#d6d8d6'); ctx.restore();
}

export class NokiaPilotScene extends Stage {
  private readonly cat: Cat;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas,{duration:DURATION,preroll:0.5,fps:30});
    this.paper.light={x:-0.6,y:0.8};
    this.world.ground=()=>890;
    this.cat=new Cat(this.world,390,890,SIGNATURE_CAT_LOOK);
  }

  protected update(t:number,dt:number):void {
    Object.assign(this.cat.intent,CAT_REST,{speed:0,facing:1,tail:0.68+Math.sin(t*2.1)*0.13,blink:1});
    this.cat.update(dt);
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
    fillGradient(ctx,[[0,top],[1,bottom]]);
    ctx.fillStyle='rgba(255,255,255,0.24)';ctx.beginPath();ctx.arc(1570,260,230,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(35,48,56,0.08)';ctx.fillRect(0,870,W,210);
    ctx.textAlign='left';ctx.fillStyle='#26313a';ctx.font='bold 62px Arial';
    ctx.fillText(TITLES[index],110,150,1680);
    ctx.fillStyle='rgba(38,49,58,0.78)';ctx.font='32px Arial';ctx.fillText(SUBTITLES[index],114,208,1640);

    if(index===0){
      for(let row=0;row<2;row++){rounded(ctx,820,360+row*245,900,22,8,'#775b45');for(let col=0;col<4;col++)phone(ctx,865+col*205,180+row*245,0.62,['#28343a','#47605c','#8b8e88','#394d63'][col]);}
      rounded(ctx,780,825,1000,25,8,'#765b45');
    } else if(index===1){
      rounded(ctx,870,650,780,36,12,'#8b6046');rounded(ctx,930,680,34,190,8,'#76513e');rounded(ctx,1550,680,34,190,8,'#76513e');
      phone(ctx,1080,275,1.18,'#263b42');rounded(ctx,1370,350,250,180,18,'#263d35');
      ctx.fillStyle='#9bcf82';ctx.font='bold 38px monospace';ctx.fillText('SNAKE',1420,420);
      for(let i=0;i<7;i++)rounded(ctx,1410+i*24,460+Math.sin(i*0.8)*18,18,18,4,'#9bcf82');
    } else if(index===2){
      rounded(ctx,820,360,900,450,24,'#e9e4d8','#7c8985');
      for(let i=0;i<5;i++){rounded(ctx,875+i*155,430,110,260,12,['#4b5d65','#788b82','#465b75','#9a8e7d','#536b60'][i]);rounded(ctx,895+i*155,455,70,120,7,'#b9d1c7');}
      for(let i=0;i<4;i++){rounded(ctx,900+i*190,760,150,80,8,'#b98d62');ctx.fillStyle='#5a4638';ctx.font='bold 22px Arial';ctx.fillText('NOKIA',930+i*190,808);}
    } else if(index===3){
      ctx.fillStyle='#f8f5ed';ctx.fillRect(0,820,W,260);rounded(ctx,1180,300,390,550,54,'#17191e','#747d8a');
      rounded(ctx,1204,340,342,455,28,'#8db1c4');ctx.fillStyle='#e8f3f5';ctx.font='bold 52px Arial';ctx.fillText('hello',1290,580);
      ctx.fillStyle='#f1f2f0';ctx.beginPath();ctx.arc(1375,820,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 30px Arial';ctx.fillText('2007',1330,900);
    } else if(index===4){
      const colors=['#7da98a','#d39a59','#7896b6','#b67d72','#8f82a8','#c3ad6d','#6d9c98','#b18d72','#8295a9'];
      for(let i=0;i<9;i++){rounded(ctx,900+(i%3)*205,310+Math.floor(i/3)*175,165,140,18,colors[i]);ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.arc(982+(i%3)*205,380+Math.floor(i/3)*175,25,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#416e4d';ctx.font='bold 70px Arial';ctx.fillText('ANDROID',1070,900);
    } else if(index===5){
      phone(ctx,1180,285,1.2,'#4c555a');rounded(ctx,1225,345,270,310,8,'#d4ddd5');
      for(let i=0;i<7;i++)rounded(ctx,1245,365+i*39,230,29,5,i%2?'#a7b6b1':'#8ea69d');
      ctx.strokeStyle='#c16d4e';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(890,320);ctx.bezierCurveTo(1110,190,1050,780,1560,680);ctx.stroke();
      ctx.fillStyle='#9a4e42';ctx.font='bold 48px Arial';ctx.fillText('TOO COMPLEX?',900,820);
    } else if(index===6){
      rounded(ctx,860,380,850,380,26,'#423e43');for(let i=0;i<5;i++)rounded(ctx,920+i*145,500,110,170,10,'#d1c9b9');
      ctx.fillStyle='#f2a45f';ctx.beginPath();ctx.moveTo(1020,380);ctx.lineTo(1130,140);ctx.lineTo(1240,380);ctx.fill();
      ctx.fillStyle='#fff1d5';ctx.font='bold 56px Arial';ctx.fillText('2011',1270,285);
      ctx.fillStyle='#f7d2a3';ctx.font='bold 42px Arial';ctx.fillText('BURNING PLATFORM',1030,840);
    } else if(index===7){
      phone(ctx,1020,280,1.18,'#4b5d69',true);phone(ctx,1370,340,0.95,'#263f54',true);
      ctx.fillStyle='#344f64';ctx.font='bold 58px Arial';ctx.fillText('LUMIA',1160,900);rounded(ctx,870,790,760,18,8,'#657d8a');
    } else if(index===8){
      rounded(ctx,900,330,360,440,20,'#d8dedb','#667a82');rounded(ctx,1320,330,360,440,20,'#d8dedb','#667a82');
      ctx.fillStyle='#526b79';ctx.font='bold 54px Arial';ctx.fillText('NOKIA',980,490);ctx.fillStyle='#2f67a1';ctx.fillText('MICROSOFT',1350,490);
      ctx.strokeStyle='#8a684e';ctx.lineWidth=34;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1170,610);ctx.lineTo(1380,610);ctx.stroke();
      ctx.fillStyle='#354b5b';ctx.font='bold 40px Arial';ctx.fillText('2014',1190,850);
    } else {
      rounded(ctx,850,355,900,440,28,'#e9e4d9','#8c938b');
      for(let i=0;i<4;i++)phone(ctx,900+i*205,410,0.7,['#394a50','#4d6261','#7d7c70','#46596c'][i]);
      ctx.fillStyle='#465c61';ctx.font='bold 48px Arial';ctx.fillText('A PART OF OUR HISTORY',950,850);
    }
    this.cat.draw(this.paper);
  }

  soundtrack(sampleRate:number):Stereo{
    const mix=new Mixer(this.videoLength,sampleRate)
      .bus('music',{gain:0.55,reverb:0.28})
      .bus('ambience',{gain:0.18,reverb:0.12});
    const roots=[note('C4'),note('A3'),note('F3'),note('G3')];
    for(let s=0;s<10;s++){
      const root=roots[Math.floor(s/3)%roots.length];
      for(const [i,n] of triad(root,'major',0).entries()){
        mix.add('music',s*SCENE_SECONDS,instrument.pad(n-12,SCENE_SECONDS,sampleRate,{
          seed:2400+s*7+i,cutoff:s>=6?560:920,attack:0.9,release:1.1,
        }),{gain:0.12,pan:(i-1)*0.32});
      }
      mix.add('music',s*SCENE_SECONDS+1.1,instrument.harp(root+12,sampleRate,{seed:2600+s,decay:0.85}),{gain:0.12,pan:s%2?0.25:-0.25});
      if(s===0||s===3||s===6||s===9)mix.add('ambience',s*SCENE_SECONDS+0.2,instrument.chime(root+24,sampleRate),{gain:0.12,pan:0.2});
    }
    return mix.render({reverb:{room:0.58,damp:0.62},master:-2,ceiling:-1,fadeIn:0.8,fadeOut:1.5});
  }
}
