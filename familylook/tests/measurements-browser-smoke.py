import pathlib
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
html=(root/'FitMyStyle_Tailor_Studio_OFFLINE.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for name,viewport in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
  ctx=b.new_context(viewport=viewport,accept_downloads=True)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_selector('#people-list .person-nav',timeout=15000)
  assert page.locator('.person-nav').count()==4
  page.locator('#f-height').fill('171');page.locator('#f-chest').fill('94');page.locator('#f-shoulder').fill('41');page.locator('#f-backLength').fill('42');page.locator('#f-sleeve').fill('59')
  page.locator('#person-fit').select_option('relaxed')
  assert '105' in page.locator('#fit-analysis').inner_text() or '110' in page.locator('#fit-analysis').inner_text()
  page.locator('.person-nav').nth(3).click();assert page.locator('#person-type').input_value()=='baby'
  assert page.locator('#f-torso').count()==1
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'horizontal overflow '+name
  page.screenshot(path=str(root/'samples'/f'tailor-{name}.png'),full_page=True)
  with page.expect_popup() as popup: page.locator('#print-family').click()
  report=popup.value;report.wait_for_load_state('domcontentloaded')
  assert report.locator('section.sheet').count()==5
  if name=='desktop':report.pdf(path=str(root/'samples'/'FitMyStyle-rodzina-karty-TECH.pdf'),format='A4',print_background=True,prefer_css_page_size=True)
  print(name,{'family':page.locator('.person-nav').count(),'cards':report.locator('section.sheet').count(),'js_errors':errors})
  assert not errors,errors
  ctx.close()
 b.close()