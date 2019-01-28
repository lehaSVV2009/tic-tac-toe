import React from "react";
import { Game } from "tic-tac-toe-core";
import Lobby from "./libs/boardgame.io/react";

import Board from "./Board";
import StyledLobby from "./StyledLobby";

Game.minPlayers = Game.maxPlayers = 2;

const App = () => (
  <Lobby
    gameServer={process.env.REACT_APP_API_URL}
    lobbyServer={process.env.REACT_APP_API_URL}
    gameComponents={[{ game: Game, board: Board }]}
    renderer={({
      errorMsg,
      gameComponents,
      gameInstances,
      phase,
      playerName,
      runningGame,
      onEnterLobby,
      onExitLobby,
      onCreateRoom,
      onJoinRoom,
      onLeaveRoom,
      onExitRoom,
      onStartGame
    }) => (
      <StyledLobby
        errorMsg={errorMsg}
        gameComponents={gameComponents}
        gameInstances={gameInstances}
        phase={phase}
        playerName={playerName}
        runningGame={runningGame}
        onEnterLobby={onEnterLobby}
        onExitLobby={onExitLobby}
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        onLeaveRoom={onLeaveRoom}
        onExitRoom={onExitRoom}
        onStartGame={onStartGame}
      />
    )}
  />
);

export default App;
