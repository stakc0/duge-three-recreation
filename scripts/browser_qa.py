"""Real Chromium smoke tests. pip install playwright; python -m playwright install chromium.
Run against npm run dev or npm run preview: python scripts/browser_qa.py [URL].
Screenshots and downloaded PNGs are saved under ignored test-results/.
"""
from pathlib import Path
import json
import sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5183'
OUT = Path(__file__).resolve().parents[1] / 'test-results'
OUT.mkdir(exist_ok=True)
errors = []
checks = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--enable-unsafe-swiftshader'])
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto(URL)
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT / 'desktop-ocean.png'))
    page.keyboard.press('Enter')
    page.wait_for_function("window.__duge?.state === 'main'", timeout=25000)
    page.wait_for_timeout(3000)
    assert page.evaluate('__duge.grassCount') == 90000
    page.screenshot(path=str(OUT / 'desktop-meadow.png'))
    checks.append('Enter transitions ocean → dive → falls → meadow; 90,000 grass blades')
    page.mouse.wheel(0, 500)
    page.wait_for_function('__duge.station === 1')
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT / 'desktop-waterfall.png'))
    checks.append('wheel advances station')
    page.locator('[data-station="2"]').click()
    page.wait_for_timeout(2500)
    page.locator('#next').click()
    assert page.locator('#page-count').inner_text() == '2 / 4'
    page.locator('#previous').click()
    assert page.locator('#page-count').inner_text() == '1 / 4'
    with page.expect_download() as d:
        page.locator('#save-meme').click()
    d.value.save_as(str(OUT / 'postcard.png'))
    page.screenshot(path=str(OUT / 'desktop-gallery.png'))
    checks.append('gallery previous/next and postcard PNG download')
    page.locator('[data-station="3"]').click()
    page.wait_for_timeout(2500)
    page.locator('[data-color="#e7b6bd"]').click()
    assert page.locator('[data-color="#e7b6bd"]').get_attribute('aria-pressed') == 'true'
    page.locator('#bandana').uncheck()
    page.mouse.move(450, 400)
    page.mouse.down()
    page.mouse.move(570, 400, steps=12)
    page.mouse.up()
    page.wait_for_timeout(1000)
    assert page.evaluate('__duge.rotation') > .5
    with page.expect_download() as d:
        page.locator('#save-pfp').click()
    d.value.save_as(str(OUT / 'portrait.png'))
    png = (OUT / 'portrait.png').read_bytes()
    assert png[:8] == b'\x89PNG\r\n\x1a\n'
    assert int.from_bytes(png[16:20], 'big') == 1024
    assert int.from_bytes(png[20:24], 'big') == 1024
    page.screenshot(path=str(OUT / 'desktop-portrait.png'))
    checks.append('portrait background, bandana, drag, actual 1024×1024 PNG export')
    page.locator('#quality').click()
    assert page.evaluate('__duge.grassCount') == 40000
    page.locator('#quality').click()
    page.locator('#sound').click()
    assert page.locator('#sound').get_attribute('aria-pressed') == 'true'
    page.locator('#sound').click()
    checks.append('quality and real Web Audio toggle')
    page.locator('.wordmark').click()
    assert page.evaluate('__duge.state') == 'ocean'
    checks.append('return to ocean')
    context.close()
    mobile = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion='reduce')
    page = mobile.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto(URL)
    page.wait_for_timeout(2000)
    page.screenshot(path=str(OUT / 'mobile-ocean.png'))
    page.locator('#enter').tap()
    page.wait_for_function('__duge.state === "main"')
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT / 'mobile-meadow.png'))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    touch = mobile.new_cdp_session(page)
    touch.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': 210, 'y': 660}]})
    touch.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': 210, 'y': 450}]})
    touch.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    page.wait_for_function('__duge.station === 1')
    for station, label in [(2, 'gallery'), (3, 'portrait')]:
        page.locator(f'[data-station="{station}"]').tap()
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT / f'mobile-{label}.png'))
        assert page.locator('#save-meme' if station == 2 else '#save-pfp').is_visible()
    checks.append('fresh 390×844 mobile: touch navigation, reduced motion, panels fit viewport')
    browser.close()

report = {'checks': checks, 'errors': errors, 'screenshots': str(OUT)}
(OUT / 'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
assert not errors, errors
