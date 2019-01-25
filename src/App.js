import React from "react";
import { Game } from "tic-tac-toe-core";
import Lobby from "./libs/boardgame.io/react";
import "./lobby.css";

import Board from "./Board";

Game.minPlayers = Game.maxPlayers = 2;

const App = () => (
  <Lobby
    gameServer={process.env.REACT_APP_API_URL}
    lobbyServer={process.env.REACT_APP_API_URL}
    gameComponents={[{ game: Game, board: Board }]}
  />
);

export default App;
