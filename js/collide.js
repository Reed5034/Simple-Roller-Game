/* =====================================================================
   collide.js  --  DID THE PLAYER TOUCH SOMETHING?

   The player is a BOX for collision, even though it is drawn as a
   circle. Boxes are much easier to check, and nobody can tell.

   Every function here answers one yes-or-no question about a box.
   ===================================================================== */

var Collide = {};

Collide.overlaps = function (x, y, width, height, otherX, otherY, otherWidth, otherHeight) {
  return x < otherX + otherWidth && x + width > otherX &&
         y < otherY + otherHeight && y + height > otherY;
};

// Which grid squares does this box overlap?
// Returns a list of { col: , row: } objects.
Collide.squaresUnder = function (x, y, width, height) {
  var firstCol = Math.floor(x / CONFIG.TILE);
  var lastCol  = Math.floor((x + width  - 1) / CONFIG.TILE);
  var firstRow = Math.floor(y / CONFIG.TILE);
  var lastRow  = Math.floor((y + height - 1) / CONFIG.TILE);

  var squares = [];
  for (var row = firstRow; row <= lastRow; row++) {
    for (var col = firstCol; col <= lastCol; col++) {
      squares.push({ col: col, row: row });
    }
  }
  return squares;
};

// Is this box inside a solid block?
Collide.hitsSolid = function (x, y, width, height) {
  var squares = Collide.squaresUnder(x, y, width, height);
  for (var i = 0; i < squares.length; i++) {
    if (Level.isSolid(squares[i].col, squares[i].row)) { return true; }
  }
  return false;
};

// Is this box touching a spike?
Collide.hitsSpike = function (x, y, width, height) {
  var squares = Collide.squaresUnder(x, y, width, height);
  for (var i = 0; i < squares.length; i++) {
    if (!Level.isSpike(squares[i].col, squares[i].row)) { continue; }

    var spikeX = squares[i].col * CONFIG.TILE;
    var spikeY = squares[i].row * CONFIG.TILE + CONFIG.TILE * 0.35;
    if (Collide.overlaps(x, y, width, height, spikeX, spikeY,
                         CONFIG.TILE, CONFIG.TILE * 0.65)) {
      return true;
    }
  }
  return false;
};

// Is this box touching the finish?
Collide.hitsFinish = function (x, y, width, height) {
  var squares = Collide.squaresUnder(x, y, width, height);
  for (var i = 0; i < squares.length; i++) {
    if (Level.isFinish(squares[i].col, squares[i].row)) { return true; }
  }
  return false;
};