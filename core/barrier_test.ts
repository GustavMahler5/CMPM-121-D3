import { assertEquals } from "@std/assert";
import { apply, type Cell, type Direction, newGame } from "./rules.ts";
import {
  isPassable,
  type Item,
  itemAt,
  type Terrain,
  terrainAt,
} from "./terrain.ts";
import { RECIPES } from "./recipes.ts";

// Directions and their coordinate changes
const DIRECTIONS: {
  direction: Direction;
  dx: number;
  dy: number;
}[] = [
  { direction: "north", dx: 0, dy: -1 },
  { direction: "south", dx: 0, dy: 1 },
  { direction: "east", dx: 1, dy: 0 },
  { direction: "west", dx: -1, dy: 0 },
];

// Find a passable land cell next to a specified terrain
// Optionally require a particular resource on target cell
function findBoundary(
  seed: number,
  target: Terrain,
  resource?: Item,
): {
  from: Cell;
  to: Cell;
  direction: Direction;
} {
  const initialState = newGame(seed);

  for (let y = -100; y <= 100; y++) {
    for (let x = -100; x <= 100; x++) {
      const currentTerrain = terrainAt(seed, x, y);

      if (!isPassable(initialState.inventory, currentTerrain)) {
        continue;
      }

      for (const step of DIRECTIONS) {
        const to = {
          x: x + step.dx,
          y: y + step.dy,
        };

        if (terrainAt(seed, to.x, to.y) !== target) {
          continue;
        }

        if (
          resource !== undefined &&
          itemAt(seed, to.x, to.y) !== resource
        ) {
          continue;
        }

        return {
          from: { x, y },
          to,
          direction: step.direction,
        };
      }
    }
  }

  throw new Error(`No suitable ${target} boundary found`);
}

Deno.test("water is blocked before crafting raft", () => {
  const seed = 7;
  const edge = findBoundary(seed, "water");
  const state = newGame(seed);

  state.player = { ...edge.from };

  const before = JSON.parse(JSON.stringify(state));

  const events = apply(state, {
    type: "move",
    direction: edge.direction,
  });

  assertEquals(events[0]?.type, "blocked");
  assertEquals(state, before);
});

Deno.test("crafting raft allows entering water", () => {
  const seed = 7;
  const edge = findBoundary(seed, "water");
  const state = newGame(seed);

  state.player = { ...edge.from };

  // Add the ingredients required by the current raft recipe
  const raftRecipe = RECIPES["raft"];

  if (!raftRecipe) {
    throw new Error("Missing raft recipe");
  }

  for (const [item, amount] of Object.entries(raftRecipe)) {
    for (let i = 0; i < amount; i++) {
      state.inventory.push(item as Item);
    }
  }

  const craftEvents = apply(state, {
    type: "craft",
    recipe: "raft",
  });

  assertEquals(craftEvents[0]?.type, "crafted");
  assertEquals(state.inventory.includes("raft"), true);

  // Water should now be accessible
  const moveEvents = apply(state, {
    type: "move",
    direction: edge.direction,
  });

  assertEquals(moveEvents[0]?.type, "moved");
  assertEquals(state.player, edge.to);
});

Deno.test("squid can be gathered after entering water", () => {
  const seed = 7;

  // Find a water cell containing a squid
  const edge = findBoundary(seed, "water", "squid");
  const state = newGame(seed);

  state.player = { ...edge.from };
  state.inventory.push("raft");

  // Enter the water
  const moveEvents = apply(state, {
    type: "move",
    direction: edge.direction,
  });

  assertEquals(moveEvents[0]?.type, "moved");
  assertEquals(state.player, edge.to);

  // Gather the squid
  const gatherEvents = apply(state, {
    type: "gather",
  });

  assertEquals(gatherEvents[0]?.type, "gathered");
  assertEquals(state.inventory, ["raft", "squid"]);
});

Deno.test("rock remains blocked when holding raft", () => {
  const seed = 7;
  const edge = findBoundary(seed, "rock");
  const state = newGame(seed);

  state.player = { ...edge.from };
  state.inventory.push("raft");

  const before = JSON.parse(JSON.stringify(state));

  const events = apply(state, {
    type: "move",
    direction: edge.direction,
  });

  assertEquals(events[0]?.type, "blocked");
  assertEquals(state, before);
});
