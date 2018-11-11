import { Client } from "boardgame.io/react";

import AI from "./AI";
import Board from "./Board";
import Game from "./Game";

const App = Client({ game: Game, board: Board, ai: AI });

export default App;
