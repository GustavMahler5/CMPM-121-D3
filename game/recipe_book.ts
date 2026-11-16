import {
  type Command,
  type GameState,
  missingIngredients,
  RECIPES,
} from "../core/mod.ts";

export class RecipeBook {
  private readonly buttons: HTMLButtonElement[] = [];
  private readonly recipeNames = Object.keys(RECIPES);

  constructor(
    private readonly list: HTMLUListElement,
    private readonly state: GameState,
    private readonly submit: (command: Command) => void,
  ) {
    for (const name of this.recipeNames) {
      const li = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";

      button.addEventListener("click", (event) => {
        this.submit({
          type: "craft",
          recipe: name,
        });

        // Give keyboard control back to the game after a mouse click
        if (event.detail > 0) {
          button.blur();
        }
      });

      li.appendChild(button);
      this.list.appendChild(li);
      this.buttons.push(button);
    }
  }

  update(): void {
    this.recipeNames.forEach((name, index) => {
      const recipe = RECIPES[name];

      const ingredients = Object.entries(recipe)
        .map(([item, amount]) => `${amount} ${item}`)
        .join(", ");

      const missing = missingIngredients(this.state, name);

      const missingText = Object.entries(missing)
        .map(([item, amount]) => `${amount} ${item}`)
        .join(", ");

      const status = missingText
        ? `Missing: ${missingText}`
        : "Ready to craft!";

      this.buttons[index].textContent =
        `Craft ${name} (${ingredients}) — ${status}`;
    });
  }
}
