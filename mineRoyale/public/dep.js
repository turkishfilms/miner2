const countNeighbors2 = () => {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < columns; i++) {
            if (grid[i][j] == -1) {
                bGrid[i][j] = -1
                continue
            }
            const sumOfNeighbors =
                (((i == 0 || j == 0) ? 0 : grid[i - 1][j - 1]) +
                    (i == 0 ? 0 : grid[i - 1][j]) +
                    ((i == 0 || j == rows - 1) ? 0 : grid[i - 1][j + 1]) +
                    (j == 0 ? 0 : grid[i][j - 1]) +
                    (j == rows - 1 ? 0 : grid[i][j + 1]) +
                    (((i + 1 == columns || j == rows - 1) ? 0 : grid[i + 1][j + 1])) +
                    ((i + 1 == columns ? 0 : grid[i + 1][j])) +
                    ((i + 1 == columns || j == 0) ? 0 : grid[i + 1][j - 1]))
            bGrid[i][j] = sumOfNeighbors < 0 ? sumOfNeighbors * -1 : 0
        }
    }
    grid = JSON.parse(JSON.stringify(bGrid))
}


const showGrid = () => {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const col = colorChoice(grid[x][y])
            fill(col[0], col[1], col[2])
            text(grid[x][y], y * CELL_SIZE + CELL_SIZE / 4, (x + 1) * CELL_SIZE - (CELL_SIZE / 4))
        }
    }
}


const showMines = () => {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            fill(grid[x][y] == -1 ? 0 : 255)
            rect(y * CELL_SIZE, x * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
    }

}



const initializeMines = (rows, columns, grid, mines) => {
    const P = (NUM_MINES - 1) / (columns * rows)
    for (let y = 0; y < columns; y++) {
        let col = []
        for (let x = 0; x < rows; x++) {
            if (random() < P) {
                mines.push([x, y])
                col.push(-1)
            } else col.push(0)
            rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
        grid.push(col)
    }

    if (mines.length > NUM_MINES) {
        const removeAmount = mines.length - NUM_MINES
        for (let i = 0; i < removeAmount; i++) {
            let r = floor(random(mines.length))
            grid[mines[r][0]][mines[r][1]] = 0
        }
    } else if (mines.length < NUM_MINES) {
        const addAmount = NUM_MINES - mines.length
        for (let i = 0; i < addAmount; i++) {
            let yes = true
            while (yes) {
                yes = false// this is when i realized this will solve the whole problem
            }
            let r = [floor(random(rows)), floor(random(columns))]
            grid[mines[r][0]][mines[r][1]] = 0
        }
    } else console.log(":");
}


function mouseClicked2() {
    const X = floor(mouseX / CELL_SIZE),
        Y = floor(mouseY / CELL_SIZE),
        CELL_VAL = grid[X][Y]
    let data = {
        X: X,
        Y: Y
    }
    if (flags[X][Y] == 1) return //cant check flagged squares

    if (CELL_VAL == -1) { //you lose
        checkedCells.forEach(arr => arr.fill(0))
        showChecked()
        socket.emit('clientClick', data)
        return
    } else if (CELL_VAL == 0) discoverEmptyArea(X, Y) //start recursion
    else checkedCells[X][Y] = 0 //add numbered square to checked

    fill(255)
    rect(X * CELL_SIZE, Y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    if (victorius()) console.log("noLife");
    showChecked()
    socket.emit('clientClick', data)

}
