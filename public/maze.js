let socket = io();

let newText = document.getElementById('newText');

const nrows = Math.floor(innerHeight / 65) - 6;
const ncols = Math.floor(innerWidth / 65) - 1;
const burger = `<img src="lotion.png" height="27px" width="27px"></img>`;
const cat = `<img src='virus.png' height="27px" width="27px"></img>`
console.log('maze works')
function createCells() {
	for (let i = 0; i < nrows; i++) {
		let row = document.createElement("div");
		row.classList.add("row");
		if (i === 0) row.classList.add("first-row");
		document.body.appendChild(row);

		for (let j = 0; j < ncols; j++) {
			let col = document.createElement("div");
			col.classList.add("cell");
			if (j === 0) col.classList.add("first-col");
			row.appendChild(col);
		}
	}
}

createCells();
document.body.innerHTML += `
	<div class="container">
		<div class="direction-button top-margin"><i class="fas fa-caret-up"></i></div>
		<div class="middle-row">
			<div class="direction-button"><i class="fas fa-caret-left"></i></div>
			<div class="direction-button"><i class="fas fa-caret-right"></i></div>
		</div>
		<div class="direction-button"><i class="fas fa-caret-down"></i></div>
	</div>
`;

class Cell {
	constructor(i, j) {
		this.r = i;
		this.c = j;

		this.neighbors = [];
		this.walls = [true, true, true, true]; //Top Right Bottom Left
		this.visited = false;
	}
	show() {
		if (!this.walls[0])
			cellElements[this.r * ncols + this.c].style["border-top"] = "none";
		if (!this.walls[1])
			cellElements[this.r * ncols + this.c].style["border-right"] = "none";
		if (!this.walls[2])
			cellElements[this.r * ncols + this.c].style["border-bottom"] = "none";
		if (!this.walls[3])
			cellElements[this.r * ncols + this.c].style["border-left"] = "none";

		if (this.visited)
			cellElements[this.r * ncols + this.c].style.background = "#ff3388";
	}
	createNeighbors() {
		if (this.r > 0) this.neighbors.push(grid[(this.r - 1) * ncols + this.c]); //Top
		if (this.c < ncols - 1)
			this.neighbors.push(grid[this.r * ncols + (this.c + 1)]); //Right
		if (this.r < nrows - 1)
			this.neighbors.push(grid[(this.r + 1) * ncols + this.c]); //Bottom
		if (this.c > 0) this.neighbors.push(grid[this.r * ncols + (this.c - 1)]); //Left
	}
	fix() {
		if (!this.walls[1] && !this.walls[2])
			cellElements[this.r * ncols + this.c].classList.add("bottomRightCorner");
	}
}

function fillGrid() {
	for (let i = 0; i < nrows; i++) {
		for (let j = 0; j < ncols; j++) {
			grid.push(new Cell(i, j));
		}
	}
	for (let i = 0; i < nrows; i++) {
		for (let j = 0; j < ncols; j++) {
			grid[i * ncols + j].createNeighbors();
		}
	}
}

let cellElements = document.querySelectorAll(".cell");
let grid = [];
fillGrid();

let current = grid[0];
let stack = [];
let play = false;
let goal = grid[nrows * ncols - 1];
let drawLoop = setInterval(animate, 8);
let canAnimate = true;
let popUps = [];

//Maze Generator Algorithm
function BacktrackingDFS() {
	cellElements[current.r * ncols + current.c].style.background = "#5429e3";
	if (!current.visited) {
		current.visited = true;
		stack.push(current);
	}

	let unvisited = [];
	for (let neigh of current.neighbors) {
		if (!neigh.visited) {
			unvisited.push(neigh);
		}
	}

	if (unvisited.length > 0) {
		let randomIndex = Math.floor(Math.random() * unvisited.length);
		let next = unvisited[randomIndex];

		//Remove Walls
		if (current.r - next.r === 1) {
			//TOP
			current.walls[0] = false;
			next.walls[2] = false;
		} else if (current.c - next.c === -1) {
			//RIGHT
			current.walls[1] = false;
			next.walls[3] = false;
		} else if (current.r - next.r === -1) {
			//BOTTOM
			current.walls[2] = false;
			next.walls[0] = false;
		} else if (current.c - next.c === 1) {
			//LEFT
			current.walls[3] = false;
			next.walls[1] = false;
		}

		current = next;
	} else if (stack.length > 0) {
		current = stack.pop();
	} else {
		clearInterval(drawLoop);
		play = true;
		cellElements[current.r * ncols + current.c].style.background = "#5429e3";
		cellElements[goal.r * ncols + goal.c].innerHTML = burger;
		cellElements[current.r * ncols + current.c].innerHTML = cat;
	}
}

function animate() {
	for (let i = 0; i < nrows; i++) {
		for (let j = 0; j < ncols; j++) {
			grid[i * ncols + j].show();
		}
	}
	for (let i = 0; i < nrows; i++) {
		for (let j = 0; j < ncols; j++) {
			grid[i * ncols + j].fix();
		}
	}
	BacktrackingDFS();
}

// GAME PLAY PHASE BEGINS HERE
let btn = document.querySelector(".generate-maze");
btn.addEventListener("click", function () {
	clearInterval(drawLoop);
	for (let popUp of popUps) {
		popUp.style.display = "none";
	}
	for (let i = 0; i < nrows; i++) {
		for (let j = 0; j < ncols; j++) {
			cellElements[i * ncols + j].removeAttribute("style");
			cellElements[i * ncols + j].classList.remove("bottomRightCorner");
			cellElements[i * ncols + j].innerHTML = "";
		}
	}
	grid = [];
	fillGrid();
	current = grid[0];
	stack = [];
	play = false;
	goal = grid[nrows * ncols - 1];
	if (canAnimate) drawLoop = setInterval(animate, 50);
	else {
		while (!play) {
			animate();
		}
	}
});

let checkbox = document.querySelector(".checkbox");
checkbox.addEventListener("click", function () {
	if (checkbox.innerHTML.includes("check"))
		checkbox.innerHTML = `<i class="fas fa-times"></i>`;
	else checkbox.innerHTML = `<i class="fas fa-check"></i>`;
	canAnimate = !canAnimate;
});

let directionButtons = document.querySelectorAll(".direction-button");

for (let k = 0; k < directionButtons.length; k++) {
	directionButtons[k].addEventListener("mousedown", function () {
		if (play) {
			cellElements[current.r * ncols + current.c].innerHTML = ``;
			if (k == 0) upArrowPressed();
			if (k == 1) leftArrowPressed();
			if (k == 2) rightArrowPressed();
			if (k == 3) downArrowPressed();
			cellElements[current.r * ncols + current.c].innerHTML = cat;
			checkWin();
		}
	});
}

document.body.addEventListener("keydown", function (event) {
	if (play) {
		cellElements[current.r * ncols + current.c].innerHTML = ``;
		if (event.key === "ArrowUp") upArrowPressed();
		if (event.key === "ArrowLeft") leftArrowPressed();
		if (event.key === "ArrowRight") rightArrowPressed();
		if (event.key === "ArrowDown") downArrowPressed();
		cellElements[current.r * ncols + current.c].innerHTML = cat;
		checkWin();
	}
});

socket.on('arduino data', (data)=>{
	console.log(data);
	if (play) {
		cellElements[current.r * ncols + current.c].innerHTML = ``;
	if (data == 2) upArrowPressed()
	if (data == 3) {leftArrowPressed();}
	if (data == 4) {rightArrowPressed();}
	if (data == 1) {downArrowPressed();}
	cellElements[current.r * ncols + current.c].innerHTML = cat;
		checkWin();
}})

document.body.addEventListener("keyup", function (event) {
	for (let k = 0; k < directionButtons.length; k++) {
		directionButtons[k].classList.remove("highlight");
	}
});

document.body.addEventListener("mouseup", function (event) {
	for (let k = 0; k < directionButtons.length; k++) {
		directionButtons[k].classList.remove("highlight");
	}
});

function checkWin() {
	if (current === goal) {
		console.log("WON");
		play = false;
		victoryMessage();
	}
}
function upArrowPressed() {
	if (!current.walls[0]) current = grid[(current.r - 1) * ncols + current.c];
	directionButtons[0].classList.add("highlight");
}
function leftArrowPressed() {
	if (!current.walls[3]) current = grid[current.r * ncols + (current.c - 1)];
	directionButtons[1].classList.add("highlight");
}
function rightArrowPressed() {
	if (!current.walls[1]) current = grid[current.r * ncols + (current.c + 1)];
	directionButtons[2].classList.add("highlight");
}
function downArrowPressed() {
	if (!current.walls[2]) current = grid[(current.r + 1) * ncols + current.c];
	directionButtons[3].classList.add("highlight");
}

function victoryMessage() {
	popUps = [];
	for (let i = 0; i < 10; i++) {
		const popUp = document.createElement("span");
		popUp.classList.add("heart");
		popUp.innerHTML = `<i class="fas fa-heart"></i>`;

		popUp.style.top = Math.random() * 50 + 50 + "%";
		popUp.style.left = Math.random() * 100 + "%";
		popUp.style.fontSize = Math.random() * 10 + 5 + "px";

		popUps.push(popUp);
	}

	for (let i = 0; i < 10; i++) {
		setTimeout(function () {
			cellElements[(goal.r - 1) * ncols + goal.c].appendChild(popUps[i]);
			setTimeout(function () {
				popUps[i].remove();
			}, 2000);
		}, i * 100);
	}
}