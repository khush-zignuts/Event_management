const {
  HTTP_STATUS_CODES,
  BOOKING_STATUS,
  PAGINATION,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");
const { Sequelize } = require("sequelize");
const VALIDATOR = require("validatorjs");
const sequelize = require("../../../../config/db");
const { Booking, Event, EventFeedback } = require("../../../models/index");

// Get all events or search by title/category

module.exports = {
  getAllEventsBySearch: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;
      const replacements = { limit, offset };

      let whereClause = `WHERE e.is_deleted = false`;

      const searchQuery = req.query.query || null;

      if (searchQuery) {
        whereClause += ` AND (e.title ILIKE :search OR e.category ILIKE :search)`;
        replacements.search = `%${searchQuery}%`;
      }

      let paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.date,
          e.start_time AS "startTime",
          e.end_time AS "endTime",
          e."available_seats" AS capacity,
          e.category
        FROM event AS e
        ${whereClause}
        ORDER BY e.date ASC
        ${paginationClause};
      `;

      const events = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const countQuery = `
        SELECT COUNT(e.id) AS total
        FROM event e
        ${whereClause}
        ${paginationClause};
      `;
      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      if (!events || events.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "No events found matching your search.",
          data: [],
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Events fetched successfully.",
        data: {
          events,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch events.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },
  getEventById: async (req, res) => {
    try {
      const eventId = req.params.id;

      const userId = req.user.id;

      const event = await Event.findOne({
        where: {
          id: eventId,
          isDeleted: false,
        },
        attributes: [
          "id",
          "title",
          "description",
          "location",
          "date",
          "startTime",
          "endTime",
          "capacity",
          "category",
        ],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
          error: "No event with the provided ID",
        });
      }
      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event fetched successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Fetch Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch event",
        data: "",
        error: error.message || "Internal server error",
      });
    }
  },
  getAllNotifications: async (req, res) => {
    try {
      const userId = req.user.id;

      const { type } = req.query;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const replacements = { userId, limit, offset };
      let whereClause = `WHERE n.user_id = :userId`;

      if (type && ["event", "announcement", "reminder"].includes(type)) {
        whereClause += ` AND n.type = :type`;
        replacements.type = type;
      }

      const rawQuery = `
        SELECT
          n.id,
          n.user_id AS "userId",
          n.title,
          n.message,
          n.type
        FROM notification n
        ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT :limit OFFSET :offset;
      `;

      const notifications = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const countQuery = `
        SELECT COUNT(n.id) AS total
        FROM notification n
        ${whereClause};
      `;

      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Notifications fetched successfully.",
        data: {
          notifications,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch notifications.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },
  submitEventFeedback: async (req, res) => {
    try {
      const { eventId, rating, comment } = req.body;
      console.log("req.body: ", req.body);
      const userId = req.user.id;

      const validation = new VALIDATOR(req.body, {
        eventId: VALIDATION_RULES.EVENT_FEEDBACK.EVENT_ID,
        rating: VALIDATION_RULES.EVENT_FEEDBACK.RATING,
        comment: VALIDATION_RULES.EVENT_FEEDBACK.COMMENT,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const event = await Event.findOne({
        where: { id: eventId, isDeleted: false },
        attributes: ["id", "date", "startTime"],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found.",
          data: "",
          error: "",
        });
      }

      // Check for valid event.time
      if (!event.startTime || !event.startTime.includes(":")) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Event time is missing or invalid.",
          data: "",
          error: "",
        });
      }

      const eventDate = new Date(parseInt(event.date, 10)); // Make sure to parse as an integer if it's stored as a string
      console.log("event.date: ", event.date);
      console.log("eventDate: ", eventDate);

      // Combining event date and time from startTime
      const [hours, minutes] = event.startTime.split(":").map(Number);
      eventDate.setHours(hours);
      eventDate.setMinutes(minutes);
      eventDate.setSeconds(0);
      eventDate.setMilliseconds(0);

      // Now you can compare
      const now = new Date();
      if (now < eventDate) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: HTTP_STATUS_CODES.FORBIDDEN,
          message: "You can only give feedback after the event has ended.",
          data: "",
          error: "",
        });
      }

      const booking = await Booking.findOne({
        where: {
          userId: userId,
          eventId: eventId,
          status: BOOKING_STATUS.BOOKED,
        },
        attributes: ["id"],
      });

      if (!booking) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: HTTP_STATUS_CODES.FORBIDDEN,
          message: "You must book the event to submit feedback.",
          data: "",
          error: "",
        });
      }

      const existingFeedback = await EventFeedback.findOne({
        where: { userId, eventId },
        attributes: ["id"],
      });

      if (existingFeedback) {
        return res.status(HTTP_STATUS_CODES.CONFLICT).json({
          success: HTTP_STATUS_CODES.CONFLICT,
          message: "Feedback already submitted for this event.",
          data: "",
          error: "",
        });
      }

      const feedback = await EventFeedback.create({
        eventId,
        userId,
        rating,
        comment,
      });

      const feedBack = {
        eventId,
        userId,
        rating,
        comment,
      };
      return res.status(HTTP_STATUS_CODES.CREATED).json({
        success: HTTP_STATUS_CODES.CREATED,
        message: "Feedback submitted successfully.",
        data: feedBack,
        error: "",
      });
    } catch (error) {
      console.error("Feedback Submit Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        success: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to submit feedback.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },
};
