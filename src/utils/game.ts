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

    for (let i = 0; i < s.matrix.length; i++){
        if (i != m) {
            new_matrix.push([...s.matrix[i]])
        } else {
            const target_col = [...s.matrix[i]]
            target_col.reverse();
            const target_index = target_col.indexOf(GamePlace.NONE);
            target_col[target_index] = place;
            target_col.reverse();

            new_matrix.push(target_col)
        }
    }

    return {
        matrix: new_matrix,
        current_player: s.current_player === WhichPlayer.P1 ? WhichPlayer.P2 : WhichPlayer.P1
    }
}
