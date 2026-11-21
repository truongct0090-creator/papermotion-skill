import {
  Mixer, Stage, Camera, fillGradient, tearWipe, ramp, vignette, grain, circlePoly,
  instrument, note, triad, drawProps, drawRidge, drawSward, drawSky, blink,
  type Paper, type RidgeSpec, type Stereo,
} from '../../src';
import { createCitySkyline, createGrassland, meadowWind, nightSky } from '../shared/environment';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';
import { STORY_TIMING } from './voiceoverTiming';

const W = 1920, H = 1080, DURATION = STORY_TIMING.duration_sec;
const TEXT_SAFE_ZONE = { left: 80, right: 780, top: 70, bottom: 440 };
const PROP_SAFE_LEFT = TEXT_SAFE_ZONE.right + 20;
const CAT_BLINKS = Array.from({ length: 110 }, (_, i) => 1.1 + i * 5.1 + (i % 4) * 0.65);
const SCENE_LINE_INDEX = [0, ...Array.from({ length: 27 }, (_, i) => i + 2)] as const;

function sceneStart(index: number): number {
  return STORY_TIMING.lines[SCENE_LINE_INDEX[index]]?.start_sec ?? DURATION;
}
function sceneIndexAt(t: number): number {
  let index = 0;
  for (let i = 1; i < SCENE_LINE_INDEX.length; i++) {
    if (t >= sceneStart(i)) index = i;
    else break;
  }
  return index;
}
export const SAMSUNG_TITLES = [
  "CÁ KHÔ VÀ GÃ KHỔNG LỒ",
  "SAMSUNG BẮT ĐẦU Ở DAEGU",
  "MẠNG LƯỚI THƯƠNG MẠI",
  "MỞ RỘNG SAU CHIẾN TRANH",
  "BƯỚC VÀO NGÀNH ĐIỆN TỬ",
  "TV ĐEN TRẮNG ĐẦU TIÊN",
  "XUẤT KHẨU ĐẾN PANAMA",
  "ĐẦU TƯ VÀO BÁN DẪN",
  "TV MÀU VÀ BÁN DẪN",
  "BÁN DẪN THÀNH TRỤ CỘT",
  "DRAM VÀO CUỘC ĐUA TOÀN CẦU",
  "BƯỚC TIẾN 64K DRAM",
  "CHIP 1M DRAM",
  "4M DRAM VÀO NĂM 1988",
  "64M DRAM – DẤU MỐC 1992",
  "NEW MANAGEMENT 1993",
  "VƯỢT QUA KHỦNG HOẢNG 1997",
  "CHẤT LƯỢNG LÀ ƯU TIÊN",
  "THƯƠNG HIỆU TOÀN CẦU",
  "KỶ NGUYÊN TV MÀN HÌNH PHẲNG",
  "GALAXY S MỞ RA CHƯƠNG MỚI",
  "GALAXY NOTE VÀ MÀN HÌNH LỚN",
  "HỆ SINH THÁI GALAXY",
  "OLED VÀ ĐIỆN THOẠI GẬP",
  "BÁN DẪN CHO KỶ NGUYÊN AI",
  "SAMSUNG HÔM NAY VÀ NGÀY MAI",
  "MỌT MỌT HỎI BẠN",
  "HẸN GẶP LẠI"
] as const;
export const SAMSUNG_SUBTITLES = [
  "Từ cá khô, rau củ đến công nghệ\nMọi thứ bắt đầu từ một cửa hàng nhỏ",
  "Daegu, Hàn Quốc • ngày 1/3/1938\nLee Byung-chul lập Samsung Sanghoe",
  "Những chuyến hàng mở rộng giao thương\nSamsung là doanh nghiệp thương mại",
  "Thực phẩm, dệt may, bảo hiểm, bán lẻ\nMở rộng sau chiến tranh Triều Tiên",
  "Samsung Electronics ra đời năm 1969\nBước đi mới vào ngành điện tử",
  "TV đen trắng P-3202 ra đời năm 1970\nSamsung-Sanyo vào ngành TV gia dụng",
  "TV Samsung đến Panama năm 1971\nHàng Hàn Quốc vươn ra thế giới",
  "Samsung mua 50% Korea Semiconductor\nBước đầu tư vào công nghệ bán dẫn",
  "Samsung hoàn tất mua lại năm 1977\nBắt đầu sản xuất TV màu và xuất khẩu",
  "Bán dẫn được hợp nhất vào năm 1980\nGia nhập hệ thống Samsung Electronics",
  "Samsung phát triển DRAM 64K năm 1983\nBắt đầu cuộc đua bộ nhớ tiên tiến",
  "Tiến lên DRAM 256K năm 1984\nTự chủ công nghệ và sản xuất",
  "DRAM 1 megabit năm 1986\nNăng lực nghiên cứu tăng tốc",
  "DRAM 4 megabit năm 1988\nTiến gần nhóm dẫn đầu thế giới",
  "DRAM 64 megabit năm 1992\nBán dẫn thành lợi thế chiến lược",
  "Lee Kun-hee khởi xướng New Management\nChất lượng và đổi mới là trọng tâm",
  "Khủng hoảng tài chính châu Á năm 1997\nTái cấu trúc để tồn tại và cạnh tranh",
  "Chuyển từ số lượng sang chất lượng\nThiết kế và độ tin cậy được ưu tiên",
  "TV, màn hình, điện thoại và linh kiện\nSamsung vươn thành thương hiệu toàn cầu",
  "LCD và công nghệ hiển thị mới\nTV màn hình phẳng bước vào gia đình",
  "Galaxy S ra mắt năm 2010\nSamsung tăng tốc trong kỷ nguyên smartphone",
  "Galaxy Note ra mắt năm 2011\nMàn hình lớn và bút S Pen tạo khác biệt",
  "Điện thoại, đồng hồ, tablet, tai nghe\nMột hệ sinh thái kết nối nhiều thiết bị",
  "Galaxy Fold thương mại hóa năm 2019\nMở ra hướng đi cho điện thoại gập",
  "DRAM, NAND và bộ nhớ băng thông cao\nChip trở thành hạ tầng của AI",
  "Từ thiết bị đến bán dẫn và kết nối\nMột tập đoàn đa ngành không ngừng đổi mới",
  "Bạn từng dùng Galaxy hay TV Samsung nào?\nKể kỷ niệm của bạn với Mọt Mọt nhé",
  "Cảm ơn bạn đã theo dõi câu chuyện\nHẹn gặp lại trong tập tiếp theo"
] as const;
const PALETTES: [string, string][] = [
  ['#25364a', '#d2a77d'],
  ['#e7d7bd', '#b7c9c3'],
  ['#d8e2df', '#a9b9aa'],
  ['#eadbc4', '#b6a38d'],
  ['#c5d6d2', '#829b91'],
  ['#d7e1e7', '#899eae'],
  ['#d6d2ca', '#818c9c'],
  ['#d8eadc', '#8eb6a0'],
  ['#d1d9dd', '#8397a5'],
  ['#1d2638', '#665267'],
  ['#d8e3dc', '#93aaa4'],
  ['#c9d8d5', '#829c99'],
  ['#d5dfdc', '#91a8a5'],
  ['#c8d7d5', '#7f9998'],
  ['#d2dfdc', '#7d9996'],
  ['#d8d2c5', '#9d8979'],
  ['#303b4c', '#7e6561'],
  ['#e7e0d2', '#b6a28e'],
  ['#d9e4e0', '#8ba59c'],
  ['#d5e1e7', '#8aa3b1'],
  ['#dbe4e5', '#8aa8b4'],
  ['#d9dedf', '#8199a6'],
  ['#dce8e4', '#92afa8'],
  ['#c8dce1', '#7f9eac'],
  ['#1c2b3e', '#566c86'],
  ['#d5e0dc', '#849b95'],
  ['#e6d9c7', '#a88f79'],
  ['#202c40', '#5d7180']
];
if (STORY_TIMING.lines.length !== 29 || SAMSUNG_TITLES.length !== 28 ||
    SAMSUNG_SUBTITLES.length !== 28 || SCENE_LINE_INDEX.length !== 28 || PALETTES.length !== 28) {
  throw new Error('Samsung Full requires 29 measured voice lines mapped to exactly 28 layouts (26 story scenes + 2 mascot scenes).');
}

function wrapText(paper: Paper, value: string, size: number, maxWidth: number): string[] {
  const ctx = paper.context;
  ctx.save();
  ctx.font = `700 ${size}px "Noto Sans", "DejaVu Sans", sans-serif`;
  const lines: string[] = [];
  for (const paragraph of value.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
      else line = candidate;
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
  ctx.font = `700 ${size}px "Noto Sans", "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => {
    const baseline = y + i * lineHeight;
    ctx.fillStyle = 'rgba(24, 20, 24, 0.20)'; ctx.fillText(line, x + 5, baseline + 7);
    ctx.fillStyle = 'rgba(24, 20, 24, 0.34)'; ctx.fillText(line, x + 3, baseline + 4);
    ctx.fillStyle = 'rgba(24, 20, 24, 0.72)'; ctx.fillText(line, x + 1.5, baseline + 2);
    ctx.shadowColor = 'rgba(18, 17, 20, 0.34)'; ctx.shadowBlur = 9; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#fff9ed'; ctx.fillText(line, x, baseline);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  });
  ctx.restore();
  return lines.length;
}

function singleLineTitle(paper: Paper, value: string, x: number, y: number, size: number, maxWidth: number): void {
  const ctx = paper.context; let fitted = size;
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  while (fitted > 30) { ctx.font = `800 ${fitted}px "Noto Sans", "DejaVu Sans", sans-serif`; if (ctx.measureText(value).width <= maxWidth) break; fitted -= 1; }
  ctx.font = `800 ${fitted}px "Noto Sans", "DejaVu Sans", sans-serif`;
  ctx.fillStyle = 'rgba(24,20,24,0.22)'; ctx.fillText(value,x+5,y+7);
  ctx.fillStyle = 'rgba(24,20,24,0.38)'; ctx.fillText(value,x+3,y+4);
  ctx.fillStyle = 'rgba(24,20,24,0.78)'; ctx.fillText(value,x+1.5,y+2);
  ctx.shadowColor='rgba(18,17,20,0.38)'; ctx.shadowBlur=10; ctx.shadowOffsetX=2; ctx.shadowOffsetY=4;
  ctx.fillStyle='#fff9ed'; ctx.fillText(value,x,y); ctx.restore();
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

function cargoCrate(paper: Paper, x: number, y: number, w: number, h: number, label: string, color: string, seed: number): void {
  paper.sheet({ shadow: 10, rim: { color: 'rgba(255,244,224,0.65)', width: 2 }, shade: { color: 'rgba(32,24,18,0.25)', width: 3 }, texture: 0.42 }, () => {
    rounded(paper, x, y, w, h, 9, color, '#6f513a');
    for (let i = 1; i < 4; i++) paper.line([{ x: x + i * w / 4, y: y + 8 }, { x: x + i * w / 4, y: y + h - 8 }], 'rgba(70,48,32,0.38)', 5);
    paper.line([{ x: x + 8, y: y + 16 }, { x: x + w - 8, y: y + 16 }], 'rgba(255,235,205,0.28)', 3);
    outlinedText(paper, label, x + 18, y + h * 0.58, Math.min(25, Math.max(17, w / 11)), false, w - 36);
    paper.piece([{ x: x + 12, y: y + 10 }, { x: x + w - 12, y: y + 10 }, { x: x + w - 18, y: y + 18 }, { x: x + 18, y: y + 18 }], '#d5b58a', { seed, tear: 1.4, shadow: 2, texture: 0.25 });
  });
}
function galaxyPhone(paper: Paper, x: number, y: number, scale: number): void {
  paper.sheet({ shadow: 14, rim: { color: 'rgba(255,244,224,0.8)', width: 2.5 }, shade: { color: 'rgba(22,26,30,0.32)', width: 4 }, texture: 0.5 }, () => {
    const ctx = paper.context;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    rounded(paper, 0, 0, 220, 390, 30, '#222c38', '#65717d');
    rounded(paper, 14, 24, 192, 330, 18, '#263b50');
    const colors = ['#e7a45d','#8bb5a0','#d17b67','#7b91b8','#d7bd76','#9d86a8'];
    for (let i = 0; i < 6; i++) rounded(paper, 29 + (i % 3) * 58, 68 + Math.floor(i / 3) * 82, 45, 58, 8, colors[i]);
    paper.piece(circlePoly({ x: 110, y: 43 }, 5, 12), '#151a20', { seed: 9301, tear: 1, shadow: 1 });
    ctx.restore();
  });
}


function drawExtendedSamsungProp(paper: Paper, index: number): void {
  const ctx = paper.context;
  const chip = (x: number, y: number, size: number, label: string, seed: number, color = '#8da7a1') => {
    rounded(paper, x, y, size, size, 12, '#303d4a', '#71858b');
    rounded(paper, x + 18, y + 18, size - 36, size - 36, 6, color, '#d5e0d8');
    for (let k = 0; k < 6; k++) {
      const p = x + 22 + k * (size - 44) / 5;
      paper.line([{x:p,y:y-16},{x:p,y:y+4}], '#b8c4bc', 5);
      paper.line([{x:p,y:y+size-4},{x:p,y:y+size+16}], '#b8c4bc', 5);
      const q = y + 22 + k * (size - 44) / 5;
      paper.line([{x:x-16,y:q},{x:x+4,y:q}], '#b8c4bc', 5);
      paper.line([{x:x+size-4,y:q},{x:x+size+16,y:q}], '#b8c4bc', 5);
    }
    outlinedText(paper, label, x + 24, y + size * 0.57, Math.min(30, size / 5), false, size - 48);
    paper.piece(circlePoly({x:x+size-30,y:y+30},8,12),'#e6c27f',{seed,tear:1,shadow:1});
  };
  if (index >= 10 && index <= 14) {
    paper.piece(circlePoly({x:1270,y:500},235,72),'#829b9b',{seed:9600+index,tear:3,shadow:12,texture:0.5});
    paper.piece(circlePoly({x:1270,y:500},202,72),'#c2d2c9',{seed:9610+index,tear:2,shadow:5,texture:0.4});
    const n = index === 10 ? 3 : index === 11 ? 4 : index === 12 ? 5 : index === 13 ? 6 : 7;
    for (let i=0;i<n;i++) for (let j=0;j<n;j++) {
      const size = index >= 13 ? 28 : 34;
      rounded(paper, 1120+i*(index>=13?42:50), 350+j*(index>=13?42:50), size, size, 4,
        ['#607f86','#8ca99c','#b9a17b','#728fa0'][(i+j+index)%4]);
    }
    chip(1430,650,155, index===10?'64K':index===11?'256K':index===12?'1M':index===13?'4M':'64M', 9620+index, '#9fb9aa');
  } else if (index === 15) {
    paper.piece([{x:950,y:730},{x:1640,y:730},{x:1580,y:470},{x:1010,y:470}],'#c8d4d0',{seed:9630,tear:3,shadow:10});
    for(let i=0;i<5;i++) rounded(paper,1010+i*118,540,90,180,4,['#8d9d9a','#b6a58c','#849ba0'][i%3]);
    rounded(paper,1110,370,390,90,12,'#5e7479');
    outlinedText(paper,'NEW MANAGEMENT',1140,430,31,false,330);
  } else if (index === 16) {
    rounded(paper,920,330,700,420,18,'#d7ded9','#6f7e7b');
    for(let i=0;i<6;i++) { const h=[210,260,170,120,80,55][i]; rounded(paper,1010+i*92,690-h,58,h,6,i<3?'#8ca59a':'#bd806b'); }
    paper.line([{x:980,y:420},{x:1570,y:690}],'#b95f58',12);
    outlinedText(paper,'1997',1170,810,46,false,200);
  } else if (index === 17) {
    rounded(paper,1030,330,500,420,30,'#718b84','#d8e4d9');
    paper.piece(circlePoly({x:1280,y:500},150,48),'#e4c78c',{seed:9640,tear:3,shadow:8});
    paper.piece([{x:1280,y:390},{x:1380,y:500},{x:1280,y:610},{x:1180,y:500}],'#a1b8a5',{seed:9641,tear:2,shadow:5});
    outlinedText(paper,'QUALITY',1160,790,42,false,260);
  } else if (index === 18) {
    paper.piece(circlePoly({x:1270,y:520},220,64),'#8ba8a1',{seed:9650,tear:3,shadow:12});
    ctx.save();ctx.strokeStyle='#f0d7a6';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(1270,520,300,105,-0.35,0,Math.PI*2);ctx.stroke();ctx.restore();
    for(let i=0;i<5;i++) paper.piece(circlePoly({x:1130+i*68,y:470+(i%2)*90},24,20),'#d9e5d9',{seed:9651+i,tear:1.5,shadow:3});
    outlinedText(paper,'GLOBAL',1160,800,40,false,260);
  } else if (index === 19) {
    rounded(paper,930,330,700,430,32,'#303b42','#89999a'); rounded(paper,970,370,620,340,12,'#82a9ad','#d9e1d8');
    paper.piece([{x:970,y:600},{x:1150,y:480},{x:1300,y:580},{x:1450,y:450},{x:1590,y:600},{x:1590,y:710},{x:970,y:710}],'#5c8586',{seed:9660,tear:2.5,shadow:3});
    rounded(paper,1180,760,210,35,10,'#8c765f'); outlinedText(paper,'FLAT DISPLAY',1090,830,34,false,400);
  } else if (index === 20 || index === 21) {
    galaxyPhone(paper,1110,270,index===20?1.45:1.28);
    if(index===21) { paper.line([{x:1500,y:360},{x:1600,y:650}],'#c6a16f',9); outlinedText(paper,'S PEN',1480,760,32,false,160); }
  } else if (index === 22) {
    const nodes=[[1120,390],[1430,390],[1275,650],[970,650],[1580,650]];
    nodes.forEach(([x,y],i)=>paper.piece(circlePoly({x,y},74,36),['#839f9a','#b6a27e','#7998a8','#9e8da4','#8da98d'][i],{seed:9680+i,tear:2.2,shadow:8}));
    nodes.slice(1).forEach(([x,y])=>paper.line([{x:1275,y:520},{x,y}],'#f2e4c8',6));
    outlinedText(paper,'GALAXY',1150,820,40,false,260);
  } else if (index === 23) {
    rounded(paper,1050,330,260,470,34,'#27323c','#899ba0'); rounded(paper,1080,360,200,390,20,'#7b9fa6');
    rounded(paper,1310,330,260,470,34,'#27323c','#899ba0'); rounded(paper,1340,360,200,390,20,'#8fb4b0');
    paper.line([{x:1300,y:360},{x:1300,y:770}],'#d9e2da',8); outlinedText(paper,'FOLD',1180,850,38,false,220);
  } else if (index === 24) {
    for(let i=0;i<5;i++) rounded(paper,1000+i*125,610-i*44,110,150,8,['#718f9b','#8ca79e','#a99a80'][i%3],'#d4dfd7');
    rounded(paper,1070,320,500,90,12,'#33495a'); outlinedText(paper,'HBM',1220,380,42,false,180);
    for(let i=0;i<6;i++) paper.line([{x:1040+i*95,y:790},{x:1040+i*95,y:850}],'#d1bd92',5);
  } else if (index === 25) {
    chip(1110,390,300,'AI',9690,'#819f9b');
    for(let i=0;i<4;i++) { paper.line([{x:1410,y:450+i*75},{x:1580,y:380+i*75}],'#d7c59f',7); paper.piece(circlePoly({x:1590,y:375+i*75},25,20),'#9ab4a6',{seed:9691+i,tear:1.5,shadow:4}); }
  } else if (index === 26) {
    paper.piece([{x:930,y:360},{x:1640,y:360},{x:1640,y:690},{x:1280,y:690},{x:1190,y:790},{x:1200,y:690},{x:930,y:690}],'#f2e6d1',{seed:9700,tear:4,shadow:13,texture:0.45});
    outlinedText(paper,'BẠN TỪNG DÙNG SAMSUNG?',1010,510,39,false,550); outlinedText(paper,'KỂ MỌT MỌT NGHE!',1100,590,32,false,450);
  } else {
    galaxyPhone(paper,1170,310,1.12); paper.piece(circlePoly({x:1510,y:390},62,32),'#e7c77f',{seed:9710,tear:2,shadow:8});
    outlinedText(paper,'CẢM ƠN BẠN!',1100,820,40,false,360);
  }
}

/** Exact Nokia Full torn-paper reveal: a ragged paper edge peels across a fixed prop group. */
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


export class SamsungFullScene extends Stage {
  private readonly skyline: ReturnType<typeof createCitySkyline>;
  private readonly ridges: RidgeSpec[];
  private readonly camera: Camera;
  private readonly cat: Cat;
  private readonly dayEnvironment: ReturnType<typeof createGrassland>;
  private readonly nightEnvironment: ReturnType<typeof createGrassland>;
  private readonly stars = nightSky(8100, { x: 960, y: 620 });
  private lastScene = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { duration: DURATION, preroll: 0.5, fps: 30 });
    this.paper.light = { x: -0.6, y: 0.8 };
    this.paper.edgeColor = 'rgba(255,246,232,0.28)';
    this.paper.shadowColor = 'rgba(24,18,24,0.34)';
    this.world.ground = () => 890;
    this.world.wind = meadowWind(8101, 0.22);
    this.cat = new Cat(this.world, 470, 890, SIGNATURE_CAT_LOOK);
    this.dayEnvironment = createGrassland(8102, -1600, 52000, () => 890, {
      sky: '#9fc5dc', cloud: '#fff8ec', cloudShade: '#d6e4e8', farHill: '#91a9a0', midHill: '#748f7c', nearHill: '#526c58', ground: '#465b42',
      grass: [['#435b3d','#7d9556'],['#536d43','#9eaa63']], treeTrunk: '#6a503e', treeLeaves: ['#607b4d','#7f995c','#a2ad69'], treeLight: '#f6d9a1',
      flowers: ['#fff4df','#f3d8a4','#e6a56e'], rock: ['#a99a82','#8f8779'],
    });
    this.nightEnvironment = createGrassland(8112, -1600, 52000, () => 890, {
      sky: '#111a31', cloud: '#35415b', cloudShade: '#202b43', farHill: '#29334b', midHill: '#202b40', nearHill: '#182338', ground: '#111a2a',
      grass: [['#172238','#29334a'],['#1d2a3d','#354157']], treeTrunk: '#242b3d', treeLeaves: ['#26334a','#303b52','#3a4358'], treeLight: '#69758a',
      flowers: ['#8d91a7','#727e9b','#a18e9c'], rock: ['#30394b','#252f42'],
    });
    this.camera = new Camera(W / 2, { width: W, height: H, stiffness: 4, damping: 4, handheld: 0 });
    this.camera.zoom = 1.15;
    this.camera.cut({ x: W / 2, y: H / 2, zoom: 1.15, handheld: 0 });
    this.skyline = createCitySkyline(5100, -700, 2700, {
      far: ['#aab4b0','#a0aca8'], mid: ['#788b88','#82918c'], near: ['#53696b','#5e7472'],
      farWindow: '#e8d4a7', midWindow: '#e8c78b', nearWindow: '#f0d49a',
    });
    const earth = ['#b7a38a','#b9a18a','#9ca9a0','#29374b','#8eaa9a','#a9aaa0','#9d8270','#8fa7b8','#9da7a5','#b5a58f','#9ba99f','#a99b8c','#8ea3ad','#a99b91','#473e49'];
    this.ridges = earth.map((color, i) => ({ seed: 6200 + i, base: 835, amp: 32, freq: 0.0018 + i * 0.00003, color, tear: 3, shadow: 8 }));
  }

  protected update(t: number, dt: number): void {
    const scene = sceneIndexAt(t);
    Object.assign(this.cat.intent, CAT_REST, {
      speed: scene === 27 ? 0 : 82, tail: 0.82, blink: blink(t, CAT_BLINKS),
      look: { x: this.cat.x + (scene === 0 || scene === 27 ? 120 : 220), y: scene === 0 || scene === 27 ? 470 : 560 },
    });
    if (scene !== this.lastScene) {
      if (!this.cat.airborne) this.cat.jump({ x: this.cat.x + 265, y: 890 }, 145);
      this.lastScene = scene;
    }
    if (scene === 27) {
      const finalStart = sceneStart(27);
      this.cat.intent.speed = 0;
      this.cat.intent.sit = ramp(t, finalStart + 0.7, finalStart + 3.7);
      this.cat.intent.look = { x: this.cat.x + 180, y: 250 };
    }
    this.cat.update(dt);
  }

  protected lateUpdate(t: number, dt: number): void {
    const scene = sceneIndexAt(t);
    this.camera.zoom = scene === 0 ? 1.75 : scene === 27 ? 1.28 : 1.15;
    const followOffset = scene === 0 ? 260 : scene === 27 ? 360 : 500;
    this.camera.update(this.cat.x + followOffset, dt, t, 610);
  }

  probe(): Record<string, unknown> {
    const i = sceneIndexAt(this.time);
    return { ...super.probe(), story: 'samsung-nokia-full', scene: i + 1, sceneTitle: SAMSUNG_TITLES[i],
      cat: [Math.round(this.cat.x), Math.round(this.cat.root.y)], airborne: this.cat.airborne,
      cameraX: Math.round(this.camera.x), zoom: this.camera.zoom };
  }

  protected draw(t: number, frame: number): void {
    const index = sceneIndexAt(t), local = t - sceneStart(index);
    if (index > 0 && local < 0.85) {
      this.drawScene(index - 1, t);
      tearWipe(this.ctx, ramp(local, 0, 0.85), () => this.drawScene(index, t), {
        seed: 2100 + index * 19, angle: index % 2 ? Math.PI / 2 : 0, tear: 30, paper: '#f1eadc',
      });
    } else this.drawScene(index, t);
    vignette(this.ctx, [35, 28, 20], 0.18, 0.5);
    grain(this.ctx, frame, 0.045);
  }

  private drawScene(index: number, t: number): void {
    const ctx = this.ctx, paper = this.paper, [top, bottom] = PALETTES[index];
    const lineIndex = SCENE_LINE_INDEX[index], sceneLocal = t - sceneStart(index);
    const beat = (segment: number, within = 0, lineOffset = 0): number => {
      const line = STORY_TIMING.lines[Math.min(lineIndex + lineOffset, STORY_TIMING.lines.length - 1)];
      const cue = line.segments[Math.min(segment, line.segments.length - 1)];
      return cue.start_sec - sceneStart(index) + cue.duration_sec * within;
    };
    fillGradient(ctx, [[0, top], [1, bottom]]);
    const isNight = index === 0 || index === 27;
    const environment = isNight ? this.nightEnvironment : this.dayEnvironment;
    const windAt = (x: number) => this.world.wind(x, 890, t).x;
    if (isNight) {
      drawSky(ctx, this.stars, { t, turn: t * 0.0015, twinkle: 0.38 });
      this.drawMoon(1500, 250);
      this.camera.layer(paper, 0.045, v => drawProps(paper, this.nightEnvironment.clouds, v.from, v.to, () => 0, t));
    } else {
      this.camera.layer(paper, 0.045, v => drawProps(paper, this.dayEnvironment.clouds, v.from, v.to, () => 0, t));
    }
    paper.piece([{x:0,y:850},{x:W,y:850},{x:W,y:H+80},{x:0,y:H+80}], '#d6c8b5', { seed: 6300 + index, tear: 3, shadow: 0, texture: 0.35 });
    this.camera.layer(paper, 0.14, v => drawProps(paper, this.skyline.far, v.from, v.to, () => 0, t));
    this.camera.layer(paper, 0.4, v => drawProps(paper, this.skyline.mid, v.from, v.to, () => 0, t));
    this.camera.layer(paper, 0.8, v => drawProps(paper, this.skyline.near, v.from, v.to, () => 0, t));
    this.camera.layer(paper, 0.66, v => drawProps(paper, environment.trees, v.from, v.to, windAt, t));
    this.camera.layer(paper, 1, v => drawRidge(paper, this.ridges[index % this.ridges.length], v.from, v.to, 1120));
    ctx.globalAlpha = 0.22 + 0.02 * Math.sin(t * 1.8);
    ctx.fillStyle = 'rgba(255,255,255,0.24)'; ctx.beginPath(); ctx.arc(1570, 260, 230, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    paper.piece([{x:0,y:870},{x:W,y:870},{x:W,y:H+20},{x:0,y:H+20}], 'rgba(35,48,56,0.08)', { seed: 6390 + index, tear: 1.5, shadow: 0, texture: 0.18 });
    this.camera.layer(paper, 0.94, v => drawProps(paper, environment.details, v.from, v.to, windAt, t, [{x:this.cat.x,y:this.cat.root.y}]));
    this.camera.layer(paper, 1.08, v => drawSward(paper, environment.sward, v.from, v.to, windAt, t, [{x:this.cat.x,y:this.cat.root.y}]));

    singleLineTitle(paper, SAMSUNG_TITLES[index], 110, 142, 50, 650);
    const subtitleLines = outlinedText(paper, SAMSUNG_SUBTITLES[index], 114, 220, 25, true, 650);
    if (subtitleLines !== 2) throw new Error(`Samsung scene ${index + 1} subtitle rendered ${subtitleLines} lines; expected exactly two in the Nokia Full safe zone.`);

    const fly = (lineOffset: number, segment: number, within: number, duration: number,
      bounds: {x:number;y:number;w:number;h:number}, draw: () => void, seed: number) =>
      paperFlyIn(paper, sceneLocal, beat(segment, within, lineOffset), duration, bounds, draw, seed);

    if (index === 0) {
      fly(0, 0, 0.22, 0.95, {x: 850, y: 230, w: 520, h: 620}, () => {
        galaxyPhone(paper, 1000, 255, 1.22);
        rounded(paper, 920, 835, 470, 20, 8, '#8c735e');
      }, 9400);
      fly(1, 0, 0.20, 0.9, {x: 1390, y: 320, w: 320, h: 500}, () => {
        cargoCrate(paper, 1410, 590, 270, 205, 'CÁ KHÔ', '#a7794f', 9402);
        cargoCrate(paper, 1450, 390, 210, 160, 'RAU CỦ', '#8b9c70', 9403);
      }, 9401);
    } else if (index === 1) {
      fly(0, 0, 0.18, 0.9, {x: 850, y: 230, w: 820, h: 610}, () => {
        paper.sheet({shadow:14,rim:{color:'rgba(255,244,224,0.75)',width:3},shade:{color:'rgba(30,24,20,0.28)',width:4},texture:0.48},()=>{
          rounded(paper, 900, 410, 700, 360, 18, '#d7b98c', '#795b43');
          rounded(paper, 850, 360, 800, 70, 10, '#684c3a');
          rounded(paper, 980, 475, 180, 250, 8, '#6f503d');
          rounded(paper, 1180, 475, 180, 250, 8, '#6f503d');
          outlinedText(paper, 'SAMSUNG SANGHOE', 930, 410, 34, false, 620);
          paper.piece([{x:900,y:430},{x:1600,y:430},{x:1585,y:450},{x:915,y:450}], '#b58b60', {seed:9410,tear:2,shadow:3});
        });
      }, 9411);
      fly(0, 1, 0.30, 0.8, {x: 860, y: 730, w: 820, h: 160}, () => {
        cargoCrate(paper, 890, 745, 230, 125, 'CÁ KHÔ', '#a7794f', 9412);
        cargoCrate(paper, 1140, 745, 230, 125, 'GẠO', '#b99a64', 9413);
        cargoCrate(paper, 1390, 745, 230, 125, 'TRÁI CÂY', '#a66e4f', 9414);
      }, 9415);
    } else if (index === 2) {
      fly(0, 0, 0.20, 0.9, {x: 850, y: 290, w: 850, h: 540}, () => {
        paper.sheet({shadow:13,rim:{color:'rgba(255,244,224,0.75)',width:3},shade:{color:'rgba(30,24,20,0.28)',width:4},texture:0.46},()=>{
          paper.piece([{x:900,y:690},{x:1570,y:690},{x:1690,y:590},{x:1040,y:590}], '#c9d4d0', {seed:9420,tear:3,shadow:10,texture:0.5});
          paper.piece([{x:980,y:590},{x:1050,y:410},{x:1480,y:410},{x:1570,y:590}], '#7d9a9a', {seed:9421,tear:3,shadow:8,texture:0.5});
          paper.piece([{x:1210,y:410},{x:1240,y:285},{x:1260,y:285},{x:1285,y:410}], '#6a5543', {seed:9422,tear:2,shadow:5});
          paper.piece([{x:1260,y:300},{x:1450,y:410},{x:1260,y:410}], '#f1e6d3', {seed:9423,tear:2.5,shadow:5});
          cargoCrate(paper, 980, 500, 170, 115, 'HÀNG', '#a7794f', 9424);
          cargoCrate(paper, 1390, 500, 170, 115, 'XUẤT', '#8b9c70', 9425);
        });
      }, 9426);
      fly(0, 1, 0.35, 0.8, {x: 860, y: 770, w: 800, h: 120}, () => {
        for (let i = 0; i < 5; i++) cargoCrate(paper, 875 + i * 155, 780, 135, 92, ['GẠO','CÁ','RAU','QUẢ','HÀNG'][i], ['#b99a64','#a7794f','#8b9c70','#a66e4f','#9b8063'][i], 9430 + i);
      }, 9435);
    } else if (index === 3) {
      fly(0, 0, 0.25, 0.95, {x: 850, y: 260, w: 850, h: 580}, () => {
        paper.sheet({shadow:13,rim:{color:'rgba(255,244,224,0.7)',width:3},shade:{color:'rgba(30,24,20,0.26)',width:4},texture:0.5},()=>{
          rounded(paper, 890, 470, 360, 300, 12, '#b7c9bd', '#647d7d');
          rounded(paper, 1290, 470, 360, 300, 12, '#d7c7a6', '#8a7355');
          for (let i = 0; i < 5; i++) {
            paper.line([{x: 930 + i*58,y: 500},{x:930+i*58,y:740}], '#718f82', 9);
            paper.piece(circlePoly({x: 960 + i*58,y: 515}, 28, 18), ['#7e9c91','#9eaf8d','#c0a56e'][i%3], {seed:9440+i,tear:2,shadow:4});
          }
          for (let i = 0; i < 7; i++) paper.line([{x: 1320+i*43,y: 520},{x: 1320+i*43,y: 735}], '#9b785d', 7);
          outlinedText(paper, 'DỆT MAY', 980, 820, 31, false, 220);
          outlinedText(paper, 'THỰC PHẨM', 1350, 820, 29, false, 260);
        });
      }, 9448);
      fly(0, 1, 0.3, 0.75, {x: 1000, y: 250, w: 650, h: 170}, () => {
        rounded(paper, 1060, 285, 540, 90, 12, '#efe3cd', '#907b62');
        outlinedText(paper, 'MỞ RỘNG KINH DOANH', 1090, 340, 29, false, 470);
      }, 9449);
    } else if (index === 4) {
      fly(0, 0, 0.18, 0.9, {x: 850, y: 260, w: 850, h: 590}, () => {
        paper.sheet({shadow:15,rim:{color:'rgba(255,244,224,0.78)',width:3},shade:{color:'rgba(30,24,20,0.3)',width:4},texture:0.48},()=>{
          rounded(paper, 900, 440, 720, 330, 18, '#dce1d9', '#647d7d');
          rounded(paper, 980, 340, 560, 105, 12, '#54747a');
          outlinedText(paper, 'SAMSUNG ELECTRONICS', 1010, 410, 32, false, 500);
          for (let i = 0; i < 4; i++) {
            rounded(paper, 950 + i*165, 570, 125, 125, 8, '#a9b7ad');
            rounded(paper, 975 + i*165, 595, 75, 75, 5, ['#d6e0d8','#8ca7a1','#b5a58f','#879bb0'][i]);
          }
          paper.line([{x:930,y:725},{x:1590,y:725}], '#71817c', 10);
        });
      }, 9450);
      fly(0, 1, 0.45, 0.75, {x: 1000, y: 810, w: 660, h: 90}, () => {
        outlinedText(paper, '1969  •  ĐIỆN TỬ', 1100, 870, 36, false, 500);
      }, 9451);
    } else if (index === 5) {
      fly(0, 0, 0.2, 0.9, {x: 950, y: 235, w: 650, h: 630}, () => {
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(20,20,20,0.38)',width:5},texture:0.5},()=>{
          rounded(paper, 1040, 330, 480, 390, 36, '#3c4141', '#202728');
          rounded(paper, 1080, 370, 400, 285, 18, '#d4d3c9');
          paper.piece(circlePoly({x: 1278,y: 510}, 112, 38), '#7e8581', {seed:9460,tear:2.4,shadow:6,texture:0.35});
          paper.piece(circlePoly({x: 1278,y: 510}, 82, 38), '#d9d8cf', {seed:9461,tear:1.7,shadow:2});
          rounded(paper, 1170, 680, 220, 38, 8, '#806047');
          paper.piece(circlePoly({x: 1460,y: 695}, 18, 20), '#d5c7a9', {seed:9462,tear:1.4,shadow:3});
          outlinedText(paper, 'P-3202', 1180, 770, 30, false, 180);
        });
      }, 9463);
      fly(0, 1, 0.28, 0.7, {x: 870, y: 800, w: 800, h: 95}, () => {
        cargoCrate(paper, 930, 815, 310, 76, 'SAMSUNG-SANYO', '#967653', 9464);
        outlinedText(paper, '1970', 1340, 875, 38);
      }, 9465);
    } else if (index === 6) {
      fly(0, 0, 0.2, 0.9, {x: 850, y: 260, w: 850, h: 590}, () => {
        paper.sheet({shadow:15,rim:{color:'rgba(255,244,224,0.75)',width:3},shade:{color:'rgba(30,24,20,0.3)',width:4},texture:0.48},()=>{
          paper.piece([{x:930,y:690},{x:1560,y:690},{x:1670,y:570},{x:1050,y:570}], '#6d8990', {seed:9470,tear:3,shadow:9,texture:0.5});
          paper.piece([{x:1080,y:570},{x:1080,y:440},{x:1110,y:440},{x:1110,y:570}], '#65513f', {seed:9471,tear:2,shadow:4});
          paper.piece([{x:1100,y:445},{x:1450,y:445},{x:1280,y:280}], '#eee5d5', {seed:9472,tear:2.8,shadow:7});
          cargoCrate(paper, 1160, 485, 240, 140, 'TV SAMSUNG', '#a7794f', 9473);
          paper.piece([{x:1500,y:365},{x:1580,y:385},{x:1500,y:405}], '#c65f4f', {seed:9474,tear:2,shadow:4});
          outlinedText(paper, 'PANAMA', 1450, 820, 44);
        });
      }, 9475);
      fly(0, 1, 0.38, 0.75, {x: 880, y: 820, w: 780, h: 80}, () => {
        outlinedText(paper, 'XUẤT KHẨU  •  1971', 1040, 880, 36, false, 500);
      }, 9476);
    } else if (index === 7) {
      fly(0, 0, 0.2, 0.9, {x: 850, y: 220, w: 850, h: 640}, () => {
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.52},()=>{
          paper.piece(circlePoly({x: 1240,y: 500}, 220, 64), '#829da0', {seed:9480,tear:3,shadow:10,texture:0.5});
          paper.piece(circlePoly({x: 1240,y: 500}, 184, 64), '#a8c0bc', {seed:9481,tear:2,shadow:5});
          for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
            rounded(paper, 1110 + i*52, 370 + j*52, 38, 38, 4, '#d8e3db');
            paper.piece(circlePoly({x: 1129+i*52,y:389+j*52}, 7, 12), '#526b72', {seed:9482+i*5+j,tear:1,shadow:1});
          }
          rounded(paper, 850, 700, 420, 95, 12, '#e8e1d2', '#8a887e');
          outlinedText(paper, 'KOREA SEMICONDUCTOR', 880, 760, 26, false, 360);
        });
      }, 9489);
      fly(0, 1, 0.38, 0.75, {x: 850, y: 820, w: 850, h: 75}, () => {
        rounded(paper, 930, 830, 690, 48, 10, '#647c80');
        outlinedText(paper, '50%  •  1974', 1130, 868, 34);
      }, 9490);
    } else if (index === 8) {
      fly(0, 0, 0.18, 0.9, {x: 850, y: 260, w: 850, h: 580}, () => {
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.5},()=>{
          for (let i = 0; i < 3; i++) {
            const x = 900 + i * 250;
            rounded(paper, x, 370, 220, 320, 24, '#3c4445', '#1e2527');
            rounded(paper, x + 20, 395, 180, 235, 12, ['#c96d50','#6b9b89','#6689ad'][i]);
            for (let j = 0; j < 3; j++) rounded(paper, x + 35 + j*48, 435 + (j%2)*70, 35, 44, 5, ['#f2d7a0','#d9e2d6','#d3c0df'][j]);
          }
          rounded(paper, 875, 710, 790, 34, 12, '#7e644b');
          outlinedText(paper, 'COLOR TELEVISION', 1090, 810, 38, false, 400);
        });
      }, 9498);
      fly(0, 1, 0.35, 0.75, {x: 950, y: 830, w: 700, h: 75}, () => {
        outlinedText(paper, '1977  •  TV MÀU', 1110, 880, 36);
      }, 9499);
    } else if (index === 9) {
      fly(0, 0, 0.2, 0.95, {x: 850, y: 230, w: 850, h: 620}, () => {
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.5},()=>{
          rounded(paper, 900, 350, 700, 390, 18, '#dce4df', '#6c8586');
          rounded(paper, 970, 280, 560, 90, 10, '#4f6972');
          outlinedText(paper, 'SAMSUNG ELECTRONICS', 1000, 340, 29, false, 500);
          paper.piece([{x:1000,y:530},{x:1110,y:450},{x:1210,y:530},{x:1320,y:450},{x:1450,y:530},{x:1560,y:450}], '#6f9194', {seed:9500,tear:3,shadow:7,texture:0.5});
          for (let i = 0; i < 6; i++) {
            const x = 990 + i * 95;
            rounded(paper, x, 575, 72, 90, 8, ['#8ca7a1','#b7a17f','#7796a2','#9c8fa8','#7e9c91','#c18d72'][i]);
            paper.piece(circlePoly({x:x+36,y:620},16,16),'#d8e3db',{seed:9510+i,tear:1.4,shadow:2});
          }
        });
      }, 9501);
      fly(0, 1, 0.35, 0.8, {x: 900, y: 790, w: 760, h: 110}, () => {
        for (let i = 0; i < 4; i++) rounded(paper, 940 + i*170, 810, 145, 65, 8, ['#7d9b91','#9eaa9b','#b8a083','#718b97'][i]);
        outlinedText(paper, '1980  •  BÁN DẪN', 1080, 900, 34, false, 500);
      }, 9502);
    } else {
      fly(0, 0, 0.20, 0.95, {x:850,y:220,w:850,h:620}, () => drawExtendedSamsungProp(paper,index), 9720 + index * 3);
      fly(0, 1, 0.34, 0.78, {x:870,y:810,w:820,h:90}, () => {
        const labels = ['1983 • 64K DRAM','1984 • 256K DRAM','1986 • 1M DRAM','1988 • 4M DRAM','1992 • 64M DRAM','1993 • NEW MANAGEMENT','1997 • TÁI CẤU TRÚC','CHẤT LƯỢNG • THIẾT KẾ','THƯƠNG HIỆU TOÀN CẦU','TV MÀN HÌNH PHẲNG','2010 • GALAXY S','2011 • GALAXY NOTE','HỆ SINH THÁI GALAXY','2019 • GALAXY FOLD','BỘ NHỚ CHO AI','CÔNG NGHỆ • CON NGƯỜI','KỂ KỶ NIỆM CỦA BẠN','HẸN GẶP LẠI'];
        outlinedText(paper, labels[index - 10], 1030, 870, 34, false, 600);
      }, 9721 + index * 3);
    }

    this.camera.layer(paper, 1, () => this.cat.draw(paper));
  }

  private drawMoon(x: number, y: number): void {
    const ctx = this.ctx;
    const glow = ctx.createRadialGradient(x, y, 70, x, y, 390);
    glow.addColorStop(0, 'rgba(238,232,205,0.30)'); glow.addColorStop(1, 'rgba(238,232,205,0)');
    ctx.fillStyle = glow; ctx.fillRect(x-410, y-410, 820, 820);
    this.paper.piece(circlePoly({x,y},98,44), '#fbf2d9', {seed:900,tear:2.5,shadow:0,texture:0.18});
    [[-28,-18,17],[25,20,22],[-8,42,12],[38,-32,9]].forEach(([dx,dy,r],i) =>
      this.paper.piece(circlePoly({x:x+dx,y:y+dy},r,16), '#e8dfc5', {seed:910+i,tear:1.1,shadow:0,edge:false}));
  }

  soundtrack(sampleRate: number): Stereo {
    const mix = new Mixer(this.videoLength, sampleRate)
      .bus('music', {gain:0.55,reverb:0.28})
      .bus('ambience', {gain:0.22,reverb:0.16});
    const roots = [note('C4'), note('A3'), note('F3'), note('G3')];
    for (let s = 0; s < SCENE_LINE_INDEX.length; s++) {
      const start = sceneStart(s);
      const next = s + 1 < SCENE_LINE_INDEX.length ? sceneStart(s + 1) : DURATION;
      const duration = Math.max(0.1, next - start);
      const root = roots[Math.floor(s / 3) % roots.length];
      for (const [i, n] of triad(root, 'major', 0).entries()) {
        mix.add('music', start, instrument.pad(n - 12, duration, sampleRate, {
          seed: 5400 + s * 7 + i, cutoff: s >= 6 ? 560 : 920, attack: 0.9, release: 1.1,
        }), {gain:0.12,pan:(i-1)*0.32});
      }
      mix.add('music', start + 0.7, instrument.harp(root + 12, sampleRate, {seed:5600+s,decay:1.05}), {gain:0.11,pan:s%2?0.25:-0.25});
      if (duration > 4.5) mix.add('music', start + 4.2, instrument.harp(root + 19, sampleRate, {seed:5700+s,decay:0.72}), {gain:0.065,pan:s%2?-0.2:0.2});
      mix.add('ambience', start, instrument.pad(root - 24, duration, sampleRate, {seed:5800+s,cutoff:420,attack:0.8,release:0.8}), {gain:0.075});
      if ([0,1,3,5,7,9].includes(s)) mix.add('ambience', start + 0.18, instrument.chime(root + 24, sampleRate), {gain:0.09,pan:0.2});
    }
    return mix.render({reverb:{room:0.58,damp:0.62},master:-2,ceiling:-1,fadeIn:0.8,fadeOut:1.5});
  }
}
