Pacman = {
  WALL: 0,
  BISCUIT: 1,
  EMPTY: 2,
  BLOCK: 3,
  PILL: 4,
  HWALL: 5,
  VWALL: 6,
  TLWALL: 7,
  TRWALL: 8,
  BLWALL: 9,
  BRWALL: 10,
  UCAP: 11,
  RCAP: 12,
  DCAP: 13,
  LCAP: 14,
  UJUNC: 15,
  RJUNC: 16,
  DJUNC: 17,
  LJUNC: 18,
};

blockSize = 20;
const blockMap = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [8, 9],
  [10, 11],
  [12, 13],
  [14, 15],
  [16, 17],
  [18, 0],
];
const RENDERER = {
  components: {
    levelsList: document.getElementById("levels-list"),
    levelEditor: document.getElementById("level-editor-controls"),
    levelEditorCanvas: document.getElementById("pacman-canvas"),
    blockEditorCanvas: document.getElementById("block-canvas"),
  },
  drawWall(ctx, map) {
    var i, j, p, line;

    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    const width = map[0].length;
    const height = map.length;

    ctx.beginPath();

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        if (map[i][j] === Pacman.HWALL) {
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.lineTo((j + 1) * blockSize, (i + 0.5) * blockSize);
        }
        if (map[i][j] === Pacman.VWALL) {
          ctx.moveTo((j + 0.5) * blockSize, i * blockSize);
          ctx.lineTo((j + 0.5) * blockSize, (i + 1) * blockSize);
        }
        if (map[i][j] === Pacman.TLWALL) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
        }
        if (map[i][j] === Pacman.TRWALL) {
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
        }
        if (map[i][j] === Pacman.BLWALL) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
        }
        if (map[i][j] === Pacman.BRWALL) {
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
        }
        if (map[i][j] === Pacman.DCAP) {
          ctx.moveTo((j + 0.5) * blockSize, i * blockSize);
          ctx.lineTo((j + 0.5) * blockSize, (i + 0.5) * blockSize);
        }
        if (map[i][j] === Pacman.UCAP) {
          ctx.moveTo((j + 0.5) * blockSize, (i + 1) * blockSize);
          ctx.lineTo((j + 0.5) * blockSize, (i + 0.5) * blockSize);
        }
        if (map[i][j] === Pacman.LCAP) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.lineTo((j + 0.5) * blockSize, (i + 0.5) * blockSize);
        }
        if (map[i][j] === Pacman.RCAP) {
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.lineTo((j + 0.5) * blockSize, (i + 0.5) * blockSize);
        }
        if (map[i][j] === Pacman.RJUNC) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
        }
        if (map[i][j] === Pacman.LJUNC) {
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
        }
        if (map[i][j] === Pacman.UJUNC) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            i * blockSize
          );
        }
        if (map[i][j] === Pacman.DJUNC) {
          ctx.moveTo((j + 1) * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
          ctx.moveTo(j * blockSize, (i + 0.5) * blockSize);
          ctx.quadraticCurveTo(
            (j + 0.5) * blockSize,
            (i + 0.5) * blockSize,
            (j + 0.5) * blockSize,
            (i + 1) * blockSize
          );
        }
      }
    }
    ctx.stroke();
  },
  drawPills(ctx, map) {
    let pillSize = 0.2;
    if (++pillSize > 30) {
      pillSize = 0;
    }
    const width = map[0].length;
    const height = map.length;

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        if (map[i][j] === Pacman.PILL) {
          ctx.beginPath();

          ctx.fillStyle = "#000";
          ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);

          ctx.fillStyle = "#FFF";
          ctx.arc(
            j * blockSize + blockSize / 2,
            i * blockSize + blockSize / 2,
            Math.abs(5 - pillSize / 3),
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  },
  drawBlock(y, x, ctx, map) {
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
  },
  drawMap(ctx, map) {
    var i,
      j,
      size = blockSize;
    const width = map[0].length;
    const height = map.length;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width * size, height * size);

    this.drawWall(ctx, map);
    this.drawPills(ctx, map);

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        this.drawBlock(i, j, ctx, map);
      }
    }
  },
  renderCurBlock(curBlock) {
    const ctx = this.components.blockEditorCanvas.getContext("2d");
    this.drawMap(ctx, blockMap);
    // draw box around current block
    ctx.beginPath();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      (curBlock % 2) * blockSize,
      Math.floor(curBlock / 2) * blockSize,
      blockSize,
      blockSize
    );
    ctx.closePath();
  },
  renderLevelControls(levelState, curLevel, curBlock) {
    if (curLevel === -1) {
      this.components.levelEditor.style.setProperty("display", "none");
      console.log("hide level editor", this.components.levelEditor);
      return;
    } else {
      this.components.levelEditor.style.display = "block";
    }
    this.drawMap(
      this.components.levelEditorCanvas.getContext("2d"),
      levelState[curLevel].map
    );
    this.renderCurBlock(curBlock);
  },
  renderLevels(levelState, curLevel) {
    const levelElements = levelState.map((_level, index) => {
      const levelElement = document.createElement("li");
      levelElement.classList.add("level");
      levelElement.dataset.level = index;
      if (index === curLevel) {
        levelElement.classList.add("active");
      }
      levelElement.innerHTML = `
      <span class="level__number">${index + 1}</span>
      <a class="level__delete">X</a>
      `;
      return levelElement;
    });
    this.components.levelsList.innerHTML = "";
    this.components.levelsList.append(...levelElements);
  },
  render(levelState, curLevel, curBlock) {
    this.renderLevels(levelState, curLevel);
    this.renderLevelControls(levelState, curLevel, curBlock);
  },
};

const APP = {
  levelState: [],
  curLevel: -1,
  curBlock: 6,
  components: {
    loadButton: document.getElementById("btn-load"),
    saveButton: document.getElementById("btn-save"),
    clearButton: document.getElementById("btn-clear"),
    levelCreator: document.getElementById("new-level"),
    levelsList: document.getElementById("levels-list"),
    levelEditorCanvas: document.getElementById("pacman-canvas"),
    blockEditorCanvas: document.getElementById("block-canvas"),
  },
  setLevelState(levelState) {
    console.log("setLevelState", levelState);
    this.levelState = levelState;
    RENDERER.render(this.levelState, this.curLevel, this.curBlock);
    this.registerLevelEventListeners();
  },
  setCurLevel(curLevel) {
    console.log("setCurLevel", curLevel);
    if (this.curLevel !== -1)
      this.components.levelsList.children[this.curLevel].classList.remove(
        "active"
      );
    this.curLevel = curLevel;
    RENDERER.renderLevelControls(this.levelState, this.curLevel, this.curBlock);
  },
  registerLevelEventListeners() {
    const list = this.components.levelsList.children;
    for (let i = 0; i < list.length; i++) {
      const levelElement = list[i];

      levelElement.addEventListener("click", (event) => {
        const level = event.target.closest(".level");
        const levelIndex = level.dataset.level;
        this.setCurLevel(+levelIndex);
        levelElement.classList.add("active");
      });

      const deleteButton = levelElement.querySelector(".level__delete");
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const levelIndex = +event.target.closest(".level").dataset.level;
        if (levelIndex === this.curLevel) {
          this.setCurLevel(-1);
        }
        this.levelState.splice(levelIndex, 1);
        this.setLevelState(this.levelState);
      });
    }
  },
  setCurBlock(curBlock) {
    this.curBlock = curBlock;
    RENDERER.renderCurBlock(this.curBlock);
  },
  registerEventListeners() {
    this.components.loadButton.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          // Make sure to parse correctly
          const levelState = JSON.parse(reader.result);
          this.setLevelState(levelState);
          this.setCurLevel(0);
        });
        reader.readAsText(file);
        fileInput.remove();
      });
      fileInput.addEventListener("blur", () => {
        fileInput.remove();
      });
      fileInput.click();
    });
    this.components.saveButton.addEventListener("click", () => {
      const levelState = this.levelState;
      const levelStateString = JSON.stringify(levelState);
      const blob = new Blob([levelStateString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "level.json";
      link.click();
      link.remove();
    });
    this.components.clearButton.addEventListener("click", () => {
      this.setLevelState([]);
    });
    this.components.levelCreator.addEventListener("click", (event) => {
      this.setLevelState([
        ...this.levelState,
        {
          map: new Array(22).fill(0).map(() => new Array(19).fill(0)),
          ghosts: [],
          BG_Music: "",
        },
      ]);
    });
    this.components.levelEditorCanvas.addEventListener("mousemove", (event) => {
      if (this.curLevel === -1) return;
      const canvas = this.components.levelEditorCanvas;
      const x = Math.floor(event.offsetX / blockSize);
      const y = Math.floor(event.offsetY / blockSize);
      const map = this.levelState[this.curLevel].map;
      RENDERER.drawMap(canvas.getContext("2d"), map);

      if (event.buttons === 1) {
        map[y][x] = this.curBlock;
      }

      canvas.getContext("2d").strokeStyle = "red";
      canvas
        .getContext("2d")
        .strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    });
    this.components.levelEditorCanvas.addEventListener(
      "mouseleave",
      (event) => {
        if (this.curLevel === -1) return;
        const canvas = this.components.levelEditorCanvas;
        const map = this.levelState[this.curLevel].map;
        RENDERER.drawMap(canvas.getContext("2d"), map);
      }
    );
    this.components.levelEditorCanvas.addEventListener("click", (event) => {
      if (this.curLevel === -1) return;
      const canvas = this.components.levelEditorCanvas;
      const x = Math.floor(event.offsetX / blockSize);
      const y = Math.floor(event.offsetY / blockSize);
      const map = this.levelState[this.curLevel].map;
      console.log(map[y][x], x, y);
      this.levelState[this.curLevel].map[y][x] = this.curBlock;
      RENDERER.drawMap(canvas.getContext("2d"), map);
    });
    this.components.blockEditorCanvas.addEventListener("mousemove", (event) => {
      if (this.curLevel === -1) return;
      const canvas = this.components.blockEditorCanvas;
      const x = Math.floor(event.offsetX / blockSize);
      const y = Math.floor(event.offsetY / blockSize);
      const map = this.levelState[this.curLevel].map;
      RENDERER.renderCurBlock(this.curBlock);

      canvas.getContext("2d").strokeStyle = "red";
      canvas
        .getContext("2d")
        .strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    });
    this.components.blockEditorCanvas.addEventListener(
      "mouseleave",
      (event) => {
        if (this.curLevel === -1) return;
        RENDERER.renderCurBlock(this.curBlock);
      }
    );
    this.components.blockEditorCanvas.addEventListener("click", (event) => {
      if (this.curLevel === -1) return;
      const canvas = this.components.blockEditorCanvas;
      const x = Math.floor(event.offsetX / blockSize);
      const y = Math.floor(event.offsetY / blockSize);
      const map = blockMap;
      this.setCurBlock(map[y][x]);
    });
  },
  init() {
    this.registerEventListeners();
    RENDERER.render(this.levelState, this.curLevel, this.curBlock);
    RENDERER.renderLevelControls(this.levelState, this.curLevel, this.curBlock);
  },
};

APP.init();
