import React from 'react';
import { StarCanvas } from '../component/canvas';
import { Outlet } from 'react-router-dom'; // For nested routes
import '../index.css';

const MainLayout = () => {
  return (
    <div className="">  
      <StarCanvas className='absolute top-0 left-0 w-full h-full z-[-1]'/> 
      <div className="relative">
        <Outlet /> {/* Your page content will render here */}
      </div>
    </div>
  );
};

export default MainLayout;
