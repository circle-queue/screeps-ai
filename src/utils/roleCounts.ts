/// <reference path="../.d.ts" />
import { Counter } from './datastructures';

let roleCounts = new Counter()
for (const name in Memory.creeps) {
  if (!(name in Game.creeps)) {
    delete Memory.creeps[name];
  } else {
    roleCounts.increment(Game.creeps[name].memory.role)
  }
}
