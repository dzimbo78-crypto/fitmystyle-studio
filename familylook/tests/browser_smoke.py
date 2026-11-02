from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re
BASE=Path('/mnt/data/fitmystyle-familylook/site')
html=(BASE/'index.html').read_text()
html=re.sub(r'<script type="module" src="/app.mjs"></script>','',html)
html=html.replace('<link rel="stylesheet" href="/styles.css">','<style>'+ (BASE/'styles.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');",'') +'</style>')
from base64 import b64encode
img=b64encode((BASE/'assets/family-hero.jpg').read_bytes()).decode()
html=html.replace('/assets/family-hero.jpg','data:image/jpeg;base64,'+img)
core=re.sub(r'\bexport (const|function)\b',r'\1',(BASE/'core.mjs').read_text())
gfx=re.sub(r'^import .+$','',(BASE/'graphics.mjs').read_text(),flags=re.MULTILINE)
gfx=re.sub(r'\bexport (const|function)\b',r'\1',gfx)
app=re.sub(r'^import .+$','',(BASE/'app.mjs').read_text(),flags=re.MULTILINE)
app=app.replace("catalog=await (await fetch('/catalog.json',{cache:'no-cache'})).json()",'catalog='+json.dumps(json.loads((BASE/'catalog.json').read_text()),ensure_ascii=False))
js=core+'\n'+gfx+'\n'+app
# Browser tests in setContent avoid local URL restrictions in secure test runner.
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for label,viewport in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
  page=b.new_page(viewport=viewport,device_scale_factor=1,accept_downloads=True)
  errors=[]
  page.on('pageerror',lambda error: errors.append(str(error)))
  page.set_content(html,wait_until='domcontentloaded')
  page.add_script_tag(content=js)
  page.locator('.person-card').first.wait_for(timeout=15000)
  assert page.locator('.person-card').count()==4
  assert page.locator('.template-card').count()==20
  page.locator('[data-action="add-child"]').click()
  print('after add count',page.locator('.person-card').count(),'errs',errors)
  assert page.locator('.person-card').count()==5
  page.locator('[data-palette="espresso"]').click()
  assert page.locator('.palette-option.selected').count()==1
  page.locator('#print-text').fill('FAMILY EDIT')
  page.locator('[data-action="back"]').click()
  assert 'selected' in (page.locator('[data-action="back"]').get_attribute('class'))
  page.locator('[data-action="front"]').click()
  page.locator('[data-action="quote"]').click()
  assert page.locator('#quote-dialog').is_visible()
  page.locator('button.dialog-close').click()
  with page.expect_download() as info:
   page.locator('[data-action="export-project"]').click()
  assert info.value.suggested_filename.endswith('.json')
  scroll=page.evaluate('document.documentElement.scrollWidth')
  print(label,'persons',page.locator('.person-card').count(),'catalog',page.locator('.template-card').count(),'scroll',scroll,'width',viewport['width'],'errors',errors)
  assert not errors
  assert scroll<=viewport['width']+1, f'Horizontal overflow {scroll}'
  page.screenshot(path=f'/mnt/data/fitmystyle-familylook/{label}-familylook.png',full_page=True)
  page.close()
 b.close()