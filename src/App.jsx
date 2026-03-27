import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateNeed from "./pages/CreateNeed";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Volunteers from "./pages/Volunteers";
import Landing from "./pages/Landing";
import Surplus from "./pages/surplus";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout";
import ActiveNeeds from "./pages/ActiveNeeds";
import DispatchHistory from "./pages/DispatchHistory";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateNeed />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Layout>
                <Volunteers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/surplus"
          element={
            <ProtectedRoute>
              <Layout>
                <Surplus />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/needs"
          element={
            <ProtectedRoute>
              <Layout>
                <ActiveNeeds />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatches"
          element={
            <ProtectedRoute>
              <Layout>
                <DispatchHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
