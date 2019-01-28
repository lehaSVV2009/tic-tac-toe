/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import Cookies from "react-cookies";
import PropTypes from "prop-types";
import { Client } from "boardgame.io/react";
import { LobbyConnection } from "./connection";
import LobbyLoginForm from "./login-form";
import LobbyRoomInstance from "./room-instance";
import LobbyCreateRoomForm from "./create-room-form";

export const PHASES = {
  ENTER: "enter",
  PLAY: "play",
  LIST: "list"
};

// TODO rename gameInstances to rooms
/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or spectate game instances.
 */

class Lobby extends React.Component {
  static propTypes = {
    gameComponents: PropTypes.array.isRequired,
    lobbyServer: PropTypes.string,
    gameServer: PropTypes.string,
    debug: PropTypes.bool,
    clientFactory: PropTypes.func
  };

  static defaultProps = {
    debug: false,
    clientFactory: Client
  };

  state = {
    phase: PHASES.ENTER,
    playerName: "Visitor",
    runningGame: null,
    errorMsg: "",
    credentialStore: {}
  };

  constructor(props) {
    super(props);
    this._createConnection(this.props);
    this._updateConnection();
  }

  componentDidMount() {
    let cookie = Cookies.load("lobbyState") || {};
    if (cookie.phase && cookie.phase === PHASES.PLAY) {
      cookie.phase = PHASES.LIST;
    }
    this.setState({
      phase: cookie.phase || PHASES.ENTER,
      playerName: cookie.playerName || "Visitor",
      credentialStore: cookie.credentialStore || {}
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let name = this.state.playerName;
    let creds = this.state.credentialStore[name];
    if (
      prevState.phase !== this.state.phase ||
      prevState.credentialStore[name] !== creds ||
      prevState.playerName !== name
    ) {
      this._createConnection(this.props);
      this._updateConnection();
      let cookie = {
        phase: this.state.phase,
        playerName: name,
        credentialStore: this.state.credentialStore
      };
      Cookies.save("lobbyState", cookie, { path: "/" });
    }
  }

  _createConnection = props => {
    const name = this.state.playerName;
    this.connection = LobbyConnection({
      server: props.lobbyServer,
      gameComponents: props.gameComponents,
      playerName: name,
      playerCredentials: this.state.credentialStore[name]
    });
  };

  _updateCredentials = (playerName, credentials) => {
    this.setState(prevState => {
      // clone store or componentDidUpdate will not be triggered
      const store = Object.assign({}, prevState.credentialStore);
      store[[playerName]] = credentials;
      return { credentialStore: store };
    });
  };

  _updateConnection = async () => {
    await this.connection.refresh();
    this.forceUpdate();
  };

  _enterLobby = playerName => {
    this.setState({ playerName, phase: PHASES.LIST });
  };

  _exitLobby = async () => {
    await this.connection.disconnect();
    this.setState({ phase: PHASES.ENTER, errorMsg: "" });
  };

  _createRoom = async (gameName, numPlayers) => {
    try {
      await this.connection.create(gameName, numPlayers);
      await this.connection.refresh();
      // rerender
      this.setState({});
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _joinRoom = async (gameName, gameID, playerID) => {
    try {
      await this.connection.join(gameName, gameID, playerID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _leaveRoom = async (gameName, gameID) => {
    try {
      await this.connection.leave(gameName, gameID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _startGame = (gameName, gameOpts) => {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: "game " + gameName + " not supported"
      });
      return;
    }

    let multiplayer = null;
    if (gameOpts.numPlayers > 1) {
      if (this.props.gameServer) {
        multiplayer = { server: this.props.gameServer };
      } else {
        multiplayer = true;
      }
    }

    const app = this.props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer
    });

    const game = {
      app: app,
      gameID: gameOpts.gameID,
      playerID: gameOpts.numPlayers > 1 ? gameOpts.playerID : null,
      credentials: this.connection.playerCredentials
    };

    this.setState({ phase: PHASES.PLAY, runningGame: game });
  };

  _exitRoom = () => {
    this.setState({ phase: PHASES.LIST, runningGame: null });
  };

  _getPhaseVisibility = phase => {
    return this.state.phase !== phase ? "hidden" : "phase";
  };

  renderRooms = (gameInstances, playerName) => {
    return gameInstances.map(gameInstance => {
      const { gameID, gameName, players } = gameInstance;
      return (
        <LobbyRoomInstance
          key={"instance-" + gameID}
          gameInstance={{ gameID, gameName, players: Object.values(players) }}
          playerName={playerName}
          onClickJoin={this._joinRoom}
          onClickLeave={this._leaveRoom}
          onClickPlay={this._startGame}
        />
      );
    });
  };

  render() {
    // player info
    const { gameComponents, renderer } = this.props;
    const { errorMsg, playerName, phase, runningGame } = this.state;

    if (renderer) {
      return renderer({
        errorMsg,
        gameComponents,
        gameInstances: this.connection.gameInstances,
        phase,
        playerName,
        runningGame,
        onEnterLobby: this._enterLobby,
        onExitLobby: this._exitLobby,
        onCreateRoom: this._createRoom,
        onJoinRoom: this._joinRoom,
        onLeaveRoom: this._leaveRoom,
        onExitRoom: this._exitRoom,
        onStartGame: this._startGame
      });
    }

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <div className={this._getPhaseVisibility(PHASES.ENTER)}>
          <LobbyLoginForm
            key={playerName}
            playerName={playerName}
            onEnter={this._enterLobby}
          />
        </div>

        <div className={this._getPhaseVisibility(PHASES.LIST)}>
          <p>Welcome, {playerName}</p>

          <div className="phase-title" id="game-creation">
            <span>Create a room:</span>
            <LobbyCreateRoomForm
              games={gameComponents}
              createGame={this._createRoom}
            />
          </div>
          <p className="phase-title">Join a room:</p>
          <div id="instances">
            <table>
              <tbody>
                {this.renderRooms(this.connection.gameInstances, playerName)}
              </tbody>
            </table>
            <span className="error-msg">
              {errorMsg}
              <br />
            </span>
          </div>
          <p className="phase-title">
            Rooms that become empty are automatically deleted.
          </p>
        </div>

        <div className={this._getPhaseVisibility(PHASES.PLAY)}>
          {runningGame && (
            <runningGame.app
              gameID={runningGame.gameID}
              playerID={runningGame.playerID}
              credentials={runningGame.credentials}
            />
          )}
          <div className="buttons" id="game-exit">
            <button onClick={this._exitRoom}>Exit game</button>
          </div>
        </div>

        <div className="buttons" id="lobby-exit">
          <button onClick={this._exitLobby}>Exit lobby</button>
        </div>
      </div>
    );
  }
}

export default Lobby;
