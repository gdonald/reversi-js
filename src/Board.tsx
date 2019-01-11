import React from "react";
import Game, {Turn} from "./Game";
import Piece, {Color} from "./Piece";

class Board extends React.Component<{}, {}> {

  public static letters: string[] = [
    "", "A", "B", "C", "D", "E", "F", "G", "H",
  ];

  public static values: number[][] = [
    [1000, -400, 100,  50,  50, 100, -400, 1000],
    [-400, -800,  -1,  -1,  -1,  -1, -800, -400],
    [ 100,   -1,   1,   1,   1,   1,   -1,  100],
    [  50,   -1,   1,   1,   1,   1,   -1,   50],
    [  50,   -1,   1,   1,   1,   1,   -1,   50],
    [ 100,   -1,   1,   1,   1,   1,   -1,  100],
    [-400, -800,  -1,  -1,  -1,  -1, -800, -400],
    [1000, -400, 100,  50,  50, 100, -400, 1000],
  ];

  public static SIZE: number = 8;

  public static clone(board: Board): Board {
    const b: Board = new Board({game: null});

    b.initializeGrid();
    for (let row = 0; row < Board.SIZE; row++) {
      b.grid[row] = [];
      for (let col = 0; col < Board.SIZE; col++) {
        b.grid[row][col] = new Piece({game: null, row, col, color: board.grid[row][col].color});
      }
    }

    return b;
  }

  public game: Game;
  public grid: Piece[][];
  public history: Piece[];
  public turn: Turn;
  public playerColor: Color;
  public aiColor: Color;

  constructor(props) {
    super(props);

    this.game = props.game;
    this.turn = Turn.Player;
    this.playerColor = Color.Black;
    this.aiColor = Color.White;
    this.history = [];

    this.initializeGrid();
  }

  public render() {
    return (
      <div className="outer">
        <div className="history">
          <table>
            <thead>
            <tr>
              <th colSpan={3}>History</th>
            </tr>
            </thead>
            <tbody>
            {this.history.reverse().map((row, index) => {
              return (
                <tr className="row" key={`r${index}`}>
                  <td>{row.toString()}</td>
                  <td>{Piece.images[row.color]}</td>
                  <td>{Game.turns[row.color]}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        <div className="board">
          <table>
            <thead>
            <tr>
              {Board.letters.map((letter) => {
                return <th key={`th${letter}`}>{letter}</th>;
              })}
            </tr>
            </thead>
            <tbody>
            {this.grid.map((row, index) => {
              return (
                <tr className="row" key={`r${index}`}>
                  <th>{index + 1}</th>
                  {row.map((piece) => {
                    return piece.render();
                  })}
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        <div className="analysis">
          <table>
            <thead>
            <tr>
              <th colSpan={2} className="title">Analysis</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Mobility</td>
              <td>{this.getMobility(this.turnColor())}</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>{this.getStability(this.turnColor())}</td>
            </tr>
            <tr>
              <td>Black:</td>
              <td>{this.discCount(Color.Black)}</td>
            </tr>
            <tr>
              <td>White:</td>
              <td>{this.discCount(Color.White)}</td>
            </tr>
            </tbody>
          </table>

        </div>
      </div>
    );
  }

  public initalize(): void {
    this.initializeGrid();
    this.setStartingPieces();
  }

  public getScore(color: Color): number {
    const blackDiscs: number = 100 * this.discCount(Color.Black);
    const whiteDiscs: number = 100 * this.discCount(Color.White);
    const totalDiscs: number = whiteDiscs + blackDiscs;
    const mobility: number = this.getMobility(color);
    const stability: number = this.getStability(color);

    console.log("totalDiscs: " + totalDiscs);
    console.log("mobility: " + mobility);
    console.log("stability: " + stability);

    let score: number = 0;

    if (totalDiscs < 16) {
      score += 50 * mobility;
      score += 100 * stability;
    } else if (totalDiscs < 32) {
      score += 40 * mobility;
      score += 50 * stability;
      score += 60 * totalDiscs;
    } else if (totalDiscs < 48) {
      score += 20 * mobility;
      score += 70 * stability;
      score += 60 * totalDiscs;
    } else {
      score += 50 * stability;
      score += 100 * totalDiscs;
    }

    return score;
  }

  public isGameOver(): boolean {
    return !(this.hasLegalMove(Color.Black) || this.hasLegalMove(Color.White));
  }

  public legalMovesCount(color: Color): number {
    let count: number = 0;

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.isLegalMove(new Piece({row, col, color}))) {
          count++;
        }
      }
    }

    return count;
  }

  public getMobility(color: Color): number {
    const black = this.legalMovesCount(Color.Black);
    const white = this.legalMovesCount(Color.White);

    if (color === Color.White) {
      return 100 * (white - black);
    } else {
      return 100 * (black - white);
    }
  }

  public getStability(color: Color): number {
    const black = this.piecesValue(Color.Black);
    const white = this.piecesValue(Color.White);

    if (color === Color.White) {
      return white - black;
    } else {
      return black - white;
    }
  }

  public piecesValue(color: Color): number {
    let count: number = 0;

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.grid[row][col].color === color) {
          count += Board.values[row][col];
        }
      }
    }

    return count;
  }

  public discCount(color: Color): number {
    let count: number = 0;

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.grid[row][col].color === color) {
          count++;
        }
      }
    }

    return count;
  }

  public flip(col: number, row: number, color: Color): void {
    this.grid[row][col].color = color;
  }

  public flipPieces(piece: Piece): void {
    const opColor = Piece.otherColor(piece.color);

    let col: number;
    let row: number;
    let fCol: number;
    let fRow: number;

    this.flip(piece.col, piece.row, piece.color);

    for (let n = 0; n < Board.SIZE; n++) {
      row = piece.row + Game.neighbors[n][0];
      col = piece.col + Game.neighbors[n][1];

      if (row < 0 || col < 0 || row >= Board.SIZE || col >= Board.SIZE) {
        continue;
      }

      if (this.grid[row][col].color === opColor) {

        row += Game.neighbors[n][0];
        col += Game.neighbors[n][1];

        while (row >= 0 && col >= 0 && row < Board.SIZE && col < Board.SIZE) {
          if (this.grid[row][col].color === piece.color) {
            fRow = piece.row;
            fCol = piece.col;

            while (true) {
              fRow += Game.neighbors[n][0];
              fCol += Game.neighbors[n][1];
              this.flip(fCol, fRow, piece.color);

              if (fRow === row && fCol === col) {
                break;
              }
            }

            break;
          }

          row += Game.neighbors[n][0];
          col += Game.neighbors[n][1];
        }
      }
    }
  }

  public isLegalMove(piece: Piece): boolean {
    if (!this.pieceIsEmpty(piece)) {
      return false;
    }

    const opColor = Piece.otherColor(piece.color);
    let colX: number;
    let rowY: number;

    for (const neighbor of Game.neighbors) {
      rowY = piece.row + neighbor[0];
      colX = piece.col + neighbor[1];

      if (rowY < 0 || colX < 0 || rowY >= Board.SIZE || colX >= Board.SIZE) {
        continue;
      }

      if (this.grid[rowY][colX].color === opColor) {
        rowY += neighbor[0];
        colX += neighbor[1];

        while (rowY >= 0 && colX >= 0 && rowY < Board.SIZE && colX < Board.SIZE) {
          if (this.grid[rowY][colX].color === piece.color) {
            return true;
          } else if (this.grid[rowY][colX].color === Color.Empty) {
            break;
          }

          rowY += neighbor[0];
          colX += neighbor[1];
        }
      }
    }

    return false;
  }

  public hasLegalMove(color: Color): boolean {
    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.isLegalMove(new Piece({row, col, color}))) {
          return true;
        }
      }
    }

    return false;
  }

  public changeTurn(): void {
    this.turn = this.turn === Turn.Player ? Turn.Ai : Turn.Player;
  }

  public turnColor(): Color {
    return this.turn === Turn.Player ? this.playerColor : this.aiColor;
  }

  private pieceIsEmpty(piece: Piece): boolean {
    return this.grid[piece.row][piece.col].color === Color.Empty;
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let row = 0; row < Board.SIZE; row++) {
      this.grid[row] = [];
      for (let col = 0; col < Board.SIZE; col++) {
        this.grid[row][col] = new Piece({game: this.game, row, col, color: Color.Empty});
      }
    }
  }

  private setStartingPieces(): void {
    this.flip(3, 3, Color.White);
    this.flip(4, 3, Color.Black);
    this.flip(3, 4, Color.Black);
    this.flip(4, 4, Color.White);
  }
}

export default Board;
