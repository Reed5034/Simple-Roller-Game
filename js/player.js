/* =====================================================================
   player.js  --  THE ROLLING CIRCLE.

   This file owns everything about the player: where it is, how fast it
   is going, and what happens when it hits something.

   It does NOT draw anything. Drawing lives in js/draw.js.
   ===================================================================== */

var Player = {
  x: 0,            // position in pixels, left edge of the box
  y: 0,            // position in pixels, top edge of the box
  vx: 0,           // speed left and right
  vy: 0,           // speed up and down
  onGround: false, // is the player standing on something right now?
  angle: 0,        // how far the circle has rolled, for drawing the dot
  boostTime: 0,    // frames remaining for speed/jump boost
  shieldTime: 0,   // frames remaining for enemy shield
  secretGlow: 0,   // frames showing secret route effect
  hasGun: false,
  facing: 1,
  bullets: [],
  shootWasDown: false
};

// Put the player back at the level's S square.
Player.reset = function () {
  Player.x = Level.startX;
  Player.y = Level.startY;
  Player.vx = 0;
  Player.vy = 0;
  Player.onGround = false;
  Player.angle = 0;
  Player.boostTime = 0;
  Player.shieldTime = 0;
  Player.secretGlow = 0;
  Player.hasGun = false;
  Player.facing = 1;
  Player.bullets = [];
  Player.shootWasDown = false;

  if (Level.secretAreas) {
    for (var i = 0; i < Level.secretAreas.length; i++) {
      Level.secretAreas[i].entered = false;
    }
  }
  if (Level.powerups) {
    for (var i = 0; i < Level.powerups.length; i++) {
      Level.powerups[i].collected = false;
    }
  }
};

Player.tryCollectPowerup = function () {
  if (!Level.powerups) { return; }

  var size = CONFIG.PLAYER_SIZE;
  for (var i = 0; i < Level.powerups.length; i++) {
    var powerup = Level.powerups[i];
    if (powerup.collected) { continue; }

    var x = powerup.x;
    var y = powerup.y;
    var w = powerup.w || 18;
    var h = powerup.h || 18;

    if (Player.x + size > x && Player.x < x + w &&
        Player.y + size > y && Player.y < y + h) {
      powerup.collected = true;
      if (powerup.type === "boost") {
        Player.boostTime = 300;
        Game.showMessage("Boost! The secret path feels much easier.");
      } else if (powerup.type === "shield") {
        Player.shieldTime = 360;
        Game.showMessage("Shield! One enemy hit is blocked.");
      } else if (powerup.type === "gun") {
        Player.hasGun = true;
        Game.showMessage("Gun collected! Press X to fire.");
      }
    }
  }
};

Player.trySecretArea = function () {
  if (!Level.secretAreas) { return; }

  var size = CONFIG.PLAYER_SIZE;
  for (var i = 0; i < Level.secretAreas.length; i++) {
    var area = Level.secretAreas[i];
    if (area.entered) { continue; }

    if (Level.overlapsRect(Player.x, Player.y, size, size, area)) {
      area.entered = true;
      Player.secretGlow = 180;
      Game.showMessage("Bonus route found! Optional shortcut ahead.");
    }
  }
};

// Run one frame of player movement.
Player.update = function () {
  var size = CONFIG.PLAYER_SIZE;
  Player.tryCollectPowerup();
  Player.trySecretArea();

  if (Player.boostTime > 0) {
    Player.boostTime = Player.boostTime - 1;
  }
  if (Player.shieldTime > 0) {
    Player.shieldTime = Player.shieldTime - 1;
  }
  if (Player.secretGlow > 0) {
    Player.secretGlow = Player.secretGlow - 1;
  }

  // --- 1. decide how fast to go sideways ------------------------------
  var moveSpeed = CONFIG.MOVE_SPEED + (Player.boostTime > 0 ? 2 : 0);
  Player.vx = 0;
  if (Input.left)  { Player.vx = -moveSpeed; }
  if (Input.right) { Player.vx =  moveSpeed; }
  if (Player.vx !== 0) { Player.facing = Player.vx > 0 ? 1 : -1; }

  // --- 2. jump, but only if we are standing on something --------------
  var jumpPower = CONFIG.JUMP_POWER + (Player.boostTime > 0 ? 1.5 : 0);
  if (Input.jump && Player.onGround) {
    Player.vy = -jumpPower;   // negative is UP
    Player.onGround = false;
  }

  // --- 3. gravity pulls down every single frame -----------------------
  Player.vy = Player.vy + CONFIG.GRAVITY;
  if (Player.vy > CONFIG.MAX_FALL) { Player.vy = CONFIG.MAX_FALL; }

  // --- 4. move sideways, one pixel at a time, stopping at walls -------
  var stepX = 0;
  if (Player.vx > 0) { stepX = 1; }
  if (Player.vx < 0) { stepX = -1; }

  for (var i = 0; i < Math.abs(Player.vx); i++) {
    if (Collide.hitsSolid(Player.x + stepX, Player.y, size, size)) { break; }
    Player.x = Player.x + stepX;
    Player.angle = Player.angle + stepX / CONFIG.PLAYER_RADIUS; // roll it
  }

  // --- 5. move up or down, one pixel at a time ------------------------
  var stepY = 0;
  if (Player.vy > 0) { stepY = 1; }
  if (Player.vy < 0) { stepY = -1; }

  Player.onGround = false;

  for (var j = 0; j < Math.abs(Player.vy); j++) {
    if (Collide.hitsSolid(Player.x, Player.y + stepY, size, size)) {
      if (stepY > 0) { Player.onGround = true; }  // we landed on something
      Player.vy = 0;
      break;
    }
    Player.y = Player.y + stepY;
  }

  // --- 6. keep the player inside the left edge of the world -----------
  if (Player.x < 0) { Player.x = 0; }

  Player.updateBullets();
  Player.shootWasDown = Input.shoot;
};

Player.updateBullets = function () {
  if (Player.hasGun && Input.shoot && !Player.shootWasDown) {
    Player.bullets.push({
      x: Player.x + (Player.facing > 0 ? CONFIG.PLAYER_SIZE : -6),
      y: Player.y + 12,
      vx: Player.facing * 10
    });
  }

  for (var i = Player.bullets.length - 1; i >= 0; i--) {
    var bullet = Player.bullets[i];
    bullet.x += bullet.vx;
    if (bullet.x < 0 || bullet.x > Level.pixelWidth() ||
        Collide.hitsSolid(bullet.x, bullet.y, 8, 4)) {
      Player.bullets.splice(i, 1);
      continue;
    }
    if (Enemy.hitByBullet(bullet.x, bullet.y, 8, 4)) {
      Player.bullets.splice(i, 1);
    }
  }
};

// Did the player just touch something deadly?
Player.isDead = function () {
  var size = CONFIG.PLAYER_SIZE;
  if (Collide.hitsSpike(Player.x, Player.y, size, size)) { return true; }
  if (Enemy.checkHit(Player.x, Player.y, size, size)) {
    if (Player.shieldTime > 0) {
      Player.shieldTime = 0;
      return false;
    }
    return true;
  }
  if (Player.y > CONFIG.CANVAS_H + 200) { return true; }   // fell off the world
  return false;
};

// Did the player just reach the finish?
Player.hasWon = function () {
  var size = CONFIG.PLAYER_SIZE;
  return Collide.hitsFinish(Player.x, Player.y, size, size);
};