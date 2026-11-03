"""Draft cards: actual body values, separate preliminary ease, no invented measurements."""
from io import BytesIO
from pathlib import Path
import json
from xml.sax.saxutils import escape
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Literal
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).parent
CATALOG = json.loads((ROOT.parent/'next-app/lib/catalog.generated.json').read_text())
MODELS = {m['id']: m for m in CATALOG['templates']}
LABELS = {m['key']: m['label'] for m in CATALOG['measures']}
EASE = {'slim': (4,3,4), 'regular': (10,8,10), 'relaxed': (16,12,14), 'oversized': (24,20,20)}
class Person(BaseModel):
    id: str = Field(min_length=1,max_length=100)
    name: str = Field(min_length=1,max_length=35)
    group: Literal['adult','child','infant']
    shape: Literal['female','male','neutral'] = 'neutral'
    templateId: str
    size: str = Field(default='',max_length=12)
    fit: Literal['slim','regular','relaxed','oversized'] = 'regular'
    measurements: dict[str,float] = Field(default_factory=dict)
    notes: str = Field(default='',max_length=1500)
    @field_validator('measurements')
    @classmethod
    def valid_values(cls,v):
        if any(k not in LABELS or not 0 < n <= 300 for k,n in v.items()):
            raise ValueError('Nieprawidłowe pomiary')
        return v
    @model_validator(mode='after')
    def valid_model(self):
        if self.templateId not in MODELS or self.group not in MODELS[self.templateId]['groups']:
            raise ValueError('Fason niedostępny dla tej grupy')
        return self
class Pack(BaseModel):
    title: str = Field(min_length=1,max_length=100)
    paletteId: str = Field(default='nordic',max_length=30)
    members: list[Person] = Field(min_length=1,max_length=12)
    @model_validator(mode='after')
    def unique_ids(self):
        if len({p.id for p in self.members}) != len(self.members):
            raise ValueError('Powtórzone osoby')
        return self

def make_pdf(pack: Pack) -> bytes:
    for name,file in [('FMS','DejaVuSans.ttf'),('FMS-Bold','DejaVuSans-Bold.ttf')]:
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name,str(ROOT/'assets'/file)))
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle('FMS',fontName='FMS',fontSize=8.2,leading=12,spaceAfter=5,textColor=colors.HexColor('#3c4535')))
    styles.add(ParagraphStyle('FMSHeading',fontName='FMS-Bold',fontSize=19,leading=24,spaceAfter=10,textColor=colors.HexColor('#35402e')))
    styles.add(ParagraphStyle('FMSSub',fontName='FMS-Bold',fontSize=10,leading=15,spaceAfter=8))
    def p(text,style='FMS'):return Paragraph(escape(str(text)).replace('\n','<br/>'),styles[style])
    stream=BytesIO();doc=SimpleDocTemplate(stream,pagesize=A4,rightMargin=17*mm,leftMargin=17*mm,topMargin=16*mm,bottomMargin=18*mm,title='FamilyLook - dokumentacja robocza')
    story=[]
    for index,person in enumerate(pack.members):
        if index:story.append(PageBreak())
        model=MODELS[person.templateId]
        story += [p('FITMYSTYLE / FAMILYLOOK ATELIER'),p(f'{person.name} - karta krawiecka','FMSHeading'),p(f'Projekt: {pack.title}'),p('STATUS: DOKUMENT ROBOCZY - zatwierdzenie konstruktora wymagane','FMSSub')]
        details=[['Fason',f"{model['id']} / {model['name']}"],['Grupa / sylwetka',f'{person.group} / {person.shape}'],['Rozmiar deklarowany',person.size or 'Nie podano'],['Dopasowanie',person.fit],['Materiał bazowy',CATALOG['fabrics'].get(model['fabric'],model['fabric'])],['Paleta',pack.paletteId]]
        table=Table([[p(a),p(b)] for a,b in details],colWidths=[46*mm,130*mm],hAlign='LEFT');table.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#edf0e7')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story += [table,Spacer(1,6*mm),p('01 / Rzeczywiste pomiary ciała','FMSSub')]
        rows=[[p('Pomiar'),p('Ciało / cm'),p('Weryfikacja')]]
        for key,label in LABELS.items():
            if key=='underbust' and person.group!='adult':continue
            value=person.measurements.get(key)
            rows.append([p(label),p(f'{value:g}' if value is not None else '-'),p('Do sprawdzenia' if value is not None else 'Nie zmierzono')])
        table=Table(rows,colWidths=[92*mm,32*mm,52*mm],repeatRows=1);table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6eadf')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#d9ddcf')),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),2)]));story += [table,Spacer(1,5*mm),p('02 / Wstępne cele wymiarowe ubrania','FMSSub')]
        rows=[[p('Miejsce'),p('Ciało'),p('Luz roboczy'),p('Wyrób / cm')]]
        for key,extra in zip(['chest','waist','hip'],EASE[person.fit]):
            value=person.measurements.get(key)
            if person.group=='infant':extra=max(extra,6)
            if model['kind']=='shirt' and key in ['chest','waist']:extra=max(extra,10)
            rows.append([p(LABELS[key]),p(f'{value:g}' if value is not None else '-'),p(f'+{extra}'),p(f'{value+extra:g}' if value is not None else 'Nie wyliczono')])
        table=Table(rows,colWidths=[70*mm,30*mm,36*mm,40*mm]);table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6eadf')),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#d9ddcf')),('TOPPADDING',(0,0),(-1,-1),4),('VALIGN',(0,0),(-1,-1),'TOP')]));story += [table,Spacer(1,4*mm),p('To nie jest wykrój. Luz nie obejmuje zapasu na szwy. Konstruktor zatwierdza materiał, kurczliwość, tolerancje, wykrój i dopasowanie na próbce fizycznej.')]
        if person.group!='adult':story.append(p('Odzież dziecięca: zweryfikuj bezpieczeństwo małych elementów i sznurków; konstrukcja wymaga przeglądu.'))
        story += [p('Uwagi: '+(person.notes or '-')),Spacer(1,4*mm),p('Konstruktor / podpis: ______________________     Przymiarka / data: ______________________')]
    def footer(c,d):
        c.setFont('FMS',7);c.setFillColor(colors.HexColor('#7d8474'));c.drawString(17*mm,10*mm,'FamilyLook / pomiary ciała i dokument roboczy / bez zatwierdzenia produkcji');c.drawRightString(193*mm,10*mm,str(d.page))
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return stream.getvalue()
