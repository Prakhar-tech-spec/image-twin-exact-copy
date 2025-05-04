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
import { Link, useLocation, useNavigate } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import { getNotifications, getCustomers, getEmis, updateNotification } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

const NOTIF_SOUND = "/notification.mp3";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState([]);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifSoundRef = React.useRef(null);
  const lastNotifId = React.useRef(null);
  const [stats, setStats] = React.useState({ total: 0, active: 0, inactive: 0, new_customers: 0 });
  const [emiStats, setEmiStats] = React.useState({ totalEmis: 0, pendingEmis: 0, overdueEmis: 0, totalDeductions: 0 });

  // Poll notifications every 60s
  React.useEffect(() => {
    let interval = setInterval(fetchNotifications, 60000);
    fetchNotifications();
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchEmiStats();
    const interval = setInterval(fetchEmiStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    const data = await getNotifications();
    setNotifications(data);
    if (data.length > 0 && data[0].id !== lastNotifId.current) {
      if (notifSoundRef.current) notifSoundRef.current.play();
      lastNotifId.current = data[0].id;
    }
  }

  async function fetchStats() {
    const customers = await getCustomers();
    const emis = await getEmis();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    setStats({
      total: customers.length,
      active: customers.filter(c => c.status === 'Active').length,
      inactive: customers.filter(c => c.status === 'Inactive').length,
      new_customers: customers.filter(c => {
        const d = new Date(c.joinDate || c.startDate || 0);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
    });
  }

  async function fetchEmiStats() {
    const emis = await getEmis();
    const today = new Date().toISOString().slice(0, 10);
    const totalEmis = emis.length;
    const pendingEmis = emis.filter(e => !e.paid && e.due_date >= today).length;
    const overdueEmis = emis.filter(e => !e.paid && e.due_date < today).length;
    const totalDeductions = emis.filter(e => e.paid).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    setEmiStats({ totalEmis, pendingEmis, overdueEmis, totalDeductions });
  }

  async function handleNotifClick(notif) {
    await updateNotification({ ...notif, read: 1 });
    setNotifOpen(false);
    navigate(`/customers?customerId=${notif.customer_id}`);
    fetchNotifications();
  }

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
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex-1 flex flex-col overflow-hidden ml-64"
        >
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
              
              <div className="relative">
                <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer relative" onClick={() => setNotifOpen(v => !v)}>
                  <Bell size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">{notifications.length}</span>
                  )}
                </div>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                    <div className="p-3 border-b font-semibold">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-400 text-center">No notifications</div>
                    ) : notifications.map(notif => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0" onClick={() => handleNotifClick(notif)}>
                        <div className="font-medium">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-1">Due: {notif.due_date} | {notif.type}</div>
                      </div>
                    ))}
                  </div>
                )}
                <audio ref={notifSoundRef} src={NOTIF_SOUND} preload="auto" />
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
                title="Total Customers" 
                value={stats.total} 
                description="Total number of customers in the system." 
              />
              <StatCard 
                icon={<Wallet size={24} />} 
                iconBg="bg-[#8F5FE8]" 
                cardBg="bg-[#F5F0FA]" 
                title="Active Customers" 
                value={stats.active} 
                description="Customers with active EMI plans." 
              />
              <StatCard 
                icon={<CreditCard size={24} />} 
                iconBg="bg-[#D97C29]" 
                cardBg="bg-[#FFF6E9]" 
                title="Inactive Customers" 
                value={stats.inactive} 
                description="Customers without active EMI plans." 
              />
              <StatCard 
                icon={<CreditCard size={24} />} 
                iconBg="bg-[#2563EB]" 
                cardBg="bg-[#EDF4FF]" 
                title="New Customers" 
                value={stats.new_customers} 
                description="Customers added this month." 
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
                  <div className="h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        key={JSON.stringify([stats.total, stats.active, stats.inactive, stats.new_customers])}
                        data={[
                          { name: 'Total Customers', value: stats.total },
                          { name: 'Active', value: stats.active },
                          { name: 'Inactive', value: stats.inactive },
                          { name: 'New', value: stats.new_customers }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8F5FE8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
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
        </motion.div>
      </AnimatePresence>
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
      <div className="text-xs text-black/40 leading-tight font-normal mt-1 whitespace-nowrap">{description}</div>
    </div>
  );
};

export default Index;
