/// <reference path="../.d.ts" />

export class Upgrader {
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
        let controller = creep.room.controller;
        if (controller == undefined) { console.log('Error: no contoller found'); return }
        if (!controller.my) { console.log('Error: no owned controller found'); return }

        let code = creep.upgradeController(controller)
        switch (code) {
            case OK:
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.working = false;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(controller);
                break;
            default:
                console.log('Error in', this.name, code);
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
