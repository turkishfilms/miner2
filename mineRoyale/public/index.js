// /**
/* 
this is the stripped down client for mineroyale
basically just a drawer for the servers data
has grid only for flag placement logic which needs checkedcells

server will generate grid, send to any new clients

each valid client click will be sent to server for processing
the new checkedCells will be sent back

TODO: add watch others maybe like a grid watch
// on loss client waits until reset
// on win new game starts
fix reset
on every client loses new game starts
rooms/session id
    each room different Grid config
home page
disconnects handled
cellsizing... w and h are separate booooohooooo also dom adjust for banner 
colored banner per room
other players in room shown on banner
flag counter on banner
different colored flags




 */
const socket = io();

let CELL_SIZE = 100,
  NUM_MINES = 10;

let w,
  h,
  rows,
  columns,
  grid = [],
  checkedCells = [],
  flags = [],
  flagCounter = 0;

function setup() {
  w = windowWidth;
  h = windowHeight;
  createCanvas(w, h);
  background(0);
  fill(125);

  console.log(socket);

  socket.on("newGame", (data) => {
    console.log("NG: hello, im ", data.socketId);
    ({ numMines: NUM_MINES, rows, columns, grid } = data);
    CELL_SIZE = w / rows;
    drawGrid(grid);
    textSize(CELL_SIZE);
    checkedCells = JSON.parse(JSON.stringify(grid)); // find better sol
    checkedCells.forEach((arr) => arr.fill(-1));
    flags = JSON.parse(JSON.stringify(grid));
    flags.forEach((arr) => arr.fill(0));
  });

  socket.on("reset", (data) => {
    // background(0)
    ({ numMines: NUM_MINES, rows, columns, grid } = data);
    CELL_SIZE = h / rows;
    fill(125);
    drawGrid(grid);
    textSize(CELL_SIZE);
    checkedCells = JSON.parse(JSON.stringify(grid)); // find better sol
    checkedCells.forEach((arr) => arr.fill(-1));
    flags = JSON.parse(JSON.stringify(grid));
    flags.forEach((arr) => arr.fill(0));
  });

  socket.on("updateClientBoard", (data) => {
    checkedCells = data.updated;
    showChecked();
  });
}

const drawGrid = (grid) => {
  for (x in grid) {
    for (let y = 0; y < grid[x].length; y++)
      rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
};

const showChecked = () => {
  //display cells that have been checked
  console.log("SC:", checkedCells);
  for (let j = 0; j < columns; j++) {
    for (let i = 0; i < rows; i++) {
      if (checkedCells[i][j] == -1) continue; //ignore
      fill(200);
      rect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      const col = colorChoice(grid[i][j]);
      fill(col[0], col[1], col[2]);
      text(
        grid[i][j],
        i * CELL_SIZE + CELL_SIZE / 4,
        (j + 1) * CELL_SIZE - CELL_SIZE / 8
      );
    }
  }
};

const colorChoice = (number) => {
  //from grid value return color of text
  switch (number) {
    case -1:
      return [255, 255, 255];
    case 0:
      return [0, 0, 0];
    case 1:
      return [0, 0, 255];
    case 2:
      return [0, 255, 0];
    case 3:
      return [255, 0, 0];
    case 4:
      return [125, 0, 125];
    case 5:
      return [150, 90, 0];
    case 6:
      return [0, 80, 0];
    case 7:
      return [255, 100, 100];
    case 8:
      return [30, 30, 90];
  }
};

function keyPressed() {
  //deal with flags
  if (key == " ") {
    const X = floor(mouseX / CELL_SIZE),
      Y = floor(mouseY / CELL_SIZE);

    if (checkedCells[X][Y] == 0) return; //if cell has alreayd been checked

    if (flags[X][Y]) {
      //if already a flag
      fill(125);
      flags[X][Y] = 0;
      flagCounter--;
    } else {
      fill(255, 0, 0);
      flags[X][Y] = 1;
      flagCounter++;
    }
    rect(X * CELL_SIZE, Y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  if (key == "w") {
    // socket.emit('clientClick', null)
  }
}

function mouseClicked() {
  const X = floor(mouseX / CELL_SIZE),
    Y = floor(mouseY / CELL_SIZE),
    CELL_VAL = grid[X][Y];
  if (flags[X][Y] == 1) return; //cant check flagged squares
  socket.emit("clientClick", {
    X: X,
    Y: Y,
    flags: flags,
  });
}

function draw() {}
