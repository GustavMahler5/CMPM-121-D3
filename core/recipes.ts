import { Item } from "./terrain.ts";

export type Recipe = Partial<Record<Item, number>>;

export const RECIPES: Record<string, Recipe> = {
  ladder: { stick: 4 },
  raft: { stick: 3, leaf: 3 /*foo: 4*/ },
  pen: { squid: 1, stick: 1 },
  warrant: { blood: 1, gun: 1, leaf: 1, pen: 1 },
};
