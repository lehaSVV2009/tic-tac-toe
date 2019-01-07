import React from "react";
import { Client } from "boardgame.io/react";
import { Game } from "tic-tac-toe-core";

import AI from "./AI";
import Board from "./Board";

// const TicTacToeSinglePlayer = Client({
//   game: Game,
//   board: Board,
//   ai: AI
// });

// const TicTacToeMultiPlayerLocal = Client({
//   game: TicTacToe,
//   board: Board,
//   multiplayer: { local: true }
// });

const TicTacToeMultiPlayerRemote = Client({
  game: Game,
  board: Board,
  multiplayer: { server: process.env.REACT_APP_API_URL }
});

const App = () => (
  <div>
    {/* <div>
      Single player
      <TicTacToeSinglePlayer />
    </div> */}
    {/* <div>
      Multi player local
      <TicTacToeMultiPlayerLocal playerID="0" />
      <TicTacToeMultiPlayerLocal playerID="1" />
    </div> */}
    <div>
      Multi player remote
      <TicTacToeMultiPlayerRemote playerID="0" />
      <TicTacToeMultiPlayerRemote playerID="1" />
    </div>
  </div>
);

export default App;
