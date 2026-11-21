#!/usr/bin/env python3
"""Reusable 4K fixed-layout PaperMotion thumbnail generator."""
import argparse, io, random, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

W, H = 3840, 2160
S = 1.5
BG=(176,128,136); PAPER=(248,231,207); CREAM=(255,244,222)
INK=(30,24,31); RED=(112,43,55); MUTED=(91,54,64)

def xy(values):
    return tuple(round(v*S) for v in values)

def font(size,bold=False):
    paths=["/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
           "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for p in paths:
        if Path(p).exists(): return ImageFont.truetype(p,round(size*S))
    raise FileNotFoundError("Install fonts-noto-core.")

def background():
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im,"RGBA"); random.seed(41)
    for _ in range(18000):
        x=random.randrange(W); y=random.randrange(H); a=random.randrange(5,17)
        d.ellipse((x,y,x+2,y+2),fill=(255,239,224,a))
    d.line(xy((150,190,1120,190)),fill=(255,244,222,110),width=4)
    return im

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"PaperMotionThumbnail/2.0"})
    with urllib.request.urlopen(req,timeout=30) as r: data=r.read(20*1024*1024+1)
    if len(data)>20*1024*1024: raise ValueError("Hero image exceeds 20 MB.")
    return Image.open(io.BytesIO(data)).convert("RGB")

def cover(im,size):
    w,h=size; scale=max(w/im.width,h/im.height)
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
    x=(im.width-w)//2; y=(im.height-h)//2
    return im.crop((x,y,x+w,y+h))

def phone(canvas):
    layer=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(layer)
    d.rounded_rectangle(xy((1450,360,1900,1125)),radius=114,fill=(31,36,34,255),outline=(*PAPER,255),width=18)
    d.rounded_rectangle(xy((1492,405,1858,1080)),radius=69,fill=(77,91,76,255),outline=(159,158,129,255),width=9)
    d.rounded_rectangle(xy((1525,455,1825,680)),radius=24,fill=(192,202,158,255),outline=(30,40,34,255),width=12)
    d.text((int(1552*S),int(490*S)),"NOKIA",font=font(49,True),fill=(34,53,39,255))
    d.text((int(1550*S),int(570*S)),"Connecting people",font=font(17),fill=(34,53,39,255))
    d.ellipse(xy((1610,720,1740,850)),fill=(30,34,32,255),outline=(*PAPER,255),width=12)
    for row in range(4):
        for col in range(3):
            x,y=1540+col*100,890+row*48
            d.rounded_rectangle(xy((x,y,x+70,y+33)),radius=15,fill=(207,199,174,255),outline=(35,38,34,255),width=5)
    canvas.paste(layer,(0,0),layer)

def mystery_iphone(canvas):
    shadow=Image.new("RGBA",(W,H)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle(xy((1955,250,2390,1110)),radius=114,fill=(25,18,27,165))
    shadow=shadow.filter(ImageFilter.GaussianBlur(round(28*S))); canvas.paste(shadow,(0,0),shadow)
    layer=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(layer)
    d.rounded_rectangle(xy((1980,235,2390,1110)),radius=108,fill=(22,19,27,225),outline=(235,215,210,115),width=12)
    d.rounded_rectangle(xy((2005,265,2365,1080)),radius=81,fill=(42,34,43,215),outline=(176,128,136,150),width=6)
    d.rounded_rectangle(xy((2040,300,2185,445)),radius=45,fill=(16,14,20,220))
    for cx,cy in [(2080,345),(2140,345),(2080,405)]:
        r=17; d.ellipse(xy((cx-r,cy-r,cx+r,cy+r)),fill=(7,8,12,255),outline=(111,101,112,180),width=6)
    qf=font(250,True); bb=d.textbbox((0,0),"?",font=qf,stroke_width=6)
    qw,qh=bb[2]-bb[0],bb[3]-bb[1]
    d.text((int(2185*S-qw/2),int(660*S-qh/2)),"?",font=qf,fill=(248,231,207,245),stroke_width=6,stroke_fill=(15,12,18,230))
    canvas.paste(layer,(0,0),layer)

def hero_panel(canvas,hero,paper_underlay=None):
    backing=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(backing)
    d.ellipse(xy((1390,190,2490,1280)),fill=(116,61,76,255))
    d.polygon([tuple(round(v*S) for v in p) for p in [(1350,330),(2240,175),(2490,1190),(1450,1300)]],fill=(236,211,190,255))
    canvas.paste(backing,(0,0),backing)
    # PaperMotion's torn-paper sheets sit above the backing and below the
    # original hero image and both phone illustrations. The phones are never
    # textured or masked by the paper layer.
    if paper_underlay is not None:
        canvas.paste(paper_underlay,(0,0),paper_underlay)
    if hero is not None:
        crop=ImageEnhance.Contrast(ImageEnhance.Color(cover(hero,(round(950*S),round(900*S)))).enhance(.72)).enhance(1.05)
        mask=Image.new("L",crop.size); md=ImageDraw.Draw(mask)
        md.polygon([tuple(round(v*S) for v in p) for p in [(50,20),(900,0),(950,120),(920,820),(760,900),(80,875),(0,730),(25,150)]],fill=255)
        canvas.paste(crop,(round(1450*S),round(255*S)),mask)
    phone(canvas); mystery_iphone(canvas)

def wrap(text,f,maxw):
    words=text.replace("\\n","\n").split(); lines=[]; line=""
    for word in words:
        if word=="\n":
            if line: lines.append(line)
            line=""; continue
        candidate=(line+" "+word).strip()
        if line and f.getlength(candidate)>maxw: lines.append(line); line=word
        else: line=candidate
    if line: lines.append(line)
    return lines

def text_layer(canvas,title,kicker,subtitle):
    d=ImageDraw.Draw(canvas); left=int(165*S); maxw=int(1110*S)
    d.rounded_rectangle(xy((165,240,790,330)),radius=15,fill=RED)
    d.text((int(195*S),int(254*S)),kicker.upper(),font=font(39,True),fill=CREAM)
    size=198
    while size>132:
        tf=font(size,True); lines=wrap(title,tf,maxw); lineh=int(size*1.16*S)
        if len(lines)<=4 and lineh*len(lines)<=835*S: break
        size-=4
    yy=int(385*S)
    for i,line in enumerate(lines):
        d.text((left+int(8*S),yy+int(9*S)),line,font=tf,fill=RED)
        d.text((left,yy),line,font=tf,fill=CREAM if i==0 else PAPER,stroke_width=2,stroke_fill=(83,48,57))
        yy+=lineh
    if subtitle.strip():
        sf=font(46); sy=min(max(yy+int(40*S),int(1050*S)),int(1190*S))
        d.line((left,sy-int(24*S),left+int(270*S),sy-int(24*S)),fill=RED,width=14)
        for line in wrap(subtitle.strip(),sf,int(1080*S))[:2]:
            d.text((left,sy),line,font=sf,fill=(73,42,52)); sy+=int(65*S)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--title",required=True); p.add_argument("--kicker",default="CÂU CHUYỆN CÔNG NGHỆ")
    p.add_argument("--subtitle",default=""); p.add_argument("--image-url",default="")
    p.add_argument("--paper-underlay",default=""); p.add_argument("--output",default="out/thumbnail.png"); a=p.parse_args()
    canvas=background()
    underlay=None
    if a.paper_underlay.strip():
        underlay=Image.open(a.paper_underlay).convert("RGBA")
        if underlay.size != (W,H): raise ValueError(f"PaperMotion underlay must be {W}x{H}, got {underlay.size}")
    hero=fetch(a.image_url) if a.image_url.strip() else None
    hero_panel(canvas,hero,underlay); text_layer(canvas,a.title.strip(),a.kicker.strip(),a.subtitle.strip())
    out=Path(a.output); out.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(out,"PNG",optimize=True,compress_level=6)
    print(f"Created {out} ({W}x{H}, 16:9, 4K PNG)")

if __name__=="__main__": main()
