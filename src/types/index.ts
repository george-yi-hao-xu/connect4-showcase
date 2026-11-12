// 2 players
export enum WhichPlayer {
    P1 = 'P1',
    P2 = 'P2'
}

// 3 MODES
export enum Mode {
    HumanHuman = "Human vs Human",
    HumanAi = "Human vs AI",
    AiAi = "AI vs AI"
}

// status
export type Status = {
    tag: 'Win' | 'Draw' | 'OnGoing';
    player?: WhichPlayer;
    winning_cells?: CellPos[]
}

export enum GamePlace {
    RED = 'RED',
    YELLOW = 'YELLOW',
    NONE = 'NONE'
}

export type GameMove = number;

// state
export type GameState = {
    matrix: GamePlace[][],
    current_player: WhichPlayer
}

export type CellPos = {
    col: number,
    row: number
}
