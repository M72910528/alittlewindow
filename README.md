# A Little Window to Another World
React + TypeScript + Vite + Tailwind v4. Frontend-only; all audio is synthesized with the Web Audio API (no asset files).

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # optional
npm run build && npm start   # production preview
```
## Replit
Import the folder; `.replit` runs `npm run dev`. To deploy: Deploy → Static, build `npm run build`, public dir `dist`.

## Notes
- Login is local-only (users + SHA-256-hashed passwords in localStorage). It is a personalisation gate, not real security; swap in a backend for real accounts.
- Shortcuts: `H` toggles controls, double-click/tap restores them. Controls auto-hide after ~4.5 s idle.
- Settings, favorites and session count persist in localStorage. Reduced-motion is respected; lightning is a single soft flash.

## Scene photos
Scenes load free-to-use photos from Unsplash (Unsplash License) straight from images.unsplash.com, so the app needs an internet connection for them. If a photo cannot load, the scene falls back to a code-drawn version. Credits are shown on screen and listed in `src/scenes.ts`: Chad Peltola, Mehrpouya H, Fabien Maurin, Michael Starkie, Christopher Politano, and the meadow photo (unsplash.com/photos/AblhYTa5ats).

## Use your own pictures
Put `scene-1.jpg` to `scene-6.jpg` in `public/scenes/` (see the README.txt there). They override the built-in photos.
