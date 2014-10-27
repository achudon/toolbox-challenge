$(document).ready(function() {
    var tiles = [];
    var idx;

    for (idx = 1; idx <= 32; ++idx) {
        tiles.push({
           tileNum: idx,
           src: 'img/tile' + idx + '.jpg'
        });
    }

    console.log(tiles);

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

    console.log(tilePairs);

    var gameBoard = $('#game-board');
    var row = $(document.createElement('div'));
    var img;

    // first parameter is actual array element. Second parameter is array index of array element
    // passed by Lo-Dash-- you don't have to accept second parameter
    _.forEach(tilePairs, function(tile, elemIndex) {
        // programming trick for double equal comparisons
        if (elemIndex > 0 && 0 == elemIndex % 4) {
            gameBoard.append(row);
            row = $(document.createElement('div'));
        }
        img = $(document.createElement('img'));
        img.attr({
           src: 'img/tile-back.png',
           alt: 'image of tile ' + tile.tileNum
        });
        img.data('tile', tile);
        row.append(img);
    });
    gameBoard.append(row);

    $('#game-board img').click(function() {
        // this refers to html DOM object that raises the event (element that just got clicked on)
        var img = $(this);
        var tile = img.data('tile'); // get data back
        img.fadeOut(100,function() {
            if (tile.flipped) {
                img.attr('src', 'img/tile-back.png');
            } else {
                img.attr('src', tile.src);
            }
            img.fadeIn(100);
            tile.flipped = !tile.flipped;
        }); // after fadeOut
    }); // on click of gameboard images

    var startTime = _.now();
    var timer = window.setInterval(function() {
        // floor trims off the decimal part of any decimal number
        var elapsedSeconds = Math.floor((_.now() - startTime)/1000);
        $('#elapsed-seconds').text(elapsedSeconds);

        if (elapsedSeconds >= 10) {
            window.clearInterval(timer);
        }
    }, 1000);


}); // jQuery ready function

