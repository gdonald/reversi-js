import React from "react";
import Board from "./Board";
import Game from "./Game";

export enum Color { Black, White, Empty }

class Piece extends React.Component {

  public static images: string[] = [
    "black", "white", "empty",
  ];

  public static otherColor(color: Color): Color {
    return color === Color.White ? Color.Black : Color.White;
  }

  public game: Game;
  public color: Color = Color.Empty;
  public col: number;
  public row: number;

  constructor(props) {
    super(props);

    this.game = props.game;
    this.col = props.col;
    this.row = props.row;
    this.color = props.color;

    this.handleClick = this.handleClick.bind(this);
  }

  public render() {
    return (
      <td className="piece" key={`c${this.col}r${this.row}`} onClick={this.handleClick}>
        <div key={`piece${this.col}${this.row}`}>
          <img src={`img/${Piece.images[this.color]}.png`} />
        </div>
      </td>
    );
  }

  public handleClick(): void {
    this.game.handlePieceClick(this);
  }

  public toString(): string {
    return `${Board.letters[this.col + 1]}${this.row + 1}`;
  }
}

export default Piece;
