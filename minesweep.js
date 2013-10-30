//the board
var board;
var size = 25;
var playing = false;
var time = 0;
var timer;

//make the board
function Board(width, height, mines) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.board = new Array();
    this.length = width * height;
    this.clicked = 0;
    this.lost = false;
    
    var i = 0;
    for (i ; i < mines; i++)
	    this.board[i] = new Cell(true);
    
    for (i ; i < this.length; i++)
	    this.board[i] = new Cell(false);
    
    shuffleArray(this.board);
}

Board.prototype.clickelement = function (x, y) {
    var check = this.doelement(x, y, Cell.prototype.click);
    var siblings = this.siblings(x, y);

    if (check == 1) //we have a mine
    {
        this.clickmines();
        return false;
    }
    else if (check == 0) //we have no mine
    {
        this.clicked++;

        var totalmines = 0;
        //check siblings for mines
        for (var k = 0; k < siblings.length; k++)
            totalmines += this.doelement(siblings[k].x, siblings[k].y, Cell.prototype.check) ? 1 : 0;

        //set the totalmines adjacent to the block
        this.setelementtotal(x, y, totalmines);

        //recurse through clicking the siblings if no mines found
        if (totalmines == 0) {
            for (var l = 0; l < siblings.length; l++) {
                this.clickelement(siblings[l].x, siblings[l].y);
            }
        }
    }
    else if (check == 2) //already been clicked
    {
        //check if flags == number 
        var flags = 0;

        for (var m = 0; m < siblings.length; m++) {
            flags += this.doelement(siblings[m].x, siblings[m].y, Cell.prototype.isflagged) ? 1 : 0;
        }
        //click on all the guys next to it if that is the case
        if (flags == this.doelement(x, y, Cell.prototype.gettotal)) {
            for (var n = 0; n < siblings.length; n++) {
                if (!this.doelement(siblings[n].x, siblings[n].y, Cell.prototype.isclicked))
                    this.clickelement(siblings[n].x, siblings[n].y);
            }
        }
    }

    //did they win?
    if (this.mines == this.length - this.clicked)
        return true;

    //did they lose?
    if (this.lost)
        return false;

    //redraw this block
    draw(x, y);
    return null;
};

Board.prototype.siblings = function(x,y)
{
       var siblings = new Array();
	    var sibcount = 0;
	    for (var i = -1; i <= 1; i++){
		    for (var j = -1; j <= 1; j++){
		        if (!(i == 0 && j == 0) && (x + i >= 0 && x + i < this.width) && 	(y + j >= 0 && y + j < this.height)){
			        siblings[sibcount] = {x: x + i,y: y + j};
			        sibcount++;
		        }
		    }
	    }
    return siblings;
};

Board.prototype.setelementtotal = function(x,y, total)
{
    this.board[x + y*this.width].settotal(total);
};

Board.prototype.elementnext = function(x, y)
{
    this.doelement(x,y, Cell.prototype.next);
};

Board.prototype.print = function()
{
    var output = "\n";

    for (var i = 0; i < this.length; i++)
    {
	output += this.board[i].tostring();
	output += (i + 1) % this.width == 0? "\n" : "";
    }
    return output;
};

Board.prototype.clickmines = function () {
    for (var i = 0; i < this.length; i++) {
        if (this.board[i].check())
            this.clickelement(i % board.width, Math.floor(i / board.width));
    }
    this.lost = true;
};

Board.prototype.countflags = function () {
    var flags = 0;
    for (var i = 0; i < this.length; i++) {
        flags += board.board[i].isflagged() ? 1 : 0;
    }
    return flags;
}

//interface to methods of the little dudes
Board.prototype.doelement = function(x,y,func)
{
    var cell = x + y * this.width;
    return func.call(this.board[cell]);
};

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//A minesweeper cell
function Cell(mine)
{
    this.mine = mine;
    this.status = 0; //0 - nothing; 1 - flag; 2 - questionmark
    this.clicked = false;
    this.totalmines = 0;
}

Cell.prototype.tostring = function(){
    if (this.status == 1)
	    return "[F]";
    else if (this.clicked)
	    return "{" + (this.mine? "*" : (this.totalmines == 0? " ": this.totalmines)) + "}";
     else if (this.status == 2)
	    return "[?]";
    else
	    return "[ ]";	
};

Cell.prototype.settotal = function(total)
{
    this.totalmines = total;
};

Cell.prototype.gettotal = function()
{
    return this.totalmines;
};

Cell.prototype.next = function() {
    if (!this.clicked){    
	    this.status = (this.status + 1) % 3;
    }
};

Cell.prototype.click = function(){
    if (this.status != 1 && !this.clicked)
    {
	    this.clicked = true;
	    return this.mine? 1 : 0;
    }
        else if (this.clicked == true)
	    return 2;
    else 
    	return 3;
};

Cell.prototype.check = function() {
    return this.mine;
};

Cell.prototype.isflagged = function(){
    return this.status == 1;
};

Cell.prototype.isclicked = function(){
    return this.clicked;
};

function setup(width, height, mines, blocksize) {
    var width = width;
    var height = height;
    var mines = mines;
    board = new Board(width, height, mines);
    size = blocksize;

    var container = document.getElementById("container");
    //clear the container - not necessary anymore but im leaving this here j.i.c.
    while (container.firstChild) {
        container.removeChild(box.firstChild);
    }

    //make it the right size
    container.style.width = pixels(board.width * size);

    //make the board
    for (var i = 0; i < board.length; i++) {
        var elem = document.createElement("div");
        elem.style.width = pixels(size);
        elem.style.height = pixels(size);
        elem.style.display = "block";
        elem.style.float = "left";
        elem.id = i % board.width + "," + Math.floor(i / board.width);
        elem.oncontextmenu = rightclick(elem.id);
        elem.onclick = leftclick(elem.id);
        container.appendChild(elem);
    }

    //place the timer and mine counter
    elem = document.createElement("div");
    elem.id = "data";
    elem.style.width = board.width * size;

    var elem2 = document.createElement("div");
    elem2.id = "time";
    elem.appendChild(elem2);

    elem2 = document.createElement("div"); 
    elem2.id = "mines";
    elem.appendChild(elem2);

    container.parentNode.appendChild(elem);
    redraw();
}

function redraw() {
    //set styles for the grid based on the properties of the blocks
    var child = document.getElementById("container").firstChild;
    while (child != null) {
        child.style.backgroundSize = pixels(size) + " " + pixels(size);
        var coords = child.id.split(",");    
        draw(parseInt(coords[0]), parseInt(coords[1]));  
        child = child.nextSibling;
    }
}

function draw(x,y) {
    var identifier = board.doelement(x, y, Cell.prototype.tostring)
    document.getElementById(x + "," + y).style.backgroundImage = chooseimage(identifier);
}

function chooseimage(identifier) {
    switch (identifier) {
        case "{*}":
            return "url(images/mine.png)";
        case "{ }":
            return "url(images/empty.png)";
        case "{1}":
            return "url(images/1.png)";
        case "{2}":
            return "url(images/2.png)";
        case "{3}":
            return "url(images/3.png)";
        case "{4}":
            return "url(images/4.png)";
        case "{5}":
            return "url(images/5.png)";
        case "{6}":
            return "url(images/6.png)";
        case "{7}":
            return "url(images/7.png)";
        case "{8}":
            return "url(images/8.png)";
        case "[ ]":
            return "url(images/sweep.png)";
        case "[F]":
            return "url(images/flag.png)";
        case "[?]":
            return "url(images/qmark.png)";
    }
}

function pixels(number) {
    return number.toString() + "px";
}

function rightclick(id) {
    var coords = id.split(",");
    return function () {
        board.elementnext(parseInt(coords[0]), parseInt(coords[1]));
        draw(parseInt(coords[0]), parseInt(coords[1]));
        return false;
    }
}

function leftclick(id) {
    var coords = id.split(",");
    return function () {
        var winner = board.clickelement(parseInt(coords[0]), parseInt(coords[1]));
        if (!playing) //start the timer on first click
        {
            timer = window.setInterval(addhundredths, 10);
            playing = true;
        }

        if (winner || winner == false) {
            window.clearInterval(timer); //stop the timer
            winner ? alert("YOU WON! Time: " + humantime()) : alert("TOO BAD :(");
        }
    }
}

function addhundredths() {
    time += 1;
    if (time % 10 == 0) {     
        document.getElementById("time").innerHTML = humantime();
        document.getElementById("mines").innerHTML = board.mines - board.countflags();
    }
}

function humantime() {
    var minutes = Math.floor(Math.floor(time / 100) / 60);
    var seconds = Math.floor(time / 100) % 60;
    var hundredths = time % 100;
    return minutes + ":" + seconds + ":" + hundredths;
}