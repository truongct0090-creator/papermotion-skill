#!/usr/bin/env python3
"""Fixed-layout 2K paper-collage YouTube thumbnail generator."""
import argparse, io, math, random, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

W, H = 2560, 1440
NAVY=(16,30,49); PAPER=(239,222,184); WHITE=(250,239,211); RED=(153,53,43); MUTED=(192,177,145)

def font(size, bold=False):
    paths = ["/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for p in paths:
        if Path(p).exists(): return ImageFont.truetype(p, size)
    raise FileNotFoundError("Install fonts-noto-core.")

def background():
    im=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(im,"RGBA"); random.seed(41)
    for _ in range(2400):
        x=random.randrange(W); y=random.randrange(H); a=random.randrange(8,24)
        d.ellipse((x,y,x+2,y+2),fill=(239,222,184,a))
    d.rectangle((70,70,W-70,H-70),outline=(239,222,184,38),width=3)
    d.line((150,190,1120,190),fill=(239,222,184,65),width=3)
    return im

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"PaperMotionThumbnail/1.0"})
    with urllib.request.urlopen(req,timeout=30) as r: data=r.read(20*1024*1024+1)
    if len(data)>20*1024*1024: raise ValueError("Hero image exceeds 20 MB.")
    return Image.open(io.BytesIO(data)).convert("RGB")

def cover(im,size):
    w,h=size; s=max(w/im.width,h/im.height)
    im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS)
    x=(im.width-w)//2; y=(im.height-h)//2
    return im.crop((x,y,x+w,y+h))

def phone(canvas):
    layer=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(layer)
    d.rounded_rectangle((1570,210,2150,1150),radius=105,fill=(20,23,24,255),outline=(*PAPER,255),width=15)
    d.rounded_rectangle((1625,270,2095,1090),radius=65,fill=(56,63,57,255),outline=(111,113,93,255),width=9)
    d.rounded_rectangle((1670,340,2050,625),radius=20,fill=(174,187,137,255),outline=(15,25,24,255),width=14)
    d.text((1710,385),"NOKIA",font=font(62,True),fill=(28,49,39,255))
    d.text((1710,485),"Connecting people",font=font(24),fill=(28,49,39,255))
    d.ellipse((1780,675,1940,835),fill=(28,31,30,255),outline=(*PAPER,255),width=10)
    for row in range(4):
        for col in range(3):
            x,y=1690+col*125,870+row*63
            d.rounded_rectangle((x,y,x+88,y+42),radius=15,fill=(185,178,151,255),outline=(30,34,32,255),width=4)
    canvas.paste(layer,(0,0),layer)

def hero_panel(canvas, hero):
    x,y,w,h=1320,205,1070,1055
    backing=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(backing)
    d.ellipse((1510,170,2460,1120),fill=(*RED,255))
    d.polygon([(1370,300),(2240,150),(2460,1180),(1460,1290)],fill=(*PAPER,255))
    canvas.paste(backing,(0,0),backing)
    if hero is None:
        phone(canvas); return
    crop=ImageEnhance.Contrast(ImageEnhance.Color(cover(hero,(w,h))).enhance(.78)).enhance(1.12)
    mask=Image.new("L",(w,h)); md=ImageDraw.Draw(mask)
    md.polygon([(80,20),(w-65,0),(w-10,130),(w-35,h-95),(w-180,h-15),(100,h-35),(0,h-170),(28,160)],fill=255)
    shadow=Image.new("RGBA",(W,H)); shadow.paste(Image.new("RGBA",(w,h),(0,0,0,150)),(x+18,y+24),mask)
    shadow=shadow.filter(ImageFilter.GaussianBlur(25)); canvas.paste(shadow,(0,0),shadow)
    canvas.paste(crop,(x,y),mask)
    edge=Image.new("RGBA",(W,H)); ed=ImageDraw.Draw(edge)
    ed.line([(x+80,y+20),(x+w-65,y),(x+w-10,y+130),(x+w-35,y+h-95),(x+w-180,y+h-15),(x+100,y+h-35),(x,y+h-170),(x+28,y+160),(x+80,y+20)],fill=(*WHITE,210),width=9,joint="curve")
    canvas.paste(edge,(0,0),edge)

def wrap(text, f, maxw):
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
    d=ImageDraw.Draw(canvas); left=185; maxw=1080
    d.rounded_rectangle((left,245,left+555,322),radius=9,fill=RED)
    d.text((left+28,255),kicker.upper(),font=font(34,True),fill=WHITE)
    size=168
    while size>112:
        tf=font(size,True); lines=wrap(title,tf,maxw); lineh=int(size*1.17)
        if len(lines)<=4 and lineh*len(lines)<=790: break
        size-=4
    yy=390
    for i,line in enumerate(lines):
        d.text((left+7,yy+8),line,font=tf,fill=RED)
        d.text((left,yy),line,font=tf,fill=WHITE if i==0 else PAPER,stroke_width=1,stroke_fill=NAVY)
        yy+=lineh
    if subtitle.strip():
        sf=font(42); sy=min(max(yy+42,1030),1160)
        d.line((left,sy-24,left+250,sy-24),fill=RED,width=8)
        for line in wrap(subtitle.strip(),sf,1020)[:2]:
            d.text((left,sy),line,font=sf,fill=MUTED); sy+=58

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--title",required=True); p.add_argument("--kicker",default="CÂU CHUYỆN CÔNG NGHỆ")
    p.add_argument("--subtitle",default=""); p.add_argument("--image-url",default="")
    p.add_argument("--output",default="out/thumbnail.png"); a=p.parse_args()
    canvas=background(); hero=fetch(a.image_url) if a.image_url.strip() else None
    hero_panel(canvas,hero); text_layer(canvas,a.title.strip(),a.kicker.strip(),a.subtitle.strip())
    out=Path(a.output); out.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(out,"PNG",optimize=True); print(f"Created {out} ({W}x{H}, 16:9)")

if __name__=="__main__": main()
