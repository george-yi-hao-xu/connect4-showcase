// game.benchmark.ts
import { test } from "vitest";
import { COL, ROW } from "../constants";

// @ts-expect-error generated benchmark artifact
import { minimax, apply_move, create_an_empty_connect4_game_state} from "../../dist-bench/game.mjs";

function bench_createState(moves: number[]) {
  let state = create_an_empty_connect4_game_state(ROW, COL);
  for (const m of moves) {
    state = apply_move(state, m);
  }

  return state;
}

const bench_ongoing_state = bench_createState([
  // 5, 6, 5, 6, 4, 7, 3, 8
  5,
]);

// avoid js engine think the result is not used
let result_sink = 0;
const minimax_clone = minimax;

test("minimax performance", async ({ bench }) => {
  await bench("12*8 middle game, depth 5", () => {
    result_sink ^= minimax_clone(bench_ongoing_state, 5, 4, false);
  }).run({
    iterations: 10,
    time: 5_000,
  });
});

test("minimax performance -o", async ({ bench }) => {
  await bench("12*8 middle game, depth 5", () => {
    result_sink ^= minimax_clone(bench_ongoing_state, 5, 4, true);
  }).run({
    iterations: 10,
    time: 5_000,
  });
});
