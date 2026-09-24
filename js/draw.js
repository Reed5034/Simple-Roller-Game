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
  
  // 1. paint the fixed-space atmosphere behind the level
  Draw.background();
  
  // 2. shift everything left so the camera looks like it moved right  
  ctx.save();  
  ctx.translate(-Draw.cameraX, 0);  
  
  Draw.world();
  Draw.powerups();
  Draw.bullets();
  Enemy.draw();
  Draw.player();  
  
  ctx.restore();  
  
  // 3. the menu draws on top, fixed to the screen  
  Draw.menu();  
};  
  
// The main menu, level picker, skin gallery, win menu, and break screen.
Draw.menu = function () {
  var ctx = Draw.ctx;
  if (Game.mode === "MENU") {
    ctx.fillStyle = "rgba(5, 9, 22, 0.97)";
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    if (Game.menuPage === "main") { Draw.mainMenu(); }
    if (Game.menuPage === "levels") { Draw.levelMenu(); }
    if (Game.menuPage === "skins") { Draw.skinMenu(); }
    return;
  }
  if (Game.mode !== "won" && Game.mode !== "break") { return; }

  ctx.fillStyle = "rgba(5, 9, 22, 0.96)";
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);  
  ctx.fillStyle = "#f3feff";
  ctx.textAlign = "center";  
  ctx.font = "bold 30px monospace";
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

Draw.menuButton = function (label, name, y, selected) {
  var ctx = Draw.ctx;
  var x = name === "back" ? 30 : 250;
  var width = name === "back" ? 120 : 300;
  var height = name === "back" ? 38 : 46;
  ctx.fillStyle = selected ? "#31d0ff" : "#172949";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = selected ? "#f3feff" : "#4de1f7";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = selected ? "#050916" : "#f3feff";
  ctx.font = name === "back" ? "16px monospace" : "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, x + width / 2, y + height / 2 + 7);
};

Draw.mainMenu = function () {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#f3feff";
  ctx.textAlign = "center";
  ctx.font = "bold 42px monospace";
  ctx.fillText("ROLLER", CONFIG.CANVAS_W / 2, 76);
  ctx.font = "16px monospace";
  ctx.fillStyle = "#83a7c4";
  ctx.fillText("Level " + (Game.selectedLevel + 1) + " wears the " +
               CONFIG.SKINS[Game.selectedLevel % CONFIG.SKINS.length].name + " skin", CONFIG.CANVAS_W / 2, 112);
  Draw.menuButton("PLAY", "play", 140, false);
  Draw.menuButton("LEVELS", "levels", 202, false);
  Draw.menuButton("SKINS", "skins", 264, false);
  ctx.font = "13px monospace";
  ctx.fillStyle = "#83a7c4";
  ctx.fillText("Click a button or use ENTER", CONFIG.CANVAS_W / 2, 350);
  ctx.textAlign = "left";
};

Draw.levelMenu = function () {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#f3feff";
  ctx.textAlign = "center";
  ctx.font = "bold 28px monospace";
  ctx.fillText("SELECT A LEVEL", CONFIG.CANVAS_W / 2, 55);
  ctx.font = "14px monospace";
  ctx.fillStyle = "#83a7c4";
  ctx.fillText("UP / DOWN, then ENTER to play", CONFIG.CANVAS_W / 2, 82);
  var first = Math.max(0, Math.min(Game.selectedLevel - 3, Level.levels.length - 6));
  for (var levelIndex = first; levelIndex < Math.min(first + 6, Level.levels.length); levelIndex++) {
    var y = 105 + (levelIndex - first) * 35;
    ctx.fillStyle = levelIndex === Game.selectedLevel ? "#31d0ff" : "#83a7c4";
    ctx.fillText((levelIndex === Game.selectedLevel ? "> " : "  ") +
                 (levelIndex + 1) + ". " + Level.levels[levelIndex].name, CONFIG.CANVAS_W / 2, y + 22);
  }
  Draw.menuButton("BACK", "back", 345, false);
  ctx.textAlign = "left";
};

Draw.skinMenu = function () {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#f3feff";
  ctx.textAlign = "center";
  ctx.font = "bold 28px monospace";
  ctx.fillText("SKINS", CONFIG.CANVAS_W / 2, 55);
  ctx.font = "14px monospace";
  ctx.fillStyle = "#83a7c4";
  ctx.fillText("Each level automatically chooses a skin", CONFIG.CANVAS_W / 2, 82);
  for (var skinIndex = 0; skinIndex < CONFIG.SKINS.length; skinIndex++) {
    var skin = CONFIG.SKINS[skinIndex];
    var x = 35 + skinIndex * 150;
    var selected = skinIndex === Game.selectedSkin;
    ctx.fillStyle = selected ? "#203d5d" : "#101a35";
    ctx.fillRect(x, 120, 130, 150);
    ctx.strokeStyle = selected ? skin.accent : "#294467";
    ctx.lineWidth = selected ? 3 : 1;
    ctx.strokeRect(x, 120, 130, 150);
    Draw.skinPreview(x + 65, 180, skin);
    ctx.fillStyle = selected ? skin.accent : "#d9faff";
    ctx.font = "14px monospace";
    ctx.fillText(skin.name, x + 65, 245);
    ctx.fillStyle = "#83a7c4";
    ctx.font = "11px monospace";
    ctx.fillText(skin.powerup === "doubleJump" ? "DOUBLE JUMP" :
           (skin.powerup === "boost" ? "SPEED BOOST" : skin.powerup.toUpperCase()), x + 65, 262);
  }
  Draw.menuButton("BACK", "back", 345, false);
  ctx.textAlign = "left";
};

Draw.skinPreview = function (centerX, centerY, skin) {
  var ctx = Draw.ctx;
  ctx.save();
  ctx.shadowColor = skin.shadow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = skin.body;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = skin.accent;
  ctx.beginPath();
  ctx.arc(centerX + 9, centerY - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

Draw.menuButtonContains = function (name, x, y) {
  var bounds = {
    play: { x: 250, y: 140, w: 300, h: 46 },
    levels: { x: 250, y: 202, w: 300, h: 46 },
    skins: { x: 250, y: 264, w: 300, h: 46 },
    back: { x: 30, y: 345, w: 120, h: 38 }
  };
  var button = bounds[name];
  return button && x >= button.x && x <= button.x + button.w &&
         y >= button.y && y <= button.y + button.h;
};

Draw.menuLevelAt = function (x, y) {
  var first = Math.max(0, Math.min(Game.selectedLevel - 3, Level.levels.length - 6));
  for (var levelIndex = first; levelIndex < Math.min(first + 6, Level.levels.length); levelIndex++) {
    var levelY = 105 + (levelIndex - first) * 35;
    if (x >= 180 && x <= 620 && y >= levelY && y <= levelY + 35) { return levelIndex; }
  }
  return -1;
};

Draw.menuSkinAt = function (x, y) {
  for (var skinIndex = 0; skinIndex < CONFIG.SKINS.length; skinIndex++) {
    var skinX = 35 + skinIndex * 150;
    if (x >= skinX && x <= skinX + 130 && y >= 120 && y <= 270) { return skinIndex; }
  }
  return -1;
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

Draw.background = function () {
  var ctx = Draw.ctx;
  var gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_H);
  gradient.addColorStop(0, "#080d20");
  gradient.addColorStop(0.55, "#101a35");
  gradient.addColorStop(1, "#182642");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#5fe8ff";
  ctx.lineWidth = 1;
  for (var x = 0; x <= CONFIG.CANVAS_W; x += CONFIG.TILE) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, CONFIG.CANVAS_H);
    ctx.stroke();
  }
  for (var y = 0; y <= CONFIG.CANVAS_H; y += CONFIG.TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(CONFIG.CANVAS_W, y + 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#a9f6ff";
  for (var i = 0; i < 28; i++) {
    var starX = (i * 137) % CONFIG.CANVAS_W;
    var starY = 18 + ((i * 67) % 190);
    ctx.fillRect(starX, starY, i % 3 === 0 ? 2 : 1, 1);
  }
  ctx.restore();
};
  
Draw.block = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#172949";
  ctx.fillRect(x, y, size, size);  
  ctx.strokeStyle = "#4de1f7";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + CONFIG.LINE_WIDTH / 2,  
                 y + CONFIG.LINE_WIDTH / 2,  
                 size - CONFIG.LINE_WIDTH,  
                 size - CONFIG.LINE_WIDTH);
  ctx.strokeStyle = "rgba(173, 249, 255, 0.18)";
  ctx.strokeRect(x + 7, y + 7, size - 14, size - 14);
};

Draw.powerups = function () {
  if (!Level.powerups) { return; }

  var ctx = Draw.ctx;
  for (var i = 0; i < Level.powerups.length; i++) {
    var item = Level.powerups[i];
    if (item.collected) { continue; }

    ctx.beginPath();
    ctx.fillStyle = item.type === "shield" ? "#ffd93d" : (item.type === "gun" ? "#ff9a3d" : "#31d0ff");
    ctx.arc(item.x + (item.w || 18) / 2, item.y + (item.h || 18) / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
};

Draw.bullets = function () {
  var ctx = Draw.ctx;
  for (var i = 0; i < Player.bullets.length; i++) {
    ctx.fillStyle = "#fff0a8";
    ctx.fillRect(Player.bullets[i].x, Player.bullets[i].y, 8, 4);
  }
};

Draw.spike = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#ff3f7f";
  ctx.beginPath();  
  ctx.moveTo(x, y + size);  
  ctx.lineTo(x + size / 2, y);  
  ctx.lineTo(x + size, y + size);  
  ctx.closePath();  
  ctx.fill();

  ctx.strokeStyle = "#ffd0e1";
  ctx.lineWidth = 1;
  ctx.stroke();
};  
  
Draw.finish = function (x, y, size) {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#a9f6ff";
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
  var skin = CONFIG.SKINS[Game.levelNumber % CONFIG.SKINS.length];
  var centerX = Player.x + CONFIG.PLAYER_SIZE / 2;
  var headY = Player.y + 7;
  var shoulderY = Player.y + 14;
  var hipY = Player.y + 22;
  var footY = Player.y + CONFIG.PLAYER_SIZE - 1;
  var runAmount = Player.vx === 0 ? 0 : Math.sin(Player.runCycle) * 5;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = skin.shadow;
  ctx.shadowBlur = Player.shieldTime > 0 ? 14 : 8;
  ctx.strokeStyle = skin.body;
  ctx.fillStyle = skin.body;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(centerX, headY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(centerX, headY + 6);
  ctx.lineTo(centerX, hipY);
  ctx.moveTo(centerX, shoulderY);
  ctx.lineTo(centerX - 7, shoulderY + runAmount);
  ctx.moveTo(centerX, shoulderY);
  ctx.lineTo(centerX + 7, shoulderY - runAmount);
  ctx.moveTo(centerX, hipY);
  ctx.lineTo(centerX - 7, footY - runAmount);
  ctx.moveTo(centerX, hipY);
  ctx.lineTo(centerX + 7, footY + runAmount);
  ctx.stroke();
  ctx.fillStyle = skin.accent;
  ctx.beginPath();
  ctx.arc(centerX, shoulderY + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};  
