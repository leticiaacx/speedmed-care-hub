import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import { useAuth } from "./contexts/AuthContext";
import type { UserRole } from "./contexts/UserContext";
import { Loader2 } from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminSettings from './pages/admin/AdminSettings';
import AdminFinancial from './pages/admin/AdminFinancial';

// Doctor
import DoctorLayout from "./components/DoctorLayout";
import DoctorHome from "./pages/doctor/DoctorHome";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorSettings from "./pages/doctor/DoctorSettings";

// Patient
import PatientLayout from "./pages/patient/PatientLayout";
import PatientHome from "./pages/patient/PatientHome";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientTreatments from "./pages/patient/PatientTreatments";
import PatientFiles from "./pages/patient/PatientFiles";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientSchedule from "./pages/patient/PatientSchedule";
import PatientSettings from "./pages/patient/PatientSettings";

import NotFound from "./pages/NotFound";

// ─── Role → home route mapping ─────────────────────────────────────────────────
const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
const ProtectedRoute = ({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but wrong role, redirect to their correct home
  if (user && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role as UserRole]} replace />;
  }

  return <>{children}</>;
};

// ─── Public route (redirect if already logged in) ─────────────────────────────
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role as UserRole]} replace />;
  }

  return <>{children}</>;
};

// ─── Inner app (needs AuthContext to be available) ────────────────────────────
const AppRoutes = () => (
  <UserProvider>
    <AppointmentProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="financial" element={<AdminFinancial />} />
          </Route>

          {/* Doctor routes */}
          <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>}>
            <Route index element={<DoctorHome />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="reports" element={<DoctorReports />} />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* Patient routes */}
          <Route path="/patient" element={<ProtectedRoute role="patient"><PatientLayout /></ProtectedRoute>}>
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
      </TooltipProvider>
    </AppointmentProvider>
  </UserProvider>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
