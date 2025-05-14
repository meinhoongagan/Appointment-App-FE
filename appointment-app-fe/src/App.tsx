import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ServiceProviderLayout from "./pages/service-provider/Dashboard";
import Overview from "./pages/service-provider/Overview";
import Appointments from "./pages/service-provider/Appointments";
import Services from "./pages/service-provider/Services";
import Profile from "./pages/service-provider/Profile";
import ConsumerLayout from "./pages/consumer/Dashboard";
import ConsumerOverview from "./pages/consumer/Overview";
import FindServices from "./pages/consumer/FindServices";
import ConsumerAppointments from "./pages/consumer/Appointments"; 
import ConsumerProfile from "./pages/consumer/Profile";
import BookProvider from "./pages/consumer/BookProvider";

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
          <Route index element={<Overview />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<Services />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Consumer routes */}
        <Route path="/consumer-dashboard" element={<ConsumerLayout />}>
          <Route index element={<ConsumerOverview />} />
          <Route path="find-services" element={<FindServices />} />
          <Route path="book/:providerId" element={<BookProvider />} />
          <Route path="appointments" element={<ConsumerAppointments />} />
          <Route path="profile" element={<ConsumerProfile />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
