import { Outlet } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';

const DoctorLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
  
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 lg:pb-8 lg:ml-20 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;