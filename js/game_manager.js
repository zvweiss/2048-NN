function GameManager(size, InputManager, Actuator) {
  this.size = size; // Size of the grid
  this.inputManager = new InputManager();
  this.actuator = new Actuator();

  this.running = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on(
    "think",
    function () {
      var best = this.ai.getBest();

      this.actuator.showHint(best.move);

      // this.printGrid(this.grid);
      // turn++;
    
      // let d = ["up", "right", "down", "left"];
      // console.log("" + turn + ": " + d[best.move] + ": " + best.moves.toString());

    }.bind(this)
  );

  this.inputManager.on(
    "run",
    function () {
      if (this.running) {
        this.running = false;
        this.actuator.setRunButton("Auto-run");
      } else {
        this.running = true;
        this.run();
        this.actuator.setRunButton("Stop");
      }
    }.bind(this)
  );

  this.setup();
};

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton("Auto-run");
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai = new AI(this.grid);

  this.score = 0;
  this.over = false;
  this.won = false;

  // Update the actuator
  this.actuate();
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    won: this.won,
  });
};

// makes a given move and updates state
GameManager.prototype.move = function (direction) {

  var result = this.grid.move(direction);

  if (!result.moved) return false;

  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  this.printGrid(this.grid);
  turn++;

  var best = this.ai.getBest();

  let d = ["up", "right", "down", "left"];
  console.log("" + turn + ": " + d[best.move] + ": " + best.moves.toString());

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
  return true;
};

GameManager.prototype.printGrid = function (g) {
  let cells = g.cells;
  var rows = [
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ];
  for (let i = 0; i < 4; i++) {
    let tiles = cells[i];
    let aRow = "";
    for (let j = 0; j < 4; j++) {
      let aTile = cells[i][j];
      //let aTile = tiles[j];
      if (aTile) {
        rows[aTile.y][aTile.x] += ("    " + aTile.value.toString()).slice(-5);
      } else {
        rows[j][i] = "    _";
      }
    }
    //console.log(aRow);
  }
  for (let ii = 0; ii < 4; ii++) {
    let aRow = "";
    for (let jj = 0; jj < 4; jj++) {
      aRow += rows[ii][jj];
    }
    console.log(aRow);
  }
};

// moves continuously until game is over
GameManager.prototype.run = function () {
  var best = this.ai.getBest();

  // console.log("" + turn);
  // turn++;

  this.printGrid(this.grid);
  turn++;

  let d = ["up", "right", "down", "left"];
  console.log("" + turn + ": " + d[best.move] + ": " + best.moves.toString());

  for (var i = 0; i < 4; i++) {
    var m = best.moves[i];
    if (this.move(m)) break;
  }
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function () {
      self.run();
    }, timeout);
  }
};
