import { Item } from "./terrain.ts";

export type Recipe = Partial<Record<Item, number>>;

export const RECIPES: Record<string, Recipe> = {
  foo: { stick: 2 },
  bar: { gem: 2, bug: 1 },
  baz: { fish: 1, leaf: 6 },
};
