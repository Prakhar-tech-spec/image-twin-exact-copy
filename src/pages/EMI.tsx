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
  LayoutDashboard
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

// Stat cards config (static)
const emiStats = [
  {
    icon: <CreditCard size={24} />, iconBg: "bg-[#43936C]", cardBg: "bg-[#EAF7F0]",
    title: "Total EMI Filed", value: 0, description: "Successfully processed EMI filings."
  },
  {
    icon: <Clock size={24} />, iconBg: "bg-[#F7B731]", cardBg: "bg-[#FFF6E9]",
    title: "Pending EMI Filings", value: 0, description: "EMIs yet to be submitted."
  },
  {
    icon: <XCircle size={24} />, iconBg: "bg-[#E14D4D]", cardBg: "bg-[#FFF0F0]",
    title: "Overdue EMI Payment", value: 0, description: "Compliance risks due to overdue EMIs."
  },
  {
    icon: <TrendingUp size={24} />, iconBg: "bg-[#2563EB]", cardBg: "bg-[#EDF4FF]",
    title: "Total EMI Deductions", value: "$0", description: "Total EMI deducted from salaries."
  }
];

const statusColors = {
  "Filed": "bg-[#ecfdf5] text-[#009a66]",
  "Overdue": "bg-[#fff0f0] text-[#e14d4d]",
  "Pending": "bg-[#fffaea] text-[#e07000]"
};

const statusOptions = ["Paid", "Pending", "Unpaid", "Due", "Overdue"];

const EMI = () => {
  const location = useLocation();
  // Placeholder for local DB data
  const [emiList, setEmiList] = useState([]); // Replace with local DB fetch
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Example: Fetch from local DB (SQLite) on mount
  useEffect(() => {
    // TODO: Replace with actual SQLite/local DB fetch
    // setEmiList(await fetchEmiListFromLocalDB());
    setEmiList([]); // Start empty, or load from local DB
  }, []);

  // Filtering logic
  const filteredEmiList = emiList.filter(emi => {
    const matchesSearch =
      emi.name?.toLowerCase().includes(search.toLowerCase()) ||
      emi.type?.toLowerCase().includes(search.toLowerCase()) ||
      emi.status?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? emi.due === dateFilter : true;
    const matchesStatus = statusFilter ? emi.status === statusFilter : true;
    return matchesSearch && matchesDate && matchesStatus;
  });

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
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {emiStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
          {/* EMI Table - scrollable */}
          <div className="bg-white rounded-2xl p-6 flex flex-col shadow border border-gray-200" style={{height: '60vh'}}>
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
              <table className="min-w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="px-4 py-2 font-normal">Employee</th>
                    <th className="px-4 py-2 font-normal">Amount</th>
                    <th className="px-4 py-2 font-normal">Deduction</th>
                    <th className="px-4 py-2 font-normal">Type</th>
                    <th className="px-4 py-2 font-normal">Status</th>
                    <th className="px-4 py-2 font-normal">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmiList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">No EMI records found.</td>
                    </tr>
                  ) : (
                    filteredEmiList.map((emi, i) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-[#f6f0fa] rounded-xl" : ""}>
                        <td className="px-4 py-3 rounded-l-xl">{emi.name}</td>
                        <td className="px-4 py-3">{emi.amount}</td>
                        <td className="px-4 py-3">{emi.deduction}</td>
                        <td className="px-4 py-3">{emi.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-4 py-1 rounded-full text-xs font-medium ${statusColors[emi.status]}`}>{emi.status}</span>
                        </td>
                        <td className="px-4 py-3 rounded-r-xl">{emi.due}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <div className="text-base text-black/80 font-normal mb-0.5 whitespace-nowrap">{title}</div>
          <div className="text-2xl text-black font-normal mb-1">{value}</div>
        </div>
      </div>
      <div className="text-xs text-black/40 leading-tight font-normal mt-1">{description}</div>
    </div>
  );
};

export default EMI; 