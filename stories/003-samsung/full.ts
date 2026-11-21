import {
  Mixer, Stage, Camera, fillGradient, tearWipe, ramp, vignette, grain, circlePoly,
  instrument, note, triad, drawProps, drawRidge, drawSward, drawSky, drawRain, blink,
  type Paper, type RidgeSpec, type Stereo,
} from '../../src';
import { createCitySkyline, createGrassland, meadowWind, nightSky, rainfall } from '../shared/environment';
import { CAT_REST, SIGNATURE_CAT_LOOK, Cat } from '../../examples/rooftops/Cat';
import { STORY_TIMING } from './voiceoverTiming';

const W = 1920, H = 1080, DURATION = STORY_TIMING.duration_sec;
const TEXT_SAFE_ZONE = { left: 80, right: 780, top: 70, bottom: 440 };
const PROP_SAFE_LEFT = TEXT_SAFE_ZONE.right + 20;
const CAT_BLINKS = Array.from({ length: 110 }, (_, i) => 1.1 + i * 5.1 + (i % 4) * 0.65);
const SCENE_LINE_INDEX = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,22,23,24,25,26,28] as const;

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
  "BẠN SẼ KHÔNG TIN SAMSUNG BẮT ĐẦU TỪ ĐÂU",
  "BA NGÔI SAO",
  "SAMSUNG KHÔNG MUỐN MÃI BÁN CÁ KHÔ",
  "MỘT QUYẾT ĐỊNH CÓ VẺ ĐIÊN RỒ",
  "CHIẾC TIVI MỞ RA TƯƠNG LAI",
  "NHỮNG CHIẾC TIVI CHƯA ĐỦ",
  "MỘT QUYẾT ĐỊNH ĐỐT TIỀN",
  "KẺ ĐI SAU MUỐN ĐUỔI KỊP",
  "CON CHIP NHỎ, BƯỚC NGOẶT LỚN",
  "THAY ĐỔI HOẶC BỊ BỎ LẠI",
  "THAM VỌNG BẮT ĐẦU THÀNH HIỆN THỰC",
  "SAMSUNG CŨNG MUỐN LÀM ĐIỆN THOẠI",
  "KHI NHỮNG ÔNG LỚN ĐÃ CÓ CHỖ ĐỨNG",
  "SAMSUNG BẮT ĐẦU CHƠI KHÁC",
  "MỘT CHIẾC ĐIỆN THOẠI ĐỔI CUỘC CHƠI",
  "SAMSUNG TUNG RA QUÂN BÀI",
  "CUỘC CHIẾN KHÔNG KHOAN NHƯỢNG",
  "MỘT Ý TƯỞNG TỪNG BỊ CHÊ CƯỜI",
  "KHI KẺ BỊ CHÊ LẠI TẠO XU HƯỚNG",
  "CHIẾN THẮNG KHÔNG KÉO DÀI MÃI",
  "CÚ NGÃ MANG TÊN NOTE 7",
  "SAMSUNG PHẢI GIÀNH LẠI NIỀM TIN",
  "BÍ MẬT PHÍA SAU NHỮNG CHIẾC ĐIỆN THOẠI",
  "LẠI MỘT LẦN THỬ THÁCH GIỚI HẠN",
  "ĐIỀU GÌ TẠO NÊN MỘT ĐẾ CHẾ",
  "CÂU CHUYỆN CHƯA KẾT THÚC"
] as const;
export const SAMSUNG_SUBTITLES = [
  "Daegu, Hàn Quốc • 1938\nCá khô, rau củ và hàng tạp hóa",
  "Samsung nghĩa là ba ngôi sao\nTham vọng lớn hơn một cửa hàng",
  "Dệt may, bảo hiểm và thương mại\nTừ buôn bán sang tự sản xuất",
  "Samsung Electronics ra đời năm 1969\nBước vào ngành điện tử cạnh tranh",
  "Tivi đen trắng • 1970\nNền móng của đế chế điện tử",
  "Tivi, tủ lạnh và máy giặt\nKhông thể mãi phụ thuộc công nghệ ngoài",
  "Đầu tư vào ngành bán dẫn\nCuộc chơi tốn kém và rủi ro",
  "Tuyển kỹ sư • tiếp nhận công nghệ\nNghiên cứu để đuổi kịp",
  "64K DRAM • 1983\nBước tiến trong công nghệ bộ nhớ",
  "Lee Kun-hee • New Management 1993\nChất lượng thay vì chỉ số lượng",
  "Nghiên cứu • chip • công nghệ điện tử\nTham vọng cạnh tranh toàn cầu",
  "Điện thoại Samsung đầu tiên tại Hàn Quốc\n1988 • thị trường còn non trẻ",
  "Nokia và Motorola đã có vị thế\nSamsung cần một khác biệt",
  "Điện thoại gập • trượt • nhiều màu sắc\nThiết bị trở thành cá tính",
  "iPhone • 2007\nĐiện thoại bước sang kỷ nguyên mới",
  "Galaxy S • 2010\nSamsung bước vào cuộc đua smartphone",
  "Apple và Samsung\nHai chiến lược trong một cuộc đua",
  "Galaxy Note • 2011\nMàn hình lớn và bút S Pen",
  "Từ bị chê quá khổ đến được yêu thích\nMột phân khúc khách hàng mới",
  "Galaxy Note 7 • 2016\nMột khủng hoảng không ngờ tới",
  "Sự cố pin và chương trình thu hồi\nAn toàn là giới hạn không thể thỏa hiệp",
  "Galaxy S8 và kiểm định chất lượng\nGiành lại niềm tin khách hàng",
  "Bán dẫn • bộ nhớ • màn hình\nLinh kiện phía sau thiết bị",
  "Galaxy Fold • 2019\nMở ra hướng đi cho điện thoại gập",
  "Từ cửa hàng cá khô đến tập đoàn công nghệ\nĐầu tư • thay đổi • dám thử thách",
  "Gần một thế kỷ thăng trầm\nSau vấp ngã, tiếp tục bước đi"
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
if (STORY_TIMING.lines.length !== 29 || SAMSUNG_TITLES.length !== 26 ||
    SAMSUNG_SUBTITLES.length !== 26 || SCENE_LINE_INDEX.length !== 26 || PALETTES.length < 26) {
  throw new Error('Samsung Full v2 requires 29 measured voice lines mapped to exactly 26 story scenes.');
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
  if (index === 10) {
    // Research investment and technology ambition.
    chip(1120,390,300,'R&D',9620,'#9fb9aa');
    for(let i=0;i<5;i++) paper.line([{x:980+i*125,y:760},{x:1630,y:760-i*35}],'#b8c9bd',7);
    outlinedText(paper,'ĐẦU TƯ DÀI HẠN',1080,830,36,false,460);
  } else if (index === 11) {
    // First-generation mobile handset.
    rounded(paper,1160,290,270,510,40,'#343e45','#9ba8a0');
    rounded(paper,1190,335,210,300,18,'#c6d1c9','#788c88');
    rounded(paper,1230,660,130,92,14,'#9aab9e','#d6e0d8');
    outlinedText(paper,'1988',1220,855,44,false,180);
  } else if (index === 12) {
    // Two established competitors.
    rounded(paper,1010,330,250,470,35,'#34434a','#a5b3aa');
    rounded(paper,1040,370,190,300,14,'#9caea3');
    for(let i=0;i<3;i++) rounded(paper,1060+i*48,690,34,28,5,'#d7d9c8');
    rounded(paper,1370,330,250,470,35,'#343e49','#a5b3aa');
    rounded(paper,1400,370,190,300,14,'#8da7a4');
    outlinedText(paper,'NOKIA',1055,850,32,false,180);
    outlinedText(paper,'MOTOROLA',1375,850,27,false,230);
  } else if (index === 13) {
    // Foldable and slider designs.
    rounded(paper,1000,340,245,430,34,'#38464a','#aab7ad');
    rounded(paper,1025,370,195,350,22,'#8fa9a1');
    paper.line([{x:1122,y:350},{x:1122,y:760}],'#d8e4da',7);
    rounded(paper,1360,340,245,430,34,'#38464a','#aab7ad');
    rounded(paper,1385,370,195,350,22,'#a2b6a8');
    rounded(paper,1385,545,195,145,12,'#6f8e8a');
    outlinedText(paper,'GẬP',1050,835,34,false,150);
    outlinedText(paper,'TRƯỢT',1390,835,34,false,180);
  } else if (index === 14) {
    // Touchscreen shift.
    galaxyPhone(paper,1130,260,1.38);
    for(let i=0;i<3;i++) paper.piece(circlePoly({x:1000+i*520,y:760},38,24),'#e5c47f',{seed:9630+i,tear:2,shadow:5});
    outlinedText(paper,'MÀN HÌNH CẢM ỨNG',1010,865,34,false,650);
  } else if (index === 15) {
    galaxyPhone(paper,1130,260,1.38);
    outlinedText(paper,'GALAXY S • 2010',1110,850,36,false,420);
  } else if (index === 16) {
    galaxyPhone(paper,980,330,1.0);
    galaxyPhone(paper,1400,330,1.0);
    outlinedText(paper,'ANDROID',1000,830,30,false,220);
    outlinedText(paper,'HỆ SINH THÁI RIÊNG',1370,830,28,false,300);
  } else if (index === 17 || index === 18) {
    galaxyPhone(paper,1110,270,1.38);
    paper.line([{x:1510,y:370},{x:1610,y:650}],'#c6a16f',9);
    outlinedText(paper,index===17?'S PEN • 2011':'GHI CHÚ • SÁNG TẠO',1460,760,28,false,240);
  } else if (index === 19) {
    galaxyPhone(paper,1130,260,1.35);
    paper.piece(circlePoly({x:1510,y:380},72,36),'#d8b46d',{seed:9640,tear:2,shadow:8});
    outlinedText(paper,'NOTE 7',1450,520,34,false,180);
  } else if (index === 20) {
    rounded(paper,1110,300,360,500,34,'#333e46','#aab7ad');
    rounded(paper,1140,335,300,430,20,'#a9b7ad','#dce4da');
    paper.piece(circlePoly({x:1280,y:535},100,48),'#c27c65',{seed:9641,tear:2.8,shadow:8});
    outlinedText(paper,'THU HỒI',1160,855,38,false,260);
  } else if (index === 21) {
    rounded(paper,1010,370,620,360,20,'#d7e1d9','#718981');
    for(let i=0;i<5;i++) {
      rounded(paper,1050+i*112,470,82,145,10,['#8ca79c','#a7b7aa','#b5a58b'][i%3]);
      paper.piece(circlePoly({x:1091+i*112,y:445},18,16),'#e5c57f',{seed:9650+i,tear:1.5,shadow:3});
    }
    outlinedText(paper,'KIỂM ĐỊNH • AN TOÀN',1050,810,36,false,540);
  } else if (index === 22) {
    chip(1100,390,250,'DRAM',9660,'#9fb9aa');
    chip(1430,440,210,'NAND',9661,'#8fae9f');
    outlinedText(paper,'BỘ NHỚ • MÀN HÌNH',1040,820,36,false,600);
  } else if (index === 23) {
    rounded(paper,1050,330,260,470,34,'#27323c','#899ba0'); rounded(paper,1080,360,200,390,20,'#7b9fa6');
    rounded(paper,1310,330,260,470,34,'#27323c','#899ba0'); rounded(paper,1340,360,200,390,20,'#8fb4b0');
    paper.line([{x:1300,y:360},{x:1300,y:770}],'#d9e2da',8); outlinedText(paper,'FOLD • 2019',1160,850,38,false,300);
  } else if (index === 24) {
    // Visual bridge from the small shop to modern technology.
    cargoCrate(paper,930,560,210,150,'CÁ KHÔ','#a7794f',9670);
    chip(1280,420,180,'CHIP',9671,'#9fb9aa');
    galaxyPhone(paper,1500,390,0.72);
    paper.line([{x:1140,y:630},{x:1280,y:520},{x:1500,y:520}],'#d5c29b',8);
  } else {
    // Closing image leaves room for the mascot and final brand mark.
    paper.piece([{x:950,y:380},{x:1640,y:380},{x:1640,y:690},{x:1280,y:690},{x:1190,y:790},{x:1200,y:690},{x:950,y:690}],'#f2e6d1',{seed:9700,tear:4,shadow:13,texture:0.45});
    outlinedText(paper,'CÂU CHUYỆN CHƯA KẾT THÚC',1000,510,37,false,590);
    outlinedText(paper,'MỌT MỌT STUDIO',1110,590,32,false,420);
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
  private readonly crisisRain = rainfall(8130, 'light');
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
    const outdoor = index <= 3 || index >= 26;
    if (outdoor) {
      this.camera.layer(paper, 0.66, v => drawProps(paper, environment.trees, v.from, v.to, windAt, t));
    }
    this.camera.layer(paper, 1, v => drawRidge(paper, this.ridges[index % this.ridges.length], v.from, v.to, 1120));
    ctx.globalAlpha = 0.22 + 0.02 * Math.sin(t * 1.8);
    ctx.fillStyle = 'rgba(255,255,255,0.24)'; ctx.beginPath(); ctx.arc(1570, 260, 230, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    paper.piece([{x:0,y:870},{x:W,y:870},{x:W,y:H+20},{x:0,y:H+20}], 'rgba(35,48,56,0.08)', { seed: 6390 + index, tear: 1.5, shadow: 0, texture: 0.18 });
    if (outdoor) {
      this.camera.layer(paper, 0.94, v => drawProps(paper, environment.details, v.from, v.to, windAt, t, [{x:this.cat.x,y:this.cat.root.y}]));
      this.camera.layer(paper, 1.08, v => drawSward(paper, environment.sward, v.from, v.to, windAt, t, [{x:this.cat.x,y:this.cat.root.y}]));
    }

    // A brief light shower underscores the 1997 crisis; it is a reusable, deterministic repo weather layer.
    if (index === 20) this.camera.layer(paper, 1.1, v => drawRain(paper.context, this.crisisRain, v, t, () => 890));

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
      fly(0, 0, 0.18, 0.9, {x: 850, y: 260, w: 850, h: 590}, () => {
        paper.sheet({shadow:15,rim:{color:'rgba(255,244,224,0.78)',width:3},shade:{color:'rgba(30,24,20,0.3)',width:4},texture:0.48},()=>{
          rounded(paper,900,440,720,330,18,'#dce1d9','#647d7d');
          rounded(paper,980,340,560,105,12,'#54747a');
          outlinedText(paper,'SAMSUNG ELECTRONICS',1010,410,32,false,500);
          for(let i=0;i<4;i++){
            rounded(paper,950+i*165,570,125,125,8,'#a9b7ad');
            rounded(paper,975+i*165,595,75,75,5,['#d6e0d8','#8ca7a1','#b5a58f','#879bb0'][i]);
          }
          paper.line([{x:930,y:725},{x:1590,y:725}],'#71817c',10);
        });
      },9450);
      fly(0,1,0.45,0.75,{x:1000,y:810,w:660,h:90},()=>{
        outlinedText(paper,'1969  •  ĐIỆN TỬ',1100,870,36,false,500);
      },9451);
    } else if (index === 4) {
      fly(0,0,0.2,0.9,{x:950,y:235,w:650,h:630},()=>{
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(20,20,20,0.38)',width:5},texture:0.5},()=>{
          rounded(paper,1040,330,480,390,36,'#3c4141','#202728');
          rounded(paper,1080,370,400,285,18,'#d4d3c9');
          paper.piece(circlePoly({x:1278,y:510},112,38),'#7e8581',{seed:9460,tear:2.4,shadow:6,texture:0.35});
          paper.piece(circlePoly({x:1278,y:510},82,38),'#d9d8cf',{seed:9461,tear:1.7,shadow:2});
          rounded(paper,1170,680,220,38,8,'#806047');
          paper.piece(circlePoly({x:1460,y:695},18,20),'#d5c7a9',{seed:9462,tear:1.4,shadow:3});
          outlinedText(paper,'TV ĐEN TRẮNG',1120,770,30,false,320);
        });
      },9463);
      fly(0,1,0.28,0.7,{x:870,y:800,w:800,h:95},()=>{
        outlinedText(paper,'1970  •  TIVI ĐẦU TIÊN',1000,875,36,false,560);
      },9465);
    } else if (index === 5) {
      fly(0,0,0.2,0.9,{x:850,y:260,w:850,h:590},()=>{
        paper.sheet({shadow:15,rim:{color:'rgba(255,244,224,0.75)',width:3},shade:{color:'rgba(30,24,20,0.3)',width:4},texture:0.48},()=>{
          const appliances=[{x:930,label:'TỦ LẠNH'},{x:1190,label:'MÁY GIẶT'},{x:1450,label:'TIVI'}];
          for(const [i,a] of appliances.entries()){
            rounded(paper,a.x,390,210,330,18,['#b8c8c2','#c9c8b7','#aebfc0'][i],'#647c7b');
            rounded(paper,a.x+18,415,174,210,10,['#dbe4dc','#8da5a1','#758c91'][i]);
            outlinedText(paper,a.label,a.x+8,770,24,false,195);
          }
        });
      },9475);
      fly(0,1,0.38,0.75,{x:880,y:820,w:780,h:80},()=>{
        outlinedText(paper,'THIẾT BỊ GIA DỤNG',1040,880,36,false,500);
      },9476);
    } else if (index === 6) {
      fly(0,0,0.2,0.9,{x:850,y:220,w:850,h:640},()=>{
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.52},()=>{
          paper.piece(circlePoly({x:1240,y:500},220,64),'#829da0',{seed:9480,tear:3,shadow:10,texture:0.5});
          paper.piece(circlePoly({x:1240,y:500},184,64),'#a8c0bc',{seed:9481,tear:2,shadow:5});
          for(let i=0;i<5;i++)for(let j=0;j<5;j++){
            rounded(paper,1110+i*52,370+j*52,38,38,4,'#d8e3db');
            paper.piece(circlePoly({x:1129+i*52,y:389+j*52},7,12),'#526b72',{seed:9482+i*5+j,tear:1,shadow:1});
          }
          rounded(paper,850,700,420,95,12,'#e8e1d2','#8a887e');
          outlinedText(paper,'KOREA SEMICONDUCTOR',880,760,26,false,360);
        });
      },9489);
      fly(0,1,0.38,0.75,{x:850,y:820,w:850,h:75},()=>{
        rounded(paper,930,830,690,48,10,'#647c80');
        outlinedText(paper,'ĐẦU TƯ BÁN DẪN',1080,868,34,false,420);
      },9490);
    } else if (index === 7) {
      fly(0,0,0.18,0.9,{x:850,y:260,w:850,h:580},()=>{
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.5},()=>{
          for(let i=0;i<3;i++){
            const x=900+i*250;
            rounded(paper,x,370,220,320,24,'#3c4445','#1e2527');
            rounded(paper,x+20,395,180,235,12,['#c8d8d0','#9fb6ac','#7e9ca4'][i]);
            for(let j=0;j<4;j++)paper.line([{x:x+38,y:435+j*48},{x:x+180,y:435+j*48}],'#e4d8bd',4);
          }
          outlinedText(paper,'KỸ SƯ NGHIÊN CỨU',1030,770,34,false,500);
          paper.piece(circlePoly({x:1550,y:300},72,32),'#e5c47f',{seed:9497,tear:2,shadow:7});
        });
      },9498);
      fly(0,1,0.35,0.75,{x:950,y:830,w:700,h:75},()=>{
        outlinedText(paper,'NGHIÊN CỨU • PHÁT TRIỂN',1050,880,34,false,560);
      },9499);
    } else if (index === 8) {
      fly(0,0,0.2,0.95,{x:850,y:230,w:850,h:620},()=>{
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.5},()=>{
          rounded(paper,930,350,650,390,18,'#dce4df','#6c8586');
          for(let i=0;i<7;i++)for(let j=0;j<5;j++)
            rounded(paper,1000+i*75,410+j*58,48,38,5,['#7b9997','#a9b9a8','#c0a77c'][(i+j)%3]);
          outlinedText(paper,'64K DRAM',1110,720,48,false,340);
          paper.piece(circlePoly({x:1510,y:300},74,40),'#d7bd7c',{seed:9500,tear:2.2,shadow:8});
        });
      },9501);
      fly(0,1,0.35,0.8,{x:900,y:790,w:760,h:110},()=>{
        outlinedText(paper,'1983  •  BƯỚC NGOẶT',1050,880,36,false,540);
      },9502);
    } else if (index === 9) {
      fly(0,0,0.2,0.95,{x:850,y:230,w:850,h:620},()=>{
        paper.sheet({shadow:16,rim:{color:'rgba(255,244,224,0.8)',width:3},shade:{color:'rgba(30,24,20,0.32)',width:4},texture:0.5},()=>{
          rounded(paper,930,350,650,390,18,'#dce4df','#6c8586');
          outlinedText(paper,'KIỂM ĐỊNH CHẤT LƯỢNG',1000,420,34,false,540);
          for(let i=0;i<4;i++){
            rounded(paper,990+i*155,500,120,150,12,['#a9b9a8','#8fa9a1','#c4b28f','#8ba1ad'][i]);
            paper.piece(circlePoly({x:1050+i*155,y:480},20,16),'#e5c47f',{seed:9510+i,tear:1.4,shadow:3});
          }
          paper.line([{x:980,y:700},{x:1550,y:700}],'#71817c',9);
          outlinedText(paper,'1993',1190,790,40,false,180);
        });
      },9501);
      fly(0,1,0.35,0.8,{x:900,y:790,w:760,h:110},()=>{
        outlinedText(paper,'NEW MANAGEMENT',1060,880,36,false,500);
      },9502);
    } else {
      fly(0, 0, 0.20, 0.95, {x:850,y:220,w:850,h:620}, () => drawExtendedSamsungProp(paper,index), 9720 + index * 3);
      fly(0, 1, 0.34, 0.78, {x:870,y:810,w:820,h:90}, () => {
        const labels = ['NGHIÊN CỨU • ĐẦU TƯ','ĐIỆN THOẠI DI ĐỘNG • 1988','NOKIA • MOTOROLA','THIẾT KẾ GẬP VÀ TRƯỢT','IPHONE • 2007','GALAXY S • 2010','APPLE • ANDROID','GALAXY NOTE • 2011','S PEN • MÀN HÌNH LỚN','NOTE 7 • 2016','THU HỒI • AN TOÀN','GIÀNH LẠI NIỀM TIN','BÁN DẪN • BỘ NHỚ • MÀN HÌNH','GALAXY FOLD • 2019','ĐẦU TƯ • THAY ĐỔI','CÂU CHUYỆN CHƯA KẾT THÚC'];
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
