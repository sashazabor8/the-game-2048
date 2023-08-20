let score = 0;

export class Cell {
  constructor(gridElement, x, y) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridElement.append(cell);
    this.x = x;
    this.y = y;
  }

  linkTile(tile) {
    tile.setXY(this.x, this.y);
    this.linkedTile = tile;
  }

  isEmpty() {
    return !this.linkedTile;
  }

  unlinkTile() {
    this.linkedTile = null;
  }

  linkTileForMerge(tile) {
    tile.setXY(this.x, this.y);
    this.linkedTileForMerge = tile;
  }

  unlinkTileForMerge() {
    this.linkedTileForMerge = null;
  }

  hasTileForMerge() {
    return !!this.linkedTileForMerge;
  }

  canAccept(newTile) {
    return (
      this.isEmpty() ||
      (!this.hasTileForMerge() && this.linkedTile.value === newTile.value)
    );
  }

  mergeTiles() {
    const mergedValue = this.linkedTile.value + this.linkedTileForMerge.value;
    this.linkedTile.setValue(mergedValue);

    const mergeScore =
      mergedValue * Math.log2(mergedValue / this.linkedTileForMerge.value);
    score = score + mergeScore;

    this.linkedTileForMerge.removeFromDom();
    this.unlinkTileForMerge();
  }

  getScore() {
    return score;
  }

  resetScore() {
    score = 0;
  }
}
