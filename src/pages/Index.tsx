import React from "react";
import { 
  Search,
  Bell, 
  Users, 
  Wallet, 
  CreditCard, 
  Download,
  Maximize2,
  ChevronRight,
  MoreHorizontal,
  Rocket,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';

const Index = () => {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col fixed h-full">
        <div className="p-5 flex items-center">
          <span className="text-purple-500 text-2xl font-bold font-qurova tracking-wide">DueDate</span>
        </div>
        
        <div className="flex-1 px-3">
          <div className="mt-8">
            <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === "/"} />
            <NavItem icon={<Users size={20} />} text="Customers" active={location.pathname === "/customers"} />
            <NavItem icon={<CreditCard size={20} />} text="EMI" active={location.pathname === "/emi"} />
          </div>
        </div>
        
        {/* Upgrade section */}
        <div className="mt-auto mb-10">
          <div className="bg-gradient-to-r from-[#a259e6] to-[#b97aff] rounded-3xl mx-3 p-6 text-center relative overflow-visible">
            <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-white rounded-full border-4 border-black p-4 flex items-center justify-center" style={{width:'72px',height:'72px'}}>
              <img src={RocketSVG} alt="Rocket Icon" className="w-10 h-10" />
            </div>
            <p className="text-sm mt-6 mb-2">Additional features to enhance your security.</p>
            <button className="bg-white text-purple-700 px-6 py-2 rounded-full mt-2 flex items-center mx-auto">
              Upgrade Pro
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Settings */}
        <div className="p-5">
          <NavItem icon={<span className="w-5 h-5 flex items-center justify-center text-gray-400">⚙️</span>} text="Settings" active={location.pathname === "/settings"} />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <div className="text-gray-500">Welcome back, Anupam Stores👋🏻</div>
            <h1 className="text-3xl">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search now" 
                className="pl-10 pr-4 py-2 border rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Bell size={24} />
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=12" alt="User" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard 
              icon={<Users size={24} />} 
              iconBg="bg-[#43936C]" 
              cardBg="bg-[#EAF7F0]" 
              title="Total Employees" 
              value={0} 
              description="No employees yet." 
            />
            <StatCard 
              icon={<Wallet size={24} />} 
              iconBg="bg-[#8F5FE8]" 
              cardBg="bg-[#F5F0FA]" 
              title="Payroll Processed" 
              value={0} 
              description="No payroll processed yet." 
            />
            <StatCard 
              icon={<CreditCard size={24} />} 
              iconBg="bg-[#D97C29]" 
              cardBg="bg-[#FFF6E9]" 
              title="Pending Pay" 
              value={0} 
              description="No pending payroll." 
            />
            <StatCard 
              icon={<CreditCard size={24} />} 
              iconBg="bg-[#2563EB]" 
              cardBg="bg-[#EDF4FF]" 
              title="Tax & Deduction" 
              value={0} 
              description="No tax or deduction data yet." 
            />
          </div>
          
          <div className="flex gap-6">
            {/* Left column */}
            <div className="flex-1 space-y-6">
              {/* Overview */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl">Overview</h2>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full border hover:bg-gray-50">
                      <Download size={20} />
                    </button>
                    <button className="p-2 rounded-full border hover:bg-gray-50">
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's a graph of your business overview</p>
                {/* Graph placeholder - all values 0, ready for real-time updates */}
                <div className="h-64 relative flex items-center justify-center">
                  <div className="text-gray-400 text-lg">No data to display</div>
                </div>
              </div>
              
              {/* Customers */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl">Customers</h2>
                  <Link to="/customers" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </Link>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's a list of your customers</p>
                {/* No customers yet */}
                <div className="text-gray-400 text-center py-8">No customers yet.</div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="w-96 space-y-6">
              {/* Attendance */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl">Upcoming EMI's</h2>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's a list of upcoming EMI's</p>
                <div className="text-gray-400 text-center py-8">No upcoming EMI's yet.</div>
              </div>
              
              {/* Announcement */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl">EMI's Due</h2>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's a list of EMI's due</p>
                <div className="text-gray-400 text-center py-8">No EMI's due yet.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const NavItem = ({ icon, text, active = false }) => {
  let to = "#";
  if (text === "Dashboard") to = "/";
  if (text === "Customers") to = "/customers";
  if (text === "EMI") to = "/emi";
  return (
    <Link to={to} className={`flex items-center space-x-3 p-3 my-1 rounded-full cursor-pointer ${
        active ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'
    }`}>
      {icon}
      <span>{text}</span>
    </Link>
  );
};

const StatCard = ({ icon, iconBg, cardBg, title, value, description }) => {
  return (
    <div className={`${cardBg} rounded-2xl px-6 py-4 flex flex-col min-w-[260px] max-w-xs`}>
      <div className="flex items-start gap-3 mb-0 mt-1">
        <div className={`flex items-center justify-center w-14 h-14 rounded-full ${iconBg} mt-0.5`}>
          {React.cloneElement(icon, { className: `${icon.props.className || ''} w-7 h-7`, color: 'white', strokeWidth: 2.5 })}
        </div>
        <div className="flex flex-col">
          <div className="text-base text-black/80 font-normal mb-0.5">{title}</div>
          <div className="text-2xl text-black font-normal mb-1">{value}</div>
        </div>
      </div>
      <div className="text-xs text-black/40 leading-tight font-normal mt-1">{description}</div>
    </div>
  );
};

export default Index;
