import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import FlightSearch from './pages/FlightSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyTickets from "./pages/MyTickets";
import AdminHome from './pages/AdminHome';
import AdminLogin from './pages/AdminLogin';
import CreateAirport from "./pages/CreateAirport";
import CreateFlight from "./pages/CreateFlight";
import CancelFlight from "./pages/CancelFlight";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search-flights" element={<FlightSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/admin-home" element={<AdminHome />} />  
        <Route path="/admin-login" element={<AdminLogin />} />  
        <Route
        path="/admin/create-airport"
        element={<CreateAirport />}
        /> 
        <Route
        path="/admin/create-flight"
        element={<CreateFlight />}
        />
       <Route
          path="/admin/cancel-flight"
          element={<CancelFlight />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;