import { Server } from "boardgame.io/server";
import { Game } from "tic-tac-toe-core";

const server = Server({ games: [Game] });
server.run(8000);
