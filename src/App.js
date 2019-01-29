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
      handleEnterLobby,
      handleExitLobby,
      handleCreateRoom,
      handleJoinRoom,
      handleLeaveRoom,
      handleExitRoom,
      handleStartGame
    }) => (
      <StyledLobby
        errorMsg={errorMsg}
        gameComponents={gameComponents}
        gameInstances={gameInstances}
        phase={phase}
        playerName={playerName}
        runningGame={runningGame}
        onEnterLobby={handleEnterLobby}
        onExitLobby={handleExitLobby}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
        onExitRoom={handleExitRoom}
        onStartGame={handleStartGame}
      />
    )}
  />
);

export default App;
