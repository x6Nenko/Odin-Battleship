import { Ship, Gameboard, Player, Game } from "./index.js";

class DOM {
    constructor() {
        this.friendlyBoard = document.querySelector(".friendly-board");
        this.enemyBoard = document.querySelector(".enemy-board");
        this.showWhosTurn = document.getElementById("turn");
        // drag and drop
        this.draggedShip = null;
        this.draggedShipCellIndex = null;
        this.initialCoordinatesForShipPlacement = null;
        this.shipsContainer = document.querySelector(".ships");
        
        // bind the functions below because event handlers are unpredictable
        // when it comes to "this" functionality
        this.handleBoardClick = this.handleBoardClick.bind(this);
        this.styleAttackedCoordinates = this.styleAttackedCoordinates.bind(this);

        // Bind event listener methods here
        this.dragStart = this.dragStart.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.mouseDown = this.mouseDown.bind(this);

        this.dragOver = this.dragOver.bind(this);
        this.dragEnter = this.dragEnter.bind(this);
        this.dragLeave = this.dragLeave.bind(this);
        this.dropShip = this.dropShip.bind(this);
        this.highlightArea = this.highlightArea.bind(this);
    };

    displayDragableShips() {
        const shipSizes = [5, 4, 3, 3, 2];

        shipSizes.forEach(ship => {
            const shipContainer = document.createElement("div");
            shipContainer.classList.add("ship");
            shipContainer.setAttribute("draggable", "true");
            shipContainer.dataset.length = ship;

            for (let i = 0; i < ship; i++) {
                let cell = document.createElement("div");
                cell.classList.add("ship-cell");
                cell.dataset.index = i;
                cell.setAttribute("draggable", "false");
                shipContainer.appendChild(cell);
            };
          
            const shipsContainer = document.querySelector(".ships");
            shipsContainer.appendChild(shipContainer);
        });

        // 0) Render all ships
    };

    addEventListenersToShips() {
        const ships = document.querySelectorAll(".ship");
        const friendlyBoardDiv = document.querySelector('.friendly-board');
        const boardCells = friendlyBoardDiv.querySelectorAll('div');

        ships.forEach(ship => {
            ship.addEventListener("dragstart", this.dragStart);
            ship.addEventListener("dragend", this.dragEnd);
        });

        document.addEventListener("mousedown", this.mouseDown);

        boardCells.forEach(cell => {
            cell.addEventListener("dragover", this.dragOver);
            cell.addEventListener("dragenter", this.dragEnter);
            cell.addEventListener("dragleave", this.dragLeave);
            cell.addEventListener("drop", this.dropShip);
        });
    };

    dragStart(event) {
        // 1) get here ship info
        this.draggedShip = event.target;
    };

    dragEnd(event) {
        // 1.5) remove highlight and so on
        this.draggedShip = null;
        this.removeHighlight();
    };

    mouseDown(event) {
        // 1.75) get ship cell info
        event.stopPropagation();
        const shipCellIndex = event.target.getAttribute('data-index');
        this.draggedShipCellIndex = shipCellIndex;
    };

    dragOver(event) {
        // 2) call highlightArea by giving it a hovered by the cursor cell
        event.preventDefault();
        const hoveredBoardCell = event.target;
        this.highlightArea(hoveredBoardCell);
    };

    dropShip(event) {
        event.preventDefault();
        const shipLength = this.draggedShip.getAttribute('data-length');
        if (game.placeManualyShip(this.initialCoordinatesForShipPlacement, shipLength)) {
            // ship was succesfully placed
            this.draggedShip.remove();
        };
        
        if (this.shipsContainer.childElementCount === 0) {
            // all ships were placed, time to start the fight
            this.showWhosTurn.innerText = "Player Turn."
        };
    };

    dragEnter(event) {

    };

    dragLeave(event) {
        this.removeHighlight();
    };
    
    removeHighlight() {
        let highlightedArea = document.querySelectorAll(".highlighted");

        highlightedArea.forEach(cell => {
            cell.classList.remove("highlighted");
        });
    };

    highlightArea(cell) {
        // 3) get nearby cells and highlight them
        let nearbyCells = this.getNearbyCells(cell);

        nearbyCells.forEach(cellId => {
            let target = document.getElementById(cellId);
            target.classList.add("highlighted");
        });
    };

    getNearbyCells(cell) {
        // 4) calculate nearby cells



        let hoveredCoordinates = cell.id.slice(2).replace('-', ', ');
        let row = hoveredCoordinates[0];
        let col = hoveredCoordinates[3];
        let shipLength = this.draggedShip.getAttribute('data-length');
        let initialBoardCell = row - this.draggedShipCellIndex;
        this.initialCoordinatesForShipPlacement = [initialBoardCell, Number(col)];
        let cellList = [];

        for (let index = 0; index < shipLength; index++) {
            cellList.push(`f-${initialBoardCell + index}-${col}`);
        };

        // console.log(cellList);
        return cellList;
    };

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

        if (this.shipsContainer.childElementCount !== 0) {
            // there is still ship placement phase
            return null;
        };

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

    intro() {
        const introContainer = document.querySelector(".intro");
        const mainContainer = document.getElementById("main");
        const playerVsPlayerBtn = document.getElementById("vsPlayer");
        const playerVsComputerBtn = document.getElementById("vsComputer");
        const startGameBtn = document.getElementById("startGame");

        // startGameBtn.addEventListener("click", () => {
        //     console.log("huit");
        //     this.displayBoards();
        //     this.displayFriendlyShips();
        //     this.addEventListenersToShips();
        // });

        startGameBtn.addEventListener("click", () => {
            introContainer.style.display = "none";
            mainContainer.style.display = "flex";
            this.updateDOM();
        });
    };

    updateDOM() {
        this.clearBoards();
        this.displayBoards();
        this.displayFriendlyShips();
        this.addEventListenersToShips();
        this.showWhosTurn.innerText = "Place the ships."
    };
};

const dom = new DOM();
const game = new Game(dom);
game.setUpNewGame();
dom.intro();

// dom.displayBoards();
// dom.displayFriendlyShips();
// dom.addEventListenersToShips();