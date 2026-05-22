const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- 1. UPDATED SCHEMA ---
const bookingSchema = new mongoose.Schema({
  workerId: String,
  workerName: String,
  workerPhone: String,   
  workerSkill: String,
  customerName: String,  
  customerEmail: String, 
  customerPhone: String, 
  date: String,
  time: String,
  address: String,
  notes: String,
  hours: Number,
  totalAmount: { type: Number, default: 0 }, 
  paymentMethod: { type: String, default: "Cash" },
  paymentStatus: { type: String, default: "Unpaid" },
  status: { type: String, default: "Pending" } 
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// ==============================
// ✅ POST: SAVE NEW BOOKING
// ==============================
router.post('/', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(400).json({ message: "Error saving booking", error: err.message });
  }
});

// ==============================
// ✅ GET: FETCH ALL BOOKINGS
// ==============================
router.get('/', async (req, res) => {
  try {
    const allBookings = await Booking.find().sort({ _id: -1 });
    res.json(allBookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
});

// ==============================
// ✅ PATCH: UPDATE STATUS (The Fix)
// ==============================
// I added "/:id" as an alias so both your frontend calls will work
router.patch(["/:id", "/status/:id"], async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    let updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedBooking) return res.status(404).json({ msg: "Booking not found" });
    res.json({ msg: "Status updated! ✅", booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update status", error: err.message });
  }
});

// ==============================
// ✅ DELETE: REMOVE A BOOKING
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ msg: "Booking not found" });
    }
    res.json({ msg: "Booking deleted successfully! 🗑️" });
  } catch (err) {
    res.status(500).json({ msg: "Server error during deletion", error: err.message });
  }
});

// ==============================
// ✅ ADMIN: GET STATS
// ==============================
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalAmount" },
          totalBookings: { $count: {} }
        }
      }
    ]);
    const result = stats.length > 0 ? stats[0] : { totalEarnings: 0, totalBookings: 0 };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error calculating stats", error: err.message });
  }
});

module.exports = router;
