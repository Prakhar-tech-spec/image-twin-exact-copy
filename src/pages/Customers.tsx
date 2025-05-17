import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Smile,
  Frown,
  Clock,
  TrendingUp,
  Bell,
  Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import PenSVG from '../assets/pen-svgrepo-com.svg';
import IconSVG from '../assets/icon.svg';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getEmis, addEmi, updateEmi, deleteEmi } from "@/lib/db";
import { AnimatePresence, motion } from 'framer-motion';

const statusColors = {
  Active: "bg-[#ecfdf5] text-[#009a66]",
  Inactive: "bg-[#fffaea] text-[#e07000]",
  "New": "bg-[#eff6fe] text-[#135dfc]"
};

const statusOptions = ["Active", "Inactive", "Completed", "Overdue"];

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
      <div className="text-xs text-black/40 leading-tight font-normal mt-1">{description}</div>
    </div>
  );
};

const Customers = () => {
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [emiHistory, setEmiHistory] = useState([]);
  const [fineModal, setFineModal] = useState({ open: false, emiId: null });
  const [fineAmount, setFineAmount] = useState("");
  const [finePercent, setFinePercent] = useState("");
  const [form, setForm] = useState({
    name: "",
    primaryContact: "",
    alternateContact: "",
    idDocs: [],
    primaryMobileModel: "",
    primaryMobileIMEI: "",
    secondaryMobileModel: "",
    secondaryMobileIMEI: "",
    originalDevicePrice: "",
    downpayment: "",
    loanAmount: "",
    emiTenure: "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "Active",
    accountNumber: "",
    ifscCode: "",
    customerPhoto: null
  });
  const [warning, setWarning] = useState("");
  const [emiPaid, setEmiPaid] = useState(null);
  const [emiDate, setEmiDate] = useState(new Date().toISOString().slice(0, 10));
  const [allEmis, setAllEmis] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchAllEmis();
  }, []);

  // Auto-select customer if customerId is present in query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerId = params.get('customerId');
    if (customerId && customerList.length > 0) {
      const found = customerList.find(c => String(c.id) === String(customerId));
      if (found) setSelected(found);
    }
  }, [location.search, customerList]);

  async function fetchCustomers() {
    const data = await getCustomers();
    setCustomerList(data);
    localStorage.setItem('customers', JSON.stringify(data));
    return data;
  }

  async function fetchAllEmis() {
    const emis = await getEmis();
    setAllEmis(emis);
  }

  useEffect(() => {
    if (selected && selected.id) {
      fetchEmiHistory(selected.id);
    } else {
      setEmiHistory([]);
    }
  }, [selected]);

  async function fetchEmiHistory(customerId) {
    const emis = await getEmis();
    const customer = customerList.find(c => c.id === customerId);
    if (!customer) {
      setEmiHistory([]);
      return;
    }
    const tenure = parseInt(customer.emiTenure || (customer as any).emiTenure || 0);
    const startDate = new Date((customer.startDate || customer.joinDate));
    let updated = false;

    // Generate all expected due dates
    for (let i = 0; i < tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i + 1); // Start from next month
      const dueDateStr = dueDate.toISOString().slice(0, 10);
      const exists = emis.some(e => e.customer_id === customerId && e.due_date === dueDateStr);
      if (!exists) {
        // Create missing EMI
        const emiAmount = customer.loanAmount && customer.emiTenure ? parseFloat(customer.loanAmount)/parseInt(customer.emiTenure) : 0;
        await addEmi({
          customer_id: customerId,
          due_date: dueDateStr,
          amount: emiAmount,
          paid: 0,
          fine: 0
        });
        updated = true;
      }
    }

    // Refetch if any were added
    const finalEmis = updated ? await getEmis() : emis;
    setEmiHistory(finalEmis.filter(e => e.customer_id === customerId));
  }

  async function markAsPaid(emiId) {
    const emi = emiHistory.find(e => e.id === emiId);
    if (emi) {
      await updateEmi({ ...emi, paid: 1 });
      if (selected && selected.id) fetchEmiHistory(selected.id);
      fetchAllEmis();
    }
  }

  function markAsUnpaid(emiId) {
    setFineModal({ open: true, emiId });
    setFineAmount("");
    setFinePercent("");
  }

  async function handleEmiPaid(isPaid) {
    setShowEmiModal(false);
    if (isPaid) {
      // Find any EMI for this customer and date
      const emisForCustomer = await getEmis();
      const emisForDate = emisForCustomer.filter(e => e.customer_id === selected.id && e.due_date === emiDate);
      const unpaidEmi = emisForDate.find(e => !e.paid);
      let emiAmount = selected.loanAmount && selected.emiTenure ? parseFloat(selected.loanAmount)/parseInt(selected.emiTenure) : 0;
      if (unpaidEmi) {
        await updateEmi({ ...unpaidEmi, paid: 1 });
      } else if (emisForDate.length === 0) {
        // No EMI exists for this date, create a new paid EMI
        await addEmi({
          customer_id: selected.id,
          due_date: emiDate,
          amount: emiAmount,
          paid: 1,
          fine: 0
        });
      }
      // If already paid, do nothing

      // 3. Calculate next month's due date
      const currentDate = new Date(emiDate);
      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(currentDate.getMonth() + 1);
      const nextDueDate = nextMonthDate.toISOString().slice(0, 10);

      // 4. Check if next unpaid EMI already exists
      const nextEmiExists = emisForCustomer.some(e => e.customer_id === selected.id && e.due_date === nextDueDate && !e.paid);
      // 5. Count paid EMIs for tenure check
      const paidEmisCount = emisForCustomer.filter(e => e.customer_id === selected.id && e.paid).length + 1; // +1 for this payment
      if (!nextEmiExists && paidEmisCount < parseInt(selected.emiTenure)) {
        await addEmi({
          customer_id: selected.id,
          due_date: nextDueDate,
          amount: emiAmount,
          paid: 0,
          fine: 0
        });
      }

      fetchEmiHistory(selected.id);
      fetchAllEmis();
    } else {
      // Show fine modal
      setFineAmount("");
      setFinePercent("");
      setFineModal({ open: true, emiId: null });
    }
  }

  async function handleFineSubmit() {
    // At least one field required
    if (!fineAmount && !finePercent) return;
    const emiAmount = selected.loanAmount && selected.emiTenure ? parseFloat(selected.loanAmount)/parseInt(selected.emiTenure) : 0;
    let fine = 0;
    if (fineAmount) fine = parseFloat(fineAmount);
    else if (finePercent) fine = (parseFloat(finePercent)/100) * emiAmount;

    // Find the correct EMI by id if available, else by date
    const emisForCustomer = await getEmis();
    let currentEmi = null;
    if (fineModal.emiId) {
      currentEmi = emisForCustomer.find(e => e.id === fineModal.emiId);
    } else {
      currentEmi = emisForCustomer.find(e => e.customer_id === selected.id && e.due_date === emiDate && !e.paid);
    }
    if (currentEmi) {
      await updateEmi({ ...currentEmi, fine: (currentEmi.fine || 0) + fine });
    } else {
      // If not found, create a new one (fallback)
      await addEmi({
        customer_id: selected.id,
        due_date: emiDate,
        amount: emiAmount,
        paid: 0,
        fine: fine
      });
    }
    setFineModal({ open: false, emiId: null });
    setFineAmount("");
    setFinePercent("");
    fetchEmiHistory(selected.id);
    fetchAllEmis();
  }

  const filteredCustomers = customerList.filter(c => {
    const searchVal = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(searchVal)) ||
      (c.primaryMobileIMEI && c.primaryMobileIMEI.toLowerCase().includes(searchVal)) ||
      (c.secondaryMobileIMEI && c.secondaryMobileIMEI.toLowerCase().includes(searchVal)) ||
      (c.primaryContact && c.primaryContact.toLowerCase().includes(searchVal)) ||
      (c.phone && c.phone.toLowerCase().includes(searchVal)) ||
      (c.email && c.email.toLowerCase().includes(searchVal))
  );
  });

  async function handleAddCustomer(e) {
    e.preventDefault();
    if (isEditMode) {
      // Save previous values for comparison
      const prevTenure = selected.emiTenure;
      const prevLoanAmount = selected.loanAmount;
      const prevStartDate = selected.startDate || selected.joinDate;
      await updateCustomer({ ...selected, ...form });
      setShowAddModal(false);
      setIsEditMode(false);
      const updatedList = await fetchCustomers();
      // Refresh selected with latest data from updatedList
      const updated = updatedList.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
      // If tenure, loan amount, or start date changed, update EMI history
      if (
        prevTenure !== form.emiTenure ||
        prevLoanAmount !== form.loanAmount ||
        prevStartDate !== form.startDate
      ) {
        // Delete all EMIs for this customer
        const emis = await getEmis();
        const customerEmis = emis.filter(e => e.customer_id === selected.id);
        for (const emi of customerEmis) {
          await deleteEmi(emi.id);
        }
        // Regenerate EMI schedule
        const tenure = parseInt(form.emiTenure);
        const loanAmount = parseFloat(form.loanAmount);
        const startDate = new Date(form.startDate);
        for (let i = 0; i < tenure; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i + 1); // Start from next month
          const dueDateStr = dueDate.toISOString().slice(0, 10);
          const emiAmount = loanAmount / tenure;
          await addEmi({
            customer_id: selected.id,
            due_date: dueDateStr,
            amount: emiAmount,
            paid: 0,
            fine: 0
          });
        }
        fetchEmiHistory(selected.id);
        fetchAllEmis();
      }
    } else {
      await addCustomer(form);
      setShowAddModal(false);
      setIsEditMode(false);
      fetchCustomers();
    }
  }

  function handleEditCustomer() {
    // Pre-fill form with selected customer data
    setForm({
      name: selected.name || '',
      primaryContact: (selected as any).primaryContact || selected.phone || '',
      alternateContact: (selected as any).alternateContact || '',
      idDocs: (selected as any).idDocs || [],
      primaryMobileModel: (selected as any).primaryMobileModel || '',
      primaryMobileIMEI: (selected as any).primaryMobileIMEI || '',
      secondaryMobileModel: (selected as any).secondaryMobileModel || '',
      secondaryMobileIMEI: (selected as any).secondaryMobileIMEI || '',
      originalDevicePrice: (selected as any).originalDevicePrice || '',
      downpayment: (selected as any).downpayment || '',
      loanAmount: (selected as any).loanAmount || '',
      emiTenure: (selected as any).emiTenure || '',
      startDate: (selected as any).startDate || selected.joinDate || new Date().toISOString().slice(0, 10),
      status: selected.status || 'Active',
      accountNumber: (selected as any).accountNumber || '',
      ifscCode: (selected as any).ifscCode || '',
      customerPhoto: (selected as any).customerPhoto || null
    });
    setIsEditMode(true);
    setShowAddModal(true);
  }

  function handleEmiAction() {
    setEmiPaid(null);
    setEmiDate(new Date().toISOString().slice(0, 10));
    setShowEmiModal(true);
  }

  async function handleDeleteCustomer() {
      await deleteCustomer(selected.id);
      // Also delete all EMIs for this customer
      const emis = await getEmis();
      const customerEmis = emis.filter(e => e.customer_id === selected.id);
      for (const emi of customerEmis) {
        await deleteEmi(emi.id);
      }
      fetchCustomers();
      setSelected(null);
    fetchAllEmis();
  }

  async function markEmiAsUnpaid(emiId) {
    const emi = emiHistory.find(e => e.id === emiId);
    if (emi) {
      await updateEmi({ ...emi, paid: 0 });
      if (selected && selected.id) fetchEmiHistory(selected.id);
      fetchAllEmis();
    }
  }

  return (
    <>
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
                <div className="flex-1 px-3 pb-32">
                  <div className="mt-8">
                    <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === "/"} />
                    <NavItem icon={<Users size={20} />} text="Customers" active={location.pathname === "/customers"} />
                    <NavItem icon={<CreditCard size={20} />} text="EMI" active={location.pathname === "/emi"} />
                  </div>
                </div>
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
              <h1 className="text-3xl">Customers</h1>
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
          <div className="flex-1 overflow-auto p-6 px-4 md:px-8">
            {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 w-full">
              <StatCard 
                icon={<Users size={24} />} 
                iconBg="bg-[#43936C]" 
                cardBg="bg-[#EAF7F0]" 
                title="Total Customers" 
                value={customerList.length} 
                description="90% of customers are regular clients." 
              />
              <StatCard 
                icon={<Smile size={24} />} 
                iconBg="bg-[#8F5FE8]" 
                cardBg="bg-[#F5F0FA]" 
                title="Active Customers" 
                value={customerList.filter(c => c.status === 'Active').length} 
                description="Most customers are active and present." 
              />
              <StatCard 
                icon={<Frown size={24} />} 
                iconBg="bg-[#D97C29]" 
                cardBg="bg-[#FFF6E9]" 
                title="Inactive Customers" 
                value={customerList.filter(c => c.status === 'Inactive').length} 
                description="Some customers are currently inactive." 
              />
              <StatCard 
                icon={<TrendingUp size={24} />} 
                iconBg="bg-[#2563EB]" 
                cardBg="bg-[#EDF4FF]" 
                title="New Customers" 
                value={customerList.filter(c => c.loyalty === 'New').length} 
                description="Recently joined customers." 
              />
            </div>
            {/* Table and Profile Side by Side */}
            <div className="flex gap-6">
              {/* Customer Table */}
              <div className="flex-1">
                <div className="bg-white rounded-3xl p-0 shadow border border-gray-200">
                  <div className="flex flex-col gap-4 px-6 pt-6 pb-4">
                    <div className="flex items-center gap-2 w-full">
                      <h2 className="text-xl mr-4">Customers</h2>
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                      />
                      <input type="date" className="border rounded-full px-3 py-1 text-sm ml-2" />
                      <button
                        className="ml-auto bg-primary text-white rounded-full px-8 py-2 text-sm font-medium hover:bg-purple-700 transition flex items-center justify-center whitespace-nowrap"
                        onClick={() => {
                          setForm({
                            name: "",
                            primaryContact: "",
                            alternateContact: "",
                            idDocs: [],
                            primaryMobileModel: "",
                            primaryMobileIMEI: "",
                            secondaryMobileModel: "",
                            secondaryMobileIMEI: "",
                              originalDevicePrice: "",
                              downpayment: "",
                              loanAmount: "",
                            emiTenure: "",
                            startDate: new Date().toISOString().slice(0, 10),
                              status: "Active",
                              accountNumber: "",
                              ifscCode: "",
                              customerPhoto: null
                          });
                          setIsEditMode(false);
                          setShowAddModal(true);
                        }}
                      >
                        Add Customer
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                      <tr className="text-gray-600 text-sm">
                        <th className="px-6 pb-2 pt-2 font-medium">Customer</th>
                        <th className="px-2 pb-2 pt-2 font-medium">Primary Number</th>
                        <th className="px-2 pb-2 pt-2 font-medium">Next EMI Date</th>
                        <th className="px-2 pb-2 pt-2 font-medium">Fine</th>
                        <th className="px-2 pb-2 pt-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c, i) => {
                        // Find next unpaid EMI for this customer from allEmis
                        const emis = allEmis.filter(e => e.customer_id === c.id && !e.paid);
                        const nextEmi = emis.length > 0 ? emis.reduce((a, b) => new Date(a.due_date) < new Date(b.due_date) ? a : b) : null;
                        return (
                          <tr
                            key={i}
                            className={`cursor-pointer transition-colors ${selected?.name === c.name ? "bg-[#faf4fe]" : "hover:bg-gray-50"} border-t border-gray-200 last:border-b-0`}
                            onClick={() => setSelected(c)}
                            style={{ borderTop: i === 0 ? 'none' : undefined }}
                          >
                            <td className="px-6 py-3 flex items-center font-medium">
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                              </div>
                              <span>{c.name}</span>
                            </td>
                            <td className="px-2 py-3 text-sm">{c.primaryContact || c.phone}</td>
                            <td className="px-2 py-3 text-sm">
                              {(() => {
                                const emis = allEmis.filter(e => e.customer_id === c.id);
                                if (emis.length === 0) return '-';
                                const unpaidEmis = emis.filter(e => !e.paid);
                                if (unpaidEmis.length === 0 && emis.length >= (parseInt(c.emiTenure) || 0)) return 'All Paid';
                                const nextEmi = unpaidEmis.length > 0 ? unpaidEmis.reduce((a, b) => new Date(a.due_date) < new Date(b.due_date) ? a : b) : null;
                                return nextEmi ? (
                                  <span className={new Date(nextEmi.due_date) < new Date() ? "text-red-500 font-semibold" : ""}>
                                    {nextEmi.due_date}
                                  </span>
                                ) : '-';
                              })()}
                            </td>
                            <td className="px-2 py-3 text-sm">{nextEmi ? `₹${nextEmi.fine || 0}` : '-'}</td>
                            <td className="px-2 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Customer Profile Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 60 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              style={{ willChange: 'transform, opacity' }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative w-full max-w-lg md:max-w-3xl mx-auto p-0 flex flex-col md:flex-row gap-y-0 md:gap-x-0 min-h-[60vh] max-h-[90vh]"
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-700 text-3xl bg-white bg-opacity-80 rounded-full p-1 transition"
                onClick={() => setSelected(null)}
                aria-label="Close profile"
              >
                &times;
              </button>
              {/* Left: Customer Details */}
              <div className="w-full md:w-1/2 flex flex-col">
                {/* Gradient Header */}
                <div className="bg-gradient-to-tr from-purple-100 to-blue-50 px-6 pt-8 pb-4 flex flex-col items-center relative">
                  {/* Status badge */}
                  <span className="absolute top-4 right-4 md:right-8 bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200">{selected?.status}</span>
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-white shadow -mb-12 overflow-hidden border-4 border-white flex items-center justify-center">
                    {selected && selected.customerPhoto ? (
                      <img src={typeof selected.customerPhoto === 'string' ? selected.customerPhoto : URL.createObjectURL(selected.customerPhoto)} alt={selected?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-300">👤</span>
                    )}
                  </div>
                </div>
                <div className="pt-16 pb-6 px-4 sm:px-6 md:px-8 flex-1 flex flex-col items-center md:items-start overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-1 text-center md:text-left">{selected?.name}</h3>
                  <div className="text-gray-500 mb-4 text-center md:text-left">Customer</div>
                  <h4 className="text-lg font-semibold mb-2 mt-2 md:mt-0">Customer Details</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-gray-700 text-sm items-center w-full">
                    <div><span className="font-medium text-gray-800">Primary Contact Number:</span> <span className="ml-1">{selected && ('primaryContact' in selected) ? (selected as any).primaryContact || selected.phone || '-' : selected?.phone || '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Alternate Contact Number:</span> <span className="ml-1">{selected && ('alternateContact' in selected) ? (selected as any).alternateContact || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Primary Mobile Model:</span> <span className="ml-1">{selected && ('primaryMobileModel' in selected) ? (selected as any).primaryMobileModel || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Primary Mobile IMEI Number:</span> <span className="ml-1">{selected && ('primaryMobileIMEI' in selected) ? (selected as any).primaryMobileIMEI || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Secondary Mobile Model:</span> <span className="ml-1">{selected && ('secondaryMobileModel' in selected) ? (selected as any).secondaryMobileModel || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Secondary Mobile IMEI Number:</span> <span className="ml-1">{selected && ('secondaryMobileIMEI' in selected) ? (selected as any).secondaryMobileIMEI || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Original Device Price:</span> <span className="ml-1">{selected && ('originalDevicePrice' in selected) ? ((selected as any).originalDevicePrice ? `₹${(selected as any).originalDevicePrice}` : '-') : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Downpayment:</span> <span className="ml-1">{selected && ('downpayment' in selected) ? ((selected as any).downpayment ? `₹${(selected as any).downpayment}` : '-') : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Loan Amount:</span> <span className="ml-1">{selected && ('loanAmount' in selected) ? ((selected as any).loanAmount ? `₹${(selected as any).loanAmount}` : '-') : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">EMI Tenure:</span> <span className="ml-1">{selected && ('emiTenure' in selected) ? ((selected as any).emiTenure ? `${(selected as any).emiTenure} months` : '-') : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Start Date:</span> <span className="ml-1">{selected && ('startDate' in selected) ? (selected as any).startDate || selected.joinDate || '-' : selected?.joinDate || '-'}</span></div>
                    <div><span className="font-medium text-gray-800">Account Number:</span> <span className="ml-1">{selected && ('accountNumber' in selected) ? (selected as any).accountNumber || '-' : '-'}</span></div>
                    <div><span className="font-medium text-gray-800">IFSC Code:</span> <span className="ml-1">{selected && ('ifscCode' in selected) ? (selected as any).ifscCode || '-' : '-'}</span></div>
                  </div>
                  <button className="w-full py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium mb-4 hover:from-purple-700 hover:to-pink-600 transition" onClick={() => setShowDocsModal(true)}>
                    View Documents
                  </button>
                  <div className="flex gap-3 mb-4 w-full">
                    <button className="flex-1 flex items-center justify-center bg-white border border-black rounded-full h-12 font-medium text-gray-700 hover:bg-gray-50 transition" title="Edit" onClick={handleEditCustomer}>
                      <img src={IconSVG} alt="Edit" className="h-5 w-5" />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-black rounded-full h-12 font-medium hover:bg-gray-50 transition" title="Delete" onClick={() => setShowDeleteModal(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2h6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* Right: EMI History & Due EMI */}
              <div className="w-full md:w-1/2 flex flex-col gap-y-6 bg-gray-50 md:pl-8 md:border-l md:border-gray-200 overflow-y-auto max-h-[90vh] p-4 md:p-8">
                <h4 className="text-lg font-semibold mb-2">EMI History</h4>
                <details className="rounded-xl border px-4 py-2 cursor-pointer bg-white">
                  <summary className="font-medium text-gray-700 flex items-center justify-between cursor-pointer select-none">
                    View EMI History <span className="ml-2">▼</span>
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {(() => {
                      const tenure = parseInt(selected?.emiTenure || (selected as any)?.emiTenure || 0);
                      const startDate = new Date((selected?.startDate || selected?.joinDate));
                      const emiRows = [];
                      for (let i = 0; i < tenure; i++) {
                        const dueDate = new Date(startDate);
                        dueDate.setMonth(startDate.getMonth() + i + 1); // Start from next month
                        const dueDateStr = dueDate.toISOString().slice(0, 10);
                        const emi = emiHistory.find(e => e.due_date === dueDateStr);
                        emiRows.push(
                          emi ? (
                            <li key={emi.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm py-1 border-b last:border-b-0 gap-y-1">
                              <span>{emi.due_date} - ₹{emi.amount} {emi.fine ? `(+₹${emi.fine} fine)` : ''}</span>
                              <span className={`px-2 rounded-full font-medium ${emi.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{emi.paid ? 'Paid' : 'Unpaid'}</span>
                              <span className="flex gap-1">
                                {!emi.paid && (
                                  <>
                                    <button className="bg-green-100 text-green-700 p-1 rounded-full text-xs flex items-center justify-center" title="Mark as Paid" onClick={() => markAsPaid(emi.id)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <button className="bg-red-100 text-red-700 p-1 rounded-full text-xs flex items-center justify-center" title="Mark as Unpaid / Add Fine" onClick={() => markAsUnpaid(emi.id)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {emi.paid && (
                                  <button className="bg-yellow-100 text-yellow-700 p-1 rounded-full text-xs flex items-center justify-center" title="Mark as Unpaid" onClick={() => markEmiAsUnpaid(emi.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </span>
                            </li>
                          ) : (
                            <li key={dueDateStr} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm py-1 border-b last:border-b-0 text-gray-400 gap-y-1">
                              <span>{dueDateStr} - ₹-</span>
                              <span className="px-2 rounded-full font-medium bg-gray-100 text-gray-400">-</span>
                            </li>
                          )
                        );
                      }
                      return emiRows;
                    })()}
                  </ul>
                </details>
                {selected && emiHistory.length > 0 && (
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 flex flex-col items-center shadow-sm">
                    <div className="text-lg font-semibold text-yellow-800 mb-1">Due EMI</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {(() => {
                        // Count paid EMIs
                        const paidCount = emiHistory.filter(e => e.paid).length;
                        const unpaidEmis = emiHistory.filter(e => !e.paid);
                        // If no EMI is paid, show the full loan amount (or original device price - downpayment if you want)
                        if (paidCount === 0) {
                          // Use loanAmount (already device price - downpayment)
                          let due = 0;
                          if (selected && 'loanAmount' in selected && selected.loanAmount) {
                            due = parseFloat(selected.loanAmount) || 0;
                          }
                          // Add all fines from unpaid EMIs
                          const totalFine = unpaidEmis.reduce((sum, e) => sum + (parseFloat(e.fine) || 0), 0);
                          return `₹${(due + totalFine).toFixed(2)}`;
                        } else {
                          // Otherwise, sum all unpaid EMIs (amount + fine)
                          const totalDue = unpaidEmis.reduce((sum, e) => sum + (parseFloat(e.amount) || 0) + (parseFloat(e.fine) || 0), 0);
                          return `₹${totalDue.toFixed(2)}`;
                        }
                      })()}
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">Total unpaid EMI amount (including fines)</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-2"
          >
            <div className="bg-white rounded-xl p-4 sm:p-8 md:p-10 shadow-xl w-full max-w-lg md:max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button type="button" className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-3xl focus:outline-none" onClick={() => setShowAddModal(false)} aria-label="Close">
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-2 col-span-2">Add New Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input required className="border rounded px-3 py-2" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="Primary Contact Number" value={form.primaryContact} onChange={e => setForm(f => ({ ...f, primaryContact: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="Alternate Contact Number" value={form.alternateContact} onChange={e => setForm(f => ({ ...f, alternateContact: e.target.value }))} />
                <div className="relative">
                  <input
                    required
                    type="file"
                    className="border rounded px-3 py-2 w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      if (files.length > 5) {
                        setForm(f => ({ ...f, idDocs: [] }));
                        setWarning("You can upload a maximum of 5 files.");
                        e.target.value = null;
                      } else {
                        setForm(f => ({ ...f, idDocs: files }));
                        setWarning("");
                      }
                    }}
                  />
                  <div className="border rounded px-3 py-2 w-full h-full flex items-center text-gray-400 bg-white pointer-events-none">
                    {form.idDocs && form.idDocs.length > 0
                      ? `${form.idDocs.length} file(s) selected`
                      : "Upload ID Documents (max 5 files)"}
                  </div>
                  {warning && <div className="text-red-500 text-sm font-medium absolute left-0 -bottom-5">{warning}</div>}
                </div>
                <input required className="border rounded px-3 py-2" placeholder="Primary Mobile Model" value={form.primaryMobileModel} onChange={e => setForm(f => ({ ...f, primaryMobileModel: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="Primary Mobile IMEI Number" value={form.primaryMobileIMEI} onChange={e => setForm(f => ({ ...f, primaryMobileIMEI: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="Secondary Mobile Model" value={form.secondaryMobileModel} onChange={e => setForm(f => ({ ...f, secondaryMobileModel: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="Secondary Mobile IMEI Number" value={form.secondaryMobileIMEI} onChange={e => setForm(f => ({ ...f, secondaryMobileIMEI: e.target.value }))} />
                <input required type="number" min="1" className="border rounded px-3 py-2" placeholder="Original Device Price (₹)" value={form.originalDevicePrice} onChange={e => setForm(f => ({ ...f, originalDevicePrice: e.target.value }))} />
                <input required type="number" min="0" className="border rounded px-3 py-2" placeholder="Downpayment (₹)" value={form.downpayment} onChange={e => setForm(f => ({ ...f, downpayment: e.target.value }))} />
                <input required type="number" min="1" className="border rounded px-3 py-2" placeholder="Loan Amount (₹)" value={form.loanAmount} onChange={e => setForm(f => ({ ...f, loanAmount: e.target.value }))} />
                <input required type="number" min="1" className="border rounded px-3 py-2" placeholder="EMI Tenure (Months)" value={form.emiTenure} onChange={e => setForm(f => ({ ...f, emiTenure: e.target.value }))} />
                <input readOnly className="border rounded px-3 py-2 bg-gray-100" placeholder="Monthly EMI Amount (₹)" value={form.loanAmount && form.emiTenure ? (parseFloat(form.loanAmount)/parseInt(form.emiTenure)).toFixed(2) : ''} />
                <input required type="date" className="border rounded px-3 py-2" placeholder="Start Date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                <select required className="border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="">Select EMI Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <input required className="border rounded px-3 py-2" placeholder="Account Number" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
                <input required className="border rounded px-3 py-2" placeholder="IFSC Code" value={form.ifscCode} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} />
                <div className="relative">
                  {/* Hidden file inputs for camera and album */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    id="customer-photo-camera"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setForm(f => ({ ...f, customerPhoto: file }));
                      }
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="customer-photo-album"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setForm(f => ({ ...f, customerPhoto: file }));
                      }
                    }}
                  />
                  {/* Button to trigger menu */}
                  <button
                    type="button"
                    className="border rounded px-3 py-2 w-full h-full flex items-center text-gray-400 bg-white"
                    onClick={e => setShowPhotoMenu(true)}
                  >
                    {form.customerPhoto ? (typeof form.customerPhoto === 'string' ? 'Photo selected' : form.customerPhoto.name) : 'Upload Customer Photo'}
                  </button>
                  {/* Menu for photo options */}
                  {showPhotoMenu && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border rounded shadow z-50 flex flex-col">
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setShowPhotoMenu(false);
                          document.getElementById('customer-photo-camera').click();
                        }}
                      >
                        Take Photo
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setShowPhotoMenu(false);
                          document.getElementById('customer-photo-album').click();
                        }}
                      >
                        Choose from Album
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                        onClick={() => setShowPhotoMenu(false)}
                      >
                        Cancel
                      </button>
                </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-2 col-span-2 w-full">
                <button type="submit" className="w-full md:flex-1 py-2 rounded bg-primary text-white hover:bg-purple-700" onClick={handleAddCustomer}>Add Customer</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* View Documents Modal */}
      {showDocsModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] p-6 relative flex flex-col">
            <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowDocsModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
              {('idDocs' in selected) && (selected as any).idDocs && (selected as any).idDocs.length > 0 ? (
                ((selected as any).idDocs as (File[] | string[])).map((doc: any, idx: number) => {
                  let url = '';
                  let filename = '';
                  let isImage = false;
                  if (typeof doc === 'string') {
                    url = doc;
                    filename = doc.split('/').pop() || doc;
                    isImage = !!doc.match(/\.(jpg|jpeg|png)$/i);
                  } else if (doc instanceof File) {
                    url = URL.createObjectURL(doc);
                    filename = doc.name;
                    isImage = doc.type.startsWith('image/');
                  }
                  return (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-4 border rounded-xl p-4 bg-gray-50">
                      {isImage ? (
                        <img src={url} alt={filename} className="w-full max-w-xs max-h-72 object-contain rounded-xl border" />
                      ) : (
                        <div className="w-full max-w-xs h-48 flex items-center justify-center bg-gray-200 rounded-xl border text-4xl text-gray-500">PDF</div>
                      )}
                      <div className="flex-1 flex flex-col items-center md:items-start w-full">
                        <span className="font-medium text-base mb-2 text-center md:text-left break-all">{filename}</span>
                        <a href={url} download={filename} className="mt-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-purple-700 transition text-center md:text-left">Download</a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-center">No documents uploaded.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* EMI Modal */}
      {showEmiModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowEmiModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-lg font-semibold mb-4">EMI Payment</h3>
            <div className="mb-4 text-gray-700 text-base">Is the EMI paid for <span className="font-semibold">{selected?.name}</span>?</div>
            <div className="flex gap-4 mb-4">
              <button
                className={`flex-1 py-2 rounded-full border ${emiPaid === true ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300'} font-medium transition`}
                onClick={() => handleEmiPaid(true)}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 rounded-full border ${emiPaid === false ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300'} font-medium transition`}
                onClick={() => handleEmiPaid(false)}
              >
                No
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-medium">Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                value={emiDate}
                onChange={e => setEmiDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
        </motion.div>
      )}
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
              value={fineAmount}
              onChange={e => setFineAmount(e.target.value)}
            />
            <input
              type="number"
              className="border rounded w-full px-3 py-2 mb-4"
              placeholder="Enter fine percentage (%)"
              value={finePercent}
              onChange={e => setFinePercent(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-purple-600 text-white rounded px-4 py-2" onClick={handleFineSubmit} disabled={!fineAmount && !finePercent}>Submit</button>
              <button className="flex-1 bg-gray-200 rounded px-4 py-2" onClick={() => setFineModal({ open: false, emiId: null })}>Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative flex flex-col items-center">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-3xl mb-4 text-red-500">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-center">Delete Customer</h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete <span className="font-bold">{selected?.name}</span> and all their data? This action cannot be undone.
            </p>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
                onClick={async () => {
                  await handleDeleteCustomer();
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
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

export default Customers;