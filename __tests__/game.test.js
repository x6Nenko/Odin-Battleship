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

    expect(game.player).toEqual({ name: 'nickname', gameboard: null, isTurn: true });
    expect(game.computer).toEqual({ name: 'computer', gameboard: null, isTurn: false });
});

test('place the ships', () => {
  const game = new Game();
  game.createBoards();
  game.createPlayers();
  game.placeTheShips();

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

  expectGameboard(game.player.gameboard);
});


test('set up the game by one helper function', () => {
    const game = new Game();
    game.setUpNewGame();

    // Test basic properties
    expect(game.dom).toBeUndefined();
    expect(game.player.isTurn).toBe(true);
    expect(game.computer.isTurn).toBe(false);

    // Test gameboard structure and ships
    const expectGameboard = (gameboard) => {
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

    expectGameboard(game.playerGameboard);
    expectGameboard(game.computerGameboard);
});


test('whose turn function shows that now is the player turn', () => {
    const game = new Game();
    game.setUpNewGame();

    expect(game.whoseTurn()).toEqual("player");
});

test('whose turn function shows that now is the computer turn', () => {
    const game = new Game();
    game.setUpNewGame();
    game.checkAndProceed("computer");

    expect(game.whoseTurn()).toEqual("computer");
});