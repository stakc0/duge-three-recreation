# duge — independent Three.js recreation

A clean-room, locally generated 3D interpretation of the public duge.wtf experience. **This is a substantial visual rebuild, not a pixel-identical or asset-identical clone.** No reference JavaScript, puppy model, textures, meme artwork, music, or private endpoints are bundled. The extruded meadow lettering uses the Helvetiker typeface distributed with Three.js (its package license applies).

## Run

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run build
npm run preview -- --host 0.0.0.0
```

Node 20.19+ or 22.12+ is required by Vite. `node_modules/` and `dist/` are intentionally untracked; the lockfile is retained.

## Implemented

- Full-screen ocean with independently written animated water/reflection shader, bobbing watermelon boat, waving paw flag, and animated puppy. Enter/click/scroll starts a camera dive and waterfall passage.
- Low-perspective meadow composition, sculpted procedural retriever with floppy ears, muzzle, eyes, toes, fur bump/detail, breathing/head/tail motion and a waving foreleg when petted.
- Undulating terrain, 90,000 instanced wind-bent grass blades (40,000 in low quality), instanced flowers, distant hills, rocks and drifting pollen.
- Actual Three.js bloom, depth-of-field, ACES tone mapping, shadows, fog and fine grain; quality toggle disables expensive postprocessing and lowers pixel ratio.
- Four functional stations: meadow, animated waterfall and spray, rocky gallery grotto, portrait studio. Wheel, arrow keys, navigation dots, touch swipes and drag work; returning to the ocean works.
- Original four-caption postcard gallery, background swatches, bandana control and real 1024×1024 PNG downloads. Ambient sound is real, locally synthesised and opt-in.
- Responsive desktop/mobile composition, reduced-motion entrance shortcut, accessible control names and WebGL failure message.

## Verification

The reproducible browser check uses Python Playwright/Chromium:

```sh
python -m pip install playwright
python -m playwright install chromium
python scripts/browser_qa.py http://127.0.0.1:5183
```

It captures desktop (1440×900) and fresh mobile (390×844) views, exercises navigation, gallery, actual PNG downloads, portrait controls, audio and quality, and fails on browser/GLSL console errors. Outputs live in ignored `test-results/`. `npm run build` also checks the production bundle. No deployment or push is performed by this rebuild.

## Exact fidelity gaps

- The reference's detailed, textured, skinned golden puppy is **not licensed/provided**. This independently sculpted procedural mascot is visibly stylised; it does not match the reference anatomy, facial expression, fur or skeletal animation quality. Reaching that fidelity needs an authorised production model and animation set.
- Ocean reflections are procedural sky approximations, not the reference's reflection/refraction implementation; waterfall, terrain, tree placement, camera choreography and cave are independently authored approximations.
- The reference's desktop-style icons, social/token controls, gallery memes, PFP accessories and sound assets are not copied. This version provides original postcards and a smaller, functional portrait control set; it has no token purchase, wallet or community backend.
- Postprocessing and framing are tuned by desktop/mobile screenshots but do not establish visual parity. The public reference entrance and post-skip meadow were inspected in isolated Chromium; headless software rendering makes its cinematic transitions slow.
- GPU frame rate on physical mobile hardware, Safari and Firefox is not verified. The high-quality scene intentionally favours fidelity; use low quality for slower devices.
- Vite reports a bundle-size advisory because Three.js and its postprocessing are in one approximately 640 kB minified bundle; the production build succeeds.
