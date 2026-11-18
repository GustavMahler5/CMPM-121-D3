import { assertEquals } from "@std/assert";
import { RECIPES } from "./mod.ts";
import { canReach } from "./can_reach.ts";

Deno.test("check if all items are reachable", () => {
  const unreachable: string[] = canReach(RECIPES);
  assertEquals(unreachable.length, 0);
});
