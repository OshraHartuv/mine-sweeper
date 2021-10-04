'use strict'

var gBoard;
var gLevel;
var gGame;
var gIntreval;
var gMinesLocations;
const MINE = '💣'
const FLAG = '🚩'
const HAPPY = '😊'
const SAD = '😖'
const WIN = '😎'
const RESET = '😲'
const HINT = '💡'

function initGame() {
    gLevel = startGame()
    console.log(gLevel);
    renderBoard(gBoard, '.board-container')
}

function cellClickedLeft(location, elCell) {
    if (gGame.hintIsOn){
        console.log('hint');
        showNags(location);
        gGame.hintIsOn =false
        return;
    }
    if (!gGame.isOn) return;
    if (gBoard[location.i][location.j].isMarked) return;
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = HAPPY;
    var currCell = gBoard[location.i][location.j]
    gGame.shownCount += (currCell.isShown) ? 0 : 1;
    currCell.isShown = true;
    if (gGame.isFirstClick) {
        runTimer();
        placeMines(gLevel.mines)
        setMinesAroundCount(gBoard)
        renderBoard(gBoard, '.board-container')
        gGame.isFirstClick = false;
        elCell = document.querySelector(`.${getClassName(location)}`)
    }
    else if (currCell.isMine) {
        if (gGame.lives === 0) {
            var elLives = document.querySelector('.lives')
            elLives.innerText = 'DEAD'
            elSmily.innerText = SAD;
            loseGame()
        }
        else {
            gGame.lives--
            var elLivesSpan = document.querySelector('.lives span')
            elLivesSpan.innerText = gGame.lives;
            elSmily.innerText = SAD
            setTimeout(function () {
                elSmily.innerText = HAPPY;
            }, 1000)
        }
    }
    if (currCell.minesAroundCount === 0) openNegs(location)
    if (gGame.markedCount + gGame.shownCount === gLevel.size ** 2) winGame()
    elCell.id = 'shown'
    renderCell(location, currCell.minesAroundCount)
}

function startGame(size = 4, mines = 2) {
    clearInterval(gIntreval);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true,
        lives: 3,
        hints:3,
        hintIsOn: false
    }
    gLevel = {
        size: size,
        mines: mines
    }
    cssStartGameSelectors()
    gMinesLocations = []
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container')
    return gLevel
}

function cellClickedRight(event, location, elcell) {
    if (event.which == 3) {
        if (gBoard[location.i][location.j].isShown) return;
        if (!gGame.isOn) return
        if (!gBoard[location.i][location.j].isMarked) {
            gBoard[location.i][location.j].isMarked = true;
            renderCell(location, FLAG)
            gGame.markedCount++
            elcell.id = 'flaged'
            if (gGame.markedCount + gGame.shownCount === gLevel.size ** 2) winGame()
        }
        else {
            gBoard[location.i][location.j].isMarked = false;
            renderCell(location, '')
            gGame.markedCount--
            elcell.removeAttribute('id')

        }
    }
}

function reset() {
    startGame(gLevel.size, gLevel.mines)
}

function loseGame() {
    console.log('looser');
    gGame.isOn = false;
    clearInterval(gIntreval);
    for (var i = 0; i < gMinesLocations.length; i++) {
        var currMineLocation = gMinesLocations[i];
        var elCell = document.querySelector(`.${getClassName(currMineLocation)}`)
        elCell.id = 'shown'
        gBoard[currMineLocation.i][currMineLocation.j].isShown = true;
        renderCell(currMineLocation, MINE)
    }
    var elLooser = document.querySelector('h3')
    elLooser.style.display = 'block'
}

function winGame() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown) return
        }
    }
    clearInterval(gIntreval);
    gGame.isOn = false;
    var elWinner = document.querySelector('h2')
    elWinner.style.display = 'block'
    var elSmily = document.querySelector('.smily')
    elSmily.innerText = WIN
    console.log('win');
}

function openNegs(location) {
    var elCell = document.querySelector(`.${getClassName(location)}`)
    elCell.id = 'shown'
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                gBoard[i][j].isMarked = false;
                gGame.shownCount++
                var elCell = document.querySelector(`.${getClassName({ i: i, j: j })}`)
                elCell.id = 'shown'
                renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
                winGame()
            }
            else continue;
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

function hint(elHintBtn){
    gGame.hints--
    gGame.hintIsOn = true;
    var elHintBtnTextStr = '' 
    for (var i =0; i < gGame.hints;i++){
        elHintBtnTextStr += HINT + ' ';
    } 
    var elHintBtnSpan = document.querySelector('.hint span');
    elHintBtnSpan.innerText = elHintBtnTextStr
    if(gGame.hints === 0) setTimeout(function(){
        elHintBtn.style.display='none'
    },2000)
}

function showNags(location){
    var hintCells = [];
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown){
                gBoard[i][j].isShown = true;
                hintCells.push({i:i,j:j})
                renderCell({i:i, j:j},gBoard[i][j].minesAroundCount)
            } 
        }
    }
    console.log(hintCells);
    setTimeout(function(){
        for (var i = 0; i < hintCells.length; i++){
            var currCellLocation = hintCells[i]
            gBoard[currCellLocation.i][currCellLocation.j].isShown= false
            renderCell({i:currCellLocation.i, j:currCellLocation.j},'')
        }
    },1000)
}

function cssStartGameSelectors() {
    var elLooser = document.querySelector('h3')
    elLooser.style.display = 'none'
    var elWinner = document.querySelector('h2')
    elWinner.style.display = 'none'
    var elTimer = document.querySelector('.timer');
    elTimer.style.display = 'none';
    var elLives = document.querySelector('.lives');
    elLives.innerHTML = `lives: <span>${gGame.lives}</span>`
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = HAPPY;
    var elHintBtnSpan = document.querySelector('.hint span');
    elHintBtnSpan.innerText = `${HINT} ${HINT} ${HINT}`
    var elHintBtn = document.querySelector('.hint');
    elHintBtn.style.display = 'block'
}
