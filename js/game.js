'use strict'

var gBoard;
var gLevel;
var gGame;
var gIntreval;
var gMinesLocations;
const MINE = '💣'
const FLAG = '🚩'

function initGame() {
    gLevel = levelChoice()
    console.log(gLevel);
    renderBoard(gBoard, '.board-container')
}

function levelChoice(size = 4, mines = 2) {
    clearInterval(gIntreval);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true
    }
    gLevel = {
        size: size,
        mines: mines
    }
    gMinesLocations = []
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container')
    var elTimer = document.querySelector('.timer');
    elTimer.style.display = 'none';
    return gLevel
}

function loseGame() {
    console.log('looser');
    gGame.isOn = false;
    clearInterval(gIntreval);
    for (var i = 0; i < gMinesLocations.length; i++) {
        var currMineLocation = gMinesLocations[i];
        gBoard[currMineLocation.i][currMineLocation.j].isShown = true;
        renderCell(currMineLocation, MINE)
    }
}

function winGame() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && !currCell.isMarked) return
            else if (!currCell.isMine && !currCell.isShown) return
        }
    }
    clearInterval(gIntreval);
    gGame.isOn = false;
    console.log('win');
}

function openNegs(location){
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                gBoard[i][j].isMarked = false;
                gGame.shownCount++
                // console.log(gGame.shownCount);
                renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
                winGame()
            }
            else continue;
        }
    }
}


function cellClickedLeft(location) {
    if (!gGame.isOn) return;
    var currCell = gBoard[location.i][location.j]
    gGame.shownCount+= (currCell.isShown) ? 0:1;
    currCell.isShown = true;
    if (gGame.isFirstClick) {
        
        gGame.isFirstClick = false;
        runTimer();
        placeMines(gLevel.mines)
        setMinesAroundCount(gBoard)
        renderBoard(gBoard, '.board-container')
    }
    else if (currCell.isMarked) return;
    else if (currCell.isMine) loseGame()
    if (currCell.minesAroundCount === 0) openNegs(location)
    renderCell(location, currCell.minesAroundCount)
    if (gGame.markedCount + gGame.shownCount === gLevel.size ** 2) winGame()

}

function cellClickedRight(event, location) {
    if (event.which == 3) {
        if (gBoard[location.i][location.j].isShown) return;
        if (!gGame.isOn) return
        if (!gBoard[location.i][location.j].isMarked) {
            gBoard[location.i][location.j].isMarked = true;
            renderCell(location, FLAG)
            gGame.markedCount++
            if (gGame.markedCount + gGame.shownCount === gLevel.size ** 2) winGame()
        }
        else {
            gBoard[location.i][location.j].isMarked = false;
            renderCell(location, '')
            gGame.markedCount--

        }
    }
}

function runTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.style.display = 'block';
    gIntreval = setInterval(function () {
        gGame.secsPassed += 0.001
        elTimer.innerText = gGame.secsPassed.toFixed(3);
    }, 1);
}