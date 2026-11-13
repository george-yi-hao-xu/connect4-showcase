import { CellPos, GameMove, GamePlace, GameState, Status, WhichPlayer } from '../types'

export function create_an_empty_connect4_game_state(row: number, col: number): GameState {
    const matrix: GamePlace[][] = Array(col).fill(Array(row).fill(GamePlace.NONE))
    
    return {
        matrix: matrix,
        current_player: WhichPlayer.P1
    }
}

export function get_legal_moves(s: GameState): GameMove[]{
    const results : GameMove[] = []
    for (let curr_col = 0; curr_col < s.matrix.length; curr_col++){
        if(s.matrix[curr_col][0] === GamePlace.NONE){
            results.push(curr_col)
        }
    }
    return results
}

export function check_status(s: GameState, chain = 4): Status {
    // iternate all cell to see if any win
    const P1_winning_cells = find_winning_cells(s.matrix, GamePlace.RED)
    const P2_winning_cells = find_winning_cells(s.matrix, GamePlace.YELLOW)

    if (P1_winning_cells && P2_winning_cells) {
        // bug
        console.warn("Both players win. BUG")
        throw new Error("Both players win.")
    }

    // Draw/OnGoing
    if (!P1_winning_cells && !P2_winning_cells){
        const legal_next_moves = get_legal_moves(s)

        if(legal_next_moves.length === 0){
            // draw
            return {
                tag: 'Draw'
            }
        } else {
            // OnGoing
            return {
                tag: 'OnGoing',
                player: s.current_player
            }
        }
    }

    if (P1_winning_cells) {
        return {
            tag: 'Win',
            player: WhichPlayer.P1,
            winning_cells: P1_winning_cells
        }
    }

    if (P2_winning_cells) {
        return {
            tag: 'Win',
            player: WhichPlayer.P2,
            winning_cells: P2_winning_cells
        }
    }

    throw new Error("Unkown Status")
}

export function find_winning_cells(m:GamePlace[][], target:GamePlace, chain =4 ) {
    const DIRECTIONS = [
        { dc: 1, dr: 0}, // ->
        { dc: 0, dr: 1}, // down
        { dc: 1, dr: 1}, // down-right
        { dc: -1, dr: 1}, // down-left
    ]

    // iterate all cells
    for (const [col_i, column] of m.entries()){
        for (const [row_i, cell] of column.entries()){
            if (cell !== target) continue

            // collect
            for (const {dc, dr} of DIRECTIONS){
                const collection_cells: CellPos[] = []

                for (let step = 0; step < chain; step++){
                    const next_col_i = col_i + step * dc
                    const next_row_i = row_i + step * dr
                    const next_cell = m[next_col_i]?.[next_row_i]

                    if (next_cell != target) break
                    collection_cells.push({col: next_col_i, row: next_row_i})
                }

                if (collection_cells.length === chain) return collection_cells
            }
        }
    }

    return null
}

export function apply_move(s: GameState, m: GameMove): GameState{
    const new_matrix: GamePlace[][] = []
    const place = s.current_player === WhichPlayer.P1 ? GamePlace.RED : GamePlace.YELLOW;
    let row = 0;

    for (let i = 0; i < s.matrix.length; i++){
        if (i != m) {
            new_matrix.push([...s.matrix[i]])
        } else {
            const target_col = [...s.matrix[i]]
            target_col.reverse();
            const target_index = target_col.indexOf(GamePlace.NONE);
            row = target_col.length - target_index - 1;
            target_col[target_index] = place;
            target_col.reverse();

            new_matrix.push(target_col)
        }
    }

    return {
        matrix: new_matrix,
        current_player: s.current_player === WhichPlayer.P1 ? WhichPlayer.P2 : WhichPlayer.P1,
        last_drop: {
            row: row,
            col: m
        }
    }
}

function score_game_state(s: GameState, chain = 4): number {
    const status = check_status(s, chain)

    // win case
    if (status.tag === 'Win') {
        return status.player === WhichPlayer.P1 ? +Infinity : -Infinity
    }

    // draw
    if (status.tag === 'Draw') {
        return 0
    }

    const DIRECTIONS = [
        { dc: 1, dr: 0},
        { dc: 0, dr: 1},
        { dc: 1, dr: 1},
        { dc: 1, dr: -1}
    ]

    let state_score = 0;

    for (const [col_i, column] of s.matrix.entries()){
        for (const [row_i, cell] of column.entries()){
            for (const direction of DIRECTIONS){
                const { dc, dr } = direction;
                let red_count = 0;
                let yellow_count = 0;
                let is_complete_window = true

                // one direction, how many red/yellow
                for (let step = 0; step < chain; step++){
                    const step_place = s.matrix[col_i + step * dc]?.[row_i + step * dr]

                    // go outside
                    if (step_place === undefined) {
                        is_complete_window = false
                        break
                    }

                    if (step_place === GamePlace.RED) red_count++;
                    if (step_place === GamePlace.YELLOW) yellow_count++;
                }

                // impossible to achieve a chain
                if (!is_complete_window || (red_count > 0 && yellow_count > 0)) continue

                if (red_count > 0) state_score += 10 ** (red_count - 1);
                if (yellow_count > 0) state_score -= 10 ** (yellow_count - 1);
            }
        }
    }

    return state_score
}

export function minimax(s: GameState, max_depth = 3, chain = 4): GameMove{
    if (check_status(s, chain).tag !== 'OnGoing') throw new Error("Bug: call ai when game is over!")

    // tree search
    function search_r(s: GameState, current_depth: number) {
        // end case
        if (check_status(s).tag !== 'OnGoing' || current_depth === max_depth) {
            // get score and return
            return score_game_state(s, chain)
        }

        // P1-MAX
        if (s.current_player === WhichPlayer.P1) {
            let bestScore = -Infinity
            for (const possible_move of get_legal_moves(s)){
                bestScore = Math.max(bestScore, search_r(apply_move(s, possible_move), current_depth + 1))
            }

            return bestScore
        }

        // P2-MIN
        let bestScore = +Infinity
        for (const possible_move of get_legal_moves(s)){
            bestScore = Math.min(bestScore, search_r(apply_move(s, possible_move), current_depth + 1))
        }
        return bestScore
    }

    // starts here
    let best_move: GameMove = get_legal_moves(s)[0] 
    let best_score = s.current_player === WhichPlayer.P1 ? -Infinity : Infinity

    for (const possible_move of get_legal_moves(s)) {
        const current_score = search_r(apply_move(s, possible_move), 1)
        const is_better = s.current_player === WhichPlayer.P1
            ? current_score > best_score
            : current_score < best_score
        
            if (is_better) {
                best_move = possible_move
                best_score = current_score
            }
    }

    return best_move
}
