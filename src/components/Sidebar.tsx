import React from "react";
import { LayoutDashboard, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';

const Sidebar = ({ pathname }: { pathname: string }) => (
  <div className="w-64 bg-black text-white flex flex-col justify-between h-full fixed">
    <div>
      <div className="p-5 flex items-center">
        <span className="text-purple-500 text-2xl font-bold font-qurova tracking-wide">DueDate</span>
      </div>
      <div className="flex-1 px-3">
        <div className="mt-8">
          <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/" active={pathname === "/"} />
          <NavItem icon={<Users size={20} />} text="Customers" to="/customers" active={pathname === "/customers"} />
          <NavItem icon={<CreditCard size={20} />} text="EMI" to="/emi" active={pathname === "/emi"} />
        </div>
      </div>
    </div>
    <div className="mb-10">
      <div className="bg-gradient-to-r from-[#a259e6] to-[#b97aff] rounded-3xl mx-3 p-6 text-center relative overflow-visible">
        <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-white rounded-full border-4 border-black p-4 flex items-center justify-center" style={{width:'72px',height:'72px'}}>
          <img src={RocketSVG} alt="Rocket Icon" className="w-10 h-10" />
        </div>
        <p className="text-sm mt-6 mb-2">Additional features to enhance your security.</p>
        <button className="bg-white text-purple-700 px-6 py-2 rounded-full mt-2 flex items-center mx-auto">
          Upgrade Pro
          <span className="ml-1">→</span>
        </button>
      </div>
    </div>
    <div className="p-5">
      <NavItem icon={<span className="w-5 h-5 flex items-center justify-center text-gray-400">⚙️</span>} text="Settings" to="/settings" active={pathname === "/settings"} />
    </div>
  </div>
);

const NavItem = ({ icon, text, to, active = false }: { icon: React.ReactNode, text: string, to: string, active?: boolean }) => (
  <Link to={to} className={`flex items-center space-x-3 p-3 my-1 rounded-full cursor-pointer ${
    active ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'
  }`}>
    {icon}
    <span>{text}</span>
  </Link>
);

export default Sidebar; 