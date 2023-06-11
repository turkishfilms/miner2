import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import math from "math.js";

import { setUncaughtExceptionCaptureCallback } from "process";

const app = express(),
  router = express.Router(),
  server = createServer(app),
  port = process.env.PORT || 3030,
  io = new Server(server);

app.use(express.static("public"));

console.log("starting...");

router.get("/", (req, res) => {
  console.log("someone is a nothing burger");
  res.send("bunnies");
});

router.get("/crackhead", (req, res) => {
  resetGame();
  console.log("someone is a crackhead");
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

router.get("/nonigga", (req, res) => {
  console.log("someone is a cracker");
});

router.get("*", (req, res) => {
  res.send("you are a pumpkin");
});

app.use("/", router);

//game stuff//

/**
 * TODO:
//  * make grid 175-6
//  * send grid to client on connect 178-88
//  * place player in players and grid in pgrid 180-1
//  * update corresponding pgrid on click 190-230
//  * each click check for victory/loss 221-35
//  * when victory 230-2
//  *      player recieves one point 235
//  *      new grid 233-4
//  *      replace all clients with new grid 236-43
// * disconnects handled 264-7
 * 
 * on every client loses new game starts
 * 
 * fix reset
 * home page
 * cellsizing...
 * flag counter on banner
 * different colored flags
 * rooms/session id
 *     each room different Grid config
 *     colored banner per room
 *     other players in room shown on banner
 * timer or something

 * 
 */

// players = [{
//     playerID: "something",
//     points: 0,
//     grid: [
//         [-1, -1, -1],
//         [-1, -1, -1],
//         [-1, 0, -1]
//     ]
// }]

const players = [];

let rows = 100,
  columns = 100,
  numMines = 100,
  minesOnly,
  grid;

const newBlankGrid = (grid, val) => {
  let newBlankGrid = JSON.parse(JSON.stringify(grid));
  newBlankGrid.forEach((arr) => arr.fill(val));
  return JSON.parse(JSON.stringify(newBlankGrid));
};

const findPlayerFromID = (ID) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].playersID == ID)
      return {
        player: players[i],
        playersIndex: i,
      };
  }
};

const resetGame = () => {
  minesOnly = initializeMines(math.floor(math.random() * 7), rows, columns);
  grid = countNeighbors(minesOnly);
  io.emit("reset", {
    numMines,
    rows,
    columns,
    grid,
    socketId: "no",
  });
  players.forEach((player) => {
    player.playersGrid = newBlankGrid(grid, -1);
    player.playersNotLost = 1;
  });
};

const allPlayersLost = () => {
  return players.reduce(
    (p, c) => p + c.playersNotLost,
    players[0].playersNotLost
  )
    ? 0
    : 1;
};

const initializeMines = (numOfMines, rows, columns) => {
  //from nummines rows and cols create a grid of row x cols with nummines num of randomly distributed mines
  let newGrid = new Array(rows);
  for (let i = 0; i < newGrid.length; i++)
    newGrid[i] = new Array(columns).fill(0);
  let mines = [];
  mines.push([math.floor(math.random(rows)), math.floor(math.random(columns))]);
  for (let i = 0; i < numOfMines; i++) {
    let loop = 1;
    while (loop) {
      const x = math.floor(math.random() * rows),
        y = math.floor(math.random() * columns);
      let foundCopy = 0;
      mines.forEach((minePos) => {
        if (minePos[0] == x && minePos[1] == y) foundCopy = 1;
      });
      if (foundCopy == 0) {
        mines.push([x, y]);
        newGrid[x][y] = -1;
        loop = 0;
      }
    }
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

const victorious = (minesOnly, checkedCells) => {
  //win
  return minesOnly.every((e, x) => e.every((e, y) => checkedCells[x][y] == e)); //too clever
};

const updateGrid = (X, Y, checked, minesOnly, flags) => {
  // placeholder for mouseclicked so socket events will work
  const CELL_VAL = grid[X][Y];
  let checked2 = JSON.parse(JSON.stringify(checked)),
    winner = -1;

  // console.log("UG:", CELL_VAL, checked2, X, Y);
  if (CELL_VAL == -1) {
    //you lose
    return {
      updatedGrid: newBlankGrid(checked, 0),
      won: 0,
    };
  } else if (CELL_VAL == 0)
    discoverEmptyArea(X, Y, checked2, flags); //start recursion
  else {
    checked2[X][Y] = 0; //add numbered square to checked
  }

  if (victorious(minesOnly, checked2)) {
    return {
      updatedGrid: checked2,
      won: 1,
    };
  }
  return {
    updatedGrid: checked2,
    won: winner,
  };
};

const discoverEmptyArea = (x, y, checked2, flags) => {
  //populate checkedcells by  a recursive search for adjacent(also diag) cells with 0 neighbors
  checked2[x][y] = 0; //this cell is has been checked
  let leftSearch = x == 0 ? 0 : -1,
    rightSearch = x == rows - 1 ? 0 : 1,
    upSearch = y == 0 ? 0 : -1,
    downSearch = y == columns - 1 ? 0 : 1; //boundary conditions
  for (let i = leftSearch; i <= rightSearch; i++) {
    for (let j = upSearch; j <= downSearch; j++) {
      if (checked2[x + i][y + j] == 0) continue; //already been checked
      if (flags[x + i][y + j] == 1) continue; //dont check flags
      if (grid[x + i][y + j] == 0) {
        discoverEmptyArea(x + i, y + j, checked2, flags); //recurse at new spot
      } else checked2[x + i][y + j] = 0; //cell is added to checked
    }
  }
};

minesOnly = initializeMines(numMines, rows, columns);
grid = countNeighbors(minesOnly);

io.on("connection", (sock) => {
  console.log(`Welcome ${sock.id} to the WarZone! boy`);

  players.push({
    playersID: sock.id,
    playersPoints: 0,
    playersGrid: newBlankGrid(grid, -1),
    playersNotLost: 1,
  });

  sock.emit("newGame", {
    numMines,
    rows,
    columns,
    grid,
    socketId: sock.id,
  });

  sock.on("clientClick", (data) => {
    if (data == null) {
      console.log("no click data from", sock.id);
      console.log(players, allPlayersLost());
      return;
    }

    const { X, Y, flags } = data;

    console.log(`client ${sock.id} clicked on ${[X, Y]}`);

    const {
      player: { playersGrid: playersChecked },
      playersIndex,
    } = findPlayerFromID(sock.id);

    const { updatedGrid, won } = updateGrid(
      X,
      Y,
      playersChecked,
      minesOnly,
      flags
    ); // updatedGrid == 1 if WIN, 0 if LOST, grid of checkedCells if !1 && !0

    players[playersIndex].playersGrid = updatedGrid;

    sock.emit("updateClientBoard", {
      updated: updatedGrid,
    });

    if (won == 1) {
      //when victory
      console.log(sock.id, "got lucky");
      players[playersIndex].playersPoints++;
      setTimeout(() => resetGame(), 1000);
      return;
    } else if (won == 0) {
      //when loss
      console.log(sock.id, "is trash");
      players[playersIndex].playersNotLost = 0;
      if (allPlayersLost()) {
        //everybody loss
        setTimeout(() => resetGame(), 1000);
        return;
      }
    }
  });

  sock.on("disconnect", (data) => {
    console.log(sock.id, "doesnt even love you anymore");
    players.splice(findPlayerFromID(sock.id).playersIndex, 1);
    if (players.length != 0 && allPlayersLost()) {
      //when disconnect guy was lat non lost player im an edge case samurai
      console.log("Loetsof losers");
      setTimeout(() => resetGame(), 1000);
    }
  });
});

server.listen(port, () => console.log(`good lord ${port}`));
