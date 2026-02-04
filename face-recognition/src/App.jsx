import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Camera from "./pages/Camera";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/camera" element={<Camera />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
