import './style.css'

const rows = 16;
const cols = 16;

let playing = false;
let timer;
let reproductionTime = 100;

let grid = initGrid(rows, cols, 0);
let nextGrid = initGrid(rows, cols, 0);

/**
 * Creates and initiazes a grid with given value
 * @param {Number} rows Number of rows
 * @param {Number} cols Number of columns
 * @param {Number} val value to initialize with
 */
function initGrid(rows, cols, val) {
	return Array(rows).fill().map(() => Array(cols).fill(val));
}

function resetGrids() {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			grid[i][j] = 0;
			nextGrid[i][j] = 0;
		}
	}
}

/**
 * Copy nextGrid to grid, and reset nextGrid
 */
function copyAndResetGrid() {
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			grid[i][j] = nextGrid[i][j];
			nextGrid[i][j] = 0;
		}
	}
}

// initilize game of life
function initilize() {
	createTable();
	setUpControlButtons();
}

// lay out the board
function createTable() {
	const gridContainer = document.getElementById("gridContainer");
	if (!gridContainer) {
		console.error("Problem: no grid available");
	}
	const table = document.createElement("table");

	for (let row = 0; row < rows; row++) {
		const tr = document.createElement("tr");
		for (let col = 0; col < cols; col++) {
			const cell = document.createElement("td");
			cell.setAttribute("id", row + "_" + col)
			cell.setAttribute("class", "dead");
			cell.onclick = function () {
				let rowCol = this.id.split("_");
				let row = rowCol[0];
				let col = rowCol[1];

				const classes = this.getAttribute("class");
				if (classes.indexOf("live") > -1) {
					this.setAttribute("class", "dead");
					grid[row][col] = 0;
				} else {
					this.setAttribute("class", "live");
					grid[row][col] = 1;
				}
			};
			tr.appendChild(cell);
		}
		table.appendChild(tr);
	}
	gridContainer.appendChild(table);
}

function updateView() {
	grid.forEach((row, i) => {
		row.forEach((col, j) => {
			const cell = document.getElementById(i + "_" + j);
			if (col === 0) {
				cell.setAttribute("class", "dead");
			} else {
				cell.setAttribute("class", "live");
			}
		});
	});
}

function setUpControlButtons() {
	const startButton = document.getElementById("start");
	startButton.onclick = startButtonHandler;

	const clearButton = document.getElementById("clear");
	clearButton.onclick = clearButtonHandler;
}

function clearButtonHandler() {
	playing = false;
	const startButton = document.getElementById("start");
	startButton.innerHTML = "start";
	clearTimeout(timer);

	const liveCells = document.getElementsByClassName("live");
	// convert to array first, otherwise, working on a live node list won't update
	var cells = [];
	for (const cell of liveCells) {
		cells.push(cell);
	}
	for (const cell of cells) {
		cell.setAttribute("class", "dead");
	}
	resetGrids();
}

function startButtonHandler() {
	// start/pause/continue the game
	if (playing) {
		playing = false;
		this.innerHTML = "continue";
		clearTimeout(timer);
	} else {
		playing = true;
		this.innerHTML = "pause";
		play();
	}
}

/**
 * Run the Game of Life
 */
function play() {
	computeNextGen();
	if (playing) {
		timer = setTimeout(play, reproductionTime);
	}
}
/**
 * Computes which cells will live for next generations
 */
function computeNextGen() {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			applyRules(i, j);
		}
	}
	// copy nextGrid to grid, and reset nextGrid
	copyAndResetGrid();

	// copy all 1 values to "live" in the table
	updateView();
}

/**
 * 1.Any live cell with fewer than two live neighbours dies, as if caused by under-population.
 * 2.Any live cell with two or three live neighbours lives on to the next generation.
 * 3.Any live cell with more than three live neighbours dies, as if by overcrowding.
 * 4.Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 * 
 * These four rules decide the logic for the game
 * @param {Number} row 
 * @param {Number} col 
 */
function applyRules(row, col) {
	const numNeighbors = countNeighbors(row, col);
	if (grid[row][col] == 1) {
		if (numNeighbors < 2) {
			nextGrid[row][col] = 0;
		} else if (numNeighbors == 2 || numNeighbors == 3) {
			nextGrid[row][col] = 1;
		} else if (numNeighbors > 3) {
			nextGrid[row][col] = 0;
		}
	} else if (grid[row][col] == 0) {
		if (numNeighbors == 3) {
			nextGrid[row][col] = 1;
		}
	}
}

/**
 * Counts the number of neighbors of a cell
 * @param {Number} row 
 * @param {Number} col 
 */
function countNeighbors(row, col) {
	let count = 0;
	if (row - 1 >= 0) {							//top left
		if (grid[row - 1][col] == 1) { count++; }
	}
	if (row - 1 >= 0 && col - 1 >= 0) {				//top
		if (grid[row - 1][col - 1] == 1) { count++; }
	}
	if (row - 1 >= 0 && col + 1 < cols) {			//top right
		if (grid[row - 1][col + 1] == 1) { count++; }
	}
	if (col - 1 >= 0) {							//left
		if (grid[row][col - 1] == 1) { count++; }
	}
	if (col + 1 < cols) {							//right
		if (grid[row][col + 1] == 1) { count++; }
	}
	if (row + 1 < rows) {							//bottom
		if (grid[row + 1][col] == 1) { count++; }
	}
	if (row + 1 < rows && col - 1 >= 0) {
		if (grid[row + 1][col - 1] == 1) { count++; }
	}
	if (row + 1 < rows && col + 1 < cols) {			//bottom right
		if (grid[row + 1][col + 1] == 1) { count++; }
	}
	return count;
}

window.onload = initilize;
