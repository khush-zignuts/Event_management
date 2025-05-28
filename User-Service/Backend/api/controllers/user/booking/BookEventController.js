const { generateUUID } = require("../../../utils/utils");
const sequelize = require("../../../../config/db");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const {
  HTTP_STATUS_CODES,
  BOOKING_STATUS,
  PAGINATION,
} = require("../../../../config/constant");
const { Booking, Event } = require("../../../models/index");

module.exports = {
  bookEvent: async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("userId: ", userId);
      const eventId = req.params.id;
      console.log("eventId: ", eventId);

      // Fetch event to get organizerId
      const event = await Event.findOne({
        where: { id: eventId, isDeleted: false },
        attributes: ["id", "organizerId", "capacity"],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found.",
          data: "",
          error: "EVENT_NOT_FOUND",
        });
      }

      // Check if the event is already fully booked
      const bookedCount = await Booking.count({
        where: {
          eventId: eventId,
          status: BOOKING_STATUS.BOOKED,
          isDeleted: false,
        },
      });
      console.log("bookedCount: ", bookedCount);

      if (bookedCount >= event.capacity) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "This event is fully booked.",
          data: "",
          error: "EVENT_FULL",
        });
      }

      // Check if booking already exists
      const existingBooking = await Booking.findOne({
        where: {
          userId: userId,
          eventId: eventId,
        },
        attributes: ["id", "status"],
      });

      console.log("existingBooking: ", existingBooking);
      if (existingBooking) {
        if (existingBooking.status === BOOKING_STATUS.BOOKED) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: HTTP_STATUS_CODES.BAD_REQUEST,
            message: "You have already booked this event.",
            data: "",
            error: "DUPLICATE_BOOKING",
          });
        } else if (existingBooking.status === BOOKING_STATUS.CANCELLED) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: HTTP_STATUS_CODES.BAD_REQUEST,
            message:
              "The event booking was previously cancelled by the organizer.",
            data: "",
            error: "BOOKING_CANCELLED",
          });
        } else if (existingBooking.status === BOOKING_STATUS.PENDING) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: HTTP_STATUS_CODES.BAD_REQUEST,
            message: "Your booking for this event is still pending.",
            data: "",
            error: "BOOKING_PENDING",
          });
        }
      }
      const bokkindId = generateUUID();

      let newBooking = {
        id: bokkindId,
        userId: userId,
        eventId: eventId,
        organizerId: event.organizerId,
        status: BOOKING_STATUS.PENDING,
      };

      // Create booking
      await Booking.create(newBooking);

      return res.status(HTTP_STATUS_CODES.CREATED).json({
        status: HTTP_STATUS_CODES.CREATED,
        message: "Event booked successfully. Awaiting confirmation.",
        data: newBooking,
        error: "",
      });
    } catch (error) {
      console.error("Book Event Error:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to book event.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },
  getAllBookedEventsOrById: async (req, res) => {
    try {
      const eventId = req.query.eventId;
      const userId = req.user.id;

      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;
      let replacements = {};

      let paginationClause = ` LIMIT :limit OFFSET :offset`;
      replacements = { limit, offset };

      let whereClause = `WHERE e.is_deleted = false AND b.status = 'booked' AND b.user_id = :userId `;
      replacements.userId = userId;

      if (eventId) {
        whereClause += ` AND e.id = :eventId `;
        replacements.eventId = eventId;
      }

      const rawQuery = `
        SELECT DISTINCT 
          e.id, 
          e.title, 
          e.description, 
          e.location, 
          e.date, 
          e.start_time,
          e.end_time,
          e.available_seats AS capacity, 
          e.category
        FROM event AS e
        INNER JOIN booking AS b ON b.event_id = e.id
        ${whereClause}
        ORDER BY e.date ASC
        ${paginationClause};
`;

      const events = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });
      if (!events || events.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: eventId
            ? "No bookings found for the provided event ID."
            : "No booked events found.",
          data: "",
          error: "",
        });
      }

      const countQuery = `
      SELECT COUNT(e.id) AS total
      FROM event e
      INNER JOIN booking AS b ON b.event_id = e.id
      ${whereClause}
      ${paginationClause};
    `;

      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: eventId
          ? "Booked event fetched successfully."
          : "All booked events fetched successfully.",
        data: {
          events,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching booked events:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch booked events.",
        data: "",
        error: error || "SERVER_ERROR",
      });
    }
  },
};
