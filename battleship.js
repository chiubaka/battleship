/**
 * Created by dchiu on 2/15/15.
 */

/**
 * Size of the grid. Probably shouldn't be changed from 10 for standard battleship.
 * @type {number}
 */
var BATTLESHIP_GRID_SIZE = 10;

/**
 * A list of the player's ship objects. Not currently used in any kind of clever way, but could be
 * used so that the AI can heuristically not shoot at locations where there is not enough space for
 * a remaining player ship. However, since this logic is not learning, per se, I didn't focus my
 * time on it.
 */
var playerShips;
/**
 * Keeps track of the number of player ships that still have life.
 */
var playerShipsRemaining;
/**
 * Keeps track of the locations where the player places ships across games.
 */
var playerShipsHistogram;
/**
 * Keeps track of the locations where the player attacks across games. Currently not used to do
 * anything clever with the AI, but could be used to smartly place the AI's ships on the board.
 */
var playerAttacksHistogram;
/**
 * A list of the AI's ship objects.
 */
var aiShips;
var aiShipsRemaining;
/**
 * Keeps track of the state of the player's grid. There is some duplicated info between playerShips
 * and playerGrid, but playerShips is useful to make it easy to tell which ships are left, and
 * playerGrid makes it easy to tell if a location contains a ship.
 * @type {Array}
 */
var playerGrid = [];
/**
 * Keeps track of the state of the AI's grid and where its ships are placed.
 * @type {Array}
 */
var aiGrid = [];
/**
 * A weighted grid that helps the AI determine which locations are of highest value.
 */
var aiAttackGrid;

/**
 * Sets up the UI grid and the internal grid model for the game.
 */
function initializeGridView(gridSelector) {
  gridSelector.empty();
  for (var i = 0; i < BATTLESHIP_GRID_SIZE; i++) {
    var row = $("<tr/>");
    for (var j = 0; j < BATTLESHIP_GRID_SIZE; j++) {
      row.append("<td data-col=" + j + " data-row=" + i + "/>");
    }
    gridSelector.append(row);
  }
}

/**
 * Returns a grid that is BATTLESHIP_GRID_SIZE x BATTLESHIP_GRID_SIZE with the given initialValue
 * as the value in each grid location.
 * @param initialValue
 * @returns {Array}
 */
function initializeGridModel(initialValue) {
  var grid = [];
  for (var i = 0; i < BATTLESHIP_GRID_SIZE; i++) {
    var gridCol = [];
    for (var j = 0; j < BATTLESHIP_GRID_SIZE; j++) {
      gridCol.push({state: initialValue});
    }
    grid.push(gridCol);
  }
  return grid;
}

/**
 * Ends the game and displays a message. Shows the play again button.
 * @param message
 */
function gameOver(message) {
  $("#message").text("Game over. " + message);
  $("#play-again-button").show();
  $("td").unbind("click");
}

/**
 * Checks to see if the game is over.
 */
function checkForGameOver() {
  if (aiShipsRemaining === 0) {
    gameOver("You win!");
  }
  else if (playerShipsRemaining === 0) {
    gameOver("You lose.");
  }
}

/**
 * Gets the jQuery object for the cell at the given column and row.
 * @param col
 * @param row
 * @returns {*|jQuery|HTMLElement}
 */
function getPlayerGridCell(col, row) {
  return $(playerGridCells[row * BATTLESHIP_GRID_SIZE + col]);
}

/**
 * Given a ship, calls the callback function once with each location that the ship occupies.
 * @param ship
 * @param callback
 */
function forEachShipLocation(ship, callback) {
  var locations = locationsForShip(ship);

  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    if (callback(location)) {
      break;
    }
  }
}

/**
 * Given a ship, returns a list of all of the board locations that ship occupies.
 * @param ship
 * @returns {Array}
 */
function locationsForShip(ship) {
  var locations = [];
  var startCol = ship.startCol;
  var startRow = ship.startRow;
  var length = ship.length;
  if (ship.vertical) {
    for (var row = startRow; row < startRow + length; row++) {
      locations.push({col: startCol, row: row});
    }
  }
  else {
    for (var col = startCol; col < startCol + length; col++) {
      locations.push({col: col, row: startRow});
    }
  }

  return locations;
}

/**
 * Updates the UI to display the given ship.
 * @param ship
 */
function drawShip(ship) {
  forEachShipLocation(ship, function(location) {
    getPlayerGridCell(location.col, location.row).removeClass().addClass("ship");
  });
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

  var returnValue = true;
  forEachShipLocation(ship, function(location) {
    if (grid[location.col][location.row].state !== null) {
      returnValue = false;
    }

    // Return true to break out of forEachShipLocation early.
    return true;
  });

  return returnValue;
}

/**
 * Places a ship in the given grid model.
 * @param ship
 * @param grid
 * @todo Consider combining this with the drawShip() function.
 */
function placeShipInGrid(ship, grid) {
  forEachShipLocation(ship, function(location) {
    grid[location.col][location.row].state = ship;
  });
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
        hits: 0,
        vertical: startCol === endCol
      };
      playerShips.push(ship);
      drawShip(ship);
      placeShipInGrid(ship, playerGrid);
      updatePlayerShipsHistogram(ship);
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
    hits: 0,
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

/**
 * Figures out what location the AI should attack.
 */
function aiTurn() {
  var maxValue = 0;
  var maxLocations = [];
  for (var col = 0; col < BATTLESHIP_GRID_SIZE; col++) {
    for (var row = 0; row < BATTLESHIP_GRID_SIZE; row++) {
      var value = aiAttackGrid[col][row].state;

      if (value > maxValue) {
        maxValue = value;
        maxLocations = [{col: col, row: row}];
      }
      else if (value === maxValue) {
        maxLocations.push({col: col, row: row});
      }
    }
  }

  // Nothing to do if maximum value is 0. Actually, this would probably be a bug!
  if (maxValue === 0) {
    console.warn("Maximum value on AI turn was 0.");
    return;
  }

  // Randomly retrieve one of the best locations to attack.
  var index = getRandomInt(0, maxLocations.length - 1);
  var locationToAttack = maxLocations[index];

  // Since we've already attacked this location, 0 out its value so that it can't be attacked again.
  aiAttackGrid[locationToAttack.col][locationToAttack.row].state = 0;

  if (playerGrid[locationToAttack.col][locationToAttack.row].state !== null) {
    getPlayerGridCell(locationToAttack.col, locationToAttack.row).removeClass().addClass("hit");
    var ship = playerGrid[locationToAttack.col][locationToAttack.row].state;
    ship.hits++;
    if (ship.hits === ship.length) {
      playerShipsRemaining--;
      checkForGameOver();
    }
  }
  else {
    getPlayerGridCell(locationToAttack.col, locationToAttack.row).addClass("miss");
  }
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
    playerAttacksHistogram[col][row].state += 1;
    if (aiGrid[col][row].state === null) {
      $(this).addClass("miss");
    }
    else {
      $(this).addClass("hit");
      var ship = aiGrid[col][row].state;
      ship.hits++;
      if (ship.hits === ship.length) {
        aiShipsRemaining--;
        checkForGameOver();
      }
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

/**
 * Updates the AI attack grid weights based on the frequency with which the player has place his/her
 * ships in locations on the board.
 */
function updateAiAttackGrid() {
  for (var col = 0; col < BATTLESHIP_GRID_SIZE; col++) {
    for (var row = 0; row < BATTLESHIP_GRID_SIZE; row++) {
      aiAttackGrid[col][row].state += playerShipsHistogram[col][row].state;
    }
  }
}

/**
 * Adds one to the frequency of every grid space that the given ship occupies. This way the AI
 * is more likely to attack these locations.
 * @param ship
 */
function updatePlayerShipsHistogram(ship) {
  forEachShipLocation(ship, function(location) {
    playerShipsHistogram[location.col][location.row].state += 1;
  });
}

/**
 * Resets the game so that it can be played from the beginning.
 */
function resetGame() {
  playerShipsRemaining = 5;
  aiShipsRemaining = 5;
  playerShips = [];
  aiShips = [];
  playerGrid = initializeGridModel(null);
  aiGrid = initializeGridModel(null);
  aiAttackGrid = initializeGridModel(1);
  updateAiAttackGrid();
  initializeGridView($("#player-grid"));
  $("#play-again-button").hide();
  $("#player-attack-grid").empty();
  playerGridCells = $("#player-grid td");
  placeAIShips();
  placePlayerShips();
}

$(document).ready(function() {
  playerAttacksHistogram = initializeGridModel(0);
  playerShipsHistogram = initializeGridModel(0);
  $("#play-again-button").click(resetGame);
  resetGame();
});