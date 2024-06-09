/// <reference path="../.d.ts" />

export class Collector {
    public static run(creep: Creep) {
        if (creep.memory.working) {
            this.work(creep);
        } else {
            this.gather(creep);
        }
    }

    private static gather(creep: Creep) {
        let energy = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES).filter((r) => r.resourceType === RESOURCE_ENERGY))
        if (energy === null) { return }
        let code = creep.pickup(energy)
        switch (code) {
            case OK:
            case ERR_TIRED:
            case ERR_BUSY:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(energy);
                break;
            case ERR_FULL:
                creep.memory.working = true;
                break;
            default:
                console.log('Error in', this.name, code);
        }
    }

    private static work(creep: Creep) {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false
            return
        }
        let spawn = creep.room.find(FIND_MY_SPAWNS)[0]
        let target
        if (spawn === null) { console.log('Error: no spawn found') }
        if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store[RESOURCE_ENERGY]) {
            target = spawn
        } else {
            let structures = creep.room.find(FIND_STRUCTURES)
            if (structures == null) {
                return
            }
            let storages = structures.filter((s) => (s.structureType == STRUCTURE_CONTAINER) && s.store.energy < 2000)
            let storage = creep.pos.findClosestByPath(storages)
            if (storage == null) {
                console.log('Error: no storage found')
                return
            }
            target = storage
        }



        let code = creep.transfer(target, RESOURCE_ENERGY)
        switch (code){
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break

        }
    }

}

// if (creep.store.getFreeCapacity() == 0) {
//     creep.drop(RESOURCE_ENERGY);
// } else {
//     let closestSource = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES))
//     if (closestSource === null) { return }
//     if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
//         creep.moveTo(closestSource);
//     }
// }
