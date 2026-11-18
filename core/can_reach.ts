import { isPassable, Item, Recipe, Terrain, TERRAIN_ITEMS } from "./mod.ts";

export function canReach(recipes: Record<string, Recipe>): string[] {
  const availableItems = new Set<Item>();
  const reachableRecipes = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [terrain, items] of Object.entries(TERRAIN_ITEMS)) {
      if (isPassable([...availableItems], terrain as Terrain)) {
        for (const item of items) {
          if (!availableItems.has(item)) {
            availableItems.add(item);
            changed = true;
          }
        }
      }
    }
    for (const [recipeName, ingredients] of Object.entries(recipes)) {
      const craftable = Object.keys(ingredients).every((item) =>
        availableItems.has(item as Item)
      );
      if (craftable && !reachableRecipes.has(recipeName)) {
        reachableRecipes.add(recipeName);
        availableItems.add(recipeName as Item);
        changed = true;
      }
    }
  }
  return Object.keys(recipes).filter((recipeName) =>
    !reachableRecipes.has(recipeName)
  );
}
