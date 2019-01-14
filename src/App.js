import React from "react";
import axios from "axios";
import { Client } from "boardgame.io/react";
import { Game } from "tic-tac-toe-core";

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

class App extends React.Component {
  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_API_URL}/games`)
      .then(response => alert(`Fetch games response: ${response.data}`))
      .catch(error => alert(`Fetch games error: ${error}`));
  }

  render() {
    return (
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
  }
}

export default App;
