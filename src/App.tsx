import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminPatients from "./pages/admin/AdminPatients";

// Doctor
import DoctorLayout from "./components/DoctorLayout";
import DoctorHome from "./pages/doctor/DoctorHome";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import PatientLayout from "./pages/patient/PatientLayout";
import PatientHome from "./pages/patient/PatientHome";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientTreatments from "./pages/patient/PatientTreatments";
import PatientFiles from "./pages/patient/PatientFiles";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientSchedule from "./pages/patient/PatientSchedule";
import PatientSettings from "./pages/patient/PatientSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <AppointmentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="doctors" element={<AdminDoctors />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="patients" element={<AdminPatients />} />
                </Route>

                <Route path="/doctor" element={<DoctorLayout />}>
                  <Route index element={<DoctorHome />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="patients" element={<DoctorPatients />} />
                  <Route path="reports" element={<DoctorReports />} />
                  <Route path="settings" element={<DoctorSettings />} />
                </Route>
                <Route path="/patient" element={<PatientLayout />}>
                  <Route index element={<PatientHome />} />
                  <Route path="appointments" element={<PatientAppointments />} />
                  <Route path="treatments" element={<PatientTreatments />} />
                  <Route path="files" element={<PatientFiles />} />
                  <Route path="history" element={<PatientHistory />} />
                  <Route path="schedule" element={<PatientSchedule />} />
                  <Route path="settings" element={<PatientSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppointmentProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
