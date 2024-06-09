/// <reference path=".d.ts" />
import { Builder } from "role/builder";
import { Collector } from "role/collector";
import { Harvester } from "role/harvester";
import { Upgrader } from "role/upgrader";
import { BUILDER, COLLECTOR, HARVESTER, UPGRADER } from "utils/const";
import { Counter } from "utils/datastructures";
import { ErrorMapper } from "utils/ErrorMapper";

const roleMap: { [role: string]: any }  = {
  [HARVESTER]: Harvester,
  [COLLECTOR]: Collector,
  [BUILDER]: Builder,
  [UPGRADER]: Upgrader,
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Automatically delete memory of missing creeps & count the roles
  let roleCounts = new Counter()
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    } else {
      roleCounts.increment(Game.creeps[name].memory.role)
    }
  }

  let spawn = Game.spawns['Spawn1'];
  if (roleCounts.get(HARVESTER) < 5){
    spawn.spawnCreep([WORK, WORK, CARRY, MOVE], HARVESTER + Game.time, { memory: { role: HARVESTER, working: true} });
  } else if (roleCounts.get(COLLECTOR) < 2){
    spawn.spawnCreep([CARRY, CARRY, MOVE], COLLECTOR + Game.time, { memory: { role: COLLECTOR, working: false} });
  } else if (roleCounts.get(BUILDER) < 4){
    spawn.spawnCreep([WORK, WORK, CARRY, MOVE], BUILDER + Game.time, { memory: { role: BUILDER, working: false} });
  } else if (roleCounts.get(UPGRADER) < 2){
    spawn.spawnCreep([WORK, WORK, CARRY, MOVE], UPGRADER + Game.time, { memory: { role: UPGRADER, working: false} });
  }

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    let obj = roleMap[creep.memory.role];
    creep.say(creep.memory.role[0]);
    obj.run(creep);
  }
});
