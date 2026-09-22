/* =====================================================================  
   draw.js  --  EVERYTHING YOU CAN SEE.  
   ===================================================================== */  
  
var Draw = {  
  canvas: null,  
  ctx: null,  
  cameraX: 0  
};  
  
Draw.setup = function () {  
  Draw.canvas = document.getElementById("game");  
  Draw.ctx = Draw.canvas.getContext("2d");  
};  
  
Draw.updateCamera = function () {  
  Draw.cameraX = Player.x - CONFIG.CANVAS_W / 2;  
  if (Draw.cameraX < 0) { Draw.cameraX = 0; }  
  
  var furthest = Level.pixelWidth() - CONFIG.CANVAS_W;  
  if (furthest < 0) { furthest = 0; }  
  if (Draw.cameraX > furthest) { Draw.cameraX = furthest; }  
};  
  
// Draw one whole frame.  
Draw.everything = function () {  
  var ctx = Draw.ctx;  
  
  // 1. wipe the screen white  
  ctx.fillStyle = "#ffffff";  
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);  
  
  // 2. shift everything left so the camera looks like it moved right  
  ctx.save();  
  ctx.translate(-Draw.cameraX, 0);  
  
  Draw.world();
  Draw.secretAreas();
  Draw.powerups();
  Enemy.draw();
  Draw.player();  
  
  ctx.restore();  
  
  // 3. the menu draws on top, fixed to the screen  
  Draw.menu();  
};  
  
// the calm win menu and break screen  
Draw.menu = function () {  
  var ctx = Draw.ctx;  
  if (Game.mode !== "won" && Game.mode !== "break") { return; }

  ctx.fillStyle = "#ffffff";  
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);  
  ctx.fillStyle = "#000000";  
  ctx.textAlign = "center";  
  ctx.font = "30px monospace";  
  if (Game.mode === "won") {  
    if (Game.beatGame) {  
      ctx.fillText("You beat the Game!", CONFIG.CANVAS_W / 2, 180);  
      ctx.font = "20px monospace";  
      ctx.fillText("Press R to start over", CONFIG.CANVAS_W / 2, 230);  
    } else {  
      ctx.fillText("Level Complete!", CONFIG.CANVAS_W / 2, 150);  
      ctx.font = "20px monospace";  
      ctx.fillText("Press ENTER for Next Level", CONFIG.CANVAS_W / 2, 210);  
      ctx.fillText("Press B — Need a break?", CONFIG.CANVAS_W / 2, 250);  
    }  
  } else if (Game.mode === "break") {  
    ctx.fillText("Ready for More?", CONFIG.CANVAS_W / 2, 190);  
    ctx.font = "20px monospace";  
    ctx.fillText("Press ENTER", CONFIG.CANVAS_W / 2, 240);  
  }  
  ctx.textAlign = "left";  
};  
  
// Draw every grid square that is currently on screen.  
Draw.world = function () {  
  var ctx = Draw.ctx;  
  var size = CONFIG.TILE;  
  
  var firstCol = Math.floor(Draw.cameraX / size) - 1;  
  var lastCol  = firstCol + Math.ceil(CONFIG.CANVAS_W / size) + 2;  
  
  for (var row = 0; row < CONFIG.ROWS; row++) {  
    for (var col = firstCol; col <= lastCol; col++) {  
      var here = Level.charAt(col, row);  
      var x = col * size;  
      var y = row * size;  
  
      if (here === "#") { Draw.block(x, y, size); }  
      if (here === "^") { Draw.spike(x, y, size); }  
      if (here === "F") { Draw.finish(x, y, size); }  
    }  
  }  
};  
  
Draw.block = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#ffffff";  
  ctx.fillRect(x, y, size, size);  
  ctx.strokeStyle = "#000000";  
  ctx.lineWidth = CONFIG.LINE_WIDTH;  
  ctx.strokeRect(x + CONFIG.LINE_WIDTH / 2,  
                 y + CONFIG.LINE_WIDTH / 2,  
                 size - CONFIG.LINE_WIDTH,  
                 size - CONFIG.LINE_WIDTH);  
};

Draw.powerups = function () {
  if (!Level.powerups) { return; }

  var ctx = Draw.ctx;
  for (var i = 0; i < Level.powerups.length; i++) {
    var item = Level.powerups[i];
    if (item.collected) { continue; }

    ctx.beginPath();
    ctx.fillStyle = item.type === "shield" ? "#ffd93d" : "#31d0ff";
    ctx.arc(item.x + (item.w || 18) / 2, item.y + (item.h || 18) / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
};

Draw.secretAreas = function () {
  if (!Level.secretAreas) { return; }

  var ctx = Draw.ctx;
  for (var i = 0; i < Level.secretAreas.length; i++) {
    var area = Level.secretAreas[i];
    var undergroundY = area.y + 180;
    var closeEnough = Math.abs(Player.x - area.x) < 140;
    var visibleAlpha = area.entered ? 0.18 : (closeEnough ? 0.035 : 0.01);

    ctx.fillStyle = area.entered ? "rgba(58, 255, 160, 0.18)" : "rgba(19, 34, 58, " + visibleAlpha + ")";
    ctx.fillRect(area.x, undergroundY, area.w, area.h);

    if (closeEnough || area.entered) {
      ctx.strokeStyle = area.entered ? "rgba(58, 255, 160, 0.7)" : "rgba(100, 150, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.strokeRect(area.x, undergroundY, area.w, area.h);
    }
  }
};
  
Draw.spike = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#000000";  
  ctx.beginPath();  
  ctx.moveTo(x, y + size);  
  ctx.lineTo(x + size / 2, y);  
  ctx.lineTo(x + size, y + size);  
  ctx.closePath();  
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
};  
  
Draw.finish = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#000000";  
  ctx.fillRect(x + size / 2 - 2, y, 4, size);  
  ctx.beginPath();  
  ctx.moveTo(x + size / 2 + 2, y + 4);  
  ctx.lineTo(x + size - 4,     y + 12);  
  ctx.lineTo(x + size / 2 + 2, y + 20);  
  ctx.closePath();  
  ctx.fill();  
};  
  
Draw.player = function () {  
  var ctx = Draw.ctx;  
  var r = CONFIG.PLAYER_RADIUS;  
  var centerX = Player.x + CONFIG.PLAYER_SIZE / 2;  
  var centerY = Player.y + CONFIG.PLAYER_SIZE / 2;  
  
  ctx.fillStyle = "#ffffff";  
  ctx.strokeStyle = "#000000";  
  ctx.lineWidth = CONFIG.LINE_WIDTH;  
  ctx.beginPath();  
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2);  
  ctx.fill();  
  ctx.stroke();  
  
  var dotX = centerX + Math.cos(Player.angle) * r * CONFIG.DOT_DISTANCE;  
  var dotY = centerY + Math.sin(Player.angle) * r * CONFIG.DOT_DISTANCE;  
  
  ctx.fillStyle = "#000000";  
  ctx.beginPath();  
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);  
  ctx.fill();  
};  
