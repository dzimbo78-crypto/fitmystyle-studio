# FitMyStyle Studio

**Public website:** https://fitmystyle-studio-independent.onrender.com

FitMyStyle is an independent fashion matching, garment-design and technical visualization app. This repository and the Render service belong **only** to FitMyStyle. No B-CORE or other application files, databases, credentials or shared deployments are used.

## Run & develop

- `index.html` is the current self-contained, deployable browser app (Studio 8.1). Render serves this file directly; no paid API is required for guest mode.
- `source/` contains the **modular** application, garment templates, 3D viewer, import connectors, scripts, automated tests and locally generated image assets.
- `node --test source/tests/*.test.mjs` runs the Node test suite.
- `node source/scripts/build.mjs` builds `source/dist/` for a modular static deployment.
- `node source/scripts/build-offline.mjs` builds `source/FitMyStyle_Studio_8_OFFLINE.html`; review it before replacing the published root `index.html`.

## Current functionality

Family outfit planner, 12 palettes, 432 clearly marked demo ideas, private guest wardrobe, multi-format product import, catalog radar, 3D technical mannequin with front/back seam display and printable technical sheet, pattern sketches, SVG/PDF exports, session backup, manual guest-session deletion, and shopping planning without checkout.

## Actual limitations

**No live shop checkout, automated production, partner accounts or paid orders are active.** Public seller feed inventory starts empty. The mannequin and patterns are educational/technical previews, not production-certified CAD or a photo-realistic fit guarantee. Account sign-in and cross-device sync need a **separate** authenticated backend and remain disabled until configured. Guest data is browser-session scoped and can be explicitly cleared; browser restoration policies may persist a session.

## Deployment

Render: `fitmystyle-studio-independent`, static site, branch `main`, build command `mkdir -p public && cp index.html public/index.html`, publish folder `public`. Each commit to `main` deploys automatically.

## Quality assurance

116 Node tests passed in the local release build. Additional desktop/mobile browser checks covered the 3D technical sheet, backup, private session deletion, visual responsiveness and absence of JavaScript errors in tested scenarios. CI executes module tests and rebuilds source. See `source/QA.md` for scope and limitations.
