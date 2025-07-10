import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ServiceProviderLayout from "./pages/service-provider/Dashboard";
import Overview from "./pages/service-provider/Overview";
import Appointments from "./pages/service-provider/Appointments";
import Services from "./pages/service-provider/Services";
import Profile from "./pages/service-provider/Profile";
import Receptionists from "./pages/service-provider/Receptionists";
import ConsumerLayout from "./pages/consumer/Dashboard";
import ConsumerOverview from "./pages/consumer/Overview";
import FindServices from "./pages/consumer/FindServices";
import ConsumerAppointments from "./pages/consumer/Appointments"; 
import ConsumerProfile from "./pages/consumer/Profile";
import BookProvider from "./pages/consumer/BookProvider";
// import DashboardHome from "./pages/service-provider/DashboardHome";
import CalenderPage from "./pages/service-provider/Calender";
import ReceptionistDashboard from "./pages/receptionist/Dashboard";

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Service Provider routes */}
        <Route path="/service-dashboard" element={<ServiceProviderLayout />}>
          {/* <Route index element={<DashboardHome />} /> */}
          <Route path="overview" element={<Overview />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<Services />} />
          <Route path="receptionists" element={<Receptionists />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calender" element={<CalenderPage />} />
        </Route>

        {/* Consumer routes */}
        <Route path="/consumer-dashboard" element={<ConsumerLayout />}>
          <Route index element={<ConsumerOverview />} />
          <Route path="find-services" element={<FindServices />} />
          <Route path="book/:providerId" element={<BookProvider />} />
          <Route path="appointments" element={<ConsumerAppointments />} />
          <Route path="profile" element={<ConsumerProfile />} />
        </Route>

        {/* Receptionist routes */}
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
