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

Board.prototype.clickelement = function (i) {
    var check = this.board[i].click();
    var siblings = this.siblings(i);

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
            totalmines += this.board[siblings[k]].check() ? 1 : 0;

        //set the totalmines adjacent to the block
        this.board[i].settotal(totalmines);

        //recurse through clicking the siblings if no mines found
        if (totalmines == 0) {
            for (var l = 0; l < siblings.length; l++) {
                this.clickelement(siblings[l]);
            }
        }
    }
    else if (check == 2) //already been clicked
    {
        //check if flags == number 
        var flags = 0;

        for (var m = 0; m < siblings.length; m++) {
            flags += siblings[m].isflagged() ? 1 : 0;
        }
        //click on all the guys next to it if that is the case
        if (flags == this.board[i].gettotal()) {
            for (var n = 0; n < siblings.length; n++) {
		var pos = siblings[n].x + siblings[n].y * this.width;
                if (!this.board[pos].isclicked())
                    this.clickelement(pos);
            }
        }
    }

    //redraw this block
    draw(i);

    //did they win?
    if (this.mines == this.length - this.clicked)
        return true;

    //did they lose?
    if (this.lost)
        return false;
    
    //did they neither win nore lose?
    return null;
};

Board.prototype.siblings = function(k)
{
    var siblings = new Array();
    var sibcount = 0;

    //i have to look at this like a square now
    var x = k % this.width;
    var y = Math.floor(k / board.width); 

    for (var i = -1; i <= 1; i++){
	for (var j = -1; j <= 1; j++){
	    if (!(i == 0 && j == 0) && (x + i >= 0 && x + i < this.width) && (y + j >= 0 && y + j < this.height)){
		siblings[sibcount] = i + j * this.width; //ok back to being 1 dimensional
		sibcount++;
	    }
	}
    }
    return siblings;
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
            this.clickelement(i);
    }
    this.lost = true;
};

Board.prototype.countflags = function () {
    var flags = 0;
    for (var i = 0; i < this.length; i++) {
        flags += board.board[i].isflagged() ? 1 : 0;
    }
    return flags;
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
    board = new Board(width, height, mines);
    size = blocksize;

    var container = document.getElementById("container");

    //make it the right size
    container.style.width = pixels(board.width * size);

    //make the board
    for (var i = 0; i < board.length; i++) {
        var elem = document.createElement("div");
        elem.style.width = pixels(size);
        elem.style.height = pixels(size);
        elem.style.display = "block";
        elem.style.float = "left";
        elem.id = i;
        elem.oncontextmenu = rightclick(elem.id);
        elem.onclick = leftclick(elem.id);
        container.appendChild(elem);
    }

    //place the timer and mine counter - outside of container so it doesnt get treated like a mine
    elem = document.createElement("div");
    elem.id = "data";
    elem.style.width = board.width * size;

    var elem2 = document.createElement("div");
    elem2.id = "time";
    elem.appendChild(elem2);

    elem2 = document.createElement("div"); 
    elem2.id = "mines";
    elem.appendChild(elem2);

    elem2 = document.createElement("div");
    elem2.id = "message";
    elem.appendChild(elem2);

    container.parentNode.appendChild(elem);
    redraw();
}

function redraw() {
    //set styles for the grid based on the properties of the blocks
    var child = document.getElementById("container").firstChild;
    while (child != null) {
        child.style.backgroundSize = pixels(size) + " " + pixels(size);   
        draw(child.id);  
        child = child.nextSibling;
    }
}

function draw(i) {
    var identifier = board.board[i].tostring();
    document.getElementById(i).style.backgroundImage = chooseimage(identifier);
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
    default:
	return null;//this should never happen
    }
}

function rightclick(id) {
    return function () {
        board.board[parseInt(id)].next();
        draw(parseInt(id));
        return false;
    };
}

function leftclick(id) {
    return function () {
        var winner = board.clickelement(parseInt(id));
        if (!playing) //start the timer on first click
        {
            timer = window.setInterval(addhundredths, 10);
            playing = true;
        }

        if (winner || winner == false) {
            window.clearInterval(timer); //stop the timer
            displaywinlose(winner);
        }
    };
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

function displaywinlose(winner) {
    var message;

    if (winner)
    {
        message = "YOU WON! Time: " + humantime();    
    }
    else
        message = "TOO BAD :(";

    var msg = document.getElementById("message");
    msg.innerHTML = "<p>" + message + "</p>";
    msg.style.float = "left";
}

function pixels(number) {
    return number.toString() + "px";
}
