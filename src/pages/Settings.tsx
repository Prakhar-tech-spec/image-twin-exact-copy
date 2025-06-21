import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ChevronRight,
  Bell,
  Settings as SettingsIcon,
  Menu
} from "lucide-react";

const NavItem = ({ icon, text, active = false }) => {
  let to = "#";
  if (text === "Dashboard") to = "/";
  if (text === "Customers") to = "/customers";
  if (text === "EMI") to = "/emi";
  if (text === "Settings") to = "/settings";
  return (
    <Link to={to} className={`flex items-center space-x-3 p-3 my-1 rounded-full cursor-pointer ${
        active ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'
    }`}>
      {icon}
      <span>{text}</span>
    </Link>
  );
};

const Settings = () => {
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to clear IndexedDB, localStorage, and reload
  const handleResetEverything = async () => {
    setResetting(true);
    // Clear IndexedDB
    if ('indexedDB' in window) {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      }
    }
    // Clear localStorage
    localStorage.clear();
    // Small delay for effect
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar for desktop */}
      <div className="w-64 bg-black text-white flex flex-col fixed h-full hidden md:block">
        <div className="p-5 flex items-center">
          <span className="text-purple-500 text-2xl font-bold font-qurova tracking-wide">DueDate</span>
        </div>
        <div className="flex-1 px-3 pb-32">
          <div className="mt-8">
            <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === "/"} />
            <NavItem icon={<Users size={20} />} text="Customers" active={location.pathname === "/customers"} />
            <NavItem icon={<CreditCard size={20} />} text="EMI" active={location.pathname === "/emi"} />
          </div>
        </div>
        {/* Upgrade section */}
        <div className="mt-20 mb-10">
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

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-64 bg-black text-white flex flex-col h-full z-50"
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-white text-2xl p-1 rounded-full bg-gray-800 hover:bg-gray-700"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                &times;
              </button>
              <div className="flex items-center justify-center h-20 border-b border-gray-800">
                <span className="text-purple-500 text-2xl font-bold font-qurova tracking-wide">DueDate</span>
              </div>
              <div className="flex-1 px-3">
                <div className="mt-8">
                  <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === "/"} />
                  <NavItem icon={<Users size={20} />} text="Customers" active={location.pathname === "/customers"} />
                  <NavItem icon={<CreditCard size={20} />} text="EMI" active={location.pathname === "/emi"} />
                </div>
              </div>
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
              <div className="p-5">
                <NavItem icon={<span className="w-5 h-5 flex items-center justify-center text-gray-400">⚙️</span>} text="Settings" active={location.pathname === "/settings"} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64"
        >
          {/* Header */}
          <header className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar menu button for mobile */}
              <button
                className="block md:hidden p-2 rounded-full bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={24} />
              </button>
              <div className="text-gray-500">Settings</div>
              <h1 className="text-3xl">Settings</h1>
            </div>
          </header>
          {/* Settings content */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-8">
            <div className="bg-gray-50 rounded-2xl shadow p-8 w-full max-w-xl text-center">
              <p className="text-gray-500 text-lg mb-6">Manage your application settings below.</p>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full shadow transition text-lg"
                onClick={() => setShowWarning(true)}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Reset Everything'}
              </button>
              <p className="text-gray-400 text-sm mt-4">This will erase all customers, EMIs, notifications, and settings. This action cannot be undone.</p>
            </div>
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
                  >
                    <h2 className="text-2xl font-bold mb-2 text-red-600">Are you sure?</h2>
                    <p className="text-gray-700 mb-6">This will permanently erase <b>all</b> data in the software and reset it to zero. This action cannot be undone.</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-full"
                        onClick={() => setShowWarning(false)}
                        disabled={resetting}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow"
                        onClick={handleResetEverything}
                        disabled={resetting}
                      >
                        Yes, Reset Everything
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Settings; 