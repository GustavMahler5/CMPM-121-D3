// The world is a pure function of a seed and coordinates. Nothing here is stored,
// so the world can be effectively unbounded while saved state stays small.
// import type _Phaser from "npm:phaser@4.2.1";

export type Terrain = "grass" | "forest" | "water" | "rock";

export type GatherableItem =
  | "stick"
  | "gun"
  | "leaf"
  | "blood"
  | "squid";
// | "foo";
export type CraftableItem = "ladder" | "raft" | "pen" | "warrant";
export type Item = GatherableItem | CraftableItem;

export const TERRAIN_ITEMS: Record<Terrain, Item[]> = {
  grass: ["blood"],
  forest: ["stick", "leaf"],
  rock: ["gun"],
  water: ["squid"],
};

export function terrainAt(seed: number, x: number, y: number): Terrain {
  const raw = 0.65 * noise(seed, x, y, 9) + 0.35 * noise(seed + 1, x, y, 3);
  // Every game starts at the origin, so flatten the land there. Otherwise some
  // seeds would start inside a lake or walled into a pocket.
  const height = 0.5 + (raw - 0.5) * Math.min(1, Math.hypot(x, y) / 10);
  if (height < 0.3) return "water";
  if (height > 0.7) return "rock";
  return noise(seed + 2, x, y, 6) < 0.45 ? "forest" : "grass";
}

export function itemAt(seed: number, x: number, y: number): Item | undefined {
  const terrain = terrainAt(seed, x, y);
  const itemsInTerrain = TERRAIN_ITEMS[terrain];

  if (noise(seed + 1, x, y, 1) < 0.05) {
    return getRandomItem(itemsInTerrain, seed + 1, x, y);
  }
}

function getRandomItem(items: Item[], seed: number, x: number, y: number) {
  const numOfItems = items.length;

  const randNoise = noise(seed, x, y, 1) * 100;
  const index = Math.floor(randNoise % numOfItems);

  return items[index];
}

const PASSABLE_WITH: Partial<Record<Terrain, Item>> = {
  water: "raft",
  rock: "ladder",
};

export function isPassable(inventory: Item[], terrain: Terrain): boolean {
  if (terrain !== "water" && terrain !== "rock") return true;
  const required = PASSABLE_WITH[terrain];
  return required !== undefined && inventory.includes(required);
}

// Value noise: random numbers at coarse grid points, blended between them, so
// that terrain forms regions instead of static.
function noise(seed: number, x: number, y: number, scale: number): number {
  const left = Math.floor(x / scale);
  const top = Math.floor(y / scale);
  const blendX = smooth(x / scale - left);
  const blendY = smooth(y / scale - top);
  return mix(
    mix(gridValue(seed, left, top), gridValue(seed, left + 1, top), blendX),
    mix(
      gridValue(seed, left, top + 1),
      gridValue(seed, left + 1, top + 1),
      blendX,
    ),
    blendY,
  );
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// A hash, not a generator: the same inputs give the same number in [0, 1), with
// no memory of earlier calls.
function gridValue(seed: number, x: number, y: number): number {
  let hash = Math.imul(seed, 0x9e3779b1) ^ Math.imul(x, 0x85ebca6b) ^
    Math.imul(y, 0xc2b2ae35);
  hash = Math.imul(hash ^ (hash >>> 15), 0x2c1b3c6d);
  hash = Math.imul(hash ^ (hash >>> 12), 0x297a2d39);
  return ((hash ^ (hash >>> 15)) >>> 0) / 2 ** 32;
}
