"use strict";

// global variables (there are many)
var tiles;
var matches;
var missed;
var remaining;
var firstImg;
var acceptClicks;
var won;
var timer;
var first;
var startTime;

// when the page loads, create the game board and add click handlers
$(document).ready(function() {

    tiles = [];

    first = true; // first click of game
    var idx;

    for (idx = 1; idx <= 32; ++idx) {
        tiles.push({
            tileNum: idx,
            src: 'img/tile' + idx + '.jpg',
            flipped: false,
            fixed: false
        });
    }

    // start new game
    newGame();

    $('.resume-timer').click(function () {
        console.log(startTime + 'starttime');
        if ((parseInt($('#elapsed-seconds').text().slice(0,2)) == 0)) {
            first = true; // the player hasn't started the game yet, so the timer will start when they click on a tile
        } else {
            startTimer(); // the player has already started, so resume timer where they left off
        }
    });

    // show welcome dialog
    $('#welcome-modal').modal();

    // add click handler to the rules button
    $('#rules').click(function() {
        stopTimer();
        $('#rules-modal').modal();
    });

    // add click handler to the new game button
    $('#new-game').click(function() {
        stopTimer();
        $('#new-game-modal').modal();
    });

    // start new game if user chooses to do so
    $('#new-game-button').click(function() {
        $('#new-game-modal').modal('hide');
        newGame();
    });

    // start new game if user chooses to do so
    $('#play-again-button').click(function() {
        $('#win-modal').modal('hide');
        newGame();
    });

}); // jQuery ready function

// start the timer (refreshing every second)
function startTimer() {
    var time = _.now();
    timer = window.setInterval(function () {
        // floor trims off the decimal part of any decimal number
        var elapsedSeconds = Math.floor((_.now() - time) / 1000) + startTime;
        console.log(elapsedSeconds);
        $('#elapsed-seconds').text(elapsedSeconds+'s');
    }, 1000);
}

// stop the timer and save its value
function stopTimer() {
    startTime = parseInt($('#elapsed-seconds').text().slice(0,2));
    window.clearInterval(timer);
}

// start a new game by resetting statistics and creating
// a gameboard with different tiles
function newGame() {
    stopTimer();
    $('#elapsed-seconds').text(0+'s');

    $('#game-board').empty();

    remaining = 8; // remaining matches
    matches = 0; // matches made by user
    missed = 0; // matches missed by user
    first = true;
    firstImg = null; // no tile has been clicked yet
    acceptClicks = true; // allow user to click on a tile
    won = false; // set "user has won" to false
    startTime = 0; // set value that timer starts with

    updateStats(); // reset stats to default value on webpage

    var shuffled = _.shuffle(tiles);
    console.log(shuffled);

    var selectedTiles = shuffled.slice(0, 8);
    console.log(selectedTiles);

    var tilePairs = [];
    _.forEach(selectedTiles, function(tile) {
        tilePairs.push(_.clone(tile));
        tilePairs.push(_.clone(tile));
    });

    tilePairs = _.shuffle(tilePairs);

    var gameBoard = $('#game-board');
    var row = $(document.createElement('div'));
    var img;
    var elemIndex = 0;

    // first parameter is actual array element. Second parameter is array index of array element
    // passed by Lo-Dash-- you don't have to accept second parameter
    _.forEach(tilePairs, function(tile, elemIndex) {
        // programming trick for double equal comparisons
        if (elemIndex > 0 && 0 == elemIndex % 4) {
            gameBoard.append(row);
            row = $(document.createElement('div'));
        }
        img = $(document.createElement('img'));
        var pageHeight = $(window).height();
        var pageWidth = $(window).width();

        var dimension = Math.min(((pageHeight*4)/24), ((pageWidth*4)/24)); // adjust tile size so that they all fit on the screen
        img.attr('height', dimension);
        img.attr('width', dimension);
        img.attr({
            src: 'img/tile-back.png',
            alt: 'image of tile ' + tile.tileNum
        });
        img.data('tile', tile);
        row.append(img);
    });
    gameBoard.append(row);

    // add click event handler to each image on the gameboard
    $('#game-board img').click(function() {
        // this refers to html DOM object that raises the event (element that just got clicked on)
        if (first) { // if this is the first tile clicked, start the timer
            startTimer();
            first = false;
        }
        if(acceptClicks) { // if the game state is ready for the user to choose another tile
            takeTurn($(this));
        }
    }); // on click of gameboard images
} // end of new Game method

// flip a tile over so that the other image shows
function flipTile(img) {
    var tile = img.data('tile');

    img.fadeOut(200, function () {
        if (tile.flipped) {
            img.attr('src', 'img/tile-back.png');
        } else {
            img.attr('src', tile.src);
        }
        img.fadeIn(200);
        tile.flipped = !tile.flipped;
    }); // after fadeOut
}

// enforce game rules after user chooses tile
function takeTurn(img) {
    var tile = img.data('tile');
    if (!tile.fixed) { // if the tile can be flipped over
        tile.fixed = true; // set the tile so that it can't be flipped over
        flipTile(img);
        if (firstImg == null) { // if this is the first tile clicked on
            firstImg = img;
        } else { // this is the second tile clicked on
            acceptClicks = !acceptClicks; // make sure no other clicks are read
            if (checkMatch(img)) { // check if tiles match, if so, set so they can't be flipped again
                setTimeout(function() {
                    changeStyle(firstImg, 'right-match');
                    changeStyle(img, 'right-match');
                }, 10);
                matches++; // update statistics
                remaining--;

                setTimeout (function() {
                    firstImg = null; // reset to new turn
                    acceptClicks = true;

                }, 200);
            } else {
                setTimeout(function() {
                    changeStyle(firstImg, 'wrong-match');
                    changeStyle(img, 'wrong-match');
                }, 201);

                missed++;
                setTimeout(function () {
                    flipTile(firstImg);
                    flipTile(img);

                    resetTile(firstImg); // allow tiles to be flipped over again
                    resetTile(img);

                    changeStyle(firstImg, '');
                    changeStyle(img, '');

                    firstImg = null;
                    acceptClicks = true;
                    updateStats(); // update all statistics: matches, remaining, missed
                }, 1000);
            }
            updateStats(); // update all statistics: matches, remaining, missed
            if (remaining == 0) { // check to see if the user has won
                gameWon();
            }
        }
    }
}

function changeStyle(img, style) {
    img.attr('class', style);
}

// check to see if tiles match
function checkMatch(img) {
    var firstTile = firstImg.data('tile');
    var secondTile = img.data('tile');
    if (firstTile.src == secondTile.src) {
        console.log('it was a match!');
        return true;
    }
    return false;
}

// reset tile so that it can be flipped over
function resetTile (img) {
    img.data('tile').fixed = false;
}

// update stats on HTML page
function updateStats() {
    $('#matches').text(' ' + matches);
    $('#missed').text(' ' + missed);
    $('#remaining').text(' ' + remaining);
}

// stops timer, shows congratulatory message
function gameWon() {
    stopTimer();
    $('#win-modal').modal();
}


