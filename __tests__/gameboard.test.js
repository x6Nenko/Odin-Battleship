const { Gameboard, Ship } = require('../index');

test('place the new ship if the place is valid, axis: row.', () => {
    const myShip = new Ship(3);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "row", [2, 4]);

    expect(gameboard.board).toEqual(
        {
            "2, 4": myShip,
            "3, 4": myShip,
            "4, 4": myShip,
        }
    );
});

test('place the new ship if the place is valid, axis: col.', () => {
    const myShip = new Ship(3);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "col", [4, 5]);

    expect(gameboard.board).toEqual(
        {
            "4, 5": myShip,
            "4, 6": myShip,
            "4, 7": myShip,
        }
    );
});

test('do not place the ship if the place isnt valid, axis: row.', () => {
    const myShip = new Ship(3);
    const myBiggerShip = new Ship(5);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "col", [6, 7]);
    gameboard.placeShip(myBiggerShip, "row", [2, 9]);

    expect(gameboard.board).toEqual(
        {
            "6, 7": myShip,
            "6, 8": myShip,
            "6, 9": myShip,
        }
    );
});

test('do not place the ship if the place isnt valid, axis: col.', () => {
    const myShip = new Ship(3);
    const myBiggerShip = new Ship(4);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "row", [4, 4]);
    gameboard.placeShip(myBiggerShip, "col", [6, 4]);

    expect(gameboard.board).toEqual(
        {
            "4, 4": myShip,
            "5, 4": myShip,
            "6, 4": myShip,
        }
    );
});

test('receive missed attack and record the coordinates of the missed shot', () => {
    const myShip = new Ship(3);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "row", [4, 4]);
    gameboard.receiveAttack("1, 4");

    expect(gameboard.board).toEqual(
        {
            "1, 4": null,
            "4, 4": myShip,
            "5, 4": myShip,
            "6, 4": myShip,
        }
    );
});

test('receive correct attack', () => {
    const myShip = new Ship(3);
    const gameboard = new Gameboard();

    gameboard.placeShip(myShip, "row", [4, 4]);
    gameboard.receiveAttack("5, 4");

    expect(myShip).toEqual(
        {
        "hits": 1,
        "length": 3,
        "sunk": false,
        }
    );
});

test('not all the ships have been sunk', () => {
    const myShip = new Ship(3);
    const mySecondShip = new Ship(2);
    const myThirdShip = new Ship (1);
    const gameboard = new Gameboard();

    gameboard.placeShip(mySecondShip, "col", [8, 6]);
    gameboard.placeShip(myThirdShip, "row", [4, 8]);

    gameboard.placeShip(myShip, "row", [4, 4]);
    gameboard.receiveAttack("5, 4");

    expect(gameboard.isAllShipsSunk()).toBe(false);
});

test('all the ships have been sunk', () => {
    const myShip = new Ship(3);
    const mySecondShip = new Ship(2);
    const myThirdShip = new Ship (1);
    const gameboard = new Gameboard();

    gameboard.placeShip(mySecondShip, "col", [8, 6]);
    gameboard.placeShip(myThirdShip, "row", [4, 8]);
    gameboard.placeShip(myShip, "row", [4, 4]);

    gameboard.receiveAttack("4, 4");
    gameboard.receiveAttack("5, 4");
    gameboard.receiveAttack("6, 4");

    gameboard.receiveAttack("8, 6");
    gameboard.receiveAttack("8, 7");

    gameboard.receiveAttack("4, 4");

    expect(gameboard.isAllShipsSunk()).toBe(true);
});