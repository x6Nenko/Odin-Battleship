import { Ship } from "../index";

test('create new ship', () => {
    const myShip = new Ship(3);

    expect(myShip.length).toBe(3);
    expect(myShip.hits).toBe(0);
    expect(myShip.sunk).toBe(false);
});

test('hit ship function increases hit count', () => {
    const myShip = new Ship(3);
    myShip.hit();

    expect(myShip.hits).toBe(1);
});

test('ship is sunk when it got amount of hits that equal ship length', () => {
    const myShip = new Ship(3);
    myShip.hit();
    myShip.hit();
    myShip.hit();

    expect(myShip.hits).toBe(3);
    expect(myShip.sunk).toBe(true);
});

test('ship isnt sunk when it got less hits than ships length', () => {
    const myShip = new Ship(3);
    myShip.hit();
    myShip.hit();

    expect(myShip.hits).toBe(2);
    expect(myShip.sunk).toBe(false);
});