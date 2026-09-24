/* =====================================================================
   config.js  --  ALL THE NUMBERS.

   This is the first file to open if you want to change how the game
   FEELS. Every number here is safe to change. Change one at a time and
   play the game after each change.
   ===================================================================== */

var CONFIG = {

  // --- the world grid -------------------------------------------------
  TILE: 40,           // how many pixels wide and tall one grid square is
  ROWS: 10,           // how many rows tall every level piece is
  PIECE_COLS: 8,      // how many columns wide every level piece is

  // --- the screen -----------------------------------------------------
  CANVAS_W: 800,
  CANVAS_H: 400,

  // --- how the player moves -------------------------------------------
  MOVE_SPEED: 4,      // pixels per frame left and right
  JUMP_POWER: 15,     // how hard the jump pushes UP. bigger = higher
  GRAVITY: 0.8,       // how hard the world pulls DOWN. bigger = heavier
  MAX_FALL: 16,       // fastest the player is allowed to fall

  // --- the player's size ----------------------------------------------
  PLAYER_SIZE: 32,    // the player collides as a 32x32 box
  PLAYER_RADIUS: 16,  // ...but is DRAWN as a circle this big

  // --- drawing --------------------------------------------------------
  LINE_WIDTH: 3,      // thickness of every black outline
  DOT_DISTANCE: 0.55, // how far the off-center dot sits from the middle
                      // 0 = dead center, 1 = right on the edge

  // --- rules ----------------------------------------------------------
  START_LEVEL: 0,      // which level in data/levels.json to load first

  // Player looks and abilities rotate by level, so every stage has its own identity.
  SKINS: [
    { name: "Neon", body: "#f3feff", accent: "#5fe8ff", shadow: "#31d0ff", powerup: "doubleJump" },
    { name: "Sunset", body: "#fff0d0", accent: "#ff9a3d", shadow: "#ff3f7f", powerup: "boost" },
    { name: "Meadow", body: "#e8ffe9", accent: "#5dff9a", shadow: "#31d0ff", powerup: "shield" },
    { name: "Violet", body: "#f2e8ff", accent: "#c58cff", shadow: "#ff70c8", powerup: "doubleJump" },
    { name: "Gold", body: "#fffbd1", accent: "#ffd93d", shadow: "#ff9a3d", powerup: "gun" }
  ]
};