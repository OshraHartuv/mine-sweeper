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

function addMinesManualy(location,elManualBtn) {
    gBoard[location.i][location.j]= {
        minesAroundCount: MINE,
        isShown: true,
        isMine: true,
        isMarked: false
    }
    gLevel.minesAdded--
    elManualBtn.innerText = (gLevel.minesAdded === 0) ? `let's go!` : gLevel.minesAdded
    gMinesLocations.push(location)
    renderCell(location, MINE);
    return;
}