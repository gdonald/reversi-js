import * as React from "react";
import * as ReactDOM from "react-dom";
import Game from "./Game";

const Reversi: React.FunctionComponent<{}> = () => {
  return <Game key="g"></Game>;
};

ReactDOM.render(
    <Reversi/>,
    document.getElementById("root"),
);
