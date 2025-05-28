const socketIo = require("socket.io");
const { Event, User, Organizer, SocketIO } = require("../api/models/index");

let io;
let users = {};
const socketSetup = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const socketId = socket.id;
    console.log("\nA user connected:", socketId);

    // console.log("socket: ", socket)
    // registration event
    socket.on("registeredUser", async (data) => {
      const socketId = socket.id;
      console.log("\nsocketId: ", socketId);
      const { userId, eventId } = data;
      console.log("\nuserId, eventId: ", userId, eventId);

      try {
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "name", "email"],
        });

        const userName = user.name;
        console.log("userName: ", userName);

        // Fetch the event and organizerId
        const event = await Event.findOne({
          where: { id: eventId },
          attributes: ["id", "organizerId"],
        });

        const organizerId = event.organizerId;

        const organizer = await Organizer.findOne({
          where: { id: organizerId },
          attributes: ["id", "name", "email"],
        });

        const organizerName = organizer.name;

        // Check if socket entry already exists for user
        const existingEntry = await SocketIO.findOne({
          where: { senderId: userId },
        });
        // console.log("existingEntry: ", existingEntry);

        if (!existingEntry) {
          // First time: create new socket entry
          await SocketIO.create({
            senderId: userId,
            socketId: socketId,
          });
          console.log(
            `Socket entry created for user ${userId} and {socketId: ${socketId}}`
          );
        } else {
          // Optional: update existing socket entry
          await SocketIO.update(
            { socketId: socketId },
            { where: { senderId: userId } }
          );
          console.log(
            `Socket entry updated for user ${userId} and {socketId: ${socketId}}`
          );
        }

        socket.emit("registered", {
          organizerId: organizerId,
          organizerName: organizerName,
          userName: userName,
          message: `${userName} has connected with socket ID ${socket.id}`,
        });
      } catch (err) {
        console.error("Error handling socket entry:", err.message);
      }
    });

    socket.on("registeredOrganizer", async (data) => {
      console.log("data: ", data);
      const socketId = socket.id;
      console.log("Organizer socketId: ", socketId);
      const { userId, userName, eventId, organizerId, organizerName } = data;

      try {
        // Check if socket entry already exists for user
        const existingEntry = await SocketIO.findOne({
          where: { senderId: organizerId },
        });
        // console.log("existingEntry: ", existingEntry);

        if (!existingEntry) {
          // First time: create new socket entry
          await SocketIO.create({
            senderId: organizerId,
            socketId: socketId,
          });
          console.log(
            `Socket entry created for user ${organizerId} and {socketId: ${socketId}}`
          );
        } else {
          // Optional: update existing socket entry
          await SocketIO.update(
            { socketId: socketId },
            { where: { senderId: organizerId } }
          );
          console.log(
            `Socket entry updated for user ${organizerId} and {socketId: ${socketId}}`
          );
        }

        // Emit the registration event to the organizer
        // console.log("userName: ", userName);
        socket.emit("registered", {
          // userName: userName,
          message: `${organizerName} has connected with socket ID ${socket.id}`,
        });
      } catch (err) {
        console.error("Error handling socket entry:", err.message);
      }
    });

    // Handle sending messages
    // socket.on("sendMessage", async (data) => {
    //   try {
    //     console.log("data send");
    //     const { chatId, senderId, receiverId, eventId, message } = data;

    //     const socketEntry = await SocketIO.findOne({
    //       where: { senderId: senderId },
    //       attributes: ["socketId"],
    //     });

    //     const opossiteSocket = await SocketIO.findOne({
    //       where: { senderId: receiverId },
    //       attributes: ["socketId"],
    //     });
    //     if (!socketEntry) {
    //       console.log(`No socket entry found for senderId: ${senderId}`);
    //       return;
    //     }

    //     const senderSocketId = socketEntry.socketId;
    //     const opossiteSocketId = opossiteSocket.socketId;

    //     console.log("Sender Socket ID:", senderSocketId);
    //     console.log("Opossite Socket ID:", opossiteSocketId);

    //     // console.log("data: ", data);
    //     const messagePayload = {
    //       chatId,
    //       senderId,
    //       receiverId,
    //       eventId,
    //       message,
    //     };

    //     // Emit message to the sender and receiver
    //     if (opossiteSocketId) {
    //       io.to(opossiteSocketId).emit("message", messagePayload);
    //     }

    //     if (senderSocketId) {
    //       io.to(senderSocketId).emit("message", messagePayload);
    //     }

    //     // You can now use `senderSocketId` for emitting messages if needed
    //     // io.to(senderSocketId).emit('some-event', messagePayload);
    //   } catch (err) {
    //     console.error("Error retrieving socket ID:", err);
    //   }
    // });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id);
      // You can remove userId/organizerId mappings here if needed
      try {
        // Remove socket entry from DB
        const deleted = await SocketIO.destroy({
          where: { socketId: socket.id },
        });

        if (deleted) {
          console.log(`Socket entry with ID ${socket.id} deleted from DB`);
        } else {
          console.log(`No socket entry found in DB for ID: ${socket.id}`);
        }
      } catch (err) {
        console.error("Error deleting socket entry from DB:", err);
      }
    });
  });
};
const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { socketSetup, getIo };
