/* =====================================================================
   main.js  --  THE STARTING LINE.

   This is the smallest file in the project and it runs last. All it
   does is: set up the screen, load the data files, build the first
   level, and start the loop.

   You will almost never need to change this file.
   ===================================================================== */

Draw.setup();

var adminCodeInput = document.getElementById("admin-code");
var unlockAuraButton = document.getElementById("unlock-aura");

if (adminCodeInput && unlockAuraButton) {
  unlockAuraButton.addEventListener("click", function () {
    Game.unlockAura(adminCodeInput.value);
  });

  adminCodeInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      Game.unlockAura(adminCodeInput.value);
    }
  });
}

Game.syncAdminBar();

Level.loadData(function () {
  Game.selectedLevel = CONFIG.START_LEVEL;
  Game.loop();
});