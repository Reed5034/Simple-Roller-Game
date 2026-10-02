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
  menuDownWasDown: false,
  menuPage: "main",
  selectedSkin: -1,
  pendingLevel: null,
  menuKeyWasDown: false,
  paused: false,
  auraUnlocked: false,
  adminCode: "1234"
};  

Game.startLevel = function (levelNumber) {
  if (Game.selectedSkin < 0) {
    Game.selectedLevel = levelNumber;
    Game.pendingLevel = levelNumber;
    Game.menuPage = "skins";
    Game.mode = "MENU";
    Game.paused = false;
    return;
  }
  Game.pendingLevel = null;
  Game.levelNumber = levelNumber;
  Level.build(levelNumber);
  Enemy.reset();
  Player.reset();
  Game.mode = "playing";
  Game.paused = false;
  Game.showMessage("");
};

Game.openMenu = function (page) {
  Game.menuPage = page;
  Game.mode = "MENU";
  Game.paused = true;
  Game.selectedLevel = Game.levelNumber;
  Game.syncAdminBar();
};

Game.resumeLevel = function () {
  Game.mode = "playing";
  Game.menuPage = "main";
  Game.paused = false;
  Game.showMessage("");
};

Game.showMessage = function (text) {
  document.getElementById("message").textContent = text;
};

Game.syncAdminBar = function () {
  var bar = document.getElementById("admin-bar");
  var input = document.getElementById("admin-code");
  var button = document.getElementById("unlock-aura");
  if (!bar || !input || !button) { return; }
  var shouldShow = Game.menuPage === "skins";
  bar.classList.toggle("hidden", !shouldShow);
  if (Game.auraUnlocked) {
    input.value = "UNLOCKED";
    input.disabled = true;
    button.disabled = true;
    button.textContent = "Unlocked";
  } else {
    input.disabled = false;
    button.disabled = false;
    button.textContent = "Unlock Aura";
    if (input.value === "UNLOCKED") { input.value = ""; }
  }
};

Game.unlockAura = function (code) {
  var entered = String(code || "").trim();
  if (entered !== Game.adminCode) {
    Game.showMessage("Admin code rejected.");
    return false;
  }
  Game.auraUnlocked = true;
  var auraIndex = CONFIG.SKINS.findIndex(function (skin) { return skin.name === "Aura"; });
  if (auraIndex >= 0 && Game.selectedSkin < 0) {
    Game.selectedSkin = auraIndex;
  }
  Game.syncAdminBar();
  Game.showMessage("Aura unlocked.");
  return true;
};

// --- ONE FRAME --------------------------------------------------------
Game.update = function () {  
  if (Game.mode === "MENU") {
    Game.updateMenu();
    return;
  }

  var menuJustPressed = Input.menuKey && !Game.menuKeyWasDown;
  Game.menuKeyWasDown = Input.menuKey;
  if (menuJustPressed && Game.mode === "playing") {
    Game.openMenu("main");
    return;
  }

  var gameClick = Input.menuClick;
  Input.menuClick = null;
  if (gameClick && Game.mode === "playing") {
    if (Draw.gameButtonContains("gameLevels", gameClick.x, gameClick.y)) {
      Game.openMenu("levels");
      return;
    }
    if (Draw.gameButtonContains("gameSkins", gameClick.x, gameClick.y)) {
      Game.openMenu("skins");
      return;
    }
  }

  Game.menuPage = "main";
  var menuUpJustPressed = Input.menuUp && !Game.menuUpWasDown;
  var menuDownJustPressed = Input.menuDown && !Game.menuDownWasDown;
  Game.menuUpWasDown = Input.menuUp;
  Game.menuDownWasDown = Input.menuDown;

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

Game.updateMenu = function () {
  var menuUpJustPressed = Input.menuUp && !Game.menuUpWasDown;
  var menuDownJustPressed = Input.menuDown && !Game.menuDownWasDown;
  var enterJustPressed = Input.enter && !Game.enterWasDown;
  var click = Input.menuClick;
  Input.menuClick = null;

  Game.menuUpWasDown = Input.menuUp;
  Game.menuDownWasDown = Input.menuDown;
  Game.enterWasDown = Input.enter;

  if (Game.menuPage === "main") {
    Game.syncAdminBar();
    if (click) {
      if (Draw.menuButtonContains("play", click.x, click.y)) {
        if (Game.paused) {
          Game.resumeLevel();
        } else {
          Game.startLevel(Game.selectedLevel);
        }
      } else if (Draw.menuButtonContains("levels", click.x, click.y)) {
        Game.menuPage = "levels";
      } else if (Draw.menuButtonContains("skins", click.x, click.y)) {
        Game.menuPage = "skins";
      }
    } else if (enterJustPressed) {
      if (Game.paused) {
        Game.resumeLevel();
      } else {
        Game.startLevel(Game.selectedLevel);
      }
    }
    Game.syncAdminBar();
    return;
  }

  if (Game.menuPage === "levels") {
    Game.syncAdminBar();
    if (menuUpJustPressed) {
      Game.selectedLevel = (Game.selectedLevel + Level.levels.length - 1) % Level.levels.length;
    }
    if (menuDownJustPressed) {
      Game.selectedLevel = (Game.selectedLevel + 1) % Level.levels.length;
    }
    if (click) {
      var clickedLevel = Draw.menuLevelAt(click.x, click.y);
      if (clickedLevel >= 0) {
        Game.selectedLevel = clickedLevel;
        Game.startLevel(clickedLevel);
      } else if (Draw.menuButtonContains("back", click.x, click.y)) {
        Game.menuPage = "main";
      }
    } else if (enterJustPressed) {
      Game.startLevel(Game.selectedLevel);
    }
    Game.syncAdminBar();
    return;
  }

  if (Game.menuPage === "skins") {
    Game.syncAdminBar();
    var visibleSkins = [];
    for (var i = 0; i < CONFIG.SKINS.length; i++) {
      if (Game.auraUnlocked || CONFIG.SKINS[i].name !== "Aura") {
        visibleSkins.push(i);
      }
    }
    if (visibleSkins.length === 0) {
      Game.syncAdminBar();
      return;
    }
    if (menuUpJustPressed) {
      var currentVisibleIndex = visibleSkins.indexOf(Game.selectedSkin);
      var nextIndex = currentVisibleIndex >= 0 ? currentVisibleIndex - 1 : visibleSkins.length - 1;
      Game.selectedSkin = visibleSkins[(nextIndex + visibleSkins.length) % visibleSkins.length];
    }
    if (menuDownJustPressed) {
      var currentVisibleIndex = visibleSkins.indexOf(Game.selectedSkin);
      var nextIndex = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : 0;
      Game.selectedSkin = visibleSkins[nextIndex % visibleSkins.length];
    }
    if (Game.selectedSkin < 0 || Game.selectedSkin >= CONFIG.SKINS.length || (!Game.auraUnlocked && CONFIG.SKINS[Game.selectedSkin].name === "Aura")) {
      Game.selectedSkin = visibleSkins[0];
    }
    if (enterJustPressed && Game.selectedSkin >= 0) {
      if (Game.pendingLevel !== null) {
        Game.startLevel(Game.pendingLevel);
      } else {
        Game.menuPage = "main";
      }
    }
    if (click) {
      var clickedSkin = Draw.menuSkinAt(click.x, click.y);
      if (clickedSkin >= 0) {
        Game.selectedSkin = clickedSkin;
        if (Game.pendingLevel !== null) {
          Game.startLevel(Game.pendingLevel);
        }
      } else if (Draw.menuButtonContains("back", click.x, click.y)) {
        Game.menuPage = "main";
      }
    }
    Game.syncAdminBar();
  }
};