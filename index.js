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
        if (this.hits === this.length) {
            this.sunk = true;
            return "Ship is sunk!";
        };
    };
};

module.exports = Ship;