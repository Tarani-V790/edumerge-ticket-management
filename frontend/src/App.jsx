import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/create-ticket"
          element={<CreateTicket />}
        />

        <Route
          path="/tickets/:id"
          element={<TicketDetails />}
        />

        <Route
          path="/staff"
          element={<StaffDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;