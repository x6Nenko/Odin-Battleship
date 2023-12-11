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
    };

    placeShip(ship, axis, initialCell) {
        // check if place is valid
        if (!this.isValidPlace(ship, axis, initialCell)) {
            return false;
        };

        const row = initialCell[0];
        const col = initialCell[1];

        // 1 4
        // 1 4  - 3 4
        for (let index = 0; index < ship.length; index++) {
            if (axis === "row") {
                const key = `${row + index}, ${col}`;
                this.board[key] = ship;
            } else if (axis === "col") {
                const key = `${row}, ${col + index}`;
                this.board[key] = ship;
            };
        };
    };

    isValidPlace(ship, axis, initialCell) {
        const row = initialCell[0];
        const col = initialCell[1];

        for (let index = 0; index < ship.length; index++) {
            if (axis === "row") {
                const key = `${row + index}, ${col}`;
                
                if (key in this.board) {
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
};

module.exports = {
    Ship,
    Gameboard,
};