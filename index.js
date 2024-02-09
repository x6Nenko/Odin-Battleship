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
        this.receivedAttacksHistory = [];
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

        const finalShipCoordinates = [];

        // place the ship on the board
        for (let index = 0; index < ship.length; index++) {
            if (axis === "row") {
                const key = `${row + index}, ${col}`;
                this.board[key] = ship;
                finalShipCoordinates.push(key);
            } else if (axis === "col") {
                const key = `${row}, ${col + index}`;
                this.board[key] = ship;
                finalShipCoordinates.push(key);
            };
        };

        this.ships.push([ship, finalShipCoordinates, axis]); // add the ship to the list of ships
    };

    isValidPlace(ship, axis, initialCell) {
        const row = initialCell[0];
        const col = initialCell[1];

        if (row > 9 || col > 9 || row < 0 || col < 0) {
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
            this.receivedAttacksHistory.push({"coordinates": coordinates, "result": "hit"});

            return this.board[coordinates] = "hit";
        } else {
            // track missed attack
            this.lastReceivedAttackInfo = {"coordinates": coordinates, "result": "null"};
            this.receivedAttacksHistory.push({"coordinates": coordinates, "result": "null"});

            return this.board[coordinates] = null;
        };
    };

    isAllShipsSunk() {
        const ships = this.ships;
        

        for (let i = 0; i < ships.length; i++) {
            const ship = ships[i][0];

            if (ship.sunk === false) {
                // Return false if any ship is not sunk
                return false;
            };

            // Return true if all ships are sunk
            return true;
        };
    };

    resetBoardAndShips() {
        this.board = {};
        this.ships = [];
    };
};

class Player {
    constructor(name, gameboard, isTurn) {
        this.name = name;
        this.gameboard = gameboard;
        this.isTurn = isTurn;
        // Smart Computer
        this.isComputerMissedNearbyAttack = false;
        this.preLastAttackInfo = {};
        this.trackedTails = [];
        this.queue = [];
        this.trackedAxis = null;
        this.trackedDirection = null;
        this.isChangedDirection = false;
    };

    attack(enemy, coordinates) {
        const result = enemy.gameboard.receiveAttack(coordinates);
        if (result === "hit") {
            this.trackedTails.push({"coordinates": coordinates, "result": "hit"});
        };

        return result;
    };

    randomAttack(enemy) {
        let randomCoordinates;

        if (this.trackedTails.length > 1) {
            // there is attacked ship that is not sunk yet
            return this.attackTails(enemy);
        };

        if (enemy.gameboard.lastReceivedAttackInfo !== null) {
            // because when its null - means there are no received attacks yet
            if (enemy.gameboard.lastReceivedAttackInfo["result"] === "hit") {
                // if previous attack was succesfull - attack nearby coordinates
                randomCoordinates = this.generateNearbyCoordinates(enemy.gameboard.lastReceivedAttackInfo["coordinates"], enemy);

                // save info about attack to process it further in case computer not finishes the ship
                this.preLastAttackInfo = {...enemy.gameboard.lastReceivedAttackInfo};;

                const result = this.attack(enemy, randomCoordinates);

                if (result === null) {
                    this.isComputerMissedNearbyAttack = true;
                };

                return result
            } else if (this.isComputerMissedNearbyAttack === true) {
                // if previous attack wasn't succesfull - attack nearby coordinates to find correct direction
                randomCoordinates = this.generateNearbyCoordinates(this.preLastAttackInfo["coordinates"], enemy);

                const result = this.attack(enemy, randomCoordinates);

                if (result !== null) {
                    this.isComputerMissedNearbyAttack = false;
                };              

                return result
            };
        };

        do {
            randomCoordinates = this.generateRandomCoordinates();
        } while (!this.isValidMove(enemy.gameboard, randomCoordinates));

        return this.attack(enemy, randomCoordinates);
    };  
    
    attackTails(enemy) {
        if (this.isChangedDirection === false) {
            // if its true then direction was reversed, so no need to regenerate it
            this.getTailsDirection();
        };

        this.generateQueue();

        if (this.queue.length === 0) {
            // ship must be sunked
            this.clearTailsBreadCrumbs();
            return this.randomAttack(enemy);
        };

        const coordinates = this.queue.shift();
        const coordinatesStr = `${coordinates[0]}, ${coordinates[1]}`;

        if (this.isValidMove(enemy.gameboard, coordinatesStr) && coordinates[0] <= 9 && coordinates[0] >= 0 && coordinates[1] <= 9 && coordinates[1] >= 0) {
            return this.attack(enemy, coordinatesStr)
        } else {
            if (this.isChangedDirection) {
                // ship must be sunked, back to random attacks
                this.clearTailsBreadCrumbs();
                return this.randomAttack(enemy);
            };

            // Attack in reversed direction
            this.reverseDirection();
            this.isChangedDirection = true;
            this.attackTails(enemy);
        }
    };

    clearTailsBreadCrumbs() {
        this.trackedTails = [];
        this.queue = [];
        this.trackedAxis = null;
        this.trackedDirection = null;
        this.isChangedDirection = false;
    };

    getTailsDirection() {
        this.trackedDirection = null;
    
        // Extract the coordinates
        const coordinates = this.trackedTails.map(cell => cell.coordinates);
        const firstCoord = coordinates[0].split(", ").map(Number);
        const secondCoord = coordinates[1].split(", ").map(Number);
    
        // Determine the direction based on the difference between the coordinates
        const diffRow = secondCoord[0] - firstCoord[0];
        const diffCol = secondCoord[1] - firstCoord[1];
    
        if (diffRow === 0) {
            // If its 0, it's moving along the same row (col axis)
            this.trackedAxis = 'col';
            this.trackedDirection = diffCol > 0 ? [0, 1] : [0, -1]; // Check where it goes: Left or Right
        } else if (diffCol === 0) {
            // Ifits is 0, it's moving along the same column (row axis)
            this.trackedAxis = 'row';
            this.trackedDirection = diffRow > 0 ? [1, 0] : [-1, 0]; // Check where it goes: Up or Down
        };
    };

    generateQueue() {
        const queue = [];
        let firstOrLast;
        
        if (this.isChangedDirection) {
            // initial cell is the first attacked cell cuz it was reversed
            firstOrLast = this.trackedTails[0];
        } else {
            // initial cell is the last attacked cell
            firstOrLast = this.trackedTails[this.trackedTails.length - 1];
        };

        let [row, col] = firstOrLast["coordinates"].split(", ").map(Number);
        row += this.trackedDirection[0];
        col += this.trackedDirection[1];
    
        // Assuming ship size is 5 for the largest ship
        for (let i = 0; i < 5; i++) {
            queue.push([row, col]);
            row += this.trackedDirection[0]; // Update row based on direction
            col += this.trackedDirection[1]; // Update column based on direction
        };

        // Store this queue for further processing
        this.queue = queue;
    };

    reverseDirection() {
        if (this.trackedDirection) {
            if (this.trackedDirection[0] === -1) {
                // From Up to Down
                this.trackedDirection = [1, 0];
            } else if (this.trackedDirection[0] === 1) {
                // From Down to Up
                this.trackedDirection = [-1, 0];
            } else if (this.trackedDirection[1] === -1) {
                // From Left to Right
                this.trackedDirection = [0, 1];
            } else if (this.trackedDirection[1] === 1) {
                // From Right to Left
                this.trackedDirection = [0, -1];
            };
        };
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

            if (newRow >= 0 && newRow <= 9 && newCol >= 0 && newCol <= 9) {
                if (this.isValidMove(enemy.gameboard, newCoordinates)) {
                    this.trackedDirection = [rowOffset, colOffset];
                    return newCoordinates;
                };
            };
        };
    
        // If no valid nearby coordinate is found, fall back to generating a random one
        // or erase latest received attack so there are no endless loop happening and
        // remove do while below and return this.generateRandomCoordinates();
        let newRandomCoordinates;
        do {
            newRandomCoordinates = this.generateRandomCoordinates();
        } while (!this.isValidMove(enemy.gameboard, newRandomCoordinates));

        return newRandomCoordinates;
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
        // this.placeRandomShips(this.computerGameboard);
        this.dom.displayDragableShips();
    };

    createBoards() {
        this.playerGameboard = new Gameboard();
        this.computerGameboard = new Gameboard();
    };

    createPlayers() {
        this.player = new Player("nickname", this.playerGameboard, true);
        this.computer = new Player("computer", this.computerGameboard, false);
    }

    placeRandomShips(atBoard) {    
        const Carrier = new Ship(5);
        const Battleship = new Ship(4);
        const Cruiser = new Ship(3);
        const Submarine = new Ship(3);
        const Destroyer = new Ship(2);

        this.placeRandomShip(Carrier, atBoard);
        this.placeRandomShip(Battleship, atBoard);
        this.placeRandomShip(Cruiser, atBoard);
        this.placeRandomShip(Submarine, atBoard);
        this.placeRandomShip(Destroyer, atBoard);
    };

    placeManualyShip(initialCell, axis, shipLength) {
        const newShip = new Ship(Number(shipLength));
        
        if (!this.playerGameboard.isValidPlace(newShip, axis, initialCell)) {
            // return false to DOM so it knows that ship wasn't placed
            return false;
        };

        this.playerGameboard.placeShip(newShip, axis, initialCell);
        this.dom.displayFriendlyShips(newShip, axis, initialCell);

        return true;
    };

    placeRandomShip(ship, whichGameboard) {
        let randomPlace;

        do {
            randomPlace = this.player.findRandomPlaceForShip();
        } while (!whichGameboard.isValidPlace(ship, randomPlace[0], randomPlace[1]));

        whichGameboard.placeShip(ship, randomPlace[0], randomPlace[1]);
        
        if (whichGameboard === this.playerGameboard) {
            this.dom.displayFriendlyShips(ship, randomPlace[0], randomPlace[1]);
        };
    };

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
            return playerShips.every(ship => ship[0].sunk);
        } else if (enemy === "computer") {
            const computerShips = this.computer.gameboard.ships;
            return computerShips.every(ship => ship[0].sunk);
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
            }, 100);
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

        const computersSunkShips = this.getComputersSunkShips();
        if (computersSunkShips) {
            this.dom.displaySunkedShip(computersSunkShips);
        };

        // e = enemy (computer board)
        this.dom.getLastAttackInfo("e", latestAttackInfo);

        if (latestAttackInfo["result"] === "hit" && !this.isAllShipsSunk("computer")) {
            // when attack is succesfull and there are still ships left - keep turn for a player
            return null;
        };

        // missed attack or when there are no ships left anymore requires further process
        this.checkAndProceed("computer");
    };

    handleComputersRandomAttack() {
        this.computer.randomAttack(this.player);
        const latestAttackInfo = this.player.gameboard.lastReceivedAttackInfo;
        // f = friendly (player board)
        this.dom.getLastAttackInfo("f", latestAttackInfo);

        if (latestAttackInfo["result"] === "hit" && !this.isAllShipsSunk("player")) {
            // when attack is succesfull and there are still ships left - keep turn for a computer
            return setTimeout(() => {
                this.handleComputersRandomAttack();
            }, 100);
        };

        this.checkAndProceed("player");
    };

    getComputersSunkShips() {
        const ships = this.computerGameboard.ships;
        const sunkShips = [];

        ships.forEach(ship => {
            if (ship[0].sunk) {
                // push ship coordinates and axis
                sunkShips.push([ship]);
            };
        });

        return sunkShips;
    };

    restartTheGame() {
        return setTimeout(() => {
            // send isTurn to outro so it knows who won the match
            this.dom.outro(this.player.isTurn);

            this.setUpNewGame();
        }, 1000);
    };
};

// const game = new Game();
// game.setUpNewGame();

export { Ship, Gameboard, Player, Game };