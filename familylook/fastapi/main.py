"""Optional, separate backend for tailor PDF and provider-ready drafts.
No live sales, manufacturing dispatch, payment or AI image calls.
"""
from __future__ import annotations
import io, json, os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, KeepTogether, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape

CATALOG=json.loads((Path(__file__).resolve().parent.parent/'site/data/catalog.json').read_text(encoding='utf8'))
MODELS={m['id']:m for m in CATALOG['models']}
MEASURES={m['id']:m for m in CATALOG['measurements']}
class Artwork(BaseModel):
    text: str=Field('',max_length=80)
    color: str='#F5F3EC'
    position: str='chest'
    scale: float=Field(1,ge=0.1,le=3)
class Member(BaseModel):
    model_config=ConfigDict(extra='ignore')
    id: str=Field(max_length=60)
    label: str=Field(max_length=70)
    group: Literal['adult','child','infant']
    bodyType: str='unspecified'
    size: str=Field('',max_length=20)
    model: str=Field(max_length=40)
    color: str='#91A18B'
    fit: str='regular'
    easeOffset: float=Field(0,ge=-3,le=25)
    measurements: dict[str,float|None]=Field(default_factory=dict)
    artwork: Artwork=Field(default_factory=Artwork)
class Project(BaseModel):
    name: str=Field('Rodzinny projekt',max_length=90)
    palette: str='sage'
    people: list[Member]=Field(min_length=1,max_length=12)
    seamAllowanceMm: float=Field(10,ge=0,le=35)
    shrinkagePercent: float=Field(0,ge=0,le=20)
    notes: str=Field('',max_length=3000)
class PreviewRequest(BaseModel):
    project: Project
    consent: bool=False

app=FastAPI(title='FitMyStyle FamilyLook API',version='0.1.0',docs_url='/docs')
FONTP='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLDP='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
if Path(FONTP).exists():
    pdfmetrics.registerFont(TTFont('DejaVu',FONTP))
    pdfmetrics.registerFont(TTFont('DejaVu-Bold',BOLDP))
FONT='DejaVu' if Path(FONTP).exists() else 'Helvetica'
FONT_BOLD='DejaVu-Bold' if Path(FONTP).exists() else 'Helvetica-Bold'

@app.get('/health')
def health():return {'status':'ok','production_dispatch':False,'payment':False,'ai_generation':False}

def rows_for(p:Member):
    model=MODELS.get(p.model)
    if not model or p.group not in model['groups']:
        raise HTTPException(422,f'Fason {p.model} niedostępny dla {p.group}')
    valid=[]
    for key,v in p.measurements.items():
        md=MEASURES.get(key)
        if md and v is not None and (v<1 or v>250):
            raise HTTPException(422,f'Nieprawidłowy pomiar: {md["name"]}')
    for key,ease in model.get('ease',{}).items():
        b=p.measurements.get(key)
        valid.append((MEASURES[key]['name'],b,round(ease+p.easeOffset,1),round(b+ease+p.easeOffset,1) if b else None))
    for key in model['required']:
        if key not in model.get('ease',{}) and key!='height':
            valid.append((MEASURES[key]['name'],p.measurements.get(key),None,None))
    missing=[MEASURES[k]['name'] for k in model['required'] if not p.measurements.get(k)]
    return model,valid,missing

@app.post('/v1/tech-pack.pdf')
def tech_pack(project:Project):
    buf=io.BytesIO(); pdf=SimpleDocTemplate(buf,pagesize=A4,leftMargin=34,rightMargin=34,topMargin=35,bottomMargin=36,
                                            title=f'FitMyStyle - {project.name} - Tech Pack DRAFT')
    style=getSampleStyleSheet();style.add(ParagraphStyle(name='TitleCustom',fontName=FONT_BOLD,fontSize=17,leading=21,spaceAfter=10,textColor=colors.HexColor('#203a2a')))
    style.add(ParagraphStyle(name='SubtitleCustom',fontName=FONT_BOLD,fontSize=11,leading=15,spaceBefore=13,spaceAfter=7))
    style.add(ParagraphStyle(name='NormalCustom',fontName=FONT,fontSize=8.1,leading=12,spaceAfter=5))
    style.add(ParagraphStyle(name='SmallCustom',fontName=FONT,fontSize=7,leading=10))
    story=[Paragraph('FITMYSTYLE / FAMILYLOOK STUDIO',style['TitleCustom']),Paragraph(f'<b>Projekt:</b> {escape(project.name)} · <b>Tryb:</b> DRAFT / NIE DO PRODUKCJI',style['NormalCustom']),Paragraph('Dokument wymaga weryfikacji pomiarów, konstrukcji, materiału, szwów, tolerancji i odszytej próbki. Pomiary ciała nie są równe wymiarom gotowego ubrania.',style['NormalCustom'])]
    for n,p in enumerate(project.people):
        model,rows,missing=rows_for(p)
        if n:story.append(PageBreak())
        story.extend([Paragraph(f'{n+1}. {escape(p.label)} — {escape(p.group)}',style['TitleCustom']),
                      Paragraph(f'<b>Model:</b> {escape(model["name"])} | <b>Rozmiar informacyjny:</b> {escape(p.size)} | <b>Materiał:</b> {escape(model["material"])} | <b>Dopasowanie:</b> {escape(p.fit)}',style['NormalCustom']),
                      Paragraph(f'<b>Zapas na szew (założenie):</b> {project.seamAllowanceMm:g} mm | <b>Skurcz (do testu):</b> {project.shrinkagePercent:g}%',style['NormalCustom'])])
        table_data=[['Pomiar','Ciało cm','Luz cm','Wyrób cm']]+[[name,str(body) if body else 'BRAK',str(ease) if ease is not None else '—',str(finished) if finished else '—']for name,body,ease,finished in rows]
        t=Table(table_data,colWidths=[215,92,77,89],hAlign='LEFT',repeatRows=1)
        t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),FONT),('FONTNAME',(0,0),(-1,0),FONT_BOLD),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8efea')),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#b4c0b6')),('BOTTOMPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('FONTSIZE',(0,0),(-1,-1),7.5)]))
        story.extend([Paragraph('Pomiary ciała / wymiary wyrobu',style['SubtitleCustom']),t])
        if missing:story.append(Paragraph('<b>Braki:</b> '+escape(', '.join(missing))+' — nie dopuszczać do krojenia.',style['NormalCustom']))
        story.append(Paragraph('Instrukcje dla osoby mierzącej',style['SubtitleCustom']))
        for mid in model['required']:
            mm=MEASURES[mid]
            story.append(Paragraph(f'<b>{escape(mm["name"])}:</b> {escape(mm["instruction"])}',style['SmallCustom']))
            story.append(Spacer(1,3))
        story.extend([Paragraph('Uwagi konstruktora i zatwierdzenia',style['SubtitleCustom']),Paragraph('Materiał / test skurczu: ________________________________________',style['NormalCustom']),Paragraph('Przymiarka / korekty: ___________________________________________',style['NormalCustom']),Paragraph('Podpis konstruktora: ___________________ Data: ________________',style['NormalCustom']),Paragraph('Kontrola: szablony, gradacja, opis technologii, bezpieczeństwo dzieci, pliki nadruku i tolerancje.',style['SmallCustom']),Paragraph('<b>PROJEKT KONCEPCYJNY — NIE JEST GOTOWYM WYKROJEM PRODUKCYJNYM.</b>',style['NormalCustom'])])
    pdf.build(story)
    return Response(content=buf.getvalue(),media_type='application/pdf',headers={'Content-Disposition':'attachment; filename="fitmystyle-familylook-techpack.pdf"','Cache-Control':'no-store'})

@app.post('/v1/ai/visualization')
def ai_visualization(payload:PreviewRequest):
    raise HTTPException(503,'Model AI niepodłączony. Użyj edytowalnych szablonów SVG bez kosztów i ograniczeń API.')

@app.post('/v1/manufacturer/draft')
def manufacturer_draft(project:Project):
    # Draft only: no secrets, provider IDs, payment capture or order submission.
    items=[]
    for p in project.people:
        model,rows,missing=rows_for(p)
        items.append({'member':p.label,'garment':model['id'],'size_label':p.size,'color':p.color,
                      'provider_blueprint_id':None,'provider_variant_id':None,'print_area_id':None,
                      'artwork':p.artwork.model_dump(),'ready_for_dispatch':False,
                      'missing_body_measurements':missing,'needs_supplier_approval':True})
    return {'status':'DRAFT_ONLY','order_created':False,'no_payment_captured':True,'items':items}