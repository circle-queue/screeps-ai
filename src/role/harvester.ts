/// <reference path="../.d.ts" />
import { HARVESTER } from "utils/const";

export class Harvester{
    public static run(creep: Creep) {
        if (creep.store.getFreeCapacity() == 0) {
            creep.drop(RESOURCE_ENERGY);
        } else {
            let closestSource = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES))
            if (closestSource === null) {
                let neighRoom = Game.map.describeExits(creep.room.name)
                neighRoom[7]
            }
            if (closestSource === null) {
                console.log('Error: no source found', this.name)
                return;
            }
            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSource);
            }
        }
    }
}

export function free_harvester_spots(room: Room): number {
    let sources = room.find(FIND_SOURCES)
    if (sources.length == 0) { return 0 }

    let free = 0
    for (let source of sources) {
        let pos = source.pos
        // Count tiles around source
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                let terrain = room.getTerrain().get(pos.x + x, pos.y + y)
                if (terrain != TERRAIN_MASK_WALL) { free += 1 }
            }
        }
        // Deduct occupied tiles
        let harvesters = room.getPositionAt(pos.x, pos.y)?.findInRange(FIND_MY_CREEPS, 1, { filter: (c) => c.memory.role == HARVESTER })
        if (harvesters === undefined) { continue }
        free -= harvesters.length
    }

    return free
}
