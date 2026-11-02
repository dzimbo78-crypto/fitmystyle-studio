from pathlib import Path
import re,base64
base=Path(__file__).resolve().parents[1]/'site'
html=(base/'index.html').read_text()
css=(base/'styles.css').read_text()
js='\n'.join((base/p).read_text() for p in ['lib/measurements.mjs','lib/graphics.mjs','app.mjs'])
js=re.sub(r'^import .*?;\s*$', '', js, flags=re.MULTILINE)
js=re.sub(r'\bexport (const|function|class)\b',r'\1',js)
image=base/'assets/hero-family.webp'
img='data:image/webp;base64,'+base64.b64encode(image.read_bytes()).decode()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
html=html.replace('src="assets/hero-family.svg"','src="'+img+'"')
html=html.replace('<script type="module" src="app.mjs"></script>','<script type="module">'+js+'</script>')
html=html.replace('<link rel="manifest" href="manifest.webmanifest">','')
out=base.parent/'FamilyLook_Studio_Atelier_OFFLINE.html';out.write_text(html)
print(out, out.stat().st_size)