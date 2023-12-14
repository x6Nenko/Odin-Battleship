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
    };

    placeShip(ship, axis, initialCell) {
        // check if place is valid
        if (!this.isValidPlace(ship, axis, initialCell)) {
            return false;
        };

        const row = initialCell[0];
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

        for (let index = 0; index < ship.length; index++) {
            if (axis === "row") {
                const key = `${row + index}, ${col}`;
                
                if (key in this.board) {
                    // the place isn't valid
                    return false;
                };
            } else if (axis === "col") {
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
            if (this.board[coordinates] === null) {
                // these coordinates were already attacked
                return null;
            };

            // attack found ship
            const ship = this.board[coordinates];
            ship.hit();

            // track succesfull attack
            return this.board[coordinates] = null;
        } else {
            // track missed attack
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
    constructor(name, gameboard) {
        this.name = name;
        this.gameboard = gameboard;
        this.isTurn = false;
    };

    attack(enemy, coordinates) {
        return enemy.gameboard.receiveAttack(coordinates);
    };

    randomAttack(enemy) {
        let randomCoordinates;

        do {
            randomCoordinates = this.generateRandomCoordinates();
        } while (!this.isValidMove(enemy.gameboard, randomCoordinates));

        return this.attack(enemy, randomCoordinates);
    };

    generateRandomCoordinates() {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        return `${row}, ${col}`;
    };

    isValidMove(gameboard, coordinates) {
        if (coordinates in gameboard.board && gameboard.board[coordinates] === null) {
            // those coordinates were already attacked
            return false;
        };

        return true;
    };
};

module.exports = {
    Ship,
    Gameboard,
    Player,
};