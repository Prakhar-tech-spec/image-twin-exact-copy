import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Users,
  CreditCard,
  Calendar as CalendarIcon,
  TrendingUp,
  XCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { getEmis, addEmi, updateEmi, deleteEmi } from "@/lib/db";
import { getCustomers } from "@/lib/db";
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

const statusColors = {
  "Filed": "bg-[#ecfdf5] text-[#009a66]",
  "Overdue": "bg-[#fff0f0] text-[#e14d4d]",
  "Pending": "bg-[#fffaea] text-[#e07000]"
};

const statusOptions = ["Paid", "Pending", "Unpaid", "Due", "Overdue"];

const EMI = () => {
  const location = useLocation();
  const [emiList, setEmiList] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fineModal, setFineModal] = useState({ open: false, emiId: null });
  const [fineValue, setFineValue] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch EMI list from backend
  useEffect(() => {
    fetchEmiList();
    fetchCustomerList();
    const interval = setInterval(fetchEmiList, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchEmiList() {
    const data = await getEmis();
    setEmiList(data);
    localStorage.setItem('emis', JSON.stringify(data));
  }

  async function fetchCustomerList() {
    const data = await getCustomers();
    setCustomerList(data);
  }

  async function markAsPaid(emiId) {
    const emi = emiList.find(e => e.id === emiId);
    if (emi) {
      await updateEmi({ ...emi, paid: (parseFloat(emi.amount) || 0) + (parseFloat(emi.fine) || 0), fine: 0 });
      fetchEmiList();
    }
  }

  function markAsUnpaid(emiId) {
    setFineModal({ open: true, emiId });
    setFineValue("");
  }

  async function submitFine() {
    const emi = emiList.find(e => e.id === fineModal.emiId);
    if (emi) {
      await updateEmi({ ...emi, fine: (emi.fine || 0) + parseFloat(fineValue) });
      setFineModal({ open: false, emiId: null });
      setFineValue("");
      fetchEmiList();
    }
  }

  // Filtering logic
  const today = new Date().toISOString().slice(0, 10);
  const filteredEmiListWithFine = emiList.filter(emi => emi.fine > 0 && !emi.paid);
  const totalEmis = filteredEmiListWithFine.length;
  const pendingEmis = filteredEmiListWithFine.filter(e => !e.paid && e.due_date >= today).length;
  const overdueEmis = filteredEmiListWithFine.filter(e => !e.paid && e.due_date < today).length;
  const totalDeductions = filteredEmiListWithFine.filter(e => e.paid).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const filteredEmiList = emiList.filter(emi => {
    const matchesSearch = emi.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? emi.due_date === dateFilter : true;
    const isOverdue = !emi.paid && emi.due_date < today;
    const isUnpaid = !emi.paid;
    const matchesStatus = statusFilter ? (statusFilter === 'Overdue' ? isOverdue : emi.status === statusFilter) : true;
    return matchesSearch && matchesDate && (isUnpaid || isOverdue) && matchesStatus;
  });

  async function markFinePaid(emiId) {
    const emi = emiList.find(e => e.id === emiId);
    if (emi) {
      await updateEmi({ ...emi, paid: (parseFloat(emi.amount) || 0) + (parseFloat(emi.fine) || 0), fine: 0 });
      fetchEmiList();
    }
  }

  function markFineUnpaid(emiId) {
    setFineModal({ open: true, emiId });
    setFineValue("");
  }

  async function submitFineDouble() {
    const emi = emiList.find(e => e.id === fineModal.emiId);
    if (emi) {
      await updateEmi({ ...emi, fine: (emi.fine || 0) * 2 });
      setFineModal({ open: false, emiId: null });
      setFineValue("");
      fetchEmiList();
    }
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
              <h1 className="text-3xl">EMI</h1>
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
          {/* EMI content */}
          <div className="flex-1 overflow-auto p-6 px-4 md:px-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 w-full">
              <StatCard 
                icon={<CreditCard size={24} />} 
                iconBg="bg-[#43936C]" 
                cardBg="bg-[#EAF7F0]" 
                title="Total EMI Filed" 
                value={totalEmis} 
                description="Successfully processed EMI filings." 
              />
              <StatCard 
                icon={<Clock size={24} />} 
                iconBg="bg-[#8F5FE8]" 
                cardBg="bg-[#F5F0FA]" 
                title="Pending EMI Filings" 
                value={pendingEmis} 
                description="EMIs yet to be submitted." 
              />
              <StatCard 
                icon={<XCircle size={24} />} 
                iconBg="bg-[#D97C29]" 
                cardBg="bg-[#FFF6E9]" 
                title="Overdue EMI Payment" 
                value={overdueEmis} 
                description="Compliance risks due to overdue EMIs." 
              />
              <StatCard 
                icon={<TrendingUp size={24} />} 
                iconBg="bg-[#2563EB]" 
                cardBg="bg-[#EDF4FF]" 
                title="Total EMI Deductions" 
                value={`₹${totalDeductions.toFixed(2)}`} 
                description="Total EMI deducted from customers." 
              />
            </div>
            {/* EMI Table - scrollable */}
            <div className="bg-white rounded-2xl p-6 flex flex-col shadow border border-gray-200 overflow-x-auto" style={{height: '60vh'}}>
              <div className="flex justify-between items-center mb-1 flex-shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-xl whitespace-nowrap">EMI Compliance List</h2>
                  <p className="text-gray-500 text-sm mt-1 whitespace-nowrap">Here's EMI compliance list details</p>
                </div>
                <div className="flex items-center gap-2 w-full justify-end">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search EMI..."
                    className="border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 mr-2"
                    style={{maxWidth: '220px'}}
                  />
                  {/* Calendar popover */}
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className={`p-2 rounded-full border hover:bg-gray-50 ${dateFilter ? 'bg-purple-100 border-purple-400' : ''}`} title="Filter by Date">
                        <CalendarIcon size={20} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter ? new Date(dateFilter) : undefined}
                        onSelect={date => {
                          setDateFilter(date ? date.toISOString().slice(0, 10) : "");
                          setCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Status dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`p-2 rounded-full border hover:bg-gray-50 ${statusFilter ? 'bg-purple-100 border-purple-400' : ''}`} title="Filter by Status">
                        <CreditCard size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map(option => (
                        <DropdownMenuItem
                          key={option}
                          onSelect={() => setStatusFilter(option)}
                          className={statusFilter === option ? 'bg-purple-100 text-purple-700' : ''}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Reset Filters button */}
                  <button
                    className="ml-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                    onClick={() => {
                      setSearch("");
                      setDateFilter("");
                      setStatusFilter("");
                    }}
                    title="Reset Filters"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              <div className="overflow-auto mt-4 flex-1 scrollbar-none" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                <style>{`
                  .scrollbar-none::-webkit-scrollbar { display: none; }
                `}</style>
                <table className="w-full text-left border-separate border-spacing-0 mt-4">
                  <thead>
                    <tr className="text-gray-600 text-sm">
                      <th className="px-4 pb-2 pt-2 font-medium">Customer</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Due Date</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Amount</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Fine</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Status</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmiListWithFine.map((emi, i) => {
                      const customer = customerList.find(c => c.id === emi.customer_id);
                      return (
                        <tr key={emi.id} className="border-t border-gray-200 last:border-b-0">
                          <td className="px-4 py-3">{customer ? customer.name : '-'}</td>
                          <td className="px-2 py-3">{emi.due_date}</td>
                          <td className="px-2 py-3">₹{emi.amount}</td>
                          <td className="px-2 py-3">₹{emi.fine || 0}</td>
                          <td className="px-2 py-3">{emi.paid ? "Paid" : "Unpaid"}</td>
                          <td className="px-2 py-3 flex gap-2">
                            {!emi.paid && (
                              <>
                                <button className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs" onClick={() => markFinePaid(emi.id)}>Mark as Paid</button>
                                <button className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs" onClick={() => markFineUnpaid(emi.id)}>Mark as Unpaid</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Fine Modal */}
              {fineModal.open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                >
                  <div className="bg-white rounded-xl p-8 shadow-xl w-80">
                    <h2 className="text-lg font-semibold mb-4">Add Fine for Unpaid EMI</h2>
                    <input
                      type="number"
                      className="border rounded w-full px-3 py-2 mb-4"
                      placeholder="Enter fine amount (₹)"
                      value={fineValue}
                      onChange={e => setFineValue(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button className="flex-1 bg-purple-600 text-white rounded px-4 py-2" onClick={submitFineDouble} disabled={!fineValue}>Submit</button>
                      <button className="flex-1 bg-gray-200 rounded px-4 py-2" onClick={() => setFineModal({ open: false, emiId: null })}>Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

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
          <div className="text-base text-black/80 font-normal mb-0.5 whitespace-nowrap">{title}</div>
          <div className="text-2xl text-black font-normal mb-1">{value}</div>
        </div>
      </div>
      <div className="text-xs text-black/40 leading-tight font-normal mt-1">{description}</div>
    </div>
  );
};

export default EMI; 