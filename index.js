import { Grid } from './js/grid.js';
import { Tile } from './js/tile.js';

let score = 0;
const gameBoard = document.getElementById('game-board');
const grid = new Grid(gameBoard);

grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

setInputOnce();

function setInputOnce() {
  window.addEventListener('keydown', handleInput, { once: true });
}

async function handleInput(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setInputOnce();
        return;
      }
      await moveUp();
      break;
    case 'ArrowDown':
      if (!canMoveDown()) {
        setInputOnce();
        return;
      }
      await moveDown();
      break;
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setInputOnce();
        return;
      }
      await moveLeft();
      break;
    case 'ArrowRight':
      if (!canMoveRight()) {
        setInputOnce();
        return;
      }
      await moveRight();
      break;
    default:
      setInputOnce();
      return;
  }
  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveDown() && !canMoveUp() && !canMoveLeft() && !canMoveRight()) {
    await newTile.waitForAnimationEnd();
    addModalGameOver();
    return;
  }

  updateScoreDisplay();
  setInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByStroke);
}

async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedStroke);
}

async function slideTiles(groupedCells) {
  const promises = [];
  groupedCells.forEach(group => slideTilesInGroup(group, promises));

  await Promise.all(promises);

  grid.cells.forEach(cell => {
    cell.hasTileForMerge() && cell.mergeTiles();
    score = cell.getScore();
  });
}

function slideTilesInGroup(group, promises) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell;
    let j = i - 1;

    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }
    cellWithTile.unlinkTile();
  }
}

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn);
}
function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}
function canMoveLeft() {
  return canMove(grid.cellsGroupedByStroke);
}
function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedStroke);
}

function canMove(groupedCells) {
  return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }
    if (cell.isEmpty()) {
      return false;
    }
    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  });
}

function addModalGameOver() {
  const body = document.body;
  const modalContent = ` 
  <div id="game-modal">
       <div class="modal">
            <h2 class="modal-title">Game over</h2>
            <p class="modal-score">Score: ${score} </p>
            <button type="button" class="modal-button">Try agian!</button>
        </div>
    </div>`;
  body.insertAdjacentHTML('beforeend', modalContent);

  const buttonRef = document.querySelector('.modal-button');
  buttonRef.addEventListener('click', onClickButtonRef);
}

function onClickButtonRef() {
  const gameModalRef = document.getElementById('game-modal');
  gameModalRef.remove();
  resetGame();
}

function resetGame() {
  const tileElements = document.querySelectorAll('.tile');
  score = 0;
  updateScoreDisplay();

  tileElements.forEach(tileElement => {
    tileElement.remove();
  });

  grid.cells.forEach(cell => {
    cell.unlinkTile();
    cell.resetScore();
  });
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
  setInputOnce();
}

function updateScoreDisplay() {
  const scoreElement = document.querySelector('.score');
  scoreElement.textContent = `Score: ${score}`;
}
