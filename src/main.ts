/// <reference path=".d.ts" />

// Setup prototypes before imports
import { setupRoomPositionPrototype } from "prototype/RoomPosition";
setupRoomPositionPrototype()

import { Builder } from "role/builder";
import { Collector } from "role/collector";
import { Harvester } from "role/harvester";
import { Upgrader } from "role/upgrader";
import { ErrorMapper } from "utils/ErrorMapper";
import { MapCache } from "utils/mapCache";

class Tester {
  static default_body = [WORK, CARRY, MOVE]

  public static run(creep: Creep) {
    let path = PathFinder.search(creep.pos, new RoomPosition(25, 25, 'W2N5'))
    // console.log('path', path.path, path.incomplete, path.ops, path.cost, creep.moveByPath(path.path))
  }
}


const roleMap = {
  [Harvester.name]: Harvester,
  [Collector.name]: Collector,
  [Builder.name]: Builder,
  [Upgrader.name]: Upgrader,
  [Tester.name]: Tester
}

let cache = new MapCache() // Big object that stores information about the game state

export const loop = ErrorMapper.wrapLoop(() => {
  cache.checkDeadCreeps()
  autoSpawnCreep()

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    let obj = roleMap[creep.memory.role];
    creep.say(creep.memory.role[0]);
    obj.run(creep);
  }
});

function autoSpawnCreep() {
  let roleCount = (name: string) => cache.roleCounts.get(name)

  console.log(
    'Harvester:', roleCount(Harvester.name),
    'Collector:', roleCount(Collector.name),
    'Builder:', roleCount(Builder.name),
    'Upgrader:', roleCount(Upgrader.name),
    'Tester:', roleCount(Tester.name),
    'Free Mining Spots:', cache.hasMiningSpot(),
  )

  if (false) { } // formatting only

  else if (roleCount(Harvester.name) < 1) { spawnCreep(Harvester.name) }
  else if (roleCount(Collector.name) < 1) { spawnCreep(Collector.name) }

  // else if (roleCount(Collector.name) < (roleCount(Harvester.name) / 3)){ spawnCreep(Collector.name) }
  else if (roleCount(Builder.name) < roleCount(Harvester.name) / 3) { spawnCreep(Builder.name) }
  // else if (roleCount(Upgrader.name) < roleCount(Harvester.name) / 3){ spawnCreep(Upgrader.name) }

  // else if (roleCount(Tester.name) < 1){ spawnCreep(Tester.name) }

  else if (cache.hasMiningSpot()) { spawnCreep(Harvester.name) } // Spawn Harvesters while there are free miner positions
}

function spawnCreep(role: string, spawn: string = 'Spawn1') {
  let spawn_ = Game.spawns[spawn];
  let obj = roleMap[role];

  if (role == Harvester.name && !cache.hasMiningSpot()) {
    return console.log('ERROR: Spawning harvester without free mining spots')
  }

  let name = role + '@' + Game.time
  let code = spawn_.spawnCreep(
    obj.default_body,
    name,
    { memory: { role: role, working: false, targetPosId: undefined, targetObjId: undefined } }
  );
  switch (code) {
    case OK:
      break
    case ERR_NOT_ENOUGH_ENERGY:
    case ERR_BUSY:
      return
    default:
      return console.log('ERROR: Spawning error:', code)
  }
  cache.roleCounts.increment(role)
  let creep = Game.creeps[name];
  if (creep == undefined) { return console.log('ERROR: failed to get spawned creep') } // Failed to spawn creep

  if (role == Harvester.name) {
    let success = cache.assignMiningSpot(creep)
    if (!success) {
      return console.log('ERROR: Spawned harvester without free mining spots', creep.name)
    }
  }
}
