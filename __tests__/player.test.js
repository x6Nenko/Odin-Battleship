import { Ship, Gameboard, Player } from "../index";

test('create new players', () => {
    const playerGameboard = new Gameboard();
    const computerGameboard = new Gameboard();

    const player = new Player("nickname", playerGameboard, true);;
    const computer = new Player("computer", computerGameboard, false);

    expect(player.name).toEqual('nickname');
    expect(player.gameboard).toBeInstanceOf(Gameboard);
    expect(player.gameboard.board).toEqual({});
    expect(player.gameboard.ships).toEqual([]);
    expect(player.isTurn).toBe(true);
    
    expect(computer.name).toEqual('computer');
    expect(computer.gameboard).toBeInstanceOf(Gameboard);
    expect(computer.gameboard.board).toEqual({});
    expect(computer.gameboard.ships).toEqual([]);
    expect(computer.isTurn).toBe(false);
});

test('attack enemy gameboard', () => {
    const playerGameboard = new Gameboard();
    const computerGameboard = new Gameboard();

    const player = new Player("nickname", playerGameboard, true);;
    const computer = new Player("computer", computerGameboard, false);

    const playerCarrier = new Ship(5);
    const playerBattleship = new Ship(4);
    const playerCruiser = new Ship(3);
    const playerSubmarine = new Ship(2);
    const playerDestroyer = new Ship(1);

    const computerCruiser = new Ship(3);
    const computerSubmarine = new Ship(2);
    const computerDestroyer = new Ship(1);

    // playerGameboard.placeShip(playerSubmarine, "col", [8, 6]);
    // playerGameboard.placeShip(playerDestroyer, "row", [4, 8]);
    // playerGameboard.placeShip(playerCruiser, "row", [4, 4]);

    // computerGameboard.placeShip(computerSubmarine, "col", [8, 6]);
    // computerGameboard.placeShip(computerDestroyer, "row", [4, 8]);
    computerGameboard.placeShip(computerCruiser, "row", [4, 4]);

    player.attack(computer, "4, 4");

    expect(computer.gameboard.board["4, 4"]).toBe("hit");
});

test('check if random move is valid', () => {
    const playerGameboard = new Gameboard();
    const computerGameboard = new Gameboard();

    const player = new Player("nickname", playerGameboard, true);;
    const computer = new Player("computer", computerGameboard, false);

    const playerCruiser = new Ship(3);

    playerGameboard.placeShip(playerCruiser, "row", [4, 4]);

    computer.attack(player, "4, 4");

    expect(computer.isValidMove(playerGameboard, "4, 4")).toBe(false);
    expect(computer.isValidMove(playerGameboard, "8, 7")).toBe(true);
    expect(computer.isValidMove(playerGameboard, "4, 5")).toBe(true);
});

test('make random attack', () => {
    const playerGameboard = new Gameboard();
    const computerGameboard = new Gameboard();

    const player = new Player("nickname", playerGameboard, true);;
    const computer = new Player("computer", computerGameboard, false);

    const playerCruiser = new Ship(3);
    const computerCruiser = new Ship(3);

    playerGameboard.placeShip(playerCruiser, "row", [4, 4]);
    computerGameboard.placeShip(computerCruiser, "row", [4, 4]);

    jest.spyOn(computer, 'generateRandomCoordinates').mockReturnValue('5, 4');

    computer.randomAttack(player);

    expect(player.gameboard).toEqual(
        {
        "board": {
            "4, 4": {"hits": 1, "length": 3, "sunk": false}, 
            "5, 4": "hit", "6, 4": {"hits": 1, "length": 3, "sunk": false}
        }, 
        "ships": [{"hits": 1, "length": 3, "sunk": false}],
        "lastReceivedAttackInfo": {
            "coordinates": "5, 4",
            "result": "hit",
        },
        },
    );
});

test('change the turn from player to computer', () => {
    const playerGameboard = new Gameboard();
    const computerGameboard = new Gameboard();

    const player = new Player("nickname", playerGameboard, true);;
    const computer = new Player("computer", computerGameboard, false);

    player.changeTurn(player, computer);

    expect(player.isTurn).toEqual(false);
    expect(computer.isTurn).toEqual(true);
});