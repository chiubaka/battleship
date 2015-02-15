/**
 * Created by dchiu on 2/15/15.
 */

/**
 * Size of the grid. Probably shouldn't be changed from 10 for standard battleship.
 * @type {number}
 */
var BATTLESHIP_GRID_SIZE = 10;

/**
 * Sets up the grid to battleship on.
 */
function initializeBattleshipGrid() {
  for (var i = 0; i < BATTLESHIP_GRID_SIZE; i++) {
    var row = $("<tr/>");
    for (var j = 0; j < BATTLESHIP_GRID_SIZE; j++) {
      row.append("<td width='50' height='50'/>");
    }
    $("#battleship-grid").append(row);
  }
}

$(document).ready(function() {
  initializeBattleshipGrid();
});