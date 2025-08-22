const PDFDocument = require('pdfkit');
const Event = require('../models/event');
const Payment = require('../models/payment');
const HallReservation = require('../models/hallReservation');

exports.generateEventReport = async (req, res, next) => {
  const eventId = req.params.eventId;

  try {
    const event = await Event.findOne({ _id: eventId, status: 'approved' })
      .populate('host', 'name email')
      .populate('hall')
      .populate('category', 'name')
      .populate('registeredUsers', 'name email');

    //Event not found or not approved
    if (!event) {
      const error = new Error('Event not found or not approved');
      error.statusCode = 404;
      throw error;
    }

    // Only the event host or an admin can generate the report
    if (req.userRole !== 'admin' && event.host._id.toString() !== req.userId) {
      const error = new Error('Not authorized to access this report');
      error.statusCode = 403;
      throw error;
    }

    //Get completed payments for this event
    const payments = await Payment.find({
      event: event._id,
      status: 'completed',
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Fetch hall reservation details
    const hallReservation = await HallReservation.findOne({
      event: event._id,
    }).populate('hall');

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set headers to prompt PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=event-report-${eventId}.pdf`
    );

    doc.pipe(res); // Stream PDF directly to response

    // Report contents
    doc.fontSize(20).text(`Event Report: ${event.title}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Description: ${event.description}`);
    doc.text(`Date: ${event.date}`);
    doc.text(`Time: ${event.time}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Price: ${event.price || 'Free'}`);
    doc.text(`Category: ${event.category.name}`);
    doc.text(`Host: ${event.host.name} (${event.host.email})`);
    doc.text(`Capacity: ${event.capacity}`);
    doc.moveDown();

    doc.fontSize(14).text('Registered Users:', { underline: true });
    doc
      .fontSize(12)
      .text(`Total Registered Users: ${event.registeredUsers.length}`);
    doc.moveDown();

    doc.fontSize(14).text('Hall Reservation:', { underline: true });
    if (hallReservation) {
      doc.fontSize(12).text(`Hall: ${hallReservation.hall.name}`);
      doc.text(`Location: ${hallReservation.hall.location}`);
      doc.text(`Start: ${hallReservation.startDate}`);
      doc.text(`End: ${hallReservation.endDate}`);
    } else {
      doc.text('No hall reservation');
    }
    doc.moveDown();

    doc.fontSize(14).text('Payment Summary:', { underline: true });
    doc.fontSize(12).text(`Total Revenue: $${(totalRevenue / 100).toFixed(2)}`);
    doc.text(`Completed Payments: ${payments.length}`);

    doc.end(); // Finalize the document
  } catch (err) {
    next(err);
  }
};
