from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess,time,base64,re
root=Path(__file__).resolve().parent.parent
html=(root/'site/index.html').read_text()
css=(root/'site/styles.css').read_text()
domain=(root/'site/domain.mjs').read_text().replace('export const ','const ').replace('export function ','function ')
app=(root/'site/app.mjs').read_text()
app=app.replace(app.split('\n')[0]+'\n','',1)
hero=base64.b64encode((root/'site/assets/family-hero.webp').read_bytes()).decode()
html=html.replace('<link rel=\"stylesheet\" href=\"styles.css\">','<style>'+css+'</style>')
html=html.replace('src=\"assets/family-hero.webp\"','src=\"data:image/webp;base64,'+hero+'\"')
html=html.replace('<script type=\"module\" src=\"app.mjs\"></script>', '<script type=\"module\">'+domain+'\n'+app+'</script>')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height,label in [(1440,900,'desktop'),(390,844,'mobile')]:
   page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
   errors=[]
   page.on('pageerror',lambda err: errors.append(str(err)))
   page.set_content(html,wait_until='load')
   assert page.title()=='FamilyLook Studio · FitMyStyle'
   assert page.locator('.family-card').count()==4
   assert page.locator('.template-card').count()==20
   page.locator('#add-member').click()
   assert page.locator('.family-card').count()==5
   page.locator('#measure-person').select_option(index=0)
   page.locator('#m-chest').fill('92')
   page.locator('#m-chest').dispatch_event('change')
   assert page.locator('#m-chest').input_value()=='92'
   page.locator('#measure-person').select_option(index=1)
   assert page.locator('#m-chest').input_value()==''
   page.locator('#measure-person').select_option(index=0)
   assert page.locator('#m-chest').input_value()=='92'
   page.locator('#view-back').click()
   assert page.locator('#view-back').get_attribute('class')=='active'
   page.locator('#art-position').select_option('back')
   page.locator('#art-text').fill('TEAM ONE')
   page.locator('#art-text').dispatch_event('input')
   assert page.locator('#family-preview').locator('text=TEAM ONE').count()>0
   with page.expect_download() as dl:page.locator('#download-techpack').click()
   d=dl.value
   assert d.suggested_filename.endswith('.html')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert not errors,errors
   page.screenshot(path=str(root/f'preview-{label}.png'),full_page=True)
   if label=='desktop':
    page.locator('#print-techpack').click()
    pp=browser.contexts[-1].pages[-1]
    pp.wait_for_load_state('load')
    pp.pdf(path=str(root/'example-tailor-pack.pdf'),format='A4',print_background=True)
   print(label,'OK',len(errors),'JS errors')
   page.close()
  browser.close()
finally:pass