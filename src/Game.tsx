import React from "react";
import Board from "./Board";
import Piece, {Color} from "./Piece";

export enum Turn { Player, Ai }

class Game extends React.Component<{}, {}> {

  public static neighbors: number[][] = [
    [-1, -1],
    [-1,  0],
    [-1,  1],
    [ 0,  1],
    [ 1,  1],
    [ 1,  0],
    [ 1, -1],
    [ 0, -1],
  ];

  public static turns: string[] = [
    "player", "computer",
  ];

  public board: Board;
  public mounted: boolean = false;
  public aiThinking: boolean = false;

  constructor(props) {
    super(props);

    this.board = new Board({game: this});
    this.board.initalize();
  }

  public render() {
    return <>{this.board.render()}</>;
  }

  public componentDidMount(): void {
    this.mounted = true;
    this.setState({ waitIsActive: false });
  }

  public componentWillMount(): void {
    this.mounted = false;
  }

  public forceUpdateIfMounted(): void {
    if (this.mounted) {
      this.forceUpdate();
    }
  }

  public handlePieceClick(piece: Piece): void {
    if (this.board.turn !== Turn.Player) {
      return;
    }

    const moveColor = this.board.turnColor();
    const p = new Piece({row: piece.row, col: piece.col, color: moveColor});

    if (this.board.isLegalMove(p)) {
      this.board.history.push(p);
      this.board.flipPieces(p);
      this.forceUpdateIfMounted();

      if (this.board.hasLegalMove(Piece.otherColor(this.board.playerColor))) {
        this.board.changeTurn();

        this.aiThinking = true;
        this.forceUpdateIfMounted();

        this.waitAiTurn();
      }
    }
  }

  private waitAiTurn() {
    const that = this;
    setTimeout( () => {
      while (true) {
        that.aiTurn();

        if (this.board.hasLegalMove(this.board.playerColor)) {
          this.aiThinking = false;
          break;
        }

        if (!this.board.hasLegalMove(this.board.aiColor)) {
          this.aiThinking = false;
          break;
        }
      }

      this.board.changeTurn();
      this.aiThinking = false;
      this.forceUpdateIfMounted();

    }, 200);
  }

  private aiTurn(): void {
    const piece = this.minimaxDecision(this.board, this.board.aiColor);
    this.board.history.push(piece);
    this.board.flipPieces(piece);
  }

  private heuristic(board: Board, turnColor: Color): number {
    const playerScore: number = board.getScore(turnColor);
    const aiScore: number = board.getScore(Piece.otherColor(turnColor));
    return playerScore - aiScore;
  }

  private minimaxDecision(board: Board, turnColor: Color): Piece {
    const pieces = this.movesList(board, turnColor);
    let bestPiece: Piece = new Piece({col: -1, row: -1, color: Color.Empty});
    let bestValue: number = -1000000;

    for (const piece of pieces) {
      const b = Board.clone(board);
      b.flipPieces(piece);
      const value: number = this.minimaxValue(b, turnColor, Piece.otherColor(turnColor), 1, -1000000, 1000000);

      if (value > bestValue) {
        bestValue = value;
        bestPiece = piece;
      }
    }

    return bestPiece;
  }

  private minimaxValue(board: Board, originalColor: Color, currentColor: Color,
                       depth: number, alpha: number, beta: number): number {
    if (depth === 5 || board.isGameOver()) {
      return this.heuristic(board, originalColor);
    }

    const pieces = this.movesList(board, currentColor);
    const otherColor: Color = Piece.otherColor(originalColor);

    if (pieces.length === 0) {
      return this.minimaxValue(board, originalColor, otherColor, depth + 1, alpha, beta);
    } else {
      let bestValue: number = originalColor === currentColor ? -1000000 : 1000000;

      for (const piece of pieces) {
        const b = Board.clone(board);
        b.flipPieces(piece);

        const value: number = this.minimaxValue(b, originalColor, otherColor, depth + 1, alpha, beta);

        if (originalColor === currentColor) { // max
          alpha = Math.max(alpha, bestValue);
          if (beta <= alpha) {
            bestValue = value;
            break;
          }
        } else { // min
          beta = Math.min(beta, bestValue);
          if (beta <= alpha) {
            bestValue = value;
            break;
          }
        }
      }

      return bestValue;
    }

    return -1;
  }

  private movesList(board: Board, turnColor: Color): Piece[] {
    const pieces: Piece[] = [];

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        const piece = new Piece({row, col, color: turnColor});
        if (board.isLegalMove(piece)) {
          pieces.push(piece);
        }
      }
    }

    return pieces;
  }
}

export default Game;
