// ============================================================================
// COMBINED SYSTEM CONFIGURATION & REGISTRY
// ============================================================================

const GAME_CONFIG = {
    gravity: 0.5,
    moveSpeed: 4,
    jumpForce: -10,
    tileSize: 32, // Resolution mapping for data grid blocks
    playerRadius: 16
};

// Complete 100-Level structural array generated programmatically
const GAME_LEVELS = Array.from({ length: 100 }, (_, index) => {
    const id = index + 1;
    let pieces = ["start", "flat"];
    
    if (id === 1) {
        pieces.push("flat", "finish");
    } else if (id < 20) {
        // Early levels: Short distances, single hazards
        const pool = ["gap", "spikes", "flat"];
        pieces.push(pool[id % pool.length], "flat", "finish");
    } else if (id < 60) {
        // Mid game: Longer platforming sequences
        for (let i = 0; i < Math.floor(id / 10) + 2; i++) {
            pieces.push((i % 2 === 0) ? "flat" : ((id + i) % 3 === 0 ? "gap" : "spikes"));
        }
        pieces.push("finish");
    } else {
        // Late game / Endgame gauntlets
        for (let i = 0; i < 8; i++) {
            if (i % 3 === 0) pieces.push("spikes");
            else if (i % 3 === 1) pieces.push("gap");
            else pieces.push("flat");
        }
        pieces.push("finish");
    }

    return {
        id: id,
        name: `Level ${id}`,
        pieces: pieces
    };
});

// ============================================================================
// IMPROVED CIRCULAR HITBOX ENGINE (js/collide.js Replacement)
// ============================================================================

/**
 * Calculates physics interactions using standard Circle-to-AABB Box projection math.
 * Prevents phantom clipped edges when passing sharp geometry walls.
 */
function checkCircleTileCollision(playerCircle, solidTile) {
    // Determine exact absolute center coordinates for the circle
    const circleX = playerCircle.x + playerCircle.radius;
    const circleY = playerCircle.y + playerCircle.radius;

    // Isolate the boundary limits of the solid obstacle map cell
    const closestX = Math.max(solidTile.x, Math.min(circleX, solidTile.x + solidTile.width));
    const closestY = Math.max(solidTile.y, Math.min(circleY, solidTile.y + solidTile.height));

    // Vector calculations from the block anchor points
    const deltaX = circleX - closestX;
    const deltaY = circleY - closestY;

    // Determine square distance scalar
    const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);
    
    // Intersection flags return true if bounds overlap
    return distanceSquared < (playerCircle.radius * playerCircle.radius);
}

// ============================================================================
// STICK FIGURE VECTOR CANVAS ART RENDERING (js/draw.js Replacement)
// ============================================================================

/**
 * Standard vector graphics system mapping a rotating stick-figure layout
 * inside a boundary bounding container context.
 */
function drawStickFigurePlayer(ctx, player) {
    const radius = player.radius || GAME_CONFIG.playerRadius;
    const centerX = player.x + radius;
    const centerY = player.y + radius;
    
    // Track rotation angle if the player has rolling velocity metrics active
    const angle = player.rotationAngle || 0;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // 1. Head (Centered relative to vertical coordinate shift)
    ctx.beginPath();
    ctx.arc(0, -radius * 0.4, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Spine / Torso
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.1);
    ctx.lineTo(0, radius * 0.4);
    ctx.stroke();

    // 3. Dynamic Walking Arms (Varying offset positions based on mechanical motion)
    const armSwing = Math.sin(angle * 2) * (radius * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0); // Shoulder anchor point
    ctx.lineTo(-radius * 0.4, armSwing); // Left arm
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.4, -armSwing); // Right arm
    ctx.stroke();

    // 4. Running / Tumbling Legs
    const legSwing = Math.cos(angle * 2) * (radius * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.4); // Pelvis base joint
    ctx.lineTo(-radius * 0.3, radius * 0.4 + legSwing); // Left leg segment
    ctx.moveTo(0, radius * 0.4);
    ctx.lineTo(radius * 0.3, radius * 0.4 - legSwing); // Right leg segment
    ctx.stroke();

    ctx.restore();
}

// ============================================================================
// EXPORT INTEGRATION REFERENCE
// ============================================================================
console.log("Game sub-systems cleanly initialized. 100 levels built successfully.");
