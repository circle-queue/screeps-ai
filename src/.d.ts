declare module "ambient-module-name" {
  global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
      uuid: number;
      log: any;
    }

    interface CreepMemory {
      role: string;
      working: boolean;
      targetPosId: Id<RoomPosition> | undefined;
      targetObjId: Id<Source> | undefined;
    }
    interface RoomPositionConstructor {
      fromId(id: Id<RoomPosition>): RoomPosition
    }

    interface RoomPosition {
      id: Id<RoomPosition>
    }
  }
}

declare module NodeJS {
  interface Global {
    log: any;
  }
}
