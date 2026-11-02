from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path('/mnt/data/FitMyStyle_Studio_10'); errs=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,w,h in [('desktop',1440,900),('mobile',390,844)]:
  page=browser.new_page(viewport={'width':w,'height':h});page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content((root/'FitMyStyle_Studio_8_OFFLINE.html').read_text(),wait_until='load',timeout=30000);page.wait_for_timeout(300)
  page.locator('.public-nav [data-open-page="mannequin"]').click();page.wait_for_timeout(300)
  page.locator('#atelier-cut').select_option('sweater');page.locator('#atelier-fabric').select_option('merino')
  page.locator('#atelier-pattern').select_option('cable-knit');assert 'warkocz' in page.locator('#atelier-pattern-info').inner_text().lower()
  page.locator('#atelier-front').click();before=page.locator('#atelier-angle').inner_text();page.locator('#atelier-rotate').click();assert page.locator('#atelier-rotate').get_attribute('aria-pressed')=='true';page.wait_for_timeout(1100);after=page.locator('#atelier-angle').inner_text();print(name,'auto-rotation:',before,'->',after);assert before!=after,'auto rotate did not move'
  page.locator('#atelier-rotate').click();assert page.locator('#atelier-rotate').get_attribute('aria-pressed')=='false'
  page.locator('#atelier-cut').select_option('cardigan');page.locator('#atelier-canvas').scroll_into_view_if_needed();page.evaluate('window.scrollBy(0,-180)');page.screenshot(path=str(root/f'fms10-{name}-atelier.png'),full_page=False)
  page.locator('#atelier-request').click();assert page.locator('#production-enquiry').is_visible();assert page.locator('#production-send').is_visible();page.locator('#production-close').click()
  page.locator('.public-nav [data-open-page="landing"]').click();assert page.locator('.public-hero').is_visible();assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+3')
  page.screenshot(path=str(root/f'fms10-{name}-home.png'),full_page=False)
  page.close()
 browser.close()
print('pageerrors:',errs)
assert not errs