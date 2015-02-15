/**
 * Created by dchiu on 2/15/15.
 */

/**
 * Size of the grid. Probably shouldn't be changed from 10 for standard battleship.
 * @type {number}
 */
var BATTLESHIP_GRID_SIZE = 10;

/**
 * Stores objects which represent the player's ships.
 * @type {Array}
 */
var playerShips = [];
var aiShips = [];
/**
 * Keeps track of the state of the player's grid. There is some duplicated info between playerShips
 * and playerGrid, but playerShips is useful to make it easy to tell which ships are left, and
 * playerGrid makes it easy to tell if a location contains a ship.
 * @type {Array}
 */
var playerGrid = [];
var aiGrid = [];
var aiAttackGrid = [];

/**
 * Sets up the UI grid and the internal grid model for the game.
 */
function initializeGridView(gridSelector) {
  for (var i = 0; i < BATTLESHIP_GRID_SIZE; i++) {
    var row = $("<tr/>");
    for (var j = 0; j < BATTLESHIP_GRID_SIZE; j++) {
      row.append("<td data-col=" + j + " data-row=" + i + "/>");
    }
    gridSelector.append(row);
  }
}

function initializeGridModel(grid, initialValue) {
  for (var i = 0; i < BATTLESHIP_GRID_SIZE; i++) {
    var gridCol = [];
    for (var j = 0; j < BATTLESHIP_GRID_SIZE; j++) {
      gridCol.push({state: initialValue});
    }
    grid.push(gridCol);
  }
}

/**
 * Gets the jQuery object for the cell at the given column and row.
 * @param col
 * @param row
 * @returns {*|jQuery|HTMLElement}
 */
function getGridCell(col, row) {
  return $(playerGridCells[row * BATTLESHIP_GRID_SIZE + col]);
}

/**
 * Updates the UI to display the given ship.
 * @param ship
 */
function drawShip(ship) {
  var startCol = ship.startCol;
  var startRow = ship.startRow;
  if (ship.vertical) {
    for (var row = startRow; row < startRow + ship.length; row++) {
      getGridCell(startCol, row).removeClass().addClass("ship");
    }
  }
  else {
    for (var col = startCol; col < startCol + ship.length; col++) {
      getGridCell(col, startRow).removeClass().addClass("ship");
    }
  }
}

/**
 * Determines whether or not a given ship can be placed in the given grid.
 * @param ship
 * @param grid
 * @returns {boolean}
 */
function canPlaceShipInGrid(ship, grid) {
  var startCol = ship.startCol;
  var startRow = ship.startRow;
  var length = ship.length;
  var vertical = ship.vertical;

  // Ships can't start off the grid to the top or to the left.
  if (ship.startCol < 0 || ship.startRow < 0) {
    return false;
  }

  // Ships can't go off the end of the grid to the right or the bottom.
  if ((!vertical && startCol + length > BATTLESHIP_GRID_SIZE)
    || (vertical && startRow + length > BATTLESHIP_GRID_SIZE)) {
    return false;
  }

  // Check if any of the spaces we want to occupy are already occupied.
  if (vertical) {
    for (var row = startRow; row < startRow + length; row++) {
      if (grid[startCol][row].state !== null) {
        return false;
      }
    }
  }
  else {
    for (var col = startCol; col < startCol + length; col++) {
      if (grid[col][startRow].state !== null) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Places a ship in the given grid model.
 * @param ship
 * @param grid
 * @todo Consider combining this with the drawShip() function.
 */
function placeShipInGrid(ship, grid) {
  var startCol = ship.startCol;
  var startRow = ship.startRow;
  if (ship.vertical) {
    for (var row = startRow; row < startRow + ship.length; row++) {
      grid[startCol][row].state = ship;
    }
  }
  else {
    for (var col = startCol; col < startCol + ship.length; col++) {
      grid[col][startRow].state = ship;
    }
  }
}

/**
 * Prompts the player to place a ship
 * @param shipName
 * @param length
 * @param callback
 * @todo Error checking: 1) don't allow player to click on things that are not in a line 2) enforce
 * that start (col, row) is further to the top left than end (col, row) or automatically swap them
 * 3) don't allow player to place a ship such that it would overlap another ship
 */
function placePlayerShip(shipName, length, callback) {
  $("#message").text("Place " + shipName + " (length " + length + ") by clicking on start point " +
    "and end point.");
  var startCol, startRow, endCol, endRow;
  var firstClick = true;

  // Start listening for clicks. We need two clicks to place a ship.
  playerGridCells.click(function() {
    var col = $(this).data("col");
    var row = $(this).data("row");
    if (firstClick) {
      startCol = col;
      startRow = row;
      firstClick = false;
    }
    else {
      endCol = col;
      endRow = row;
      var ship = {
        startCol: startCol,
        startRow: startRow,
        length: length,
        vertical: startCol === endCol
      };
      playerShips.push(ship);
      drawShip(ship);
      placeShipInGrid(ship, playerGrid);
      // Remove this click listener since we are done placing this ship.
      playerGridCells.unbind("click");
      callback();
    }
  });
}

/**
 * I always have to look this one up. Found this here:
 * http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Places an AI ship with the given length on the board. This function does random placement.
 * @param length
 */
function placeAIShip(length) {
  var ship = {
    startCol: getRandomInt(0, BATTLESHIP_GRID_SIZE - 1),
    startRow: getRandomInt(0, BATTLESHIP_GRID_SIZE - 1),
    length: length,
    vertical: getRandomInt(0, 1) === 1
  };

  while (!canPlaceShipInGrid(ship, aiGrid)) {
    ship.startCol = getRandomInt(0, BATTLESHIP_GRID_SIZE - 1);
    ship.startRow = getRandomInt(0, BATTLESHIP_GRID_SIZE - 1);
    ship.vertical = getRandomInt(0, 1) === 1;
  }

  placeShipInGrid(ship, aiGrid);
  aiShips.push(ship);
}

/**
 * Places AI ships on the board.
 */
function placeAIShips() {
  placeAIShip(5);
  placeAIShip(4);
  placeAIShip(3);
  placeAIShip(3);
  placeAIShip(2);
}

function aiTurn() {

}

/**
 * Starts normal play of the game where the player and the AI take turns shooting at each other.
 */
function play() {
  initializeGridView($("#player-attack-grid"));
  playerAttackGridCells = $("#player-attack-grid td");
  playerAttackGridCells.click(function() {
    // If this cell already has a class, it has been clicked before so don't do anything.
    if ($(this).hasClass("hit") || $(this).hasClass("miss")) {
      return;
    }
    var col = $(this).data("col");
    var row = $(this).data("row");
    if (aiGrid[col][row].state === null) {
      $(this).addClass("miss");
    }
    else {
      $(this).addClass("hit");
    }
    aiTurn();
  });
  $("#message").text("Click in bottom grid to fire at a location.");
}

/**
 * Prompts player to place ships on the board.
 */
function placePlayerShips() {
  placePlayerShip("aircraft carrier", 5, function() {
    placePlayerShip("battleship", 4, function() {
      placePlayerShip("submarine", 3, function() {
        placePlayerShip("destroyer", 3, function() {
          placePlayerShip("patrol boat", 2, play);
        });
      });
    });
  });
}

$(document).ready(function() {
  initializeGridModel(playerGrid, null);
  initializeGridModel(aiGrid, null);
  initializeGridModel(aiAttackGrid, 1);
  initializeGridView($("#player-grid"));
  playerGridCells = $("#player-grid td");
  placeAIShips();
  placePlayerShips();
});