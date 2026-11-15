// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
  isPassable,
  Item,
  itemAt,
  type Terrain,
  terrainAt,
} from "./terrain.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Item[];
  gatheredCells: Cell[];
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | { type: "gathered"; item: Item; at: Cell; inventory: Item[] }
  | { type: "already gathered"; item: Item; at: Cell }
  | { type: "nothing to gather"; at: Cell };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return { seed, player: { x: 0, y: 0 }, inventory: [], gatheredCells: [] };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
  }
}

function gather(state: GameState): GameEvent[] {
  const currentCell: Cell = { ...state.player };
  const itemAtCell: Item | undefined = itemAt(
    state.seed,
    currentCell.x,
    currentCell.y,
  );
  if (!itemAtCell) {
    return [{ type: "nothing to gather", at: currentCell }];
  }
  const alreadyGatheredHere = state.gatheredCells.find((cell) =>
    cell.x == currentCell.x && cell.y == currentCell.y
  );
  if (alreadyGatheredHere) {
    return [{ type: "already gathered", item: itemAtCell, at: currentCell }];
  }

  state.gatheredCells.push(currentCell);
  state.inventory.push(itemAtCell);
  return [{
    type: "gathered",
    item: itemAtCell,
    at: currentCell,
    inventory: [...state.inventory],
  }];
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}
