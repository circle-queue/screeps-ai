/// <reference path="../.d.ts" />

export class Harvester {
    static default_body = [WORK, WORK, CARRY, MOVE]
    source: Source | undefined

    public static run(creep: Creep) {
        if (creep.memory.targetObjId !== undefined) {
            return this._harvest(creep)
        } else if (creep.memory.targetPosId !== undefined) {
            return this._moveToSource(creep)
        } else {
            return console.log('Error: no harvester targetPos found', this.name)
        }
    }

    private static _harvest(creep: Creep) {
        if (creep.store.getFreeCapacity() == 0) { creep.drop(RESOURCE_ENERGY) }
        if (creep.memory.targetObjId !== undefined) {
            let source = Game.getObjectById(creep.memory.targetObjId)
            if (source == null) {return console.log('ERROR: harvester targetObj not found', creep.name)}
            let code = creep.harvest(source)
            switch (code) {
                case OK:
                case ERR_NOT_ENOUGH_RESOURCES:
                    break
                case ERR_NOT_IN_RANGE:
                    creep.memory.targetObjId = undefined
                case ERR_NOT_OWNER:
                case ERR_BUSY:
                case ERR_INVALID_TARGET:
                case ERR_NO_BODYPART:
                case ERR_TIRED:
                case ERR_NOT_FOUND:
                default:
                    console.log('ERROR: harvester harvest', code)
            }
        } else {
            console.log('ERROR: harvester targetObj not a source', creep.name)
        }
    }

    private static _moveToSource(creep: Creep) {
        if (!(creep.memory.targetPosId !== undefined)) {
            return console.log('ERROR: harvester targetPos not a RoomPosition', creep.name)
        }


        let target = RoomPosition.fromId(creep.memory.targetPosId)
        creep.moveTo(target)
        if (_.isEqual(creep.pos.id, creep.memory.targetPosId)) {
            let source = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES))
            if (source === null) {
                return console.log('ERROR: no source found', this.name)
            }
            creep.memory.targetObjId = source.id
        }
    }
}
