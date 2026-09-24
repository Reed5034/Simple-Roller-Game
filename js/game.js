/* =====================================================================
   game.js  --  THE RULES AND THE LOOP.

   The game is always in exactly ONE mode: "playing", "dead", or "won".
   Which mode it is in decides what happens each frame.

   The loop runs about 60 times a second, forever. Every time it runs it
   does the same two things: UPDATE (change the numbers) and DRAW (show
   the numbers).
   ===================================================================== */

var Game = {  
  mode: "MENU",       // "MENU", "playing", "dead", "won", "break"  
  levelNumber: 0,  
  beatGame: false,  
  enterWasDown: false,  
  wasDownBreak: false,
  selectedLevel: 0,
  menuUpWasDown: false,
  menuDownWasDown: false
};  

Game.startLevel = function (levelNumber) {
  Game.levelNumber = levelNumber;
  Level.build(levelNumber);
  Enemy.reset();
  Player.reset();
  Game.mode = "playing";
  Game.showMessage("");
};

Game.showMessage = function (text) {
  document.getElementById("message").textContent = text;
};

// --- ONE FRAME --------------------------------------------------------
Game.update = function () {  
  var menuUpJustPressed = Input.menuUp && !Game.menuUpWasDown;
  var menuDownJustPressed = Input.menuDown && !Game.menuDownWasDown;
  Game.menuUpWasDown = Input.menuUp;
  Game.menuDownWasDown = Input.menuDown;

  if (Game.mode === "MENU") {
    if (menuUpJustPressed) {
      Game.selectedLevel = (Game.selectedLevel + Level.levels.length - 1) % Level.levels.length;
    }
    if (menuDownJustPressed) {
      Game.selectedLevel = (Game.selectedLevel + 1) % Level.levels.length;
    }
    if (Input.enter && !Game.enterWasDown) {
      Game.startLevel(Game.selectedLevel);
    }
    Game.enterWasDown = Input.enter;
    return;
  }

  // 1. R always restarts  
  if (Input.restart) {  
    var targetLevel = Game.beatGame ? 0 : Game.levelNumber;  
    Game.beatGame = false;  
    Game.startLevel(targetLevel);  
    return;  
  }  
  
  // 2. win menu and break screen choices  
  var enterJustPressed = Input.enter && !Game.enterWasDown;  
  var breakJustPressed = Input.breakKey && !Game.wasDownBreak;  
  Game.enterWasDown = Input.enter;  
  Game.wasDownBreak = Input.breakKey;  
  
  if (Game.mode === "won" && !Game.beatGame) {  
    if (enterJustPressed) {  
      Game.startLevel(Game.levelNumber + 1);  
    } else if (breakJustPressed) {  
      Game.mode = "break";  
    }  
  } else if (Game.mode === "break" && enterJustPressed) {  
    Game.mode = "won";  
    Game.showMessage("Level Complete! Enter = Next Level, B = Need a break?");  
  }  
  
  // 3. everything else only runs while actually playing  
  if (Game.mode !== "playing") { return; }  
  
  Enemy.update();
  Player.update();  
  if (Player.isDead()) {  
    Game.mode = "dead";  
    Game.showMessage("You hit something. Press R to try again.");  
    return;  
  }  
  if (Player.hasWon()) {  
    Game.mode = "won";  
    if (Game.levelNumber + 1 >= Level.levels.length) {  
      Game.beatGame = true;  
      Game.showMessage("You beat the Game! Press R to start over.");  
    } else {  
      Game.showMessage("Level Complete! Enter = Next Level, B = Need a break?");  
    }  
  }  
};  


// --- THE LOOP ITSELF --------------------------------------------------
Game.loop = function () {
  Game.update();
  Draw.updateCamera();
  Draw.everything();
  window.requestAnimationFrame(Game.loop);
  
};