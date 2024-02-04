import { Ship, Gameboard, Player, Game } from "../index.js";

test('create new boards', () => {
    const game = new Game();
    game.createBoards();

    expect(game.playerGameboard).toEqual({ board: {}, ships: [], lastReceivedAttackInfo: null, });
    expect(game.computerGameboard).toEqual({ board: {}, ships: [], lastReceivedAttackInfo: null, });
});

test('create new players', () => {
    const game = new Game();
    game.createPlayers();

    expect(game.player).toEqual({ name: 'nickname', gameboard: null, isTurn: true, isComputerMissedNearbyAttack: false, preLastAttackInfo: expect.any(Object) });
    expect(game.computer).toEqual({ name: 'computer', gameboard: null, isTurn: false, isComputerMissedNearbyAttack: false, preLastAttackInfo: expect.any(Object) });
});

test('place the ships for computer', () => {
  const game = new Game();
  game.createBoards();
  game.createPlayers();
  game.placeRandomShips(game.computerGameboard);

  const expectShip = expect.objectContaining({
      hits: expect.any(Number),
      length: expect.any(Number),
      sunk: expect.any(Boolean),
  });

  const expectGameboard = (gameboard) => {
      expect(Object.keys(gameboard.board).length).toBeGreaterThan(0);
      expect(gameboard.ships).toHaveLength(5);
      expect(gameboard.lastReceivedAttackInfo).toBeNull();

      // Test each ship in the board
      Object.values(gameboard.board).forEach(ship => {
          expect(ship).toEqual(expectShip);
      });
  };

  expectGameboard(game.computer.gameboard);
});

// Mock DOM class
class MockDOM {
    displayDragableShips() {
        // Do nothing
    };
};


test('set up the game by one helper function', () => {
    const game = new Game();
    game.dom = new MockDOM();
    game.setUpNewGame();

    // Test basic properties
    expect(game.dom).toBeDefined();
    expect(game.player.isTurn).toBe(true);
    expect(game.computer.isTurn).toBe(false);

    // Test gameboard structure and ships
    const expectComputerGameboard = (gameboard) => {
        expect(Object.keys(gameboard.board).length).toBeGreaterThan(0);
        expect(gameboard.ships).toHaveLength(5);
        expect(gameboard.lastReceivedAttackInfo).toBeNull();
        
        // Test each ship in the board
        Object.values(gameboard.board).forEach(ship => {
            expect(ship.hits).toBe(0);
            expect(ship.length).toBeGreaterThan(0);
            expect(ship.sunk).toBe(false);
        });
    };

    const expectPlayerGameboard = (gameboard) => {
        expect(Object.keys(gameboard.board).length).toBeDefined();
        expect(gameboard.ships).toBeDefined();
        expect(gameboard.lastReceivedAttackInfo).toBeNull();
    };

    expectPlayerGameboard(game.playerGameboard);
    expectComputerGameboard(game.computerGameboard);
});


test('whose turn function shows that now is the player turn', () => {
    const game = new Game();
    game.dom = new MockDOM();
    game.setUpNewGame();

    expect(game.whoseTurn()).toEqual("player");
});

test('whose turn function shows that now is the computer turn', () => {
    const game = new Game();
    game.dom = new MockDOM();
    game.setUpNewGame();
    game.checkAndProceed("computer");

    expect(game.whoseTurn()).toEqual("computer");
});

test('after succesfull attack player keeps its turn', () => {
    const mockDom = {
        getLastAttackInfo: jest.fn(),
    };

    const game = new Game(mockDom); // Pass the mockDom to the Game constructor

    game.createBoards();
    game.createPlayers();

    const playerCarrier = new Ship(5);
    const computerCarrier = new Ship(5);

    game.playerGameboard.placeShip(playerCarrier, "row", [0, 0]);
    game.computerGameboard.placeShip(computerCarrier, "row", [0, 0]);

    expect(game.whoseTurn()).toEqual("player");

    game.handlePlayersAttack("0, 0");
    expect(game.whoseTurn()).toEqual("player");

    game.handlePlayersAttack("1, 0");
    expect(game.whoseTurn()).toEqual("player");

    game.handlePlayersAttack("2, 0");
    expect(game.whoseTurn()).toEqual("player");
});