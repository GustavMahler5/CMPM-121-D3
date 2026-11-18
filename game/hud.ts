import {
  type GameEvent,
  type GameState,
  itemAt,
  terrainAt,
} from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered ${event.item} at ${event.at.x}, ${event.at.y}`;
    case "already gathered":
      return `already gathered ${event.item} at ${event.at.x}, ${event.at.y}`;
    case "nothing to gather":
      return `nothing to gather at ${event.at.x}, ${event.at.y}`;
    case "crafted":
      return `crafted ${event.requestedItem} | ${event.inventory}`;
    case "unable to craft": {
      const missing = Object.entries(event.missing ?? {})
        .map(([item, amount]) => `${amount} ${item}`)
        .join(", ");

      return missing
        ? `Cannot craft ${event.requestedItem}: missing ${missing}`
        : `Unknown recipe: ${event.requestedItem}`;
    }
    case "game over":
      return "crafted a warrant. Game";
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private readonly gatheredCells: Set<string>;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.gatheredCells = new Set(
      state.gatheredCells.map((cell) => `${cell.x},${cell.y}`),
    );
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered" || event.type === "crafted") {
      if (event.type === "gathered") {
        this.gatheredCells.add(`${event.at.x},${event.at.y}`);
        this.showPosition(event.at.x, event.at.y);
      }
      const inventoryList = element("inventory");
      if (!inventoryList) return;
      inventoryList.innerHTML = "";
      for (const item of event.inventory) {
        const li = document.createElement("li");
        li.textContent = item;
        inventoryList.appendChild(li);
      }
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    element("terrain").textContent = terrainAt(this.seed, x, y);
    const alreadyGathered = this.gatheredCells.has(`${x},${y}`);

    element("resource").textContent = alreadyGathered
      ? "None"
      : (itemAt(this.seed, x, y) ?? "None");
  }
}
