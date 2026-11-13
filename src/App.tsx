import { useState } from 'react'
import "./App.scss";
import { create_an_empty_connect4_game_state, get_legal_moves, check_status, apply_move, minimax } from './utils/game';
import { COL, ROW, AI_DEPTH } from './constants'
import { GameMove, Mode, WhichPlayer, type Status } from './types'

function App(){
    const [gameState, setGameState] = useState(create_an_empty_connect4_game_state(ROW, COL));
    const [gameStatus, setGameStatus] = useState<Status>({tag: 'OnGoing', player: WhichPlayer.P1});
    const [mode, setMode] = useState<Mode>(Mode.HumanHuman);

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
        const human_new_state = apply_move(gameState, col);
        const human_new_status = check_status(human_new_state)


        // update
        setGameState(human_new_state)
        setGameStatus(human_new_status)

        // call ai if ai mode
        if(mode === Mode.HumanAi && human_new_status.tag === 'OnGoing') {
            // call ai
            const best_move_for_ai = minimax(human_new_state, AI_DEPTH);
            
            const ai_new_state = apply_move(human_new_state, best_move_for_ai)
            const ai_new_status = check_status(ai_new_state)
            setGameState(ai_new_state)
            setGameStatus(ai_new_status)
        }
    }


    function handleModeChange(newMode: Mode){
        const new_empty_state = create_an_empty_connect4_game_state(ROW, COL);
        setMode(newMode)
        setGameState(new_empty_state)
        setGameStatus(check_status(new_empty_state))
    }

    const _isFinished = gameStatus.tag !== 'OnGoing'

    const _displayedPlayer = gameStatus.tag === 'OnGoing'
        ? gameState.current_player
        : gameStatus.tag === 'Win'
            ? gameStatus.player
            : '';
    
    const _statusText = gameStatus.tag === 'Draw'
        ? 'Draw'
        : gameStatus.tag === 'Win'
            ? `${gameStatus.player} wins`
            : `${gameState.current_player}'s turn`

    return (
        <div className="app">
            <main className="app-main">

                {/* Game Board */}
                <div className="game-board">
                    {Array.from({ length: COL}, (_, col) => {
                        return <div className={`cell-col`} key={col}>
                            {Array.from({ length: ROW}, (_, row) => {
                                const place = gameState.matrix[col][row]
                                const isWinning = gameStatus.winning_cells?.some(cell => cell.col === col && cell.row === row)
                                const isLast = gameState.last_drop?.col === col && gameState.last_drop?.row === row

                                return <div 
                                    className={`cell ${place} ${isWinning ? "winning" : ""} ${_isFinished ? 'finished' : ''} ${isLast ? 'last' : ''}`} 
                                    key={row} onClick={() => handleCellClick(col)}></div>
                            })}
                            </div>
                    })}
                </div>

                {/* Status & Controls */}
                <div className="control">
                    {/* status */}
                    <div className="turn-status" role="status">
                        {/* small circle */}
                        {_displayedPlayer && <span className={`turn-indicator ${_displayedPlayer}`}></span>}
                        <span>{_statusText}</span>
                    </div>

                    <div className="control-actions">
                        <select value={mode} onChange={e => handleModeChange(e.target.value)}>
                            {Object.values(Mode).map(m => {
                                return <option value={m} id={m} key={m}>{m}</option>
                            })}
                        </select>

                        <button onClick={() => handleModeChange(mode)}>Refresh</button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App;
