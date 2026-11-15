import { assert, assertEquals } from "@std/assert";
import { apply, type GameState, isPassable, itemAt, terrainAt } from "./mod.ts";

const SEED = 121;

function findItemCell(): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(SEED, x, 0));
    const item = itemAt(SEED, x, 0);
    if (here && item) {
      return {
        seed: SEED,
        player: { x, y: 0 },
        inventory: [],
        gatheredCells: [],
      };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

Deno.test("gathering adds item to inventory", () => {
  const state = findItemCell();
  const { x, y } = state.player;
  const item = itemAt(SEED, x, y);
  assert(item);

  apply(state, { type: "gather", item: item });
  assertEquals(state.inventory.length, 1);
  assertEquals(state.gatheredCells[0], { x, y });
  assertEquals(item, state.inventory[0]);
});

Deno.test("gathering from an empty tile fails", () => {
  // assertEquals();
});

Deno.test("gathering twice from the same tile", () => {
  // assertEquals();
});
