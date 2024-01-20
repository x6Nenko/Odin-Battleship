import { Ship, Gameboard, Player, Game } from "./index.js";

class DOM {
    constructor() {
        this.friendlyBoard = document.querySelector(".friendly-board");
        this.enemyBoard = document.querySelector(".enemy-board");
        this.showWhosTurn = document.getElementById("turn");
        // ships
        this.carrier = document.querySelector(".carrier");
        // bind the functions below because event handlers are unpredictable
        // when it comes to "this" functionality
        this.handleBoardClick = this.handleBoardClick.bind(this);
        this.styleAttackedCoordinates = this.styleAttackedCoordinates.bind(this);
    };

    // displayTacticalStageBoard() {
    //     for (let index = 0; index < 10; index++) {
    //         for (let j = 0; j < 10; j++) {
    //             const friendlyDiv = document.createElement("div");
    //             friendlyDiv.id = `f-${index}-${j}`;
    //             this.friendlyBoard.appendChild(friendlyDiv);
    //             //friendlyDiv.addEventListener("click", this.handleBoardClick);
    //             friendlyDiv.addEventListener("dragover", this.dragOver);
    //             friendlyDiv.addEventListener("drop", this.dropShip);
    //         };
    //     };
    // };

    // displayDragableShips() {
    //     const carrier = this.carrier;
    //     carrier.addEventListener("dragstart", this.dragStart);
    // };

    // dragOver(event) {
    //     event.preventDefault();
    //     //console.log(event.target);
    // };

    // dropShip(event) {
    //     event.preventDefault();
    //     const startId = event.target.id;
    //     console.log(startId);
    // };

    // dragStart(event) {
    //     event.preventDefault();
    //     draggedShipLength = event.childNodes.length;

    //     console.log(event.target);
    // };

    displayBoards() {
        for (let index = 0; index < 10; index++) {
            for (let j = 0; j < 10; j++) {
                const friendlyDiv = document.createElement("div");
                friendlyDiv.id = `f-${index}-${j}`;
                this.friendlyBoard.appendChild(friendlyDiv);
                friendlyDiv.addEventListener("click", this.handleBoardClick);

                const enemyDiv = document.createElement("div");
                enemyDiv.id = `e-${index}-${j}`;
                this.enemyBoard.appendChild(enemyDiv);
                enemyDiv.addEventListener("click", this.handleBoardClick);
            };
        };
    };

    handleBoardClick(event) {
        const targetId = event.target.id;
        const targetDiv = event.target;
        const coordinates = targetId.slice(2).replace('-', ', ');

        // check whose turn to attack and if he clicks at enemy board
        if (game.whoseTurn() === "player" && targetId[0] === "e") {
            game.handlePlayersAttack(coordinates);
        } else if (game.whoseTurn() === "computer" && targetId[0] === "f") {
            // game.handleComputersRandomAttack();
        };
    };

    getLastAttackInfo(board, attackInfo) {
        this.displayInfoAboutCurrentTurn(board);
        const targetId = `${board}-${attackInfo.coordinates.slice(0).replace(', ', '-')}`;
        const targetDiv = document.getElementById(targetId);
        const attackResult = attackInfo["result"];

        this.styleAttackedCoordinates(targetDiv, attackResult);
    };

    displayInfoAboutCurrentTurn(whoIsNext) {
        if (whoIsNext === "e") {
            this.showWhosTurn.innerText = "Computer Turn."
        } else if (whoIsNext === "f") {
            this.showWhosTurn.innerText = "Player Turn."
        };
    };

    styleAttackedCoordinates(target, attackResult) {
        if (attackResult === null || attackResult === "null") {
            return target.style.backgroundColor = "gray";
        } else if (attackResult === "hit") {
            return target.style.backgroundColor = "red";
        }
    };

    displayFriendlyShips() {
        const friendlyBoard = game.playerGameboard.board;
        
        Object.entries(friendlyBoard).forEach(square => {
            // make them looks as ids
            const coordinates = `f-${square[0].replace(/,\s*/g, '-')}`;

            // null is a missed attack or drowned part of ship
            const isShip = square[1] === null;
            console.log(isShip);

            const domSquare = document.getElementById(coordinates);
            domSquare.style.backgroundColor = "#00ff00";
            domSquare.style.padding = "2px";
        });
    };

    clearBoards() {
        // Clear existing board elements
        this.friendlyBoard.textContent = "";
        this.enemyBoard.textContent = "";
    }

    updateDOM() {
        this.clearBoards();
        this.displayBoards();
        this.displayFriendlyShips();
        this.showWhosTurn.innerText = "Player Turn."
    };
};

const dom = new DOM();
const game = new Game(dom);
game.setUpNewGame();
// dom.displayTacticalStageBoard();
dom.displayBoards();
dom.displayFriendlyShips();