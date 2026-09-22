/* =====================================================================
   enemy.js  --  MOVING HAZARDS.

   Enemies patrol a small section of the world. Touching one kills the
   player, so they act like moving blockers between the start and the flag.
   ===================================================================== */

var Enemy = {
  list: []
};

Enemy.reset = function () {
  Enemy.list = [];
  if (!Level.enemies) { return; }

  for (var i = 0; i < Level.enemies.length; i++) {
    var source = Level.enemies[i];
    Enemy.list.push({
      x: source.x,
      y: source.y,
      w: source.w || 28,
      h: source.h || 28,
      minX: source.minX,
      maxX: source.maxX,
      vx: source.vx || 1.2,
      direction: source.direction || 1
    });
  }
};

Enemy.update = function () {
  for (var i = 0; i < Enemy.list.length; i++) {
    var enemy = Enemy.list[i];
    enemy.x = enemy.x + enemy.vx * enemy.direction;

    if (enemy.x <= enemy.minX) {
      enemy.x = enemy.minX;
      enemy.direction = 1;
    }
    if (enemy.x + enemy.w >= enemy.maxX) {
      enemy.x = enemy.maxX - enemy.w;
      enemy.direction = -1;
    }
  }
};

Enemy.draw = function () {
  var ctx = Draw.ctx;
  for (var i = 0; i < Enemy.list.length; i++) {
    var enemy = Enemy.list[i];
    ctx.fillStyle = "#000000";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.strokeStyle = "#ff4d4d";
    ctx.lineWidth = 2;
    ctx.strokeRect(enemy.x - 1, enemy.y - 1, enemy.w + 2, enemy.h + 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.w - 10, enemy.h - 10);
  }
};

Enemy.checkHit = function (x, y, width, height) {
  var pad = 3;
  for (var i = 0; i < Enemy.list.length; i++) {
    var enemy = Enemy.list[i];
    var hits = x + width > enemy.x - pad && x < enemy.x + enemy.w + pad &&
               y + height > enemy.y - pad && y < enemy.y + enemy.h + pad;
    if (hits) { return true; }
  }
  return false;
};
