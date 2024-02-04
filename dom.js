import { Ship, Gameboard, Player, Game } from "./index.js";

class DOM {
    constructor() {
        this.friendlyBoard = document.querySelector(".friendly-board");
        this.enemyBoard = document.querySelector(".enemy-board");
        this.showWhosTurn = document.getElementById("turn");
        // drag and drop
        this.draggedShip = null;
        this.draggedShipCellIndex = null;
        this.draggedShipAxis = "row";
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
        this.rotateShips = this.rotateShips.bind(this);
    };

    displayDragableShips() {
        const shipSizes = [5, 4, 3, 3, 2];
        
        this.draggedShipAxis = "row";
        document.getElementById("rotateShips").style.display = "block";

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
          
            this.shipsContainer.appendChild(shipContainer);
        });
    };

    addDragAndDropEventListeners() {
        const ships = document.querySelectorAll(".ship");
        const friendlyBoardDiv = document.querySelector('.friendly-board');
        const boardCells = friendlyBoardDiv.querySelectorAll('div');
        const rotateShipsBtn = document.getElementById("rotateShips");

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

        rotateShipsBtn.addEventListener("click", this.rotateShips);
    };

    dragStart(event) {
        // get ship info
        this.draggedShip = event.target;
    };

    dragEnd(event) {
        // remove highlight and stop tracking ship
        this.draggedShip = null;
        this.removeHighlight();
    };

    mouseDown(event) {
        // get ship cell info
        const shipCellIndex = event.target.getAttribute('data-index');
        this.draggedShipCellIndex = shipCellIndex;
    };

    dragOver(event) {
        // get hovered board cell and call highlightArea
        event.preventDefault();
        const hoveredBoardCell = event.target;
        this.highlightArea(hoveredBoardCell);
    };

    dropShip(event) {
        event.preventDefault();
        const shipLength = this.draggedShip.getAttribute('data-length');

        if (game.placeManualyShip(this.initialCoordinatesForShipPlacement, this.draggedShipAxis, shipLength)) {
            // ship was succesfully placed
            this.draggedShip.remove();
        };
        
        if (this.shipsContainer.childElementCount === 0) {
            // all ships were placed, time to start the fight
            // ``=== 1 because there is a button``
            // and unbing listeners
            this.removeDragAndDropListeners();
            this.showWhosTurn.innerText = "Ready to go! Confirm it.";
            document.getElementById("rotateShips").style.display = "none";
        };
    };

    dragEnter(event) {
        event.preventDefault();
    };

    dragLeave(event) {
        this.removeHighlight();
    };

    removeDragAndDropListeners() {
        const friendlyBoardDiv = document.querySelector('.friendly-board');
        const boardCells = friendlyBoardDiv.querySelectorAll('div');

        document.removeEventListener("mousedown", this.mouseDown);

        boardCells.forEach(cell => {
            cell.removeEventListener("dragover", this.dragOver);
            cell.removeEventListener("dragenter", this.dragEnter);
            cell.removeEventListener("dragleave", this.dragLeave);
            cell.removeEventListener("drop", this.dropShip);
        });
    };

    rotateShips() {
        const ships = document.querySelectorAll(".ship");
        const shipCells = document.querySelectorAll(".ship-cell")

        ships.forEach(ship => {
            ship.classList.toggle("ship-col");
        });
        
        shipCells.forEach(cell => {
            cell.classList.toggle("ship-cell-col");
        });

        // switch axis info track
        this.draggedShipAxis === "row" ? this.draggedShipAxis = "col" : this.draggedShipAxis = "row";
    };
    
    removeHighlight() {
        let highlightedArea = document.querySelectorAll(".highlighted");

        highlightedArea.forEach(cell => {
            cell.classList.remove("highlighted");
        });
    };

    highlightArea(cell) {
        // get nearby cells and highlight them
        let nearbyCells = this.getNearbyCells(cell);

        nearbyCells.forEach(cellId => {
            let target = document.getElementById(cellId);
            target.classList.add("highlighted");
        });
    };

    getNearbyCells(cell) {
        // calculate nearby cells
        let hoveredCoordinates = cell.id.slice(2).replace('-', ', ');
        let row = hoveredCoordinates[0];
        let col = hoveredCoordinates[3];
        let shipLength = this.draggedShip.getAttribute('data-length');
        let initialBoardCell;
        let cellList = [];

        if (this.draggedShipAxis === "row") {
            initialBoardCell = row - this.draggedShipCellIndex;
            this.initialCoordinatesForShipPlacement = [initialBoardCell, Number(col)];

            for (let index = 0; index < shipLength; index++) {
                cellList.push(`f-${initialBoardCell + index}-${col}`);
            };
        } else if (this.draggedShipAxis === "col") {
            initialBoardCell = col - this.draggedShipCellIndex;
            this.initialCoordinatesForShipPlacement = [Number(row), initialBoardCell];

            for (let index = 0; index < shipLength; index++) {
                cellList.push(`f-${row}-${initialBoardCell + index}`);
            };
        };

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
        const targetId = `${board}-${attackInfo.coordinates.slice(0).replace(', ', '-')}`;
        const targetDiv = document.getElementById(targetId);
        const attackResult = attackInfo["result"];

        if (attackResult !== "hit") {
            this.displayInfoAboutCurrentTurn(board);
        };

        this.styleAttackedCoordinates(targetDiv, attackResult);
    };

    displayInfoAboutCurrentTurn(whoIsNext) {
        const infoBoard = document.querySelector(".info-board");

        if (whoIsNext === "e") {
            this.showWhosTurn.innerText = "Computer Turn."
            infoBoard.classList.remove("info-board-player-turn");
            infoBoard.classList.add("info-board-computer-turn");
        } else if (whoIsNext === "f") {
            this.showWhosTurn.innerText = "Player Turn."
            infoBoard.classList.remove("info-board-computer-turn");
            infoBoard.classList.add("info-board-player-turn");
        };
    };

    styleAttackedCoordinates(target, attackResult) {
        if (attackResult === null || attackResult === "null") {
            return target.classList.add("miss");
        } else if (attackResult === "hit") {
            return target.classList.add("hit");
        }
    };

    displayFriendlyShips(ship, axis, initialCell) {
        if (ship, axis, initialCell) {
            // axis Y
            const row = initialCell[0];
            // axis X
            const col = initialCell[1];

            // place the ship on the board
            for (let index = 0; index < ship.length; index++) {
                if (axis === "row") {
                    const key = `${row + index}, ${col}`;
                    const coordinates = `f-${key.replace(/,\s*/g, '-')}`;
                    const domSquare = document.getElementById(coordinates);

                    // Create a pseudo-element to cover part of the cell
                    domSquare.style.display = "flex";
                    const pseudoElement = document.createElement('div');

                    const cellSize = 40;
                    const shipSizeWidth = 30;
                    const shipSizeHeight = 35;
                    const margin = (cellSize - shipSizeWidth) / 2;

                    index === 0 ? pseudoElement.style.borderRadius = "100% 100% 0 0" : null;
                    index === (ship.length - 1) ? pseudoElement.style.borderRadius = "0 0 100% 100%" : null;
                    index === 0 ? pseudoElement.style.alignSelf = "end" : null;
                    index === 0 || index === (ship.length - 1) ? pseudoElement.style.height = `${shipSizeHeight}px` : pseudoElement.style.height = `${cellSize}px`;

                    pseudoElement.style.backgroundColor = "#365486";
                    pseudoElement.style.width = `${shipSizeWidth}px`;
                    pseudoElement.style.margin = `0 ${margin}px 0 ${margin}px`;
                    pseudoElement.style.zIndex = '1';

                    // Append the pseudo-element to the cell
                    domSquare.appendChild(pseudoElement);
                } else if (axis === "col") {
                    const key = `${row}, ${col + index}`;
                    const coordinates = `f-${key.replace(/,\s*/g, '-')}`;
                    const domSquare = document.getElementById(coordinates);

                    domSquare.style.display = "flex";
                    const pseudoElement = document.createElement('div');

                    const cellSize = 40;
                    const shipSizeWidth = 35;
                    const shipSizeHeight = 30;
                    const margin = (cellSize - shipSizeHeight) / 2;
                    

                    // Adjustments for column axis
                    index === 0 ? pseudoElement.style.borderRadius = "100% 0 0 100%" : null;
                    index === (ship.length - 1) ? pseudoElement.style.borderRadius = "0 100% 100% 0" : null;
                    index === 0 || index === (ship.length - 1) ? pseudoElement.style.width = `${shipSizeWidth}px` : pseudoElement.style.width = `${cellSize}px`;
                    index === 0 ? pseudoElement.style.margin = `${margin}px 0 ${margin}px auto` : pseudoElement.style.margin = `${margin}px 0 ${margin}px 0`;

                    pseudoElement.style.backgroundColor = "#365486";
                    pseudoElement.style.height = `${shipSizeHeight}px`;
                    pseudoElement.style.zIndex = '1';

                    domSquare.appendChild(pseudoElement);
                };
            };
        };
    };

    clearBoards() {
        // Clear existing board elements
        this.friendlyBoard.textContent = "";
        this.enemyBoard.textContent = "";
    }

    intro() {
        const introContainer = document.querySelector(".intro");
        const mainContainer = document.getElementById("main");
        const infoBoardContainer = document.querySelector(".info-board");
        const playerVsPlayerBtn = document.getElementById("vsPlayer");
        const playerVsComputerBtn = document.getElementById("vsComputer");
        const startGameBtn = document.getElementById("startGame");

        startGameBtn.addEventListener("click", () => {
            introContainer.style.display = "none";
            mainContainer.style.display = "flex";
            infoBoardContainer.style.display = "flex";
            this.updateDOM();
            this.shipPlacementStage();
        });
    };

    shipPlacementStage() {
        const shipsWrapper = document.querySelector(".ships-wrapper");
        const enemyContainer = document.querySelector(".enemy-container");
        const infoBoard = document.querySelector(".info-board");
        const resetBtn = document.getElementById("reset");
        const confirmBtn = document.getElementById("confirm");
        const randomBtn = document.getElementById("random");

        confirmBtn.addEventListener("click", () => {
            if (this.shipsContainer.childElementCount === 0) {
                shipsWrapper.style.display = "none";
                enemyContainer.style.display = "unset";
                this.displayInfoAboutCurrentTurn("f");
            };
        });

        resetBtn.addEventListener("click", () => {
            this.shipsContainer.innerHTML = "";
            game.playerGameboard.resetBoardAndShips();
            this.displayDragableShips();
            this.updateDOM();
        });

        randomBtn.addEventListener("click", () => {
            this.shipsContainer.innerHTML = "";
            game.playerGameboard.resetBoardAndShips();
            this.updateDOM();
            game.placeRandomShips(game.playerGameboard);
            this.showWhosTurn.innerText = "Ready to go! Confirm it.";
        });
    };

    outro(isPlayerAttackLast) {
        const outroContainer = document.querySelector(".outro");
        const mainContainer = document.getElementById("main");
        const shipsWrapper = document.querySelector(".ships-wrapper");
        const infoBoardContainer = document.querySelector(".info-board");
        const enemyContainer = document.querySelector(".enemy-container");
        const restartGameBtn = document.getElementById("restartGame");

        isPlayerAttackLast === true ? this.announceTheWinner("player") : this.announceTheWinner("computer");
        this.showWhosTurn.innerText = "";
        mainContainer.style.display = "none";
        infoBoardContainer.style.display = "none";
        infoBoardContainer.classList.remove("info-board-player-turn");
        infoBoardContainer.classList.remove("info-board-computer-turn");
        outroContainer.style.display = "block"

        restartGameBtn.addEventListener("click", () => {
            outroContainer.style.display = "none";
            mainContainer.style.display = "flex";
            shipsWrapper.style.display = "flex";
            infoBoardContainer.style.display = "flex";
            enemyContainer.style.display = "none";
            this.updateDOM();
        });
    };

    announceTheWinner(winner) {
        const winnerContainer = document.getElementById("winner");

        if (winner === "player") {
            winnerContainer.innerText = "🎉🎉🎉 You won! 🎉🎉🎉"
        } else {
            winnerContainer.innerText = "Computer has won!"
        };
    };

    updateDOM() {
        this.clearBoards();
        this.displayBoards();
        // this.displayFriendlyShips(); is it even needed?
        this.addDragAndDropEventListeners();
        this.showWhosTurn.innerText = "Place the ships.";
    };
};

const dom = new DOM();
const game = new Game(dom);
game.setUpNewGame();
dom.intro();

// dom.displayBoards();
// dom.displayFriendlyShips();
// dom.addEventListenersToShips();