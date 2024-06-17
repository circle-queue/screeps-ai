/// <reference path="../.d.ts" />

import { Harvester } from '../role/harvester';
import { Counter, ReversableMap } from './datastructures';


export class MapCache {
    // Processes the map and stores information about rooms
    // This information can be used to place harvesters
    homeSpawn: string = 'Spawn1'

    // Used to find and assign mining positions

    private _creepNameToPos: ReversableMap<string, Id<RoomPosition>> = new ReversableMap()
    private _freeMiningPos: Set<Id<RoomPosition>> = new Set()
    private _searchedRooms: Map<string, boolean> = new Map()
    nRoomsToSearch: number = 3

    // Used to check which roles are under/over represented
    roleCounts: Counter = new Counter()

    constructor() {
        console.log('MapCache initialized')
        this.checkSpawns()
        this.checkCreeps()
    }

    public checkSpawns() {
        for (const name in Game.spawns) {
            console.log('Checking Spawn', name)
            let room = Game.spawns[name].room
            if (room == undefined) {
                console.log('ERROR: Invalid room', name)
                continue
            }
            this.searchRoom(room.name)
        }
    }

    public checkCreeps() {
        for (const name in Memory.creeps) {
            // First, delete dead creeps
            let creep = Game.creeps[name]
            if (creep == undefined) {
                delete Memory.creeps[name]
                continue
            }
            // Count role
            this.roleCounts.increment(creep.memory.role)
            this.searchRoom(creep.room.name)

            if (creep.memory.role == Harvester.name) { this._setMiningSpot(creep) }
        }
    }

    public hasMiningSpot(): boolean { return this._freeMiningPos.size > 0 }

    public assignMiningSpot(creep: Creep): boolean {
        if (creep.memory.targetPosId != undefined) {
            console.log('ERROR: Harvester already has target', creep.name)
            return false
        }
        let target = this._freeMiningPos.entries().next().value[0] as Id<RoomPosition> | undefined
        if (typeof target !== 'string') {
            console.log('ERROR: target is not a RoomPosition', target)
             return false
            }
        creep.memory.targetPosId = target
        this._setMiningSpot(creep)
        return true
    }

    private _setMiningSpot(creep: Creep) {
        let targetId = creep.memory.targetPosId
        if (targetId == undefined) {
            return console.log('ERROR: Harvester has no target', creep.name)
        }
        if (this._creepNameToPos.reverse.has(targetId)) {
            return console.log('ERROR: MiningSpot already occupied', creep.name)
        }
        this._freeMiningPos.delete(targetId) // May or may not have been added
        this._creepNameToPos.set(creep.name, targetId)
    }

    public _unsetMiningSpot(creepName: string) {
        let spot = this._creepNameToPos.get(creepName)
        if (spot == undefined) {
            console.log('ERROR: MiningSpot not assigned', creepName)
            return
        }
        this._freeMiningPos.add(spot)
        this._creepNameToPos.delete(creepName)
    }

    public checkDeadCreeps() {
        for (const name in Memory.creeps){
            if (name in Game.creeps) {
                continue
            } // Still alive
            let role = name.split('@')[0]
            this.roleCounts.increment(role, -1)
            if (role == Harvester.name) {
                this._unsetMiningSpot(name)
            }
            delete Memory.creeps[name];
        }
    }

    private *getMinerPositions(room: string) {
        let room_obj = Game.rooms[room]
        if (room_obj == undefined) {
            console.log('ERROR: invalid/unexplored room', room)
        } else {
            for (let mineral of room_obj.find(FIND_SOURCES)) {
                for (let pos of findMinerPositions(mineral.pos)) {
                    yield pos
                }
            }
        }
    }

    private *bfs(room: string, n_rooms: number) {
        console.log('foo')
        // Breadth first search to find the n_rooms closest to room
        // Doesn't include a room if there is no exit
        let rooms: string[] = [room];
        for (let i = 0; i < rooms.length && i < n_rooms; i++) {
            let roomCords = new RoomCords(rooms[i]);
            for (let neigh of roomCords.neigh()) {
                let alreadyAdded = neigh.name in rooms
                let room_obj = Game.rooms[roomCords.name]
                if (room_obj == undefined) { continue }
                let noExit = room_obj.findExitTo(neigh.name) == ERR_NO_PATH
                if (alreadyAdded || noExit) { continue }
                rooms.push(neigh.name);
                yield neigh.name
            }
        }
    }

    private searchRoom(room: string) {
        if (this._searchedRooms.get(room) === true) { return }

        this._searchedRooms.set(room, true)
        for (let pos of this.getMinerPositions(room)) {
            let posId = pos.id
            let unoccupied = !this._creepNameToPos.reverse.has(posId)
            if (unoccupied) { this._freeMiningPos.add(posId) }
        }
    }

}

export class RoomCords {
    // Represents a room in a 2D grid, where N and E are positive axes.
    // W and S are negative, and are 1 less than the absolute value of the number.
    // This is to avoid the 0,0 room being ambiguous: Is it N0W0 or S0E0?
    //
    // Examples:
    //      RoomCords('E0N0') => RoomCords('E0N0', 0, 0)
    //      RoomCords('W0S0') => RoomCords('W0S0', -1, -1)
    //      RoomCords('W2N5') => RoomCords('W2N5', -3, 5)
    name: string
    x: number
    y: number

    constructor(name: string) {
        this.name = name;
        [this.x, this.y] = this.toCords(name);
    }

    static fromCords(x: number, y: number) {
        let name = ''
        if (x >= 0) {
            name += 'E'
        } else {
            x = -x + 1;
            name += 'W'
        }
        name += x
        if (y >= 0) {
            name += 'N'
        } else {
            y = -y + 1;
            name += 'S'
        }
        name += y
        return new RoomCords(name);
    }

    public *neigh() {
        // let rooms = [
            yield RoomCords.fromCords(this.x + 1, this.y)
            yield RoomCords.fromCords(this.x - 1, this.y)
            yield RoomCords.fromCords(this.x, this.y + 1)
            yield RoomCords.fromCords(this.x, this.y - 1)
        // ]
        // for (let neigh of rooms) {
        //     if (neigh.name in Game.rooms) { yield neigh }
        // }
    }

    private toCords(roomName: string) {
        let match = roomName.match(/([EW])(\d+)([NS])(\d+)/)
        if (match == null) { console.log('ERROR: Failed to parse room', roomName); return [-1, -1] }
        let [_, E, x, N, y] = match;
        let X = parseInt(x)
        let Y = parseInt(y)
        if (N != 'N') { Y = -Y - 1 }
        if (E != 'E') { X = -X - 1 }
        return [X, Y]
    }
}




function* findMinerPositions(pos: RoomPosition) {
    // Examines the 3x3 square around pos and yields all positions that are not walls or occupied
    let room = Game.rooms[pos.roomName]
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            let newPos = room.getPositionAt(pos.x + x, pos.y + y)
            if (newPos == null) { continue }
            let terrain = room.getTerrain().get(newPos.x, newPos.y)
            if (terrain != TERRAIN_MASK_WALL) {
                yield new RoomPosition(pos.x + x, pos.y + y, pos.roomName)
            }
        }
    }
}

// private free_harvester_spots(room: Room): number {
//     let sources = room.find(FIND_SOURCES)
//     if (sources.length == 0) { return 0 }

//     let free = 0
//     for (let source of sources) {
//         let pos = source.pos
//         // Count tiles around source
//         for (let x = -1; x < 2; x++) {
//             for (let y = -1; y < 2; y++) {
//                 let terrain = room.getTerrain().get(pos.x + x, pos.y + y)
//                 if (terrain != TERRAIN_MASK_WALL) { free += 1 }
//             }
//         }
//         // Deduct occupied tiles
//         let harvesters = room.getPositionAt(pos.x, pos.y)?.findInRange(FIND_MY_CREEPS, 1, { filter: (c) => c.memory.role == HARVESTER })
//         if (harvesters === undefined) { continue }
//         free -= harvesters.length
//     }

//     return free
// }

