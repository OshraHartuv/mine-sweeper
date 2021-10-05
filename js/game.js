'use strict'

const MINE = '💣'
const FLAG = '🚩'
const HAPPY = '😊'
const SAD = '😖'
const WIN = '😎'
const RESET = '😲'
const HINT = '💡'
const SAFE = '🦺'
const LIVES = '❤️'
var gBoard;
var gLevel;
var gGame;
var gIntreval;
var gMinesLocations;
var gMoves;
var gRecursMoves;


function initGame() {
    gLevel = startGame()
    renderBoard(gBoard, '.board-container')
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
        hints: 3,
        hintIsOn: false,
        safeClicks: 3,
        isManual: false,
        isBoom: false
    }
    gLevel = {
        size: size,
        mines: mines,
        minesAdded: mines,
    }
    cssChanges()
    gRecursMoves = []
    gMinesLocations = []
    gMoves = []
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container')
    return gLevel
}

function cellClicked(location, elCell) {
    if (!gGame.isOn) return;
    if (gBoard[location.i][location.j].isMarked) return;
    if (gBoard[location.i][location.j].isShown) return
    // manual mode:
    if (gGame.isManual) {
        gGame.isFirstClick = false;
        var elManualBtn = document.querySelector('.manual')
        // starting game:
        if (gLevel.minesAdded === 0) {
            gGame.isManual = false;
            runTimer();
            // hiding mines set by user
            for (var i = 0; i < gMinesLocations.length; i++) {
                var currMineLocation = gMinesLocations[i]
                gBoard[currMineLocation.i][currMineLocation.j].isShown = false;
            }
            setMinesAroundCount(gBoard)
            renderBoard(gBoard, '.board-container')
            elCell = document.querySelector(`.${getClassName(location)}`)
            //adding mines: 
        } else {
            addMinesManualy(location, elManualBtn)
            return;
        }
    }
    // boom mode:
    if (gGame.isBoom){
        gGame.isFirstClick = false;
        addBoomMines()
        gGame.isBoom = false;
        runTimer()
        setMinesAroundCount(gBoard)
        renderBoard(gBoard, '.board-container')
        elCell = document.querySelector(`.${getClassName(location)}`)
    }
    // giving the user an hint:
    else if (gGame.hintIsOn) {
        showNegs(location);
        gGame.hintIsOn = false
        return;
    }
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = HAPPY;
    var currCell = gBoard[location.i][location.j]
    gGame.shownCount += (currCell.isShown) ? 0 : 1;
    currCell.isShown = true;
    gMoves.push(location)
    // fist click sets the mines
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
            loseGame()
        }
        else {
            gGame.lives--
            var elLivesSpan = document.querySelector('.lives span')
            var livesStr = ''
            for (var i = 0; i < gGame.lives; i++) {
                livesStr += LIVES + ' '
            }
            elLivesSpan.innerText = livesStr
            elSmily.innerText = SAD
            setTimeout(function () {
                elSmily.innerText = HAPPY;
            }, 1000)
        }
    }
    if (currCell.minesAroundCount === 0) {
        openNegs(location)
        gMoves.push(gRecursMoves)
        gRecursMoves = []
    }
    if (gGame.markedCount + gGame.shownCount === gLevel.size ** 2) {
        winGame()
    }
    elCell.id = 'shown'
    renderCell(location, (currCell.minesAroundCount === 0) ? '' : currCell.minesAroundCount)
}

function cellMarked(event, location, elcell) {
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
        gMoves.push(location)
    }
}

function manual(elManualBtn) {
    var elTimer = document.querySelector('.timer');
    if (elTimer.style.display === 'block') return
    if (gGame.isManual) return
    if(gGame.isBoom) return
    elManualBtn.innerText = gLevel.minesAdded
    gGame.isManual = true;
}

function reset() {
    startGame(gLevel.size, gLevel.mines)
}

function loseGame() {
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
    var elSmily = document.querySelector('.smily')
    elSmily.innerText = SAD;
}

function winGame() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown) return
            if (currCell.isMine) {
                if (!currCell.isShown && !currCell.isMarked) return;
            }
        }
    }
    clearInterval(gIntreval);
    gGame.isOn = false;
    var elWinner = document.querySelector('h2')
    elWinner.style.display = 'block'
    var elSmily = document.querySelector('.smily')
    elSmily.innerText = WIN
    checkBestScore()
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
                if (gBoard[i][j].isMarked) {
                    gBoard[i][j].isMarked = false;
                    gGame.markedCount--
                }
                gGame.shownCount++
                gRecursMoves.push({ i: i, j: j })
                var elCell = document.querySelector(`.${getClassName({ i: i, j: j })}`)
                elCell.id = 'shown'
                renderCell({ i: i, j: j }, (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount)
                winGame()
                if (gBoard[i][j].minesAroundCount === 0) {
                    openNegs({ i: i, j: j })
                }
            }
            else continue;
        }
    }
    // // if (gRecursMoves.length) gMoves.push(gRecursMoves)
    // gRecursMoves = []
}

function runTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.style.display = 'block';
    gIntreval = setInterval(function () {
        gGame.secsPassed += 0.001
        elTimer.innerText = gGame.secsPassed.toFixed(3);
    }, 1);
}

function hint(elHintBtn) {
    if (!gGame.isOn) return;
    gGame.hints--
    gGame.hintIsOn = true;
    var elHintBtnTextStr = ''
    for (var i = 0; i < gGame.hints; i++) {
        elHintBtnTextStr += HINT + ' ';
    }
    var elHintBtnSpan = document.querySelector('.hint span');
    elHintBtnSpan.innerText = elHintBtnTextStr
    if (gGame.hints === 0) setTimeout(function () {
        elHintBtn.style.display = 'none'
    }, 2000)
}

function showNegs(location) {
    var hintCells = [];
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                hintCells.push({ i: i, j: j })
                renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
            }
        }
    }
    // hiding the hint
    setTimeout(function () {
        for (var i = 0; i < hintCells.length; i++) {
            var currCellLocation = hintCells[i]
            gBoard[currCellLocation.i][currCellLocation.j].isShown = false
            renderCell({ i: currCellLocation.i, j: currCellLocation.j }, '')
        }
    }, 1000)
}

function cssChanges() {
    var elLooser = document.querySelector('h3')
    elLooser.style.display = 'none'
    var elWinner = document.querySelector('h2')
    elWinner.style.display = 'none'
    var elTimer = document.querySelector('.timer');
    elTimer.style.display = 'none';
    var elLives = document.querySelector('.lives');
    elLives.innerHTML = `lives: <span>${LIVES} ${LIVES} ${LIVES}</span>`
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = HAPPY;
    var elHintBtnSpan = document.querySelector('.hint span');
    elHintBtnSpan.innerText = `${HINT} ${HINT} ${HINT}`
    var elHintBtn = document.querySelector('.hint');
    elHintBtn.style.display = 'block'
    var elSafeBtnSpan = document.querySelector('.safe span')
    elSafeBtnSpan.innerText = `${SAFE} ${SAFE} ${SAFE}`
    var elSafeBtn = document.querySelector('.safe')
    elSafeBtn.style.display = 'block'
    var elManualBtn = document.querySelector('.manual');
    elManualBtn.innerText = 'press for manual'
    var elBestScoreSpan = document.querySelector('.bestScore span')
    switch (gLevel.size) {
        case 4:
            elBestScoreSpan.innerText = localStorage.getItem('esay best score')
            break;
        case 8:
            elBestScoreSpan.innerText = localStorage.getItem('medium best score')
            break;
        case 12:
            elBestScoreSpan.innerText = localStorage.getItem('hard best score')
            break;
    }

}

function checkBestScore() {
    var elTimer = document.querySelector('.timer');
    var elBestScoreSpan = document.querySelector('.bestScore span')
    switch (gLevel.size) {
        case 4:
            if (!localStorage.getItem('esay best score')) {
                localStorage.setItem('esay best score', elTimer.innerText);
                elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
            } else {
                if (elTimer.innerText < localStorage.getItem('esay best score')) {
                    localStorage.setItem('esay best score', elTimer.innerText)
                    elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
                }
            }
            break;
        case 8:
            if (!localStorage.getItem('medium best score')) {
                localStorage.setItem('medium best score', elTimer.innerText);
                elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
            } else {
                if (elTimer.innerText < localStorage.getItem('medium best score')) {
                    localStorage.setItem('medium best score', elTimer.innerText)
                    elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
                }
            }
            break;
        case 12:
            if (!localStorage.getItem('hard best score')) {
                localStorage.setItem('hard best score', elTimer.innerText);
                elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
            } else {
                if (elTimer.innerText < localStorage.getItem('hard best score')) {
                    localStorage.setItem('hard best score', elTimer.innerText)
                    elBestScoreSpan.innerText = 'YOU GOT A NEW RECORD'
                }
            }
            break;
    }
}

function safeClick(elSafeBtn) {
    if (!gGame.isOn) return;
    gGame.safeClicks--
    var emptyCell = returnEmptyCell()
    gBoard[emptyCell.i][emptyCell.j].isShown = true;
    renderCell(emptyCell, gBoard[emptyCell.i][emptyCell.j].minesAroundCount)
    setTimeout(function () {
        gBoard[emptyCell.i][emptyCell.j].isShown = false;
        renderCell(emptyCell, gBoard[emptyCell.i][emptyCell.j].isMarked ? FLAG : '')
    }, 1000)
    var elSafeBtnStr = ''
    for (var i = 0; i < gGame.safeClicks; i++) {
        elSafeBtnStr += SAFE + ' ';
    }
    var elSafeBtnSpan = document.querySelector('.safe span')
    elSafeBtnSpan.innerText = elSafeBtnStr;
    if (gGame.safeClicks === 0) setTimeout(function () {
        elSafeBtn.style.display = 'none'
    }, 2000)

}

function undo() {
    if (!gMoves.length) return
    if (!gGame.isOn) return
    var lastMove = gMoves.pop()
    if (lastMove.length) {
        for (var i = 0; i < lastMove.length; i++) {
            var currCellLocation = lastMove[i]
            var elCell = getClassName(currCellLocation)
            gBoard[lastMove[i].i][lastMove[i].j].isShown = false
            gGame.shownCount--
            document.querySelector(`.${elCell}`).removeAttribute('id')
            renderCell(currCellLocation, '')
        }
        lastMove = gMoves.splice(gMoves.length-1, 1)[0]
        elCell = getClassName(lastMove)
    } else {
        var currCellLocation = lastMove
        var elCell = getClassName(currCellLocation)
        if (gBoard[lastMove.i][lastMove.j].isMarked) {
            gBoard[lastMove.i][lastMove.j].isMarked = false
            gGame.markedCount--
            document.querySelector(`.${elCell}`).removeAttribute('id')
            renderCell(currCellLocation, '')
            return
        }
    }
    gBoard[lastMove.i][lastMove.j].isShown = false
    gGame.shownCount--
    document.querySelector(`.${elCell}`).removeAttribute('id')
    renderCell(currCellLocation, '')
}

function sevenBoom(){
    console.log('boom');
    var elTimer = document.querySelector('.timer');
    if (elTimer.style.display === 'block') return
    if (gGame.isManual) return
    if(gGame.isBoom) return
    gGame.isBoom = true

}