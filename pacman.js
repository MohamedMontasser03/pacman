/*jslint browser: true, undef: true, eqeqeq: true, nomen: true, white: true */
/*global window: false, document: false */

/*
 * fix looped audio
 * add fruits + levels
 * fix what happens when a ghost is eaten (should go back to base)
 * do proper ghost mechanics (blinky/wimpy etc)
 */

let dev = false;
const mapWidth = 19,
  mapHeight = 22,
  blockSize = 32,
  footerHeight = 12 + blockSize;

var NONE = 4,
  UP = 3,
  LEFT = 2,
  DOWN = 1,
  RIGHT = 11,
  WAITING = 5,
  PAUSE = 6,
  PLAYING = 7,
  COUNTDOWN = 8,
  EATEN_PAUSE = 9,
  DYING = 10,
  BOX = 12,
  Pacman = {};

Pacman.FPS = 30;

Pacman.WALL = 0;
Pacman.BISCUIT = 1;
Pacman.EMPTY = 2;
Pacman.BLOCK = 3;
Pacman.PILL = 4;
Pacman.HWALL = 5;
Pacman.VWALL = 6;
Pacman.TLWALL = 7;
Pacman.TRWALL = 8;
Pacman.BLWALL = 9;
Pacman.BRWALL = 10;
Pacman.UCAP = 11;
Pacman.RCAP = 12;
Pacman.DCAP = 13;
Pacman.LCAP = 14;
Pacman.UJUNC = 15;
Pacman.RJUNC = 16;
Pacman.DJUNC = 17;
Pacman.LJUNC = 18;

// method 0 = line, 1 = curve, 2 = complex
const wallInstructions = {
  [Pacman.HWALL]: {
    method: 0,
    vars: [0, 0.5, 1, 0.5],
  },
  [Pacman.VWALL]: {
    method: 0,
    vars: [0.5, 0, 0.5, 1],
  },
  [Pacman.TLWALL]: {
    method: 1,
    vars: [1, 0.5, 0.5, 0.5, 0.5, 1],
  },
  [Pacman.TRWALL]: {
    method: 1,
    vars: [0, 0.5, 0.5, 0.5, 0.5, 1],
  },
  [Pacman.BLWALL]: {
    method: 1,
    vars: [1, 0.5, 0.5, 0.5, 0.5, 0],
  },
  [Pacman.BRWALL]: {
    method: 1,
    vars: [0, 0.5, 0.5, 0.5, 0.5, 0],
  },
  [Pacman.UCAP]: {
    method: 0,
    vars: [0.5, 1, 0.5, 0.5],
  },
  [Pacman.DCAP]: {
    method: 0,
    vars: [0.5, 0, 0.5, 0.5],
  },
  [Pacman.LCAP]: {
    method: 0,
    vars: [1, 0.5, 0.5, 0.5],
  },
  [Pacman.RCAP]: {
    method: 0,
    vars: [0, 0.5, 0.5, 0.5],
  },
  [Pacman.UJUNC]: {
    method: 2,
    vars: [Pacman.BRWALL, Pacman.BLWALL],
  },
  [Pacman.DJUNC]: {
    method: 2,
    vars: [Pacman.TRWALL, Pacman.TLWALL],
  },
  [Pacman.LJUNC]: {
    method: 2,
    vars: [Pacman.TRWALL, Pacman.BRWALL],
  },
  [Pacman.RJUNC]: {
    method: 2,
    vars: [Pacman.TLWALL, Pacman.BLWALL],
  },
};

Pacman.Ghost = function (game, map, colour, img) {
  var position = null,
    direction = null,
    eatable = null,
    eaten = null,
    due = null,
    sprite = null;

  function getNewCoord(dir, current) {
    var speed = isVunerable() ? 1 : isHidden() ? 4 : 2,
      xSpeed = (dir === LEFT && -speed) || (dir === RIGHT && speed) || 0,
      ySpeed = (dir === DOWN && speed) || (dir === UP && -speed) || 0;

    return {
      x: addBounded(current.x, xSpeed),
      y: addBounded(current.y, ySpeed),
    };
  }

  /* Collision detection(walls) is done when a ghost lands on an
   * exact block, make sure they dont skip over it
   */
  function addBounded(x1, x2) {
    var rem = x1 % 10,
      result = rem + x2;
    if (rem !== 0 && result > 10) {
      return x1 + (10 - rem);
    } else if (rem > 0 && result < 0) {
      return x1 - rem;
    }
    return x1 + x2;
  }

  function isVunerable() {
    return eatable !== null;
  }

  function isDangerous() {
    return eaten === null;
  }

  function isHidden() {
    return eatable === null && eaten !== null;
  }

  function getRandomDirection() {
    var moves =
      direction === LEFT || direction === RIGHT ? [UP, DOWN] : [LEFT, RIGHT];
    return moves[Math.floor(Math.random() * 2)];
  }

  function reset() {
    eaten = null;
    eatable = null;
    position = { x: 90, y: 80 };
    direction = getRandomDirection();
    due = getRandomDirection();
    if (img !== "") {
      sprite = document.createElement("img");
      sprite.src = img;
    }
  }

  function onWholeSquare(x) {
    return x % 10 === 0;
  }

  function oppositeDirection(dir) {
    return (
      (dir === LEFT && RIGHT) ||
      (dir === RIGHT && LEFT) ||
      (dir === UP && DOWN) ||
      UP
    );
  }

  function makeEatable() {
    direction = oppositeDirection(direction);
    eatable = game.getTick();
  }

  function eat() {
    eatable = null;
    eaten = game.getTick();
  }

  function pointToCoord(x) {
    return Math.round(x / 10);
  }

  function nextSquare(x, dir) {
    var rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === RIGHT || dir === DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  }

  function onGridSquare(pos) {
    return onWholeSquare(pos.y) && onWholeSquare(pos.x);
  }

  function secondsAgo(tick) {
    return (game.getTick() - tick) / Pacman.FPS;
  }

  function getColour() {
    if (eatable) {
      if (secondsAgo(eatable) > 5) {
        return game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
      } else {
        return "#0000BB";
      }
    } else if (eaten) {
      return "#222";
    }
    return colour;
  }

  function draw(ctx) {
    var s = map.blockSize,
      top = (position.y / 10) * s,
      left = (position.x / 10) * s;

    if (eatable && secondsAgo(eatable) > 8) {
      eatable = null;
    }

    if (eaten && secondsAgo(eaten) > 3) {
      eaten = null;
    }

    var tl = left + s;
    var base = top + s - 3;
    var inc = s / 10;

    var high = game.getTick() % 10 > 5 ? 3 : -3;
    var low = game.getTick() % 10 > 5 ? -3 : 3;

    var transform = {
      [LEFT]: 2,
      [RIGHT]: 1,
      [UP]: 0,
      [DOWN]: 3,
    };

    if (sprite) {
      var dy = eaten ? blockSize * 2 : 0;

      ctx.drawImage(
        sprite,
        blockSize *
          ((Math.trunc(game.getTick() / 3) % 2) + transform[direction] * 2),
        +isVunerable() * blockSize + dy,
        blockSize,
        blockSize,
        left,
        top,
        blockSize,
        blockSize
      );
    } else {
      ctx.fillStyle = getColour();
      ctx.beginPath();

      ctx.moveTo(left, base);

      ctx.quadraticCurveTo(left, top, left + s / 2, top);
      ctx.quadraticCurveTo(left + s, top, left + s, base);

      // Wavy things at the bottom
      ctx.quadraticCurveTo(tl - inc * 1, base + high, tl - inc * 2, base);
      ctx.quadraticCurveTo(tl - inc * 3, base + low, tl - inc * 4, base);
      ctx.quadraticCurveTo(tl - inc * 5, base + high, tl - inc * 6, base);
      ctx.quadraticCurveTo(tl - inc * 7, base + low, tl - inc * 8, base);
      ctx.quadraticCurveTo(tl - inc * 9, base + high, tl - inc * 10, base);

      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#FFF";
      ctx.arc(left + blockSize / 3, top + blockSize / 3, s / 6, 0, 300, false);
      ctx.arc(
        left + s - blockSize / 3,
        top + blockSize / 3,
        s / 6,
        0,
        300,
        false
      );
      ctx.closePath();
      ctx.fill();

      var f = s / 12;
      var off = {};
      off[RIGHT] = [f, 0];
      off[LEFT] = [-f, 0];
      off[UP] = [0, -f];
      off[DOWN] = [0, f];

      ctx.beginPath();
      ctx.fillStyle = "#000";
      ctx.arc(
        left + blockSize / 3 + off[direction][0],
        top + blockSize / 3 + off[direction][1],
        s / 15,
        0,
        300,
        false
      );
      ctx.arc(
        left + s - blockSize / 3 + off[direction][0],
        top + blockSize / 3 + off[direction][1],
        s / 15,
        0,
        300,
        false
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  function pane(pos) {
    if (pos.x >= 190 && direction === RIGHT) {
      return { y: pos.y, x: -10 };
    }

    if (pos.x <= -10 && direction === LEFT) {
      return { y: pos.y, x: 190 };
    }
    if (pos.y >= 220 && direction === DOWN) {
      return { y: -10, x: pos.x };
    }

    if (pos.y <= -10 && direction === UP) {
      return { y: 220, x: pos.x };
    }

    return false;
  }

  function move(ctx) {
    var oldPos = position,
      onGrid = onGridSquare(position),
      npos = null;

    if (due !== direction) {
      npos = getNewCoord(due, position);

      if (
        onGrid &&
        map.isFloorSpace({
          y: pointToCoord(nextSquare(npos.y, due)),
          x: pointToCoord(nextSquare(npos.x, due)),
        })
      ) {
        direction = due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = getNewCoord(direction, position);
    }

    if (
      onGrid &&
      map.isWallSpace({
        y: pointToCoord(nextSquare(npos.y, direction)),
        x: pointToCoord(nextSquare(npos.x, direction)),
      })
    ) {
      due = getRandomDirection();
      if (
        map.isWallSpace({
          y: pointToCoord(nextSquare(npos.y, due)),
          x: pointToCoord(nextSquare(npos.x, due)),
        }) &&
        map.isWallSpace({
          y: pointToCoord(nextSquare(npos.y, oppositeDirection(due))),
          x: pointToCoord(nextSquare(npos.x, oppositeDirection(due))),
        })
      ) {
        due = oppositeDirection(direction);
      }
      return move(ctx);
    }

    position = npos;

    var tmp = pane(position);
    if (tmp) {
      position = tmp;
    }

    due = getRandomDirection();

    return {
      new: position,
      old: oldPos,
    };
  }

  return {
    eat: eat,
    isVunerable: isVunerable,
    isDangerous: isDangerous,
    makeEatable: makeEatable,
    reset: reset,
    move: move,
    draw: draw,
  };
};

Pacman.User = function (game, map) {
  var position = null,
    direction = null,
    eaten = null,
    due = null,
    lives = null,
    score = 5,
    toeat = 210,
    keyMap = {};

  keyMap[KEY.ARROW_LEFT] = LEFT;
  keyMap[KEY.ARROW_UP] = UP;
  keyMap[KEY.ARROW_RIGHT] = RIGHT;
  keyMap[KEY.ARROW_DOWN] = DOWN;

  function addScore(nScore) {
    score += nScore;
    if (score >= 10000 && score - nScore < 10000) {
      lives += 1;
    }
  }

  function theScore() {
    return score;
  }

  function loseLife() {
    lives -= 1;
  }

  function getLives() {
    return lives;
  }

  function initUser() {
    score = 0;
    lives = 3;
    newLevel();
  }

  function newLevel() {
    resetPosition();
    eaten = 0;
    toeat = 0;
    for (let i = 0; i < Pacman.MAP.length; i++) {
      for (let j = 0; j < Pacman.MAP[i].length; j++) {
        const el = Pacman.MAP[i][j];
        if (el === Pacman.BISCUIT || el === Pacman.PILL) ++toeat;
      }
    }
  }

  function resetPosition() {
    position = { x: 90, y: 120 };
    direction = LEFT;
    due = LEFT;
  }

  function reset() {
    initUser();
    resetPosition();
  }

  function keyDown(e) {
    if (typeof keyMap[e.keyCode] !== "undefined") {
      due = keyMap[e.keyCode];
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  }

  function getNewCoord(dir, current) {
    return {
      x: current.x + ((dir === LEFT && -2) || (dir === RIGHT && 2) || 0),
      y: current.y + ((dir === DOWN && 2) || (dir === UP && -2) || 0),
    };
  }

  function onWholeSquare(x) {
    return x % 10 === 0;
  }

  function pointToCoord(x) {
    return Math.round(x / 10);
  }

  function nextSquare(x, dir) {
    var rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === RIGHT || dir === DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  }

  function next(pos, dir) {
    return {
      y: pointToCoord(nextSquare(pos.y, dir)),
      x: pointToCoord(nextSquare(pos.x, dir)),
    };
  }

  function onGridSquare(pos) {
    return onWholeSquare(pos.y) && onWholeSquare(pos.x);
  }

  function isOnSamePlane(due, dir) {
    return (
      ((due === LEFT || due === RIGHT) && (dir === LEFT || dir === RIGHT)) ||
      ((due === UP || due === DOWN) && (dir === UP || dir === DOWN))
    );
  }

  function move(ctx) {
    var npos = null,
      nextWhole = null,
      oldPosition = position,
      block = null;

    if (due !== direction) {
      npos = getNewCoord(due, position);

      if (
        isOnSamePlane(due, direction) ||
        (onGridSquare(position) && map.isFloorSpace(next(npos, due)))
      ) {
        direction = due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = getNewCoord(direction, position);
    }

    if (onGridSquare(position) && map.isWallSpace(next(npos, direction))) {
      direction = NONE;
    }

    if (direction === NONE) {
      return { new: position, old: position };
    }

    if (npos.x >= 190 && direction === RIGHT) {
      npos = { y: npos.y, x: -10 };
    }

    if (npos.x <= -10 && direction === LEFT) {
      npos = { y: npos.y, x: 190 };
    }
    if (npos.y >= 220 && direction === DOWN) {
      npos = { y: -10, x: npos.x };
    }

    if (npos.y <= -10 && direction === UP) {
      npos = { y: 220, x: npos.x };
    }

    position = npos;
    nextWhole = next(position, direction);

    block = map.block(nextWhole);

    if (
      ((isMidSquare(position.y) || isMidSquare(position.x)) &&
        block === Pacman.BISCUIT) ||
      block === Pacman.PILL
    ) {
      map.setBlock(nextWhole, Pacman.EMPTY);
      addScore(block === Pacman.BISCUIT ? 10 : 50);
      eaten += 1;

      if (eaten === toeat) {
        game.completedLevel();
      }

      if (block === Pacman.PILL) {
        game.eatenPill();
      }
    }

    return {
      new: position,
      old: oldPosition,
    };
  }

  function isMidSquare(x) {
    var rem = x % 10;
    return rem > 3 || rem < 7;
  }

  function calcAngle(dir, pos) {
    if (dir == RIGHT && pos.x % 10 < 5) {
      return { start: 0.25, end: 1.75, direction: false };
    } else if (dir === DOWN && pos.y % 10 < 5) {
      return { start: 0.75, end: 2.25, direction: false };
    } else if (dir === UP && pos.y % 10 < 5) {
      return { start: 1.25, end: 1.75, direction: true };
    } else if (dir === LEFT && pos.x % 10 < 5) {
      return { start: 0.75, end: 1.25, direction: true };
    }
    return { start: 0, end: 2, direction: false };
  }

  function drawDead(ctx, amount) {
    var size = map.blockSize,
      half = size / 2;

    if (amount >= 1) {
      return;
    }

    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.moveTo(
      (position.x / 10) * size + half,
      (position.y / 10) * size + half
    );

    ctx.arc(
      (position.x / 10) * size + half,
      (position.y / 10) * size + half,
      half,
      0,
      Math.PI * 2 * amount,
      true
    );

    ctx.fill();
  }

  function draw(ctx) {
    var s = map.blockSize,
      angle = calcAngle(direction, position);

    ctx.fillStyle = "#FFFF00";

    ctx.beginPath();

    ctx.moveTo((position.x / 10) * s + s / 2, (position.y / 10) * s + s / 2);

    ctx.arc(
      (position.x / 10) * s + s / 2,
      (position.y / 10) * s + s / 2,
      s / 2,
      Math.PI * angle.start,
      Math.PI * angle.end,
      angle.direction
    );

    ctx.fill();
  }

  function getTouches(e) {
    return e.touches;
  }

  function handleTouchStart(e) {
    const firstTouch = getTouches(e)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
    document.body.style.setProperty("overscroll-behavior-y", "contain");
  }
  function handleTouchEnd(e) {
    document.body.style.setProperty("overscroll-behavior-y", "initial");
  }

  function handleTouchMove(e) {
    if (!xDown || !yDown) {
      return;
    }
    e.preventDefault();

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        /* left swipe */
        due = LEFT;
      } else {
        /* right swipe */
        due = RIGHT;
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        due = UP;
      } else {
        /* down swipe */
        due = DOWN;
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }

  initUser();

  return {
    draw: draw,
    drawDead: drawDead,
    loseLife: loseLife,
    getLives: getLives,
    score: score,
    addScore: addScore,
    theScore: theScore,
    keyDown: keyDown,
    move: move,
    newLevel: newLevel,
    reset: reset,
    resetPosition: resetPosition,
    handleTouchMove,
    handleTouchStart,
    handleTouchEnd,
  };
};

Pacman.Map = function (size) {
  var height = null,
    width = null,
    blockSize = size,
    pillSize = 0,
    map = null;

  function withinBounds(y, x) {
    return y >= 0 && y < height && x >= 0 && x < width;
  }

  function isWall(pos) {
    return (
      withinBounds(pos.y, pos.x) &&
      (map[pos.y][pos.x] === Pacman.WALL || map[pos.y][pos.x] >= Pacman.HWALL)
    );
  }

  function isFloorSpace(pos) {
    if (!withinBounds(pos.y, pos.x)) {
      return false;
    }
    var peice = map[pos.y][pos.x];
    return (
      peice === Pacman.EMPTY ||
      peice === Pacman.BISCUIT ||
      peice === Pacman.PILL
    );
  }
  function drawWallBlock(ctx, y, x, block) {
    if (!wallInstructions[map[y][x]]) return;
    const { method, vars } = wallInstructions[block];
    if (method === 0) {
      const [x0, y0, x1, y1] = vars;
      ctx.moveTo((x + x0) * blockSize, (y + y0) * blockSize);
      ctx.lineTo((x + x1) * blockSize, (y + y1) * blockSize);
    } else if (method === 1) {
      const [x0, y0, x1, y1, x2, y2] = vars;
      ctx.moveTo((x + x0) * blockSize, (y + y0) * blockSize);
      ctx.quadraticCurveTo(
        (x + x1) * blockSize,
        (y + y1) * blockSize,
        (x + x2) * blockSize,
        (y + y2) * blockSize
      );
    } else if (method === 2) {
      vars.map((newBlock) => {
        drawWallBlock(ctx, y, x, newBlock);
      });
    }
  }
  function drawWall(ctx) {
    var i, j;

    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.beginPath();

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        drawWallBlock(ctx, i, j, map[i][j]);
      }
    }
    ctx.stroke();
  }

  function reset() {
    map = Pacman.MAP.clone();
    height = map.length;
    width = map[0].length;
  }

  function block(pos) {
    return map[Math.abs(pos.y % map.length)][pos.x];
  }

  function setBlock(pos, type) {
    map[Math.abs(pos.y % map.length)][pos.x] = type;
  }

  function drawPills(ctx) {
    var img = new Image();
    img.src = "./assets/thumb_dollarsgrid.png";
    const multi = 3;
    const curFrame = Math.floor(++pillSize / multi); 
    if (curFrame >= 23) {
      pillSize = 0;
    }
    const offsetX = curFrame % 8;
    const offsetY = Math.floor(curFrame / 8);
    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        if (map[i][j] === Pacman.PILL) {
          ctx.beginPath();
          // draw black box
          ctx.fillStyle = "#000000";
          ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);

          // load image from data url and draw it
          ctx.drawImage(
            img,
            32 * offsetX,
            32 * offsetY,
            32,
            32,
            j * blockSize,
            i * blockSize,
            blockSize,
            blockSize
          );
          ctx.closePath();
        }
      }
    }
  }

  function draw(ctx) {
    var i,
      j,
      size = blockSize;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width * size, height * size);

    drawWall(ctx);

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        drawBlock(i, j, ctx);
      }
    }
  }

  function drawBlock(y, x, ctx) {
    var layout = map[Math.abs(y % map.length)][x];

    if (layout === Pacman.PILL) {
      return;
    }

    ctx.beginPath();

    if (
      layout === Pacman.EMPTY ||
      layout === Pacman.BLOCK ||
      layout === Pacman.BISCUIT
    ) {
      ctx.fillStyle = "#000";
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);

      if (layout === Pacman.BISCUIT) {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(
          x * blockSize + blockSize / 2.5,
          y * blockSize + blockSize / 2.5,
          blockSize / 6,
          blockSize / 6
        );
      }
    }
    ctx.closePath();
  }

  reset();

  return {
    draw: draw,
    drawBlock: drawBlock,
    drawPills: drawPills,
    block: block,
    setBlock: setBlock,
    reset: reset,
    isWallSpace: isWall,
    isFloorSpace: isFloorSpace,
    height: height,
    width: width,
    blockSize: blockSize,
  };
};

Pacman.Audio = function (game) {
  var files = [],
    endEvents = [],
    bgPlaying = null,
    progressEvents = [],
    playing = [];

  function isBG(name) {
    return !isNaN(name);
  }

  function load(name, path, cb) {
    var f = (files[name] = document.createElement("audio"));

    progressEvents[name] = function (event) {
      progress(event, name, cb);
    };

    f.addEventListener("canplaythrough", progressEvents[name], true);
    f.setAttribute("preload", "true");
    f.setAttribute("autobuffer", "true");
    f.setAttribute("src", path);
    f.load();
    if (isBG(name)) {
      f.setAttribute("loop", "true");
    }
    f.pause();
  }

  function progress(event, name, callback) {
    if (event.loaded === event.total && typeof callback === "function") {
      callback();
      files[name].removeEventListener(
        "canplaythrough",
        progressEvents[name],
        true
      );
    }
  }

  function disableSound() {
    for (var i = 0; i < playing.length; i++) {
      files[playing[i]].pause();
      files[playing[i]].currentTime = 0;
    }
    pauseBG();
    playing = [];
  }

  function ended(name) {
    var i,
      tmp = [],
      found = false;

    files[name].removeEventListener("ended", endEvents[name], true);

    for (i = 0; i < playing.length; i++) {
      if (!found && playing[i]) {
        found = true;
      } else {
        tmp.push(playing[i]);
      }
    }
    playing = tmp;
  }

  function play(name) {
    if (!game.soundDisabled()) {
      endEvents[name] = function () {
        ended(name);
      };
      playing.push(name);
      files[name].addEventListener("ended", endEvents[name], true);
      files[name].play();
    }
  }

  function playBG(name) {
    bgPlaying = files[name];
    if (!game.soundDisabled()) {
      bgPlaying.play().catch((err) => {
        console.log("Failed to AutoPlay BG audio");
      });
    }
  }

  function pauseBG() {
    if (bgPlaying) {
      bgPlaying.pause();
      bgPlaying.currentTime = 0;
    }
  }

  function pause() {
    for (var i = 0; i < playing.length; i++) {
      files[playing[i]].pause();
    }
  }

  function resume() {
    for (var i = 0; i < playing.length; i++) {
      files[playing[i]].play();
    }
  }

  return {
    disableSound: disableSound,
    load: load,
    play: play,
    pause: pause,
    resume: resume,
    playBG: playBG,
    pauseBG: pauseBG,
  };
};

var PACMAN = (function () {
  var state = WAITING,
    audio = null,
    levelData = null,
    ghosts = [],
    box = null,
    eatenCount = 0,
    level = 0,
    tick = 0,
    ghostPos,
    userPos,
    stateChanged = true,
    timerStart = null,
    lastTime = 0,
    ctx = null,
    timer = null,
    map = null,
    user = null,
    died = false,
    stored = null,
    offsetX = null,
    offsetY = null,
    canvasWrapper = null;

  function getTick() {
    return tick;
  }

  function drawScore(text, position) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px BDCartoonShoutRegular";
    ctx.fillText(
      text,
      (position["new"]["x"] / 10) * map.blockSize,
      ((position["new"]["y"] + 5) / 10) * map.blockSize
    );
  }

  function dialog(text) {
    ctx.fillStyle = "#FFFF00";
    ctx.font = `${0.8 * blockSize}px BDCartoonShoutRegular`;
    var width = ctx.measureText(text).width,
      x = (map.width * map.blockSize - width) / 2;
    ctx.fillText(text, x, blockSize * 13);
  }

  function soundDisabled() {
    return localStorage["soundDisabled"] === "true";
  }

  function startLevel() {
    audio.play("start");
    timerStart = tick;
    setState(COUNTDOWN);
    initGhosts(level);
  }

  function startNewGame() {
    console.log("From Menu To Level One 'Counter'");

    Pacman.MAP = levelData[1].map;
    setState(WAITING);
    level = 1;
    user.reset();
    map.reset();
    map.draw(ctx);
    startLevel();
  }

  function keyDown(e) {
    if (e.keyCode === KEY.N) {
      if (state === WAITING) {
        startNewGame();
      } else if (state === BOX) {
        box.style.setProperty("display", "none");
        setState(PLAYING);
      }
    } else if (e.keyCode === KEY.S) {
      audio.disableSound();
      localStorage["soundDisabled"] = !soundDisabled();
    } else if (e.keyCode === KEY.P && state === PAUSE) {
      audio.resume();
      map.draw(ctx);
      setState(stored);
    } else if (e.keyCode === KEY.P) {
      stored = state;
      setState(PAUSE);
      audio.pause();
      map.draw(ctx);
      dialog("Paused");
    } else if (state !== PAUSE) {
      return user.keyDown(e);
    }
    return true;
  }

  function loseLife() {
    setState(WAITING);
    user.loseLife();
    if (user.getLives() > 0) {
      startLevel();
      died = true;
      console.log(`Restart Level ${level} 'Counter'`);
    } else {
      console.log("Lost Game Go to menu");
      Pacman.MAP = levelData[0].map;
      map.reset();
    }
  }

  function setState(nState) {
    state = nState;
    stateChanged = true;
  }

  function collided(user, ghost) {
    return (
      Math.sqrt(Math.pow(ghost.x - user.x, 2) + Math.pow(ghost.y - user.y, 2)) <
      10
    );
  }

  function drawFooter() {
    var topLeft = map.height * map.blockSize,
      textBase = topLeft + blockSize - 1;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, topLeft, map.width * map.blockSize, footerHeight);

    ctx.fillStyle = "#FFFF00";

    for (var i = 0, len = user.getLives(); i < len; i++) {
      ctx.fillStyle = "#FFFF00";
      ctx.beginPath();
      ctx.moveTo(
        1.4 * blockSize * i + map.blockSize * 8.83,
        topLeft + 1 + map.blockSize / 2
      );

      ctx.arc(
        1.4 * blockSize * i + map.blockSize * 8.83,
        topLeft + 1 + map.blockSize / 2,
        map.blockSize / 2,
        Math.PI * 0.25,
        Math.PI * 1.75,
        false
      );
      ctx.fill();
    }

    ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000";
    ctx.font = `bold ${0.9 * blockSize}px sans-serif`;
    //ctx.fillText("♪", 10, textBase);
    ctx.fillText("s", 10, textBase);

    ctx.fillStyle = "#FFFF00";
    ctx.font = `${0.8 * blockSize}px BDCartoonShoutRegular`;
    ctx.fillText("Score: " + user.theScore(), blockSize * 1.67, textBase);
    ctx.fillText("Level: " + level, 14.5 * blockSize, textBase);
  }

  function redrawBlock(pos) {
    map.drawBlock(Math.floor(pos.y / 10), Math.floor(pos.x / 10), ctx);
    map.drawBlock(Math.ceil(pos.y / 10), Math.ceil(pos.x / 10), ctx);
  }

  function mainDraw() {
    var diff, u, i, len, nScore;

    ghostPos = [];

    for (i = 0, len = ghosts.length; i < len; i += 1) {
      ghostPos.push(ghosts[i].move(ctx));
    }
    u = user.move(ctx);

    for (i = 0, len = ghosts.length; i < len; i += 1) {
      if (!ghostPos[i]) {
        return;
      }
      redrawBlock(ghostPos[i].old);
    }
    redrawBlock(u.old);

    for (i = 0, len = ghosts.length; i < len; i += 1) {
      ghosts[i].draw(ctx);
    }
    user.draw(ctx);

    userPos = u["new"];

    for (i = 0, len = ghosts.length; i < len; i += 1) {
      if (collided(userPos, ghostPos[i]["new"])) {
        if (ghosts[i].isVunerable()) {
          audio.play("eatghost");
          ghosts[i].eat();
          eatenCount += 1;
          nScore = eatenCount * 50;
          drawScore(nScore, ghostPos[i]);
          user.addScore(nScore);
          setState(EATEN_PAUSE);
          timerStart = tick;
        } else if (ghosts[i].isDangerous()) {
          audio.play("die");
          setState(DYING);
          console.log(
            `Died ${
              user.getLives() - 1 > 0
                ? "Restarting Level"
                : "Going to Main Menu"
            }`
          );
          audio.pauseBG();
          timerStart = tick;
        }
      }
    }
  }

  function mainLoop() {
    var diff;

    if (state !== PAUSE) {
      ++tick;
    }

    map.drawPills(ctx);

    if (state === PLAYING) {
      mainDraw();
    } else if (state === WAITING && stateChanged) {
      stateChanged = false;
      map.draw(ctx);
      dialog("Press N to start a New game");
      console.log("Initail Render Of main menu");
    } else if (state === BOX && stateChanged) {
      stateChanged = false;
      map.draw(ctx);
      handleTextBox();
    } else if (state === EATEN_PAUSE && tick - timerStart > Pacman.FPS / 3) {
      map.draw(ctx);
      setState(PLAYING);
    } else if (state === DYING) {
      if (tick - timerStart > Pacman.FPS * 2) {
        loseLife();
      } else {
        redrawBlock(userPos);
        for (i = 0, len = ghosts.length; i < len; i += 1) {
          redrawBlock(ghostPos[i].old);
          ghostPos.push(ghosts[i].draw(ctx));
        }
        user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
      }
    } else if (state === COUNTDOWN) {
      diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);

      if (diff === 0) {
        if (levelData[level].box && !died) {
          setState(BOX);
        } else {
          died = false;
          setState(PLAYING);
        }
        console.log(`Start level ${level}`);
        if (Object.keys(levelData).length > level) {
          audio.playBG(level);
        }
        map.draw(ctx);
      } else {
        if (diff !== lastTime) {
          lastTime = diff;
          map.draw(ctx);
        }
        dialog("Starting in: " + diff);
      }
    }

    drawFooter();
  }

  function eatenPill() {
    audio.play("eatpill");
    timerStart = tick;
    eatenCount = 0;
    for (i = 0; i < ghosts.length; i += 1) {
      ghosts[i].makeEatable(ctx);
    }
  }

  function completedLevel() {
    setState(WAITING);
    console.log(`Beat Level ${level} Starting Level ${level + 1} 'Counter'`);
    audio.pauseBG();
    level += 1;
    if (Object.keys(levelData).length > level) {
      Pacman.MAP = levelData[level].map;
    }
    map.reset();
    user.newLevel();
    startLevel();
  }

  function keyPress(e) {
    if (state !== WAITING && state !== PAUSE) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function init(wrapper, root) {
    fetch("./levels.json")
      .then((res) => res.json())
      .then((data) => {
        var i,
          len,
          ghost,
          canvas = document.createElement("canvas");

        levelData = data;

        canvasWrapper = wrapper;
        var canvasWidth = blockSize * mapWidth;

        canvas.setAttribute("width", canvasWidth + "px");
        canvas.setAttribute(
          "height",
          blockSize * mapHeight + footerHeight + "px"
        );

        if (innerWidth < canvasWidth) {
          document.body.style.setProperty("width", `${canvasWidth}px`);
        }

        wrapper.style.setProperty("width", blockSize * mapWidth + "px");
        wrapper.style.setProperty(
          "height",
          blockSize * mapHeight + footerHeight + "px"
        );
        offsetX = wrapper.offsetLeft - (mapWidth / 2) * blockSize;
        offsetY = wrapper.offsetTop;

        box = document.createElement("div");
        box.classList.add("text-box");

        ///////
        let para = document.createElement("p");
        para.classList.add("para");
        para.innerText = "0";

        let img = document.createElement("img");
        img.classList.add("box-img");
        img.src = "";
        ///////

        box.appendChild(img);
        box.appendChild(para);
        wrapper.appendChild(box);

        wrapper.appendChild(canvas);
        if (box.clientWidth > innerWidth) {
          var canvasPadding = 100;
          box.style.setProperty(
            "transform",
            `scale(${
              (innerWidth - canvasPadding) / box.clientWidth
            }) translate(-${
              (box.clientWidth - (innerWidth - canvasPadding)) / 2
            }px, calc(-50% - ${footerHeight}px))`
          );
          box.style.setProperty("left", `0`);
        }
        box.style.setProperty("display", "none");

        ctx = canvas.getContext("2d");
        Pacman.MAP = data[0].map;

        audio = new Pacman.Audio({ soundDisabled: soundDisabled });
        map = new Pacman.Map(blockSize);

        user = new Pacman.User(
          {
            completedLevel: completedLevel,
            eatenPill: eatenPill,
          },
          map
        );

        map.draw(ctx);
        dialog("Loading ...");

        var extension = Modernizr.audio.ogg ? ".ogg" : ".mp3";

        var audio_files = [
          ["start", root + "assets/audio/opening_song" + extension],
          ["die", root + "assets/audio/die" + extension],
          ["eatghost", root + "assets/audio/eatghost" + extension],
          ["eatpill", root + "assets/audio/eatpill" + extension],
          ["eating", root + "assets/audio/eating.short" + extension],
          ["eating2", root + "assets/audio/eating.short" + extension],
        ];

        for (let i = 0; i < Object.keys(data).length; i++) {
          audio_files.push([`${i}`, root + data[i]["BG-Music"] + extension]);
        }
        load(audio_files, function () {
          loaded();
        });
      });
  }

  function load(arr, callback) {
    if (arr.length === 0) {
      callback();
    } else {
      var x = arr.pop();
      audio.load(x[0], x[1], function () {
        load(arr, callback);
      });
    }
  }

  function loaded() {
    dialog("Press N to Start");

    document.addEventListener("keydown", keyDown, true);
    document.addEventListener("keypress", keyPress, true);
    canvasWrapper.addEventListener("click", handlePress);

    canvasWrapper.addEventListener("touchstart", user.handleTouchStart, false);
    canvasWrapper.addEventListener("touchmove", user.handleTouchMove, false);
    canvasWrapper.addEventListener("touchend", user.handleTouchEnd, false);

    timer = window.setInterval(mainLoop, 1000 / Pacman.FPS);
  }

  function initGhosts(level) {
    ghosts = [];
    for (let i = 0; i < levelData[level].ghosts.length; i++) {
      const el = levelData[level].ghosts[i];

      ghost = new Pacman.Ghost({ getTick: getTick }, map, "#FF0000", el.img);
      ghost.reset();
      ghosts.push(ghost);
    }
  }

  function handleTextBox() {
    box.children[1].textContent =
      levelData[level].box.msg + "\n\n\t\t Press N to start the game";
    box.children[0].src = levelData[level].box.img;
    box.style.removeProperty("display");
  }

  function handlePress(e) {
    if (
      e.x - offsetX < blockSize &&
      e.y - offsetY - mapHeight * blockSize + window.scrollY > 0
    ) {
      audio.disableSound();
      localStorage["soundDisabled"] = !soundDisabled();
      return;
    }

    if (state === WAITING) {
      startNewGame();
    } else if (state === BOX) {
      box.style.setProperty("display", "none");
      setState(PLAYING);
    } else if (state === PAUSE) {
      audio.resume();
      map.draw(ctx);
      setState(stored);
    } else if (state === PLAYING) {
      stored = state;
      setState(PAUSE);
      audio.pause();
      map.draw(ctx);
      dialog("Paused");
    }
  }

  return {
    init: init,
  };
})();

/* Human readable keyCode index */
var KEY = {
  BACKSPACE: 8,
  TAB: 9,
  NUM_PAD_CLEAR: 12,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACEBAR: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  PRINT_SCREEN: 44,
  INSERT: 45,
  DELETE: 46,
  SEMICOLON: 59,
  WINDOWS_LEFT: 91,
  WINDOWS_RIGHT: 92,
  SELECT: 93,
  NUM_PAD_ASTERISK: 106,
  NUM_PAD_PLUS_SIGN: 107,
  "NUM_PAD_HYPHEN-MINUS": 109,
  NUM_PAD_FULL_STOP: 110,
  NUM_PAD_SOLIDUS: 111,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  SEMICOLON: 186,
  EQUALS_SIGN: 187,
  COMMA: 188,
  "HYPHEN-MINUS": 189,
  FULL_STOP: 190,
  SOLIDUS: 191,
  GRAVE_ACCENT: 192,
  LEFT_SQUARE_BRACKET: 219,
  REVERSE_SOLIDUS: 220,
  RIGHT_SQUARE_BRACKET: 221,
  APOSTROPHE: 222,
};

(function () {
  /* 0 - 9 */
  for (var i = 48; i <= 57; i++) {
    KEY["" + (i - 48)] = i;
  }
  /* A - Z */
  for (i = 65; i <= 90; i++) {
    KEY["" + String.fromCharCode(i)] = i;
  }
  /* NUM_PAD_0 - NUM_PAD_9 */
  for (i = 96; i <= 105; i++) {
    KEY["NUM_PAD_" + (i - 96)] = i;
  }
  /* F1 - F12 */
  for (i = 112; i <= 123; i++) {
    KEY["F" + (i - 112 + 1)] = i;
  }
})();

Pacman.MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
  [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

Object.prototype.clone = function () {
  var i,
    newObj = this instanceof Array ? [] : {};
  for (i in this) {
    if (i === "clone") {
      continue;
    }
    if (this[i] && typeof this[i] === "object") {
      newObj[i] = this[i].clone();
    } else {
      newObj[i] = this[i];
    }
  }
  return newObj;
};
