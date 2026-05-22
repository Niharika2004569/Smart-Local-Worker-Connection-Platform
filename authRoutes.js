const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ==============================
// ✅ REGISTER ROUTE (Reliable Skill Saving)
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      skill,    // Singular string from <select name="skill">
      skills,   // Array if using multi-select
      location, 
      pincode, 
      phone, 
      gender,
      experience, 
      hourlyRate, 
      description 
    } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 2. LOGIC TO FIX "SKILL NOT FOUND":
    // We prioritize 'skill'. If that's empty, we try to take the first item from 'skills' array.
    let finalSkill = "";
    if (skill) {
      finalSkill = skill;
    } else if (Array.isArray(skills) && skills.length > 0) {
      finalSkill = skills[0];
    }

    // Ensure skills is always an array for the database
    let finalSkillsArray = [];
    if (Array.isArray(skills)) {
      finalSkillsArray = skills;
    } else if (skill) {
      finalSkillsArray = [skill];
    }

    // 3. Create New User Instance
    const newUser = new User({
      name,
      email: cleanEmail,
      password, 
      role,
      gender: gender || "male",
      skill: finalSkill, // ✅ This will now be "Electrician", "Plumber", etc.
      skills: finalSkillsArray,
      location,
      pincode,
      phone,
      experience: experience || "0",
      hourlyRate: hourlyRate || "0",
      description: description || ""
    });

    // 4. Save to MongoDB
    await newUser.save();
    console.log(`✅ SUCCESS: Registered ${name} as ${finalSkill}`);
    res.status(201).json({ msg: "Registration Successful! ✅" });

  } catch (err) {
    console.error("DETAILED BACKEND ERROR:", err.message); 
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
});

// ==============================
// ✅ LOGIN ROUTE
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.password !== password) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    res.json({ msg: "Login successful", token: "dummy-token", user });
  } catch (err) {
    res.status(500).json({ msg: "Server Error during login" });
  }
});

// ==============================
// ✅ FORGOT PASSWORD ROUTE
// ==============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });

    if (!user) {
      return res.status(404).json({ msg: "Email not found. Please register." });
    }
    res.json({ msg: "Reset link sent to your email! 📩" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ==============================
// ✅ RESET PASSWORD ROUTE
// ==============================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.password = newPassword; 
    await user.save();
    res.json({ msg: "Password updated successfully! ✅" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
