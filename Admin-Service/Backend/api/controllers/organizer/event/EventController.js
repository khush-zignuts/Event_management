const { Event } = require("../../../models/index");
const {
  HTTP_STATUS_CODES,
  PAGINATION,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");
const VALIDATOR = require("validatorjs");
const moment = require("moment-timezone");

const { Sequelize, where } = require("sequelize");
const sequelize = require("../../../../config/db");

module.exports = {
  createEvent: async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        capacity,
        category,
      } = req.body;
      const organizerId = req.organizer.id;

      const dateString = req.body.date; // Date string from the request body

      const istMoment = moment.tz(
        dateString + " 00:00:00",
        "YYYY-MM-DD HH:mm:ss",
        "Asia/Kolkata"
      );

      const istDate = istMoment.format("YYYY-MM-DD HH:mm:ss");
      const istMilliseconds = istMoment.valueOf();

      const validation = new VALIDATOR(req.body, {
        title: VALIDATION_RULES.EVENT.TITLE,
        description: VALIDATION_RULES.EVENT.DESCRIPTION,
        location: VALIDATION_RULES.EVENT.LOCATION,
        date: VALIDATION_RULES.EVENT.DATE,
        startTime: VALIDATION_RULES.EVENT.START_TIME,
        endTime: VALIDATION_RULES.EVENT.END_TIME,
        capacity: VALIDATION_RULES.EVENT.CAPACITY,
        category: VALIDATION_RULES.EVENT.CATEGORY,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const existingEvent = await Event.findOne({
        where: {
          title: title,
          isDeleted: false,
        },
        attributes: [
          "title",
          "description",
          "location",
          "date",
          "startTime",
          "endTime",
          "capacity",
          "organizerId",
          "category",
        ],
      });

      if (existingEvent) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Event with the same title  already exists.",
          data: "",
          error: "Event already exists",
        });
      }

      const eventCreated = await Event.create({
        title,
        description,
        location,
        date: istMilliseconds,
        startTime,
        endTime,
        capacity,
        organizerId: req.organizer.id,
        category,
        createdBy: req.organizer.id,
        updatedBy: req.organizer.id,
      });

      const event = {
        id: eventCreated.id,
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        capacity,
        organizerId: req.organizer.id,
        category,
      };
      console.log("event: ", event);

      return res.status(HTTP_STATUS_CODES.CREATED).json({
        status: HTTP_STATUS_CODES.CREATED,
        message: "Event created successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Create Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to create event",
        data: "",
        error: error.message,
      });
    }
  },

  getAllEventsBySearch: async (req, res) => {
    try {
      const query = req.query.search || null;
      const organizerId = req.organizer.id;
      console.log("organizerId: ", organizerId);

      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      let replacements = { limit, offset, organizerId };

      const eventCheckQuery = `
      SELECT COUNT(e.id) AS total
      FROM event AS e
      WHERE organizer_id = :organizerId AND is_deleted = false
    `;

      const eventCheckResult = await sequelize.query(eventCheckQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      console.log("eventCheckResult: ", eventCheckResult);
      if (parseInt(eventCheckResult[0].total) === 0) {
        return res.status(HTTP_STATUS_CODES.OK).json({
          status: HTTP_STATUS_CODES.OK,
          message: "No events found for this organizer.",
          data: {
            events: [],
            totalRecords: 0,
            totalPages: 0,
            currentPage: 1,
          },
          error: "",
        });
      }

      let whereClause = ` WHERE e.is_deleted = false AND e.organizer_id = :organizerId `;

      if (query) {
        whereClause += ` AND e.title ILIKE :query `;
        replacements.query = `%${query}%`;
      }

      const rawquery = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.location,
        e.date,
        e.start_time AS "startTime",
        e.end_time AS "endTime",
        e.available_seats AS "capacity",
        e.category
      FROM event AS e
      ${whereClause}
      ORDER BY e.date ASC
      LIMIT :limit OFFSET :offset
    `;

      const events = await sequelize.query(rawquery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });
      console.log("events: ", events);

      const countQuery = `
        SELECT COUNT(e.id) AS total
        FROM event e
        ${whereClause}
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
        message: "Events fetched successfully",
        data: {
          events,
          totalRecords,
          totalPages,
          currentPage: page,
        },
        error: "",
      });
    } catch (error) {
      console.error("Fetch Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch events",
        data: "",
        error: error.message || "Internal server error",
      });
    }
  },

  getEventById: async (req, res) => {
    try {
      const eventId = req.params.id;

      const organizerId = req.organizer.id;

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

  updateEvent: async (req, res) => {
    try {
      const id = req.params.id;
      console.log("id: ", id);

      const {
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        capacity,
        category,
      } = req.body;
      console.log("req.body: ", req.body);

      const validation = new VALIDATOR(req.body, {
        title: VALIDATION_RULES.EVENT.TITLE,
        description: VALIDATION_RULES.EVENT.DESCRIPTION,
        location: VALIDATION_RULES.EVENT.LOCATION,
        date: VALIDATION_RULES.EVENT.DATE,
        startTime: VALIDATION_RULES.EVENT.START_TIME,
        endTime: VALIDATION_RULES.EVENT.END_TIME,
        capacity: VALIDATION_RULES.EVENT.CAPACITY,
        category: VALIDATION_RULES.EVENT.CATEGORY,
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
        where: {
          id: id,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
          error: "Event with the given ID does not exist",
        });
      }

      const timestampDate = new Date(date).getTime();

      await event.update({
        title,
        description,
        location,
        date: timestampDate,
        startTime,
        endTime,
        capacity,
        category,
        updatedBy: req.organizer.id,
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event updated successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Update Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to update event",
        data: "",
        error: error.message || "Internal server error",
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      console.log("eventId: ", eventId);
      const organizerId = req.organizer.id;

      const event = await Event.findOne({
        where: {
          id: eventId,
        },
        attributes: ["id"],
      });
      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
          error: "No event with the provided ID",
        });
      }

      event.isDeleted = true;
      event.isActive = false;
      event.deletedAt = new Date();
      event.updatedBy = req.organizer.id;
      await event.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event deleted successfully",
        data: { id: event.id },
        error: "",
      });
    } catch (error) {
      console.error("Delete Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to delete event",
        data: "",
        error: error.message,
      });
    }
  },
};
