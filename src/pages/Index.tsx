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
  LayoutDashboard,
  Menu,
  Smile,
  Frown,
  TrendingUp,
  Clock,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import { getNotifications, getCustomers, getEmis, updateNotification, addNotification, deleteNotification } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

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
  const dashboardRef = React.useRef(null);
  const [customerList, setCustomerList] = React.useState([]);
  const [upcomingEmiDetails, setUpcomingEmiDetails] = React.useState([]);
  const [emisDueDetails, setEmisDueDetails] = React.useState([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Poll notifications every 60s
  React.useEffect(() => {
    let interval = setInterval(fetchNotifications, 60000);
    fetchNotifications();
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchStats();
    fetchCustomerList();
    const interval = setInterval(() => {
      fetchStats();
      fetchCustomerList();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchEmiStats();
    const interval = setInterval(fetchEmiStats, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    function normalizeDate(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    async function fetchUpcomingEmis() {
      const emis = await getEmis();
      const today = normalizeDate(new Date());
      const fiveDaysLater = new Date(today);
      fiveDaysLater.setDate(today.getDate() + 5);
      const upcomingEmis = emis.filter(e => {
        const due = normalizeDate(e.due_date);
        return !e.paid && due >= today && due <= fiveDaysLater;
      });
      setUpcomingEmiDetails(upcomingEmis.map(e => {
        const customer = customerList.find(c => c.id === e.customer_id);
        return {
          name: customer?.name || '-',
          due_date: e.due_date,
          amount: e.amount
        };
      }));
    }
    fetchUpcomingEmis();
  }, [customerList]);

  React.useEffect(() => {
    async function fetchEmisDue() {
      const emis = await getEmis();
      // Show all unpaid EMIs with a fine, regardless of due date
      const dueEmis = emis.filter(e => {
        return !e.paid && e.fine > 0;
      });
      setEmisDueDetails(dueEmis.map(e => {
        const customer = customerList.find(c => c.id === e.customer_id);
        return {
          name: customer?.name || '-',
          due_date: e.due_date,
          amount: e.amount,
          fine: e.fine
        };
      }));
    }
    fetchEmisDue();
  }, [customerList]);

  // Generate notifications for EMIs due today
  React.useEffect(() => {
    async function generateDueEmiNotifications() {
      const emis = await getEmis();
      const notifications = await getNotifications();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);
      // Get dismissed map from localStorage
      let dismissedMap = {};
      try {
        dismissedMap = JSON.parse(localStorage.getItem('dismissedMap') || '{}');
      } catch (e) {
        dismissedMap = {};
      }
      for (const emi of emis) {
        if (!emi.paid) {
          const emiDueDate = new Date(emi.due_date);
          emiDueDate.setHours(0, 0, 0, 0);
          if (emiDueDate.getTime() === today.getTime()) {
            // Check if notification for this EMI and date already exists
            const alreadyNotified = notifications.some(n => n.emi_id === emi.id && n.due_date === emi.due_date);
            // Check if dismissed today
            if (!alreadyNotified && !(dismissedMap[emi.id] === todayStr)) {
              await addNotification({
                id: Date.now() + Math.floor(Math.random() * 10000),
                message: `EMI due today for customer ID ${emi.customer_id}`,
                due_date: emi.due_date,
                type: 'EMI Due',
                read: 0,
                customer_id: emi.customer_id,
                emi_id: emi.id
              });
            }
          }
        }
      }
    }
    generateDueEmiNotifications();
  }, []);

  React.useEffect(() => {
    // On mount, load lastNotifId from localStorage
    const storedId = localStorage.getItem('lastNotifId');
    if (storedId) lastNotifId.current = storedId;
  }, []);

  async function fetchNotifications() {
    const data = await getNotifications();
    setNotifications(data);
    if (data.length > 0) {
      const notif = data[0];
      const todayStr = new Date().toISOString().slice(0, 10);
      // Get or initialize notified map
      let notifiedMap = {};
      try {
        notifiedMap = JSON.parse(localStorage.getItem('notifiedMap') || '{}');
      } catch (e) {
        notifiedMap = {};
      }
      // Only play sound if not notified today for this customer
      if (notif.customer_id && notifiedMap[notif.customer_id] !== todayStr && notif.id !== lastNotifId.current) {
        if (notifSoundRef.current) {
          notifSoundRef.current.play().catch(() => {});
        }
        notifiedMap[notif.customer_id] = todayStr;
        localStorage.setItem('notifiedMap', JSON.stringify(notifiedMap));
      }
      lastNotifId.current = notif.id;
      localStorage.setItem('lastNotifId', notif.id);
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

  async function fetchCustomerList() {
    const customers = await getCustomers();
    setCustomerList(customers);
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
    await deleteNotification(notif.id); // Remove notification after navigating

    // Track dismissed notification for the day
    const todayStr = new Date().toISOString().slice(0, 10);
    let dismissedMap = {};
    try {
      dismissedMap = JSON.parse(localStorage.getItem('dismissedMap') || '{}');
    } catch (e) {
      dismissedMap = {};
    }
    if (notif.emi_id) {
      dismissedMap[notif.emi_id] = todayStr;
      localStorage.setItem('dismissedMap', JSON.stringify(dismissedMap));
    }

    // Fetch the new notifications list
    const data = await getNotifications();
    setNotifications(data);

    // Update lastNotifId to the new top notification (if any)
    if (data.length > 0) {
      lastNotifId.current = data[0].id;
      localStorage.setItem('lastNotifId', data[0].id);
    } else {
      lastNotifId.current = null;
      localStorage.removeItem('lastNotifId');
    }
  }

  const handleDownloadPDF = async () => {
    // Dashboard stats
    const dashboardData = [
      ['Total Customers', stats.total],
      ['Active Customers', stats.active],
      ['Inactive Customers', stats.inactive],
      ['New Customers', stats.new_customers],
      ['Total EMI Filed', emiStats.totalEmis],
      ['Pending EMI Filings', emiStats.pendingEmis],
      ['Overdue EMI Payment', emiStats.overdueEmis],
      ['Total EMI Deductions', emiStats.totalDeductions],
    ];

    // Fetch customers and EMIs
    const customers = await getCustomers();
    const emis = await getEmis();

    // Prepare customer table
    const customerHeaders = ['Name', 'Primary Contact', 'Status', 'Original Device Price', 'Downpayment', 'Loan Amount', 'EMI Tenure', 'Start Date'];
    const customerRows = customers.map(c => [
      c.name,
      c.primaryContact || c.phone,
      c.status,
      c.originalDevicePrice,
      c.downpayment,
      c.loanAmount,
      c.emiTenure,
      c.startDate || c.joinDate
    ]);

    // Prepare EMI table
    const emiHeaders = ['Customer', 'Due Date', 'Amount', 'Fine', 'Status'];
    const emiRows = emis.map(e => [
      customers.find(c => c.id === e.customer_id)?.name || '-',
      e.due_date,
      e.amount,
      e.fine,
      e.paid ? 'Paid' : 'Unpaid'
    ]);

    // Create PDF
    const pdf = new jsPDF('landscape');
    pdf.setFontSize(18);
    pdf.text('Dashboard Overview', 14, 18);
    autoTable(pdf, {
      startY: 24,
      head: [['Metric', 'Value']],
      body: dashboardData,
    });

    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Customers', 14, 18);
    autoTable(pdf, {
      startY: 24,
      head: [customerHeaders],
      body: customerRows,
      styles: { fontSize: 10 },
    });

    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('EMIs', 14, 18);
    autoTable(pdf, {
      startY: 24,
      head: [emiHeaders],
      body: emiRows,
      styles: { fontSize: 10 },
    });

    pdf.save('software-data-report.pdf');
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newCustomers = customerList.filter(c => {
    const d = new Date(c.joinDate || c.startDate || 0);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  // Add a handler to delete a notification
  async function handleDeleteNotification(id) {
    await deleteNotification(id);
    fetchNotifications();
  }

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
                      <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between" onClick={() => handleNotifClick(notif)}>
                        <div>
                          <div className="font-medium">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-1">Due: {notif.due_date} | {notif.type}</div>
                        </div>
                        <button
                          className="ml-4 text-gray-400 hover:text-red-500 text-lg font-bold px-2 py-0.5 rounded-full focus:outline-none"
                          title="Delete notification"
                          onClick={e => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                        >
                          &times;
                        </button>
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
          <div className="flex-1 overflow-auto p-6 px-4 md:px-8" ref={dashboardRef}>
            {/* Stats Grid (2x2 layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 w-full">
              <StatCard
                icon={<Users size={24} />}
                iconBg="bg-[#43936C]"
                cardBg="bg-[#EAF7F0]"
                title="Total Customers"
                value={stats.total}
                description="Total number of customers."
              />
              <StatCard
                icon={<Smile size={24} />}
                iconBg="bg-[#8F5FE8]"
                cardBg="bg-[#F5F0FA]"
                title="Active Customers"
                value={stats.active}
                description="Customers currently active."
              />
              <StatCard
                icon={<Frown size={24} />}
                iconBg="bg-[#D97C29]"
                cardBg="bg-[#FFF6E9]"
                title="Inactive Customers"
                value={stats.inactive}
                description="Some customers are currently inactive."
              />
              <StatCard
                icon={<TrendingUp size={24} />}
                iconBg="bg-[#2563EB]"
                cardBg="bg-[#EDF4FF]"
                title="New Customers (This Month)"
                value={stats.new_customers}
                description="Customers joined this month."
              />
            </div>

            {/* Content below cards */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column */}
              <div className="flex-1 space-y-6">
                {/* Overview */}
                <div className="bg-white rounded-lg p-5">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl">Overview</h2>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-full border hover:bg-gray-50" onClick={handleDownloadPDF} title="Download PDF">
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
                  <p className="text-gray-500 text-sm mb-4">Here's a list of your new customers this month</p>
                  {newCustomers.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No new customers yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                          <tr className="text-gray-600 text-sm">
                            <th className="px-4 pb-2 pt-2 font-medium">Name</th>
                            <th className="px-2 pb-2 pt-2 font-medium">Primary Contact</th>
                            <th className="px-2 pb-2 pt-2 font-medium">Status</th>
                            <th className="px-2 pb-2 pt-2 font-medium">Start Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newCustomers.map((c, i) => (
                            <tr key={i} className="border-t border-gray-200 last:border-b-0">
                              <td className="px-4 py-3">{c.name}</td>
                              <td className="px-2 py-3">{c.primaryContact || c.phone}</td>
                              <td className="px-2 py-3">{c.status}</td>
                              <td className="px-2 py-3">{c.startDate || c.joinDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column */}
              <div className="w-96 space-y-6">
                {/* Upcoming EMI's */}
                <div className="bg-white rounded-lg p-5">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl">Upcoming EMI's</h2>
                    <Link to="/emi" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                      See More <ChevronRight size={16} />
                    </Link>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Here's a list of upcoming EMI's</p>
                  {upcomingEmiDetails.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No upcoming EMI's yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {upcomingEmiDetails.map((emi, i) => (
                        <li key={i} className="py-2 flex justify-between items-center">
                          <span className="font-medium">{emi.name}</span>
                          <span className="text-sm text-gray-600">Due: {emi.due_date}</span>
                          <span className="text-sm text-purple-700 font-semibold">₹{emi.amount}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* EMI's Due */}
                <div className="bg-white rounded-lg p-5">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl">EMI's Due</h2>
                    <Link to="/emi" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                      See More <ChevronRight size={16} />
                    </Link>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Here's a list of EMI's due</p>
                  {emisDueDetails.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No EMI's due yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {emisDueDetails.map((emi, i) => (
                        <li key={i} className="py-2 flex justify-between items-center">
                          <span className="font-medium">{emi.name}</span>
                          <span className="text-sm text-gray-600">Due: {emi.due_date}</span>
                          <span className="text-sm text-red-700 font-semibold">₹{emi.amount}</span>
                          <span className="text-xs text-red-500 ml-2">Fine: ₹{emi.fine}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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

const StatCard = ({ icon, iconBg, cardBg, title, value, description }) => {
  return (
    <div className={`${cardBg} rounded-2xl px-6 py-4 flex flex-col w-full`}>
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
