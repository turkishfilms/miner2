/**
 * TODO:
 * make grid
 * put in grid
 * send grid to client on connect
 * place player in player anf grid in pgrid
 * update corresponding pgrid on click
 * each click check for victory/loss
 * when victory
 *      player recieves one point
 *      new grid
 *      replace all clients with new grid
 * 
 * timer or something
 * 
 * 
 */
const math = require('math.js')


const sessionID = [math.random(100).toPrecision(3)], // make multpile later
    players = [],
    grid = [],
    pGrids = {}

let rows = 5,
    columns = 5,
    numMines = 12,
    minesOnly = []

const main = (io) => {
    console.log("dummy")

    const initializeMines = (numOfMines, rows, columns) => { //from nummines rows and cols create a grid of row x cols with nummines num of randomly distributed mines
        let newGrid = new Array(rows);
        for (let i = 0; i < newGrid.length; i++) newGrid[i] = new Array(columns).fill(0);
        let mines = []
        mines.push([math.floor(math.random(rows)), math.floor(math.random(columns))])
        for (let i = 0; i < numOfMines - 1; i++) {
            let loop = 1
            while (loop) {
                const x = math.floor(math.random(rows)),
                    y = math.floor(math.random(columns))
                let foundCopy = 0
                mines.forEach(minePos => {
                    if (minePos[0] == x && minePos[1] == y) foundCopy = 1
                })
                if (foundCopy == 0) {
                    mines.push([x, y])
                    newGrid[x][y] = -1
                    loop = 0
                }
            }
        }
        return newGrid
    }

    const countNeighbors = (arr) => { // take grid array and return grid array of neighboring Mines counts
        let outputArr = JSON.parse(JSON.stringify(arr))
        outputArr.forEach(arr => arr.fill(0))

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                const rows = arr.length,
                    columns = arr[i].length
                if (arr[i][j] == -1) {
                    outputArr[i][j] = -1
                    continue
                }
                const temp =
                    (((i == 0 || j == 0) ? 0 : arr[i - 1][j - 1]) +
                        (i == 0 ? 0 : arr[i - 1][j]) +
                        ((i == 0 || j == columns - 1) ? 0 : arr[i - 1][j + 1]) +
                        (j == 0 ? 0 : arr[i][j - 1]) +
                        (j == columns - 1 ? 0 : arr[i][j + 1]) +
                        ((i == rows - 1 || j == columns - 1) ? 0 : arr[i + 1][j + 1]) +
                        (i == rows - 1 ? 0 : arr[i + 1][j]) +
                        ((i == rows - 1 || j == 0) ? 0 : arr[i + 1][j - 1])) //boundary conditions
                outputArr[i][j] = temp < 0 ? temp * -1 : 0
            }
        }
        return outputArr
    }

    const updateGrid = (X, Y, checked, flags) => { // placeholder for mouseclicked so socket events will work
        const CELL_VAL = grid[X][Y]
        if (CELL_VAL == -1) { //you lose
            checked.forEach(arr => arr.fill(0))

            return
        } else if (CELL_VAL == 0) discoverEmptyArea(X, Y) //start recursion
        else checked[X][Y] = 0 //add numbered square to checked
    }

    const discoverEmptyArea = (x, y) => { //populate checkedcells by  a recursive search for adjacent(also diag) cells with 0 neighbors 
        checked[x][y] = 0 //this cell is has been checked
        let leftSearch = x == 0 ? 0 : -1,
            rightSearch = x == rows - 1 ? 0 : 1,
            upSearch = y == 0 ? 0 : -1,
            downSearch = y == columns ? 0 : 1 //boundary conditions
        for (let i = leftSearch; i <= rightSearch; i++) {
            for (let j = upSearch; j <= downSearch; j++) {
                if (checked[x + i][y + j] == 0) continue //already been checked
                if (flags[x + i][y + j] == 1) continue //dont check flags
                if (grid[x + i][y + j] == 0) {
                    discoverEmptyArea(x + i, y + j) //recurse at new spot
                } else checked[x + i][y + j] = 0 //cell is added to checked
            }
        }
    }

    minesOnly = initializeMines(numMines, rows, columns)
    grid = countNeighbors(minesOnly)

    console.log(grid)

}

module.exports = {
    main,
    sessionID, // make multpile later
    players,
    grid,
    pGrids,
    rows,
    columns,
    numMines,
    minesOnly
}