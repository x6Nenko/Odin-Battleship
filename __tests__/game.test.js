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

    expect(game.player.gameboard).toEqual({
        board: {
            '2, 2': expect.any(Ship),
            '3, 2': expect.any(Ship),
            '4, 2': expect.any(Ship),
            '5, 2': expect.any(Ship),
            '6, 2': expect.any(Ship),
            '9, 1': expect.any(Ship),
            '9, 2': expect.any(Ship),
            '9, 3': expect.any(Ship),
            '9, 4': expect.any(Ship),
            '8, 6': expect.any(Ship),
            '8, 7': expect.any(Ship),
            '4, 8': expect.any(Ship),
            '4, 4': expect.any(Ship),
            '5, 4': expect.any(Ship),
            '6, 4': expect.any(Ship),
        },
        ships: [
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
        ],
        lastReceivedAttackInfo: null,
    });
});

test('set up the game by one helper function', () => {
    const game = new Game();
    game.setUpNewGame();

    expect(game).toEqual({
        dom: undefined,
        playerGameboard: {
          board: {
            '2, 2': expect.any(Ship),
            '3, 2': expect.any(Ship),
            '4, 2': expect.any(Ship),
            '5, 2': expect.any(Ship),
            '6, 2': expect.any(Ship),
            '9, 1': expect.any(Ship),
            '9, 2': expect.any(Ship),
            '9, 3': expect.any(Ship),
            '9, 4': expect.any(Ship),
            '8, 6': expect.any(Ship),
            '8, 7': expect.any(Ship),
            '4, 8': expect.any(Ship),
            '4, 4': expect.any(Ship),
            '5, 4': expect.any(Ship),
            '6, 4': expect.any(Ship),
          },
          ships: [
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
          ],
          lastReceivedAttackInfo: null,
        },
        computerGameboard: {
          board: {
            '2, 2': expect.any(Ship),
            '3, 2': expect.any(Ship),
            '4, 2': expect.any(Ship),
            '5, 2': expect.any(Ship),
            '6, 2': expect.any(Ship),
            '9, 1': expect.any(Ship),
            '9, 2': expect.any(Ship),
            '9, 3': expect.any(Ship),
            '9, 4': expect.any(Ship),
            '8, 6': expect.any(Ship),
            '8, 7': expect.any(Ship),
            '4, 8': expect.any(Ship),
            '4, 4': expect.any(Ship),
            '5, 4': expect.any(Ship),
            '6, 4': expect.any(Ship),
          },
          ships: [
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
            expect.any(Ship),
          ],
          lastReceivedAttackInfo: null,
        },
        player: {
          name: 'nickname',
          gameboard: {
            board: expect.any(Object),
            ships: expect.any(Array),
            lastReceivedAttackInfo: null,
          },
          isTurn: true,
        },
        computer: {
          name: 'computer',
          gameboard: {
            board: expect.any(Object),
            ships: expect.any(Array),
            lastReceivedAttackInfo: null,
          },
          isTurn: false,
        },
      });
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