import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- 1. AUTHENTICATION PAGES ---
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

// --- 2. CORE USER PAGES ---
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Messages from "./pages/Messages"; 
import Account from "./pages/Account"; 
import Payments from "./pages/Payments"; 
import Settings from "./pages/Settings"; 
import ManageAddress from "./pages/ManageAddress"; 
import ChatList from "./pages/ChatList"; 

// --- 3. WORKER & MAP LOGIC ---
import Workers from "./pages/Workers"; 
import WorkerProfile from "./pages/WorkerProfile";
import BookWorker from "./pages/BookWorker"; 
import WorkerMap from "./pages/WorkerMap"; // ✅ Correctly linked for Route/Map features

function App() {
  return (
    <Router>
      <Routes>
        {/* --- AUTHENTICATION ROUTES --- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route path="/change-password" element={<ChangePassword />} />

        {/* --- DASHBOARD & ACTIVITY --- */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/messages" element={<Messages />} /> 
        <Route path="/chat-list" element={<ChatList />} /> 

        {/* --- USER ACCOUNT & SETTINGS --- */}
        <Route path="/profile" element={<Account />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} /> 
        <Route path="/address" element={<ManageAddress />} /> 

        {/* --- WORKER DISCOVERY & MAPS --- */}
        <Route path="/workers" element={<Workers />} /> 
        
        {/* ✅ Updated to PLURAL to match your navigation calls */}
        <Route path="/workers/:id" element={<WorkerProfile />} /> 
        
        <Route path="/book/:id" element={<BookWorker />} /> 
        <Route path="/map" element={<WorkerMap />} />

        {/* --- 404 FALLBACK --- */}
        <Route path="*" element={
          <div style={{ textAlign: "center", marginTop: "100px", fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ color: '#1e293b' }}>404 - Page Not Found</h2>
            <p style={{ color: '#64748b' }}>The page you are looking for does not exist.</p>
            <a href="/dashboard" style={{ color: '#4f46e5', fontWeight: '800', textDecoration: 'none' }}>
              Return to Dashboard
            </a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
