// import { isPassable, Item, Recipe, Terrain, TERRAIN_ITEMS } from "./mod.ts";
// import { CraftableItem, GatherableItem } from "./terrain.ts";

// export function canReach(
//   recipes: Record<string, Recipe>,
//   inventory: Item[],
// ): Recipe[] {
//   const missingItems: Recipe[] = [];
//   const craftables = new Set<CraftableItem>();
//   const gatherable = new Set<GatherableItem>();
//   while (true) {
//     for (const [terrain, items] of Object.entries(TERRAIN_ITEMS)) {
//       if (isPassable([...gatherable], terrain as Terrain)) {
//         for (item of items) {
//           gatherable.add(item);
//         }
//       }
//     }
//   }
//   return missingItems;
// }
