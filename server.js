const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
require("dotenv").config();

const Message = require("./models/Message"); 
const Worker = require("./models/Worker"); 
const app = express();

app.use(express.json()); 
app.use(cors()); 

const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id} ✅`);

  // --- 1. JOIN ROOM ---
  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    try {
      const history = await Message.find({ room: roomId }).sort({ timestamp: 1 });
      socket.emit("chat_history", history);
    } catch (err) { console.error("History Error:", err); }
  });

  // --- 2. LEAVE ROOM ---
  socket.on("leave_room", (room) => { socket.leave(room); });

  // --- 3. SEND MESSAGE & SMART ASSISTANT ---
  socket.on("send_message", async (data) => {
    try {
      // Save and Broadcast User's Message
      const userMsg = new Message({ 
        room: data.room, 
        author: data.author, 
        message: data.message, 
        time: data.time 
      });
      await userMsg.save();
      socket.broadcast.to(data.room).emit("receive_message", data);

      // ✅ SMART ASSISTANT LOGIC (Triggered only in assistant rooms)
      if (data.room.startsWith("assistant_")) {
        const msg = data.message.toLowerCase();
        let botText = ""; 

        // Identify Category
        let category = "";
        if (msg.includes("electric")) category = "Electrician";
        else if (msg.includes("plumb")) category = "Plumber";
        else if (msg.includes("carpent")) category = "Carpenter";
        else if (msg.includes("paint")) category = "Painter";
        else if (msg.includes("ac")) category = "AC Repair";
        else if (msg.includes("mechanic")) category = "Mechanic";

        // A. THANKS & WELCOME
        if (msg.includes("thank") || msg.includes("thx")) {
          botText = "You're very welcome! I'm happy to help. Is there anything else? 😊";
        }
        // B. PRICING & AVAILABILITY
        else if (category && (msg.includes("price") || msg.includes("rate") || msg.includes("how much") || msg.includes("available"))) {
          try {
            const workers = await Worker.find({ skill: new RegExp(category, 'i') });
            if (workers.length > 0) {
              const avg = workers.reduce((sum, w) => sum + (w.hourlyRate || 0), 0) / workers.length;
              botText = `The average rate for a ${category} is ₹${avg.toFixed(0)}/hr. We have ${workers.length} professionals ready in your area!`;
            } else {
              botText = `We don't have any ${category}s registered yet, but market rates are typically ₹250-₹400/hr.`;
            }
          } catch (err) { botText = `Checking prices... typical ${category} rates start at ₹200.`; }
        } 
        // C. GREETINGS
        else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
          botText = "Hello! I'm your LocalWorker AI. You can ask me about service prices or how to hire a professional.";
        }
        // D. BOOKING STEPS
        else if (msg.includes("book") || msg.includes("hire") || msg.includes("how to")) {
          botText = "To book: Go to 'Find Worker', pick a category, and click 'Hire' on a profile to set your date and time.";
        }
        // E. FALLBACK
        else {
          botText = "I'm the Assistant. I can help with service prices, booking info, and payments. What do you need?";
        }

        const botData = {
          room: data.room,
          author: "Assistant",
          message: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Save Bot Reply and Emit
        const finalBotMsg = new Message(botData);
        await finalBotMsg.save();
        io.to(data.room).emit("receive_message", botData);

        // ✅ EXIT IMMEDIATELY to prevent extra generic emissions
        return;
      }
    } catch (err) { console.error("Message Error:", err); }
  });

  // --- 4. CLEAR CHAT ---
  socket.on("clear_chat", async (roomId) => {
    try {
      await Message.deleteMany({ room: roomId });
      io.to(roomId).emit("chat_history", []); 
    } catch (err) { console.error("Delete Error:", err); }
  });

  socket.on("disconnect", () => { console.log("User Disconnected ❌"); });
});

// API ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("❌ DB Error:", err.message));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
