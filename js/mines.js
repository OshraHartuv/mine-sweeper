'usr strict'

function setMinesAroundCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue;
            else gBoard[i][j].minesAroundCount += countNeighbors(i, j);
        }
    }
}

function placeMines(count) {
    for (var i = 0; i < count; i++) {
        var location = returnEmptyCell();
        gBoard[location.i][location.j] = {
            minesAroundCount: MINE,
            isShown: false,
            isMine: true,
            isMarked: false
        }
    }
}