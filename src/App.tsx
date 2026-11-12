import { useState } from 'react'
import "./App.scss";
import { create_an_empty_connect4_game_state, get_legal_moves, check_status, apply_move } from './utils/game';
import { COL, ROW } from './constants'
import { GameMove, Mode, WhichPlayer, type Status } from './types'

function App(){
    const [gameState, setGameState] = useState(create_an_empty_connect4_game_state(ROW, COL));
    const [gameStatus, setGameStatus] = useState<Status>({tag: 'OnGoing', player: WhichPlayer.P1});
    const [mode, setMode] = useState<Mode>(Mode.HumanAi);

    function handleCellClick(col: GameMove) {
        // check if it's a legal move; some cols are full
        const all_legal_moves = get_legal_moves(gameState)
        if (!all_legal_moves.includes(col)) {
            console.warn("Invalid move: ", col)
            return;
        }

        // check Game is over or not
        const current_status = check_status(gameState)
        setGameStatus(current_status)
        if (current_status.tag != 'OnGoing') {
            console.warn("Game OVer")
            return;
        }

        // update state and status
        const new_state = apply_move(gameState, col);
        const new_status = check_status(new_state)


        // update
        setGameState(new_state)
        setGameStatus(new_status)
    }

    return (
        <div className="app">
            <main className="app-main">

                {/* Game Board */}
                <div className="game-board">
                    {Array.from({ length: COL}, (_, col) => {
                        return <div className={`cell-col`} key={col}>
                            {Array.from({ length: ROW}, (_, row) => {
                                const place = gameState.matrix[col][row]

                                return <div className={`cell ${place}`} key={row} onClick={() => handleCellClick(col)}></div>
                            })}
                            </div>
                    })}
                </div>

                {/* Status & Controls */}
                <div>
                    {JSON.stringify(gameStatus)}
                </div>
            </main>
        </div>
    )
}

export default App;
