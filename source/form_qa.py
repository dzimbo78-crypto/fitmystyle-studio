from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path('/mnt/data/FitMyStyle_Studio_10')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 pg=b.new_page(viewport={'width':1180,'height':900});errors=[]
 pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.route('**/formsubmit.co/ajax/**', lambda route:route.fulfill(status=200,content_type='application/json',body='{"success":"true"}'))
 pg.set_content((r/'FitMyStyle_Studio_8_OFFLINE.html').read_text(),wait_until='load',timeout=30000)
 pg.locator('.public-nav [data-open-page="mannequin"]').click();pg.locator('#atelier-request').click();assert pg.locator('#production-enquiry').is_visible()
 pg.locator('#production-name').fill('Anna Testowa');pg.locator('input[name=email]').fill('anna@example.org');pg.locator('textarea[name=note]').fill('Poproszę o wycenę czterech swetrów z własnym wzorem')
 pg.locator('input[name=consent]').check();pg.locator('#production-send').click();pg.wait_for_timeout(650)
 output=pg.locator('#production-status').inner_text();print('response',output[:180]);assert 'Bramka przyjęła' in output and 'gwarantowane' in output
 assert pg.locator('#production-enquiry').is_visible() and not errors,errors
 pg.locator('#production-close').click();b.close()