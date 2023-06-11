// RETHINK LOVE, book

/*
this is a competitive minesweeper game using socket io for server/client and p5 for rendering











 TODO:
    //cant check flagged cells
    //undoflag
    //fix accurate bomb quantity
    // cant flag checked cells 
    // checked cell cosmetic change lighter
    // victory something
    // victory = discover all non bomb squares**
    // flag counter
    // flags stop 0 search propagation
    // timer

    variations
    multi dimension
    comp/collab
    trivia/math
    simul/portal
    sudoku to place flag/check square, save when bomb hit
    money
    skins/themes(shrek,minecraft,meme,crypto,classic,funny hard math, numbers are colors or shapes)
    ads for free squares
    minesweeper logic guides
 

    SERVER: 
    start new session
    join other session 
    new game on victory or everyones loss
 TODONE:
    */

console.log("index3 sarted");

let CELL_SIZE = 50,
  NUM_MINES = 100;

let w,
  h,
  rows,
  columns,
  grid = [],
  checkedCells = [],
  flags = [],
  minesOnly = [],
  flagCounter = 0,
  timer = 0;

function setup() {
  // setInterval(() => timer++, 1000)

  w = windowWidth;
  h = windowHeight;
  createCanvas(w, h);
  background(0);
  textSize(CELL_SIZE);
  columns = floor(h / CELL_SIZE);
  rows = floor(w / CELL_SIZE);
  
  minesOnly = initializeMines(NUM_MINES, rows, columns);
  grid = countNeighbors(minesOnly);
  
  checkedCells = JSON.parse(JSON.stringify(grid)); // find better sol
  checkedCells.forEach((arr) => arr.fill(-1));
  
  flags = JSON.parse(JSON.stringify(grid));
  flags.forEach((arr) => arr.fill(0));
  
  fill(125);
  drawGrid(grid);
  console.log("heyhey");
  // socket.on('broadcastData', (data) => {
      //     updateGrid(data.Y, data.X)
      //     console.log(data)
      // })
    }
    
    function draw() {}

const drawGrid = (grid) => {
  for (x in grid) {
    for (let y = 0; y < grid[x].length; y++)
      rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
};

const fr = (r, c, m, n) => {
  const x = floor(random(rows)),
    y = floor(random(columns));
  for (let i = 0; i < mines.length; i++) {
    if (mines[i][0] == x && mines[i][1] == y) {
      let obj = fr(r, c, m, n);
      break;
    }
    return { x, y };
  }
};

const findRandom = (rows, columns, mines, newGrid) => {
  const x = floor(random(rows)),
    y = floor(random(columns));
  let foundCopy = 0;

  for (let i = 0; i < mines.length; i++) {
    if (mines[i][0] == x && mines[i][1] == y) {
      foundCopy = 1;
      findRandom(rows, columns, mines, newGrid);
      break;
    }
    if (i == mines.length - 1) {
      console.log(mines.length, i);
      mines.push([x, y]);
      newGrid[x][y] = -1;
      loop = 0;
    }
  }
};

const initializeMines = (numOfMines, rows, columns) => {
  //from nummines rows and cols create a grid of row x cols with nummines num of randomly distributed mines
  let newGrid = new Array(rows);
  for (let i = 0; i < newGrid.length; i++)
    newGrid[i] = new Array(columns).fill(0);
  let mines = [];
  mines.push([floor(random(rows)), floor(random(columns))]);
  for (let i = 0; i < numOfMines - 1; i++) {
    let loop = 0;
    // while (loop) {}
  }
  return newGrid;
};

const countNeighbors = (arr) => {
  // take grid array and return grid array of neighboring Mines counts
  let outputArr = JSON.parse(JSON.stringify(arr));
  outputArr.forEach((arr) => arr.fill(0));

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const rows = arr.length,
        columns = arr[i].length;
      if (arr[i][j] == -1) {
        outputArr[i][j] = -1;
        continue;
      }
      const temp =
        (i == 0 || j == 0 ? 0 : arr[i - 1][j - 1]) +
        (i == 0 ? 0 : arr[i - 1][j]) +
        (i == 0 || j == columns - 1 ? 0 : arr[i - 1][j + 1]) +
        (j == 0 ? 0 : arr[i][j - 1]) +
        (j == columns - 1 ? 0 : arr[i][j + 1]) +
        (i == rows - 1 || j == columns - 1 ? 0 : arr[i + 1][j + 1]) +
        (i == rows - 1 ? 0 : arr[i + 1][j]) +
        (i == rows - 1 || j == 0 ? 0 : arr[i + 1][j - 1]); //boundary conditions
      outputArr[i][j] = temp < 0 ? temp * -1 : 0;
    }
  }
  return outputArr;
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

const discoverEmptyArea = (x, y) => {
  //populate checkedcells by  a recursive search for adjacent(also diag) cells with 0 neighbors
  checkedCells[x][y] = 0; //this cell is has been checked
  let leftSearch = x == 0 ? 0 : -1,
    rightSearch = x == rows - 1 ? 0 : 1,
    upSearch = y == 0 ? 0 : -1,
    downSearch = y == columns ? 0 : 1; //boundary conditions
  for (let i = leftSearch; i <= rightSearch; i++) {
    for (let j = upSearch; j <= downSearch; j++) {
      if (checkedCells[x + i][y + j] == 0) continue; //already been checked
      if (flags[x + i][y + j] == 1) continue; //dont check flags
      if (grid[x + i][y + j] == 0) {
        discoverEmptyArea(x + i, y + j); //recurse at new spot
      } else checkedCells[x + i][y + j] = 0; //cell is added to checked
    }
  }
};

const showChecked = () => {
  //display cells that have been checked
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

function keyPressed() {
  //deal with flags
  if (key == " ") {
    const X = floor(mouseX / CELL_SIZE),
      Y = floor(mouseY / CELL_SIZE);

    if (checkedCells[X][Y] == 0) return; //if cell has alreayd been checked

    if (flags[X][Y]) {
      //if alreayd a flag
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
}

const victorius = () => {
  //win
  return minesOnly.every((e, x) => e.every((e, y) => checkedCells[x][y] == e));
};

const updateGrid = (X, Y) => {
  // placeholder for mouseclicked so socket events will work
  const CELL_VAL = grid[X][Y];
  console.log("CV:", CELL_VAL);
  if (CELL_VAL == -1) {
    //you lose
    checkedCells.forEach((arr) => arr.fill(0));
    showChecked();
    return;
  } else if (CELL_VAL == 0) discoverEmptyArea(X, Y); //start recursion
  else checkedCells[X][Y] = 0; //add numbered square to checked
};

function mouseClicked() {
  const X = floor(mouseX / CELL_SIZE),
    Y = floor(mouseY / CELL_SIZE),
    CELL_VAL = grid[X][Y];
  if (flags[X][Y] == 1) return; //cant check flagged squares
  updateGrid(X, Y);
  if (victorius()) console.log("noLife");
  showChecked();
  // socket.emit('clientClick', {X:X,Y:Y})
}
