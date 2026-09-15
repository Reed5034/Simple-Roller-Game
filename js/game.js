/* =====================================================================
   game.js  --  THE RULES, STATE ENGINE, AND MAIN LOOP.
   ===================================================================== */

var Game = {
  mode: "MENU",       // Modes: "MENU", "playing", "dead", "won"
  levelNumber: 0
};

/**
 * Initializes level configurations and resets players back to origin metrics.
 */
Game.startLevel = function (levelNumber) {
  Game.levelNumber = levelNumber;
  if (typeof Level !== 'undefined' && Level.build) { Level.build(levelNumber); }
  if (typeof Player !== 'undefined' && Player.reset) { Player.reset(); }
  
  Game.mode = "playing";
  Game.showMessage("");
};

/**
 * Manages text updates inside the document overlay layout.
 */
Game.showMessage = function (text) {
  const msgEl = document.getElementById("message");
  if (msgEl) msgEl.textContent = text;
};

// --- PHYSICS & LOGIC TICK --------------------------------------------
Game.update = function () {
  // R always restarts, no matter what mode we are in (except the main menu).
  if (typeof Input !== 'undefined' && Input.restart && Game.mode !== "MENU") {
    Game.startLevel(Game.levelNumber);
    return;
  }

  // If we are not actively inside a stage, skip movement calculations.
  if (Game.mode !== "playing") { return; }

  if (typeof Player !== 'undefined' && Player.update) {
    Player.update();

    if (Player.isDead()) {
      Game.mode = "dead";
      Game.showMessage("You hit something. Press R to try again.");
      return;
    }

    if (Player.hasWon()) {
      Game.mode = "won";
      Game.showMessage("You made it. Press R to play again.");
      return;
    }
  }
};

// --- RENDER ROUTINE ---------------------------------------------------
Game.render = function () {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (Game.mode === "MENU") {
    if (typeof drawGameMenu === 'function') {
      drawGameMenu(ctx, canvas.width, canvas.height);
    }
  } else {
    // Standard level rendering pipeline
    if (typeof Draw !== 'undefined') {
      if (Draw.updateCamera) Draw.updateCamera();
      if (Draw.everything) Draw.everything();
    }
    
    // Draw our stick figure over the level geometry
    if (typeof drawStickFigurePlayer === 'function' && typeof player !== 'undefined') {
      drawStickFigurePlayer(ctx, player);
    }
  }
};

// --- THE CORE GAME LOOP -----------------------------------------------
Game.loop = function () {
  Game.update();
  Game.render();
  window.requestAnimationFrame(Game.loop);
};

// --- INTERACTION EVENT LISTENERS ---------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  canvas.addEventListener("click", function(event) {
    // Only listen for menu interaction bounds if the player is sitting on the menu screen
    if (Game.mode !== "MENU") return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    if (typeof handleMenuClick === 'function') {
      handleMenuClick(mouseX, mouseY, canvas.width, canvas.height, function() {
        console.log("Game loop started!");
        Game.startLevel(1); // Auto-load level 1 upon a verified menu selection confirmation
      });
    }
  });
});
