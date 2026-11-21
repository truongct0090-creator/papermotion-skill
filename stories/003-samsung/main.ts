import {
  Mixer, Stage, Camera, Beats, fillGradient, tearWipe, ramp, envelope, blink, vignette, grain,
  instrument, note, triad, type Stereo,
} from '../../src';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';

const W = 1920, H = 1080, SCENE_SECONDS = 12, DURATION = 120, SCENE_SPAN = 1780, GROUND_Y = 890;
type CatBeat = 'walk' | 'anticipate' | 'leap' | 'land';

const TITLES = [
  'TỪ CỬA HÀNG CÁ KHÔ ĐẾN GÃ KHỔNG LỒ CÔNG NGHỆ',
  'MỌI THỨ BẮT ĐẦU Ở DAEGU, NĂM 1938',
  'TỪ HÀNG HÓA ĐẾN MỘT ĐẾ CHẾ THƯƠNG MẠI',
  'SAU CHIẾN TRANH, SAMSUNG MỞ RỘNG LĨNH VỰC',
  'SAMSUNG BƯỚC VÀO NGÀNH ĐIỆN TỬ',
  'CHIẾC TV ĐEN TRẮNG ĐẦU TIÊN',
  'NHỮNG CHIẾC TV ĐẦU TIÊN VƯƠN RA THẾ GIỚI',
  'BƯỚC CHÂN ĐẦU TIÊN VÀO BÁN DẪN',
  'TỪ TV MÀU ĐẾN SẢN XUẤT QUY MÔ LỚN',
  'BÁN DẪN TRỞ THÀNH MỘT PHẦN CỐT LÕI',
];
const SUBTITLES = [
  'Một tập đoàn công nghệ từng khởi đầu bằng cá khô, rau củ và trái cây',
  'Ngày 1 tháng 3 năm 1938, Lee Byung-chul mở Samsung Sanghoe',
  'Những chuyến hàng nhỏ đặt nền móng cho tham vọng lớn',
  'Sau chiến tranh Triều Tiên, Samsung mở rộng sang dệt may, thực phẩm và nhiều lĩnh vực',
  'Năm 1969, Samsung Electronics chính thức được thành lập',
  'Năm 1970, Samsung-Sanyo bắt đầu sản xuất TV đen trắng',
  'Năm 1971, TV đen trắng Samsung được xuất khẩu sang Panama',
  'Năm 1974, Samsung mua 50% Korea Semiconductor',
  'Năm 1977, Samsung hoàn tất mua lại Korea Semiconductor và xuất khẩu TV màu',
  'Năm 1980, hoạt động bán dẫn được hợp nhất vào Samsung Electronics',
];
const PALETTES: [string,string][] = [
  ['#253447','#b88c68'],['#d9c7a8','#a88c6c'],['#d8d0b9','#78918a'],['#c8d6d0','#607d80'],
  ['#d5d5ce','#6d7c80'],['#b8cbd0','#456c82'],['#d7d1c2','#788b86'],['#d9e0d8','#738b85'],
  ['#c8d6d5','#5f7880'],['#d0d8dc','#536b80'],
];

function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string):void {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.lineWidth=5;ctx.strokeStyle=stroke;ctx.stroke();}
}
function label(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,size=30,color='#33434a'):void {
  ctx.fillStyle=color;ctx.font=`bold ${size}px "Noto Sans",Arial,sans-serif`;ctx.textAlign='center';ctx.fillText(text,x,y);
}
function phone(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,color:string,smart=false):void {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.shadowColor='rgba(25,30,38,.28)';ctx.shadowBlur=24;ctx.shadowOffsetY=16;
  rounded(ctx,0,0,220,390,30,color,'#30343a');ctx.shadowColor='transparent';
  rounded(ctx,18,38,184,smart?270:190,12,smart?'#263b50':'#b8d1c1');
  if(smart){
    const colors=['#e7a45d','#8bb5a0','#d17b67','#7b91b8','#d7bd76','#9d86a8'];
    for(let i=0;i<6;i++)rounded(ctx,31+(i%3)*55,55+Math.floor(i/3)*76,42,58,7,colors[i]);
  }else{
    ctx.fillStyle='#263d35';ctx.font='bold 31px monospace';ctx.textAlign='center';ctx.fillText('SAMSUNG',110,125);
    ctx.font='23px monospace';ctx.fillText('12:08',110,165);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(62+j*48,270+i*35,12,0,Math.PI*2);ctx.fillStyle='#d8d8d0';ctx.fill();}
  }
  rounded(ctx,78,smart?330:250,64,18,9,'#d6d8d6');ctx.restore();
}
function crate(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,text:string,color='#a7794f'):void {
  rounded(ctx,x,y,w,h,8,color,'#6f513a');ctx.strokeStyle='rgba(70,48,32,.35)';ctx.lineWidth=5;
  for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/4,y+5);ctx.lineTo(x+i*w/4,y+h-5);ctx.stroke();}
  label(ctx,text,x+w/2,y+h/2+10,24,'#fff1d6');
}

export class SamsungPilotScene extends Stage {
  private readonly cat:Cat;
  private readonly cam:Camera;
  private readonly beats:Beats<CatBeat>;
  private zoom=1.1;

  constructor(canvas:HTMLCanvasElement){
    super(canvas,{duration:DURATION,preroll:0.5,fps:30});
    this.paper.light={x:-0.6,y:0.8};
    this.world.ground=()=>GROUND_Y;
    this.cat=new Cat(this.world,340,GROUND_Y,SIGNATURE_CAT_LOOK);
    this.cam=new Camera(600,{width:W,height:H,stiffness:4,damping:4,handheld:1.5});
    this.cam.zoom=this.zoom;
    this.cam.snap(600,590);
    this.beats=this.choreograph();
  }

  /** Reuse Rooftops' Cat rig, Beats choreography, ballistic Leap and spring camera. */
  private choreograph():Beats<CatBeat>{
    const cat=this.cat, intent=()=>cat.intent;
    return new Beats<CatBeat>('walk',{
      walk:{
        during:()=>{intent().speed=145;intent().facing=1;intent().tail=0.82;intent().look={x:cat.x+260,y:GROUND_Y-150};},
        next:({t})=>{const scene=Math.floor(t/SCENE_SECONDS);return scene<9&&t-scene*SCENE_SECONDS>=10.82?'anticipate':false;},
      },
      anticipate:{
        during:({since})=>{intent().speed=0;intent().crouch=ramp(since,0,0.24);intent().wiggle=envelope(since,0.02,0.08,0.18,0.24);intent().tail=0.22;intent().look={x:cat.x+250,y:GROUND_Y-130};},
        after:0.28,then:'leap',
      },
      leap:{
        enter:()=>cat.jump({x:cat.x+230,y:GROUND_Y},125),
        during:()=>{intent().speed=0;intent().tail=0.32;intent().look={x:cat.x+230,y:GROUND_Y-120};},
        next:()=>!cat.airborne?'land':false,
      },
      land:{
        during:({since})=>{intent().speed=0;intent().crouch=0.24*(1-ramp(since,0,0.28));intent().tail=0.58;},
        after:0.32,then:'walk',
      },
    });
  }

  protected update(t:number,dt:number):void{
    Object.assign(this.cat.intent,CAT_REST,{blink:blink(t,[1.2,4.9,8.6,13.4,19.8,25.1,31.6,38.2,44.8,51.4,58.1,64.7,71.3,77.9,84.5,91.1,97.7,104.3,110.9,116.2])});
    if(!this.settling)this.beats.update(t,dt);
    this.cat.update(dt);
  }

  protected lateUpdate(t:number,dt:number):void{
    this.cam.zoom=this.zoom;
    this.cam.update(this.cat.x+260,dt,t,590);
  }

  probe():Record<string,unknown>{
    const scene=Math.min(9,Math.floor(this.time/SCENE_SECONDS));
    return {...super.probe(),story:'samsung-pilot',scene:scene+1,sceneTitle:TITLES[scene],beat:this.beats.current,
      cat:[Math.round(this.cat.root.x),Math.round(this.cat.root.y)],airborne:this.cat.airborne,
      camera:[Math.round(this.cam.x),Math.round(this.cam.y)],zoom:this.cam.zoom};
  }

  protected draw(t:number,frame:number):void{
    const index=Math.min(9,Math.floor(t/SCENE_SECONDS)),local=t-index*SCENE_SECONDS;
    if(index>0&&local<0.9){
      this.drawScene(index-1,SCENE_SECONDS);
      tearWipe(this.ctx,ramp(local,0,0.9),()=>this.drawScene(index,local),{
        seed:2100+index*19,angle:index%2?Math.PI/2:0,tear:30,paper:'#f1eadc',
      });
    }else this.drawScene(index,local);

    // The cat and the floor are drawn once in the same world/camera layer: paws always meet the ground.
    this.cam.layer(this.ctx,1,()=>{
      const left=this.cat.x-1900,right=this.cat.x+2500;
      this.paper.piece([{x:left,y:GROUND_Y},{x:right,y:GROUND_Y-2},{x:right+80,y:GROUND_Y+320},{x:left-80,y:GROUND_Y+320}],
        '#b99b78',{seed:810,tear:2.5,shadow:5,texture:0.32});
      this.paper.line([{x:left,y:GROUND_Y},{x:right,y:GROUND_Y-2}],'rgba(88,69,53,.55)',5);
      for(let i=0;i<38;i++){
        const x=left+i*112;
        this.paper.line([{x,y:GROUND_Y+2},{x:x-5,y:GROUND_Y-7-(i%3)*3},{x:x+2,y:GROUND_Y+1}],
          'rgba(88,112,83,.48)',2);
      }
      this.cat.draw(this.paper);
    });

    const ctx=this.ctx;
    ctx.textAlign='left';ctx.font='bold 48px "Noto Sans",Arial,sans-serif';
    ctx.fillStyle='rgba(28,38,44,.34)';ctx.fillText(TITLES[index],103,131,1720);
    ctx.fillStyle='#26343b';ctx.fillText(TITLES[index],100,125,1720);
    ctx.fillStyle='rgba(38,52,59,.84)';ctx.font='29px "Noto Sans",Arial,sans-serif';
    ctx.fillText(SUBTITLES[index],104,180,1700);
    vignette(ctx,[35,28,20],0.16,0.5);grain(ctx,frame,0.045);
  }

  /** Each set stays in the world at its Nokia-style layout position and is revealed by a torn paper edge. */
  private drawScene(index:number,sceneTime:number):void{
    const ctx=this.ctx,[top,bottom]=PALETTES[index],base=index*SCENE_SPAN;
    fillGradient(ctx,[[0,top],[1,bottom]]);
    this.cam.layer(ctx,0.18,()=>{
      ctx.fillStyle='rgba(47,61,65,.14)';
      for(let i=0;i<8;i++)ctx.fillRect(base-420+i*310,540-(i%3)*65,210,330+(i%3)*65);
      ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(base-300,820,SCENE_SPAN+650,12);
    });
    tearWipe(ctx,ramp(sceneTime,0.45,1.45),()=>this.cam.layer(ctx,1,()=>this.drawSceneObjects(index,base)),{
      seed:4200+index*31,angle:[0,Math.PI/2,Math.PI/4,-Math.PI/4][index%4],tear:26,paper:'#f1eadc',
    });
  }

  private drawSceneObjects(index:number,base:number):void{
    const ctx=this.ctx;
    if(index===0){
      // Modern Galaxy juxtaposed with the original grocery-trading shop.
      phone(ctx,base+180,360,1.15,'#26313c',true);
      crate(ctx,base+760,610,300,180,'1938','#9a704c');crate(ctx,base+1090,650,290,140,'DAEGU','#aa835b');
      label(ctx,'GALAXY',base+300,830,46,'#f4eee2');
      ctx.globalAlpha=0.78;ctx.beginPath();ctx.ellipse(base+1180,470,125,36,-0.2,0,Math.PI*2);ctx.fillStyle='#a9a29a';ctx.fill();ctx.globalAlpha=1;
    }else if(index===1){
      rounded(ctx,base+560,410,740,330,18,'#d7b98c','#795b43');rounded(ctx,base+520,380,820,55,8,'#684c3a');
      label(ctx,'三星商會',base+930,420,42,'#f6e6c7');crate(ctx,base+620,670,210,145,'DRIED FISH');
      crate(ctx,base+870,675,190,140,'RICE','#b99a64');crate(ctx,base+1090,680,200,135,'FRUIT','#a66e4f');
      rounded(ctx,base+1370,610,170,120,12,'#6d5544');label(ctx,'LEDGER',base+1455,680,22,'#fff0d4');
    }else if(index===2){
      for(let i=0;i<5;i++)crate(ctx,base+520+i*180,650-(i%2)*70,150,135,['RICE','FISH','FRUIT','GOODS','EXPORT'][i]);
      ctx.fillStyle='#e9e2d2';ctx.beginPath();ctx.moveTo(base+660,570);ctx.lineTo(base+1370,570);ctx.lineTo(base+1230,740);ctx.lineTo(base+820,740);ctx.fill();
      ctx.fillStyle='#526d79';ctx.fillRect(base+980,390,24,180);ctx.beginPath();ctx.moveTo(base+1005,400);ctx.lineTo(base+1210,545);ctx.lineTo(base+1005,545);ctx.fill();
      label(ctx,'TRADE',base+1080,825,44);
    }else if(index===3){
      rounded(ctx,base+520,450,430,330,16,'#b7c9bd','#647d7d');rounded(ctx,base+1010,450,430,330,16,'#d7c7a6','#8a7355');
      for(let i=0;i<4;i++){ctx.fillStyle='#7e9c91';ctx.fillRect(base+590+i*82,540,28,190);ctx.beginPath();ctx.arc(base+604+i*82,520,38,0,Math.PI*2);ctx.fill();}
      crate(ctx,base+1120,620,220,140,'SUGAR','#b18d5d');label(ctx,'TEXTILES · FOOD · TRADE',base+990,835,34);
    }else if(index===4){
      rounded(ctx,base+500,420,980,390,18,'#dce1d9','#647d7d');rounded(ctx,base+620,320,740,110,10,'#54747a');
      label(ctx,'SAMSUNG ELECTRONICS',base+990,390,38,'#f7f0dd');
      for(let i=0;i<4;i++){rounded(ctx,base+600+i*220,610,160,120,10,'#a9b7ad');rounded(ctx,base+630+i*220,640,100,60,8,'#d6e0d8');}
    }else if(index===5){
      rounded(ctx,base+570,690,870,45,10,'#78583f');rounded(ctx,base+820,360,430,320,28,'#353b3c','#1e2527');
      rounded(ctx,base+865,400,340,220,10,'#b7b9b3');ctx.fillStyle='#565a59';ctx.beginPath();ctx.arc(base+1035,510,78,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e5e4dc';ctx.beginPath();ctx.arc(base+1035,510,64,0,Math.PI*2);ctx.fill();
      label(ctx,'BLACK & WHITE TV',base+1035,800,34);
    }else if(index===6){
      crate(ctx,base+570,620,310,190,'SAMSUNG TV','#9b704c');
      ctx.fillStyle='#e8e5da';ctx.beginPath();ctx.moveTo(base+1050,700);ctx.lineTo(base+1540,700);ctx.lineTo(base+1430,820);ctx.lineTo(base+1150,820);ctx.fill();
      ctx.fillStyle='#526b78';ctx.fillRect(base+1260,470,22,230);ctx.beginPath();ctx.moveTo(base+1280,485);ctx.lineTo(base+1490,670);ctx.lineTo(base+1280,670);ctx.fill();
      label(ctx,'PANAMA · 1971',base+1310,430,38);
    }else if(index===7){
      rounded(ctx,base+620,590,420,190,18,'#e8e1d2','#8a887e');ctx.beginPath();ctx.arc(base+1110,580,190,0,Math.PI*2);ctx.fillStyle='#7899a0';ctx.fill();
      for(let i=0;i<5;i++)for(let j=0;j<5;j++){ctx.strokeStyle='rgba(239,248,245,.7)';ctx.strokeRect(base+1000+i*44,470+j*44,36,36);}
      label(ctx,'KOREA SEMICONDUCTOR',base+1110,830,34);
    }else if(index===8){
      for(let i=0;i<3;i++){rounded(ctx,base+570+i*310,430,250,220,18,'#3d4445');rounded(ctx,base+595+i*310,455,200,150,8,['#c96d50','#6b9b89','#6689ad'][i]);}
      rounded(ctx,base+520,710,1080,35,12,'#7e644b');label(ctx,'COLOR TV · EXPORT',base+1080,820,38);
    }else{
      rounded(ctx,base+570,380,930,400,20,'#dfe7e2','#6c8586');
      for(let i=0;i<6;i++){rounded(ctx,base+640+i*135,470,95,180,12,'#78979a');rounded(ctx,base+660+i*135,495,55,70,6,'#d3e4dc');}
      label(ctx,'SEMICONDUCTOR DIVISION',base+1030,840,36);
    }
  }

  soundtrack(sampleRate:number):Stereo{
    const mix=new Mixer(this.videoLength,sampleRate)
      .bus('music',{gain:0.54,reverb:0.26})
      .bus('ambience',{gain:0.2,reverb:0.1});
    const roots=[note('C4'),note('A3'),note('F3'),note('G3')];
    for(let s=0;s<10;s++){
      const root=roots[Math.floor(s/3)%roots.length];
      for(const [i,n] of triad(root,'major',0).entries()){
        mix.add('music',s*SCENE_SECONDS,instrument.pad(n-12,SCENE_SECONDS,sampleRate,{
          seed:3800+s*11+i,cutoff:s<3?760:980,attack:0.9,release:1.1,
        }),{gain:0.12,pan:(i-1)*0.3});
      }
      mix.add('music',s*SCENE_SECONDS+1.0,instrument.harp(root+12,sampleRate,{seed:4100+s,decay:0.9}),{gain:0.11,pan:s%2?0.24:-0.24});
      if([0,1,3,6,9].includes(s))mix.add('ambience',s*SCENE_SECONDS+0.2,instrument.chime(root+24,sampleRate),{gain:0.1,pan:0.18});
    }
    return mix.render({reverb:{room:0.58,damp:0.62},master:-2,ceiling:-1,fadeIn:0.8,fadeOut:1.5});
  }
}
