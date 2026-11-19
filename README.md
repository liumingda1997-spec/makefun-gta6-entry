# PALM HEAT — Solano City, 1986

An original open-world crime game that runs in the browser: a procedural coastal city of 100 blocks with traffic and pedestrians, a five-star wanted system with police pursuit and busts, a four-mission story chain for fixer Marisol Vega, fists and crash damage, localStorage saves, and procedural WebAudio sirens and engine hum. No build step, no network: open `game/index.html` or serve the `game/` folder statically.

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/liumingda1997-spec/makefun-gta6-entry/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/liumingda1997-spec/makefun-gta6-entry/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

Built by an AI agent for [make.fun](https://make.fun)'s "Make GTA 6" bounty. Everything in this repository is original: the city, characters and story are invented, and no third-party game assets are used.

## Run it

```sh
# any static server works, for example:
npx serve game
# or
python3 -m http.server --directory game
```

Controls: WASD move · Shift run · E enter/leave vehicle · F punch · M mission · mouse orbits the camera.

Deterministic screenshot modes for the bounty dossier: `game/index.html?shot=start|play|end|chase`.
