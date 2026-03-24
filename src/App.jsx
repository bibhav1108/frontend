import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateNeed from "./pages/CreateNeed";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Volunteers from "./pages/Volunteers";
import Landing from "./pages/Landing";
import Verify from "./pages/Verify";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateNeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
