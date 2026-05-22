const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Worker = require("../models/Worker");

// ==============================
// ✅ 1. GET ALL WORKERS
// ==============================
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    res.status(500).json({ msg: "Fetch All Workers Error" });
  }
});

// ==============================
// ✅ 2. SEARCH WORKERS (SKILL + LOCATION)
// ==============================
router.get("/search", async (req, res) => {
  try {
    const { skill, location } = req.query;
    let query = {};
    if (skill && skill.trim() !== "") query.skill = { $regex: skill, $options: "i" };
    if (location && location.trim() !== "") query.location = { $regex: location, $options: "i" };
    
    const workers = await Worker.find(query);
    res.json(workers);
  } catch (err) {
    res.status(500).json({ msg: "Search Failed" });
  }
});

// ==============================
// ✅ 3. GET SINGLE WORKER BY ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Worker ID format" });
    }
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ msg: "Worker not found" });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ msg: "Fetch Error" });
  }
});

// ==============================
// ✅ 4. UPDATE WORKER PROFILE
// ==============================
router.put("/update/:id", async (req, res) => {
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedWorker) return res.status(404).json({ msg: "Worker not found" });
    res.json({ msg: "Profile Updated! ✅", worker: updatedWorker });
  } catch (err) {
    res.status(500).json({ msg: "Update Failed" });
  }
});

// ==============================
// ✅ 5. SUBMIT REVIEW & CALCULATE AVERAGE
// ==============================
router.post("/:id/review", async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Worker ID" });
    }

    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ msg: "Worker not found" });

    // 1. Add new review to the array
    const newReview = { 
      customerName: customerName || "Anonymous", 
      rating: Number(rating), 
      comment: comment || "", 
      createdAt: new Date() 
    };
    worker.reviews.push(newReview);

    // 2. ✅ EXACT CALCULATION LOGIC
    const totalRatingSum = worker.reviews.reduce((sum, r) => sum + r.rating, 0);
    worker.averageRating = Number((totalRatingSum / worker.reviews.length).toFixed(1));

    // 3. Save to database
    await worker.save();

    res.status(201).json({ 
      msg: "Review added! ⭐", 
      averageRating: worker.averageRating,
      reviewCount: worker.reviews.length 
    });
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ msg: "Server error while saving review" });
  }
});

module.exports = router;
