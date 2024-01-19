class Ship {
    constructor(length) {
        this.length = length;
        this.hits = 0;
        this.sunk = false;
    };

    hit() {
        this.hits++;
        this.isSunk();
    };

    isSunk() {
        if (this.hits === this.length) 
            return this.sunk = true;
    };
};

class Gameboard {
    constructor() {
        this.board = {};
        this.ships = [];
        this.lastReceivedAttackInfo = null;
    };

    placeShip(ship, axis, initialCell) {
        // check if place is valid
        if (!this.isValidPlace(ship, axis, initialCell)) {
            return false;
        };

        // axis Y
        const row = initialCell[0];
        // axis X
        const col = initialCell[1];

        // place the ship on the board
        for (let index = 0; index < ship.length; index++) {
            if (axis === "row") {
                const key = `${row + index}, ${col}`;
                this.board[key] = ship;
            } else if (axis === "col") {
                const key = `${row}, ${col + index}`;
                this.board[key] = ship;
            };
        };

        this.ships.push(ship); // add the ship to the list of ships
    };

    isValidPlace(ship, axis, initialCell) {
        const row = initialCell[0];
        const col = initialCell[1];

        if (row > 9 || col > 9) {
            // return if it goes outside of the board
            return false;
        };

        for (let index = 0; index < ship.length; index++) {

            if (axis === "row") {
                if ((row + index) > 9) {
                    return false;
                };

                const key = `${row + index}, ${col}`;
                
                if (key in this.board) {
                    // the place isn't valid
                    return false;
                };
            } else if (axis === "col") {
                if ((col + index) > 9) {
                    return false;
                };

                const key = `${row}, ${col + index}`;
                
                if (key in this.board) {
                    return false;
                };
            };
        };

        return true;
    };

    receiveAttack(coordinates) {
        if (coordinates in this.board) {
            if (this.board[coordinates] === null || this.board[coordinates] === "hit") {
                // these coordinates were already attacked
                return false;
            };

            // attack found ship
            const ship = this.board[coordinates];
            ship.hit();

            // track succesfull attack
            this.lastReceivedAttackInfo = {"coordinates": coordinates, "result": "hit"};
            return this.board[coordinates] = "hit";
        } else {
            // track missed attack
            this.lastReceivedAttackInfo = {"coordinates": coordinates, "result": "null"};
            return this.board[coordinates] = null;
        };
    };

    isAllShipsSunk() {
        const ships = this.ships;

        for (let i = 0; i < ships.length; i++) {
            const ship = ships[i];

            if (ship.sunk === false) {
                // Return false if any ship is not sunk
                return false;
            };

            // Return true if all ships are sunk
            return true;
        };
    };
};

class Player {
    constructor(name, gameboard, isTurn) {
        this.name = name;
        this.gameboard = gameboard;
        this.isTurn = isTurn;
    };

    attack(enemy, coordinates) {
        return enemy.gameboard.receiveAttack(coordinates);
    };

    randomAttack(enemy) {
        let randomCoordinates;

        if (enemy.gameboard.lastReceivedAttackInfo !== null) {
            // when its null - means there are no received attacks yet
            if (enemy.gameboard.lastReceivedAttackInfo["result"] === "hit") {
                // if previous attack was succesfull - attack nearby coordinates
                randomCoordinates = this.generateNearbyCoordinates(enemy.gameboard.lastReceivedAttackInfo["coordinates"], enemy);
                return this.attack(enemy, randomCoordinates);
            }
        };

        do {
            randomCoordinates = this.generateRandomCoordinates();
        } while (!this.isValidMove(enemy.gameboard, randomCoordinates));

        return this.attack(enemy, randomCoordinates);
    };

    // run function below until there is no valid place for a ship and then place it
    findRandomPlaceForShip() {
        let randomCoordinates;
        const randomAxis = this.generateRandomAxis();

        do {
            randomCoordinates = this.generateRandomCoordinates();
        } while (!this.isValidMove(this.gameboard, randomCoordinates));

        // return this.gameboard.placeShip();
        const coordinatesArray = randomCoordinates.split(',').map(Number);
        return [randomAxis, coordinatesArray];
    };

    generateRandomCoordinates() {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        return `${row}, ${col}`;
    };

    generateNearbyCoordinates(center, enemy) {
        const [row, col] = center.split(",").map(Number);
        
        // Define the possible directions (up, down, left, right)
        const directions = [
            [-1, 0], // Up
            [1, 0],  // Down
            [0, -1], // Left
            [0, 1],  // Right
        ];
    
        // Shuffle the directions randomly
        const shuffledDirections = directions.sort(() => Math.random() - 0.5);
    
        // Try each direction until a valid coordinate is found
        for (const [rowOffset, colOffset] of shuffledDirections) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            const newCoordinates = `${newRow}, ${newCol}`;
    
            if (this.isValidMove(enemy.gameboard, newCoordinates)) {
                return newCoordinates;
            }
        }
    
        // If no valid nearby coordinate is found, fall back to generating a random one
        return this.generateRandomCoordinates();
    };

    // for random ship placement
    generateRandomAxis() {
        const random = Math.floor(Math.random() * 2);
        return random === 0 ? "row" : "col";
    };

    isValidMove(gameboard, coordinates) {
        if (coordinates in gameboard.board && gameboard.board[coordinates] === null) {
            // those coordinates were already attacked
            return false;
        } else if (coordinates in gameboard.board && gameboard.board[coordinates] === "hit") {
            // those coordinates were already attacked
            return false;
        };

        return true;
    };

    // from player to computer or vice versa
    changeTurn(from, to) {
        from.isTurn = false;
        to.isTurn = true;
    };
};

class Game {
    // add to constructor last attack info
    constructor(dom) {
        this.dom = dom;
        this.playerGameboard = null;
        this.computerGameboard = null;
        this.player = null;
        this.computer = null;
    };

    setUpNewGame() {
        this.createBoards();
        this.createPlayers();
        this.placeTheShips();
    };

    createBoards() {
        this.playerGameboard = new Gameboard();
        this.computerGameboard = new Gameboard();
    };

    createPlayers() {
        this.player = new Player("nickname", this.playerGameboard, true);
        this.computer = new Player("computer", this.computerGameboard, false);
    }

    placeTheShips() {
        const playerCarrier = new Ship(5);
        const playerBattleship = new Ship(4);
        const playerCruiser = new Ship(3);
        const playerSubmarine = new Ship(2);
        const playerDestroyer = new Ship(1);
    
        const computerCarrier = new Ship(5);
        const computerBattleship = new Ship(4);
        const computerCruiser = new Ship(3);
        const computerSubmarine = new Ship(2);
        const computerDestroyer = new Ship(1);

        this.placeRandomShip(playerCarrier, this.playerGameboard);
        this.placeRandomShip(playerBattleship, this.playerGameboard);
        this.placeRandomShip(playerSubmarine, this.playerGameboard);
        this.placeRandomShip(playerDestroyer, this.playerGameboard);
        this.placeRandomShip(playerCruiser, this.playerGameboard);

        this.placeRandomShip(computerCarrier, this.computerGameboard);
        this.placeRandomShip(computerBattleship, this.computerGameboard);
        this.placeRandomShip(computerCruiser, this.computerGameboard);
        this.placeRandomShip(computerSubmarine, this.computerGameboard);
        this.placeRandomShip(computerDestroyer, this.computerGameboard);
    };

    placeManualyShip() {
        // TODO
    };

    placeRandomShip(ship, whichGameboard) {
        let randomPlace;

        do {
            randomPlace = this.player.findRandomPlaceForShip();
        } while (!whichGameboard.isValidPlace(ship, randomPlace[0], randomPlace[1]));

        whichGameboard.placeShip(ship, randomPlace[0], randomPlace[1]);
    };

    // shouldnt i move 2 functions below to player class?
    // i guess nop
    whoseTurn() {
        if (this.player.isTurn) {
            return "player";
        } else {
            return "computer";
        };
    };

    isAllShipsSunk(enemy) {
        if (enemy === "player") {
            const playerShips = this.player.gameboard.ships;
            return playerShips.every(ship => ship.sunk);
        } else if (enemy === "computer") {
            const computerShips = this.computer.gameboard.ships;
            return computerShips.every(ship => ship.sunk);
        };
    };

    checkAndProceed(enemy) {
        // check if enemy still has ships and continue the game if so
        if (this.isAllShipsSunk(enemy)) {
            // end the game when the enemy has no ships anymore
            return this.restartTheGame();
        };

        // change turn
        // since its computers turn - computer automatically attacks player
        if (enemy === "computer") {
            // it runs when player used its turn
            this.player.changeTurn(this.player, this.computer);

            // now its computer turn, so we can run it right away
            setTimeout(() => {
                this.handleComputersRandomAttack();
            }, 1000);
        } else {
            // computer used its turn
            this.computer.changeTurn(this.computer, this.player)
        }
    };

    // helper function that calls attack from player class
    // and saves info about latest attack
    handlePlayersAttack(coordinates) {
        // do not accept attack on the same cell
        if (this.player.attack(this.computer, coordinates) === false) {
            return null;
        };
        // attack
        this.player.attack(this.computer, coordinates);

        // change styling of the square depending on result
        const latestAttackInfo = this.computer.gameboard.lastReceivedAttackInfo;
        // e = enemy (computer board)
        this.dom.getLastAttackInfo("e", latestAttackInfo);

        if (latestAttackInfo["result"] === "hit" && !this.isAllShipsSunk("computer")) {
            // when attack is succesfull and there are still ships left - keep turn for a player
            return null;
        };

        // missed attack or when there are no ships left anymore requires further process
        this.checkAndProceed("computer");
    };

    handleComputersRandomAttack(isRepeated) {
        // isRepeated = true or false, if true - give randomAttack latestAttackInfo
        this.computer.randomAttack(this.player);
        const latestAttackInfo = this.player.gameboard.lastReceivedAttackInfo;
        // f = friendly (player board)
        this.dom.getLastAttackInfo("f", latestAttackInfo);

        if (latestAttackInfo["result"] === "hit" && !this.isAllShipsSunk("player")) {
            // when attack is succesfull and there are still ships left - keep turn for a computer
            console.log("keep");
            return setTimeout(() => {
                this.handleComputersRandomAttack();
            }, 1000);
        };

        this.checkAndProceed("player");
    };

    restartTheGame() {
        this.setUpNewGame();
        this.dom.updateDOM();
    };
};

// const game = new Game();
// game.setUpNewGame();

export { Ship, Gameboard, Player, Game };