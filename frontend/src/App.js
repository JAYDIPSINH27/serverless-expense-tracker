import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Component/Home";
import Signup from "./Component/Signup";
import Login from "./Component/Login";
import Dashboard from "./Component/Dashboard";
import Upload from "./Component/ImageUpload";
import Verification from "./Component/Verification";
import { userpool } from "./Config/userpool";
import Profile from "./Component/Profile";
import { Toaster } from "react-hot-toast";

function App() {
  let user = userpool.getCurrentUser();

  if (user) {
    <Navigate to="/dashboard" replace />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
      <Toaster position="bottom-right" reverseOrder={true} />
    </BrowserRouter>
  );
}

export default App;
