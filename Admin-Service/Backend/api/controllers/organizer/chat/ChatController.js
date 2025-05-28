const { Op, Sequelize } = require("sequelize");
const { Chat } = require("../../../models/index");
const { HTTP_STATUS_CODES } = require("../../../../config/constant");
const sequelize = require("../../../../config/db");

// POST /api/chats/get-or-create
const getorcreate = async (req, res) => {
  const { user1Id, user2Id, eventId } = req.body;

  try {
    let chat = await Chat.findOne({
      where: {
        userId: user2Id,
        organizerId: user1Id,
        eventId: eventId,
      },
      attributes: ["id"],
    });

    if (!chat) {
      chat = await Chat.create({
        userId: user2Id,
        organizerId: user1Id,
        eventId: eventId,
        createdBy: user1Id,
      });

      console.log("Chat created successfully.");
      return res.status(HTTP_STATUS_CODES.CREATED).json({
        status: HTTP_STATUS_CODES.CREATED,
        message: "Chat created successfully.",
        data: chat,
        error: "",
      });
    } else {
      console.log("Chat fetched successfully.");
      console.log("chat: ", chat.id);

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Chat fetched successfully.",
        data: chat.id,
        error: "",
      });
    }
  } catch (error) {
    console.error("Chat get-or-create error:", error);
    return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.SERVER_ERROR,
      message: "Failed to get or create chat",
      data: "",
      error: error.message || "Internal server error",
    });
  }
};

// const getAllUsersForOrganizer = async (req, res) => {
//   try {
//     const organizerId = req.organizer.id;

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const replacements = { organizerId, limit, offset };

//     // Raw query to fetch users related to organizer’s events
//     const userQuery = `
//       SELECT DISTINCT u.id, u.name
//       FROM "user" u
//       INNER JOIN Booking b ON u.id = b.user_id
//       INNER JOIN Event e ON b.event_id = e.id
//       WHERE e.organizer_id = :organizerId
//       ORDER BY u.name ASC
//       LIMIT :limit OFFSET :offset
//     `;

//     const users = await sequelize.query(userQuery, {
//       replacements,
//       type: Sequelize.QueryTypes.SELECT,
//     });

//     const countQuery = `
//     SELECT COUNT(DISTINCT u.id) AS total
//      FROM "user" u
//       INNER JOIN Booking b ON u.id = b.user_id
//       INNER JOIN Event e ON b.event_id = e.id
//       WHERE e.organizer_id = :organizerId
//   `;

//     const countResult = await sequelize.query(countQuery, {
//       replacements: { organizerId },
//       type: Sequelize.QueryTypes.SELECT,
//     });

//     const totalRecords = parseInt(countResult[0].total);
//     const totalPages = Math.ceil(totalRecords / limit);

//     return res.status(HTTP_STATUS_CODES.OK).json({
//       status: HTTP_STATUS_CODES.OK,
//       message: "Users fetched successfully",
//       data: {
//         users,
//         totalRecords,
//       },
//       error: "",
//     });
//   } catch (error) {
//     console.error("Error fetching users for organizer:", error);
//     return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
//       status: HTTP_STATUS_CODES.SERVER_ERROR,
//       message: "Failed to fetch users",
//       data: "",
//       error: error.message || "Internal server error",
//     });
//   }
// };

const getAllUsersForOrganizer = async (req, res) => {
  try {
    const organizerId = req.organizer.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const replacements = { organizerId, limit, offset };

    const userQuery = `
      SELECT DISTINCT 
        u.id AS "userId", 
        u.name AS "userName",
        e.id AS "eventId", 
        e.title AS "eventName"
      FROM "user" u
      INNER JOIN Booking b ON u.id = b.user_id
      INNER JOIN Event e ON b.event_id = e.id
      WHERE e.organizer_id = :organizerId
      ORDER BY u.name ASC
      LIMIT :limit OFFSET :offset;
    `;

    const users = await sequelize.query(userQuery, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM "user" u
      INNER JOIN Booking b ON u.id = b.user_id
      INNER JOIN Event e ON b.event_id = e.id
      WHERE e.organizer_id = :organizerId;
    `;

    const countResult = await sequelize.query(countQuery, {
      replacements: { organizerId },
      type: Sequelize.QueryTypes.SELECT,
    });

    const totalRecords = parseInt(countResult[0].total);
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Users and events fetched successfully",
      data: {
        users, // Array of { userId, userName, eventId, eventName }
        totalRecords,
        totalPages,
      },
      error: "",
    });
  } catch (error) {
    console.error("Error fetching users and events for organizer:", error);
    return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.SERVER_ERROR,
      message: "Failed to fetch users and events",
      data: "",
      error: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getorcreate,
  getAllUsersForOrganizer,
};
