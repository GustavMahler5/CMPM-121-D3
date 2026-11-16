import {
  type GameEvent,
  type GameState,
  itemAt,
  RECIPES,
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
    case "unable to craft":
      return `failed to craft ${event.requestedItem} | missing: ${event.missing}`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
    this.createRecipeButtons();
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
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
    element("resource").textContent = itemAt(this.seed, x, y) ?? "None";
  }

  private createRecipeButtons() {
    const recipesDiv = element("recipes");

    for (const [recipe, item] of Object.entries(RECIPES)) {
      const button = document.createElement("button");

      const needs = Object.entries(item)
        .map(([item, count]) => `${item}: ${count}`)
        .join(", ");

      button.textContent = `${recipe} {${needs}}`;
      recipesDiv.append(button);
    }
  }
}
