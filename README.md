# ROLLER - the base game

A humanoid runner moves through a neon platforming world. It can run, jump,
use skin abilities, and die on spikes. It wins by touching the flag.

That is the whole game. Everything else is yours to add.

## How to play it

Push your changes, then open your GitHub Pages link.
Press `Ctrl + Shift + R` to hard refresh, or you will see the old version.

- LEFT / RIGHT arrow - roll
- SPACE or UP arrow - jump
- R - restart the level
- M - pause and open the menu

The opening screen has `Play`, `Levels`, and `Skins` buttons. Each level
automatically uses a different player skin; the `Skins` screen previews the
available looks and abilities. Double-jump skins can jump once in midair,
while speed-boost skins run faster.

When a regular pickup matches the current skin's powerup, its effect is
doubled. Secret areas are no longer part of the level runtime, but regular
powerups remain.

## Where everything lives

| If you want to change... | Open this file |
|---|---|
| how high it jumps, how fast it moves, how heavy gravity feels | `js/config.js` |
| which keys do what | `js/input.js` |
| the shape of the levels | `data/levels.json` |
| the level pieces themselves | `data/pieces.json` |
| how the world is built out of pieces | `js/level.js` |
| whether something counts as a hit | `js/collide.js` |
| how the player moves, jumps, and dies | `js/player.js` |
| how anything LOOKS | `js/draw.js` |
| the rules, the win and lose conditions, the loop | `js/game.js` |
| the page around the game | `index.html` and `style.css` |

Player skins and their powerups are defined in `CONFIG.SKINS` in
`js/config.js` and rotate by level number.

## How levels work

A level is a list of piece names, in order, left to right.
Open `data/levels.json` and you will see something like this:

    "pieces": ["start", "flat", "gap", "flat", "spikes", "finish"]

Every one of those names is a little picture in `data/pieces.json`.
Each picture is 8 columns wide and 10 rows tall:

    "gap": [
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "###..###",
      "###..###"
    ]

- `.` is empty air
- `#` is a solid block
- `^` is a spike
- `S` is where the player starts
- `F` is the finish

To make a new level: change the list of names.
To make a new piece: copy one, rename it, redraw the picture, then use
that name in a level.

## Things to know before you change anything

- The player is a **box** for collisions and a **circle** for drawing.
  That is on purpose. Boxes are easier to check and nobody can tell.
- Every file is loaded in order at the bottom of `index.html`.
  If you add a new file, add it to that list too.
- The level data is loaded with `fetch()`, which only works over http.
  Use your GitHub Pages link. Opening `index.html` straight off your
  hard drive will not load the levels.
