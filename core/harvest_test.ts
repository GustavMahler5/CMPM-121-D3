import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { apply, type GameState, isPassable, itemAt, terrainAt } from "./mod.ts";

const SEED = 121;

function findItemCell(requestItemCell: boolean): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable([], terrainAt(SEED, x, 0));
    const item = itemAt(SEED, x, 0);
    if (here && Boolean(item) == requestItemCell) {
      return {
        seed: SEED,
        player: { x, y: 0 },
        inventory: [],
        gatheredCells: [],
        gameComplete: false,
      };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

Deno.test("gathering adds item to inventory successfully", () => {
  const state = findItemCell(true);
  const { x, y } = state.player;
  const item = itemAt(SEED, x, y);
  assert(item);

  apply(state, { type: "gather" });
  assertEquals(state.inventory.length, 1);
  assertEquals(state.gatheredCells[0], { x, y });
  assertEquals(item, state.inventory[0]);
});

Deno.test("gathering from an empty tile fails", () => {
  const state = findItemCell(false);
  const { x, y } = state.player;
  const item = itemAt(SEED, x, y);
  assert(!item);

  apply(state, { type: "gather" });
  assertEquals(state.inventory.length, 0);
  assertEquals(state.gatheredCells.length, 0);
  assertEquals(item, state.inventory[0]);
});

Deno.test("gathering twice from the same tile fails", () => {
  const state = findItemCell(true);
  const { x, y } = state.player;
  const item = itemAt(SEED, x, y);
  assert(item);

  apply(state, { type: "gather" });
  apply(state, { type: "gather" });
  assertEquals(state.inventory.length, 1);
  assertEquals(state.gatheredCells[0], { x, y });
  assertEquals(item, state.inventory[0]);
});

Deno.test("inventory snapshot remains unchanged after inventory update", () => {
  const state = findItemCell(true);
  const { x, y } = state.player;
  const item = itemAt(SEED, x, y);
  assert(item);

  const event = apply(state, { type: "gather" });
  const snapshot = event[0];
  if (snapshot.type != "gathered") throw new Error("Expected a gathered event");
  state.inventory.pop();
  assertEquals(item, snapshot.inventory[0]);
  assertNotEquals(item, state.inventory[0]);
  assertNotEquals(state.inventory.length, snapshot.inventory.length);
  assertEquals(state.gatheredCells[0], { x, y });
});
