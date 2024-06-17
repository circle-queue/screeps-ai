Object.defineProperty(RoomPosition.prototype, 'id', {
    // This is a getter property that returns a serialized version of the RoomPosition
    // This is useful for storing RoomPositions in memory
    //
    // Example usage:
    //      let position = new RoomPosition(10, 20, "W1N1");
    //      console.log(position.id);  // Outputs: '{"x":10,"y":20,"roomName":"W1N1"}'
    get: function() {
        return JSON.stringify({x: this.x, y: this.y, roomName: this.roomName}) as Id<RoomPosition> & string;
    }
});


// This is a static method that returns a RoomPosition object from a serialized RoomPosition
// It is the inverse of the RoomPosition.prototype.id getter
//
// Example usage:
//      let id = '{"x":10,"y":20,"roomName":"W1N1"}';
//      let position = RoomPosition.fromId(id);
//      console.log(position);  // Outputs: RoomPosition { x: 10, y: 20, roomName: 'W1N1' }
(RoomPosition as any).fromId = function(id: Id<RoomPosition> & string): RoomPosition {
    let deserialized = JSON.parse(id);
    return new RoomPosition(deserialized.x, deserialized.y, deserialized.roomName);
}

export default RoomPosition;
