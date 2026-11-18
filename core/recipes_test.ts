import { assert, assertEquals } from "@std/assert";
import {
  apply,
  CraftableItem,
  type GameState,
  Item,
  newGame,
  RECIPES,
} from "./mod.ts";

const SEED = 121;

function giveNecessaryItems(state: GameState, request: CraftableItem): number {
  let total = 0;

  for (const [item, required] of Object.entries(RECIPES[request])) {
    for (let i = 0; i < required; i++) {
      state.inventory.push(item as Item);
      total++;
    }
  }

  return total;
}

Deno.test("successfully crafts a ladder", () => {
  const state = newGame(SEED);

  const numItems: number = giveNecessaryItems(state, "ladder");
  assertEquals(state.inventory.length, numItems);

  const events = apply(state, { type: "craft", recipe: "ladder" });
  assert(events[0].type == "crafted");
  assertEquals(state.inventory, ["ladder"]);
  assert(state.inventory[0] == "ladder");
});

Deno.test("fails to craft with one missing ingredient", () => {
  const state = newGame(SEED);

  giveNecessaryItems(state, "ladder");
  state.inventory.pop();
  const startingInventory = [...state.inventory];

  const events = apply(state, { type: "craft", recipe: "ladder" });
  assert(events[0].type == "unable to craft");
  assertEquals(state.inventory, startingInventory);
});
