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
  const [paymentAmount, setPaymentAmount] = useState("");
  const [emiDate, setEmiDate] = useState(new Date().toISOString().slice(0, 10));
  const [allEmis, setAllEmis] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isEmiUpdating, setIsEmiUpdating] = useState(false);

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
      // Assume marking as paid from the list means full payment for now
      const totalDue = (parseFloat(emi.amount) || 0) + (parseFloat(emi.fine) || 0);
      const remainingDue = totalDue - (parseFloat(emi.paid) || 0);
      const amountToPay = remainingDue > 0 ? remainingDue : 0; // Amount to pay to mark as fully paid

      const updatedPaymentHistory = [
        ...(emi.payment_history || []),
        {
          date: new Date().toISOString().slice(0, 10),
          amount: amountToPay, // Record the amount paid to clear the due
          fine_paid: parseFloat(emi.fine) || 0, // Record the fine paid as part of this full payment
          type: 'full_payment' // Add a type to identify full payments via this button
        }
      ];

      await updateEmi({
        ...emi,
        paid: totalDue, // Mark as fully paid
        fine: 0, // Reset fine to 0 as it's paid
        payment_history: updatedPaymentHistory
      });
      if (selected && selected.id) fetchEmiHistory(selected.id);
      fetchAllEmis();
    }
  }

  // Modal to add payment or fine
  function handleEmiAction(emiId) {
    setPaymentAmount("");
    setFineAmount("");
    setFinePercent("");
    setFineModal({ open: true, emiId: emiId }); // Reuse fine modal state for both
  }

  async function handleSubmitEmiAction() {
    const emi = emiHistory.find(e => e.id === fineModal.emiId);
    if (!emi) return;

    const payment = parseFloat(paymentAmount) || 0;
    const fineApplied = parseFloat(fineAmount) || 0;
    const finePercentApplied = parseFloat(finePercent) || 0;

    // Calculate total due amount including existing fine
    const totalDue = (parseFloat(emi.amount) || 0) + (parseFloat(emi.fine) || 0);
    const remainingDue = totalDue - (parseFloat(emi.paid) || 0);

    // Calculate new fine amount
    let calculatedFine = fineApplied;
    if (finePercentApplied > 0) {
      calculatedFine += remainingDue * (finePercentApplied / 100);
    }

    // Validate payment amount
    if (payment > remainingDue + calculatedFine) {
      alert("Payment amount cannot exceed total due amount including new fine");
      return;
    }

    const updatedEmi = {
      ...emi,
      paid: (parseFloat(emi.paid) || 0) + payment,
      fine: (parseFloat(emi.fine) || 0) + calculatedFine,
      last_payment_date: new Date().toISOString().slice(0, 10),
      payment_history: [
        ...(emi.payment_history || []),
        {
          date: new Date().toISOString().slice(0, 10),
          amount: payment,
          fine_paid: calculatedFine > 0 ? calculatedFine : 0
        }
      ]
    };

    await updateEmi(updatedEmi);

    // If payment was full or more than due, check if next EMI needs creation
    if (updatedEmi.paid >= totalDue + calculatedFine) {
      // Check if this is the last EMI based on tenure
      const tenure = parseInt(selected?.emiTenure || 0);
      const emisForCustomer = emiHistory.filter(e => e.customer_id === selected.id);
      const paidEmisCount = emisForCustomer.filter(e => (parseFloat(e.paid) || 0) >= (parseFloat(e.amount) || 0) + (parseFloat(e.fine) || 0)).length + (updatedEmi.paid >= totalDue + calculatedFine && (parseFloat(emi.paid) || 0) < totalDue ? 1 : 0);

      if (paidEmisCount < tenure) {
        // Find the latest due date among existing EMIs for this customer
        const latestDueDate = emisForCustomer.reduce((latest, current) => {
          return new Date(current.due_date) > new Date(latest.due_date) ? current : latest;
        }, emisForCustomer[0] || { due_date: selected?.startDate || new Date().toISOString().slice(0, 10) }).due_date;

        const lastEmiDate = new Date(latestDueDate);
        const nextMonthDate = new Date(lastEmiDate);
        nextMonthDate.setMonth(lastEmiDate.getMonth() + 1);
        const nextDueDateStr = nextMonthDate.toISOString().slice(0, 10);

        // Check if an EMI already exists for this next due date
        const nextEmiExists = emisForCustomer.some(e => e.due_date === nextDueDateStr);

        if (!nextEmiExists) {
          const emiAmount = selected.loanAmount && selected.emiTenure ? parseFloat(selected.loanAmount) / parseInt(selected.emiTenure) : 0;
          await addEmi({
            customer_id: selected.id,
            due_date: nextDueDateStr,
            amount: emiAmount,
            paid: 0,
            fine: 0,
            payment_history: []
          });
        }
      }
    }

    setFineModal({ open: false, emiId: null });
    setPaymentAmount("");
    setFineAmount("");
    setFinePercent("");
    fetchEmiHistory(selected.id);
    fetchAllEmis();
  }

  async function undoPaidEmi(emiId) {
    const emi = emiHistory.find(e => e.id === emiId);
    if (!emi) return;

    // Retain payment history but reset paid and fine amounts
    // Remove the last payment history entry if it was a 'full_payment'
    const updatedPaymentHistory = [...(emi.payment_history || [])];
    if (updatedPaymentHistory.length > 0) {
      const lastPayment = updatedPaymentHistory[updatedPaymentHistory.length - 1];
      if (lastPayment.type === 'full_payment') {
        updatedPaymentHistory.pop(); // Remove the last entry if it's a full_payment type
      }
    }

    const updatedEmi = {
      ...emi,
      paid: 0, // Reset paid amount
      fine: 0, // Reset fine amount
      payment_history: updatedPaymentHistory // Use the potentially modified history
    };

    await updateEmi(updatedEmi);

    // Refresh EMI history and all emis state
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
      const prevTenure = Number(selected.emiTenure);
      const prevLoanAmount = Number(selected.loanAmount);
      const prevStartDate = String(selected.startDate || selected.joinDate);
      await updateCustomer({ ...selected, ...form });
      setShowAddModal(false);
      setIsEditMode(false);
      const updatedList = await fetchCustomers();
      // Refresh selected with latest data from updatedList
      const updated = updatedList.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
      // If tenure, loan amount, or start date changed, update EMI history
      if (
        prevTenure !== Number(form.emiTenure) ||
        prevLoanAmount !== Number(form.loanAmount) ||
        prevStartDate !== String(form.startDate)
      ) {
        setIsEmiUpdating(true);
        // Delete all EMIs for this customer
        const emis = await getEmis();
        const customerEmis = emis.filter(e => e.customer_id === selected.id);
        for (const emi of customerEmis) {
          await deleteEmi(emi.id);
        }
        // Ensure all EMIs are deleted before proceeding
        let checkEmis = [];
        for (let tries = 0; tries < 10; tries++) {
          checkEmis = (await getEmis()).filter(e => e.customer_id === selected.id);
          if (checkEmis.length === 0) break;
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Regenerate EMI schedule using latest form values
        const tenure = Number(form.emiTenure);
        const loanAmount = Number(form.loanAmount);
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
        await fetchEmiHistory(selected.id);
        await fetchAllEmis();
        setIsEmiUpdating(false);
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
                        dueDate.setMonth(startDate.getMonth() + i + 1);
                        const dueDateStr = dueDate.toISOString().slice(0, 10);
                        const emi = emiHistory.find(e => e.due_date === dueDateStr);
                        emiRows.push(
                          emi ? (
                            <li key={emi.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm py-2 border-b last:border-b-0 gap-y-2">
                              <div className="flex flex-col">
                                <span className="font-medium">{emi.due_date}</span>
                                <span className="text-gray-600">Amount: ₹{emi.amount}</span>
                                {emi.fine > 0 && <span className="text-red-600">Fine: ₹{emi.fine}</span>}
                                {emi.payment_history && emi.payment_history.length > 0 && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    {emi.payment_history.map((payment, idx) => (
                                      <div key={idx} className="flex gap-2">
                                        <span>Paid: ₹{payment.amount}</span>
                                        {payment.fine_paid > 0 && <span>Fine: ₹{payment.fine_paid}</span>}
                                        <span>{payment.date}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 rounded-full font-medium ${emi.paid >= (parseFloat(emi.amount) + parseFloat(emi.fine)) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {emi.paid >= (parseFloat(emi.amount) + parseFloat(emi.fine)) ? 'Paid' : 'Unpaid'}
                                </span>
                                <div className="flex gap-1">
                                  {emi.paid < (parseFloat(emi.amount) + parseFloat(emi.fine)) && (
                                    <>
                                      <button className="bg-green-100 text-green-700 p-1 rounded-full text-xs flex items-center justify-center" title="Mark as Paid" onClick={() => markAsPaid(emi.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      <button className="bg-red-100 text-red-700 p-1 rounded-full text-xs flex items-center justify-center" title="Add Payment/Fine" onClick={() => handleEmiAction(emi.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                  {emi.paid >= (parseFloat(emi.amount) + parseFloat(emi.fine)) && (
                                    <div className="flex gap-1">
                                      {/* New button to undo paid status */}
                                      <button className="bg-red-100 text-red-700 p-1 rounded-full text-xs flex items-center justify-center" title="Undo Paid" onClick={() => undoPaidEmi(emi.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                      {/* Show Add Payment/Fine button only if not fully paid */}
                                      {emi.paid < (parseFloat(emi.amount) + parseFloat(emi.fine)) && (
                                        <button className="bg-yellow-100 text-yellow-700 p-1 rounded-full text-xs flex items-center justify-center" title="Add Payment/Fine" onClick={() => handleEmiAction(emi.id)}>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ) : (
                            <li key={dueDateStr} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm py-2 border-b last:border-b-0 text-gray-400">
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
                {selected && emiHistory.length > 0 && !isEmiUpdating && (
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 flex flex-col items-center shadow-sm">
                    <div className="text-lg font-semibold text-yellow-800 mb-1">Due EMI</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {(() => {
                        const loanAmount = parseFloat(selected?.loanAmount) || 0;
                        let totalPrincipalPaid = 0;
                        let totalFinesLeft = 0;
                        emiHistory.forEach(e => {
                          // Only principal payments reduce the loan amount
                          const emiPrincipal = parseFloat(e.amount) || 0;
                          const emiPaid = parseFloat(e.paid) || 0;
                          const emiFine = parseFloat(e.fine) || 0;
                          // If paid more than principal, the rest is fine
                          totalPrincipalPaid += Math.min(emiPaid, emiPrincipal);
                          // Only count fines that are still left (not paid)
                          totalFinesLeft += Math.max(emiFine, 0);
                        });
                        const due = Math.max(0, loanAmount - totalPrincipalPaid) + totalFinesLeft;
                        return `₹${due.toFixed(2)}`;
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
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      
                      // Get existing files (could be File objects or strings)
                      const existingFiles = form.idDocs || [];
                      const totalCount = existingFiles.length + newFiles.length;
                      
                      if (totalCount > 5) {
                        setWarning("You can upload a maximum of 5 files in total. You already have " + 
                                   existingFiles.length + " file(s).");
                        e.target.value = null;
                      } else {
                        // Append new files to existing ones
                        setForm(f => ({ ...f, idDocs: [...existingFiles, ...newFiles] }));
                        setWarning("");
                      }
                    }}
                  />
                  <div className="border rounded px-3 py-2 w-full h-full flex items-center text-gray-400 bg-white pointer-events-none">
                    {form.idDocs && form.idDocs.length > 0
                      ? `${form.idDocs.length} file(s) selected (max 5)`
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
                    onChange={(e) => {
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
                    onChange={(e) => {
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
                    onClick={(e) => setShowPhotoMenu(true)}
                  >
                    {form.customerPhoto ? (typeof form.customerPhoto === 'string' ? 'Photo selected' : form.customerPhoto.name) : 'Upload Customer Photo'}
                  </button>
                  {/* Menu for photo options */}
                  {showPhotoMenu && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border rounded shadow z-50 flex flex-col">
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left"
                        onClick={(e) => {
                          setShowPhotoMenu(false);
                          document.getElementById('customer-photo-camera').click();
                        }}
                      >
                        Take Photo
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left"
                        onClick={(e) => {
                          setShowPhotoMenu(false);
                          document.getElementById('customer-photo-album').click();
                        }}
                      >
                        Choose from Album
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                        onClick={(e) => setShowPhotoMenu(false)}
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
      {/* EMI Payment/Fine Modal */}
      <AnimatePresence>
        {fineModal.open && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Add Payment or Fine</h3>
              {fineModal.emiId && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">For EMI ID: {fineModal.emiId}</p>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Payment Amount</label>
                <input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter amount paid"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="fineAmount" className="block text-sm font-medium text-gray-700">Fine Amount</label>
                <input
                  type="number"
                  id="fineAmount"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter fixed fine amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="finePercent" className="block text-sm font-medium text-gray-700">Fine Percentage (%)</label>
                <input
                  type="number"
                  id="finePercent"
                  value={finePercent}
                  onChange={(e) => setFinePercent(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter fine percentage"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              {/* Display current due and total after potential additions */}
              {fineModal.emiId && emiHistory.find(e => e.id === fineModal.emiId) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Current Status:</p>
                    <p>Original Amount: ₹{emiHistory.find(e => e.id === fineModal.emiId)?.amount}</p>
                    <p>Existing Fine: ₹{emiHistory.find(e => e.id === fineModal.emiId)?.fine || 0}</p>
                    <p>Amount Paid: ₹{emiHistory.find(e => e.id === fineModal.emiId)?.paid || 0}</p>
                    <p className="font-medium mt-2">Remaining Due: ₹{(
                      (parseFloat(emiHistory.find(e => e.id === fineModal.emiId)?.amount || '0') +
                      parseFloat(emiHistory.find(e => e.id === fineModal.emiId)?.fine || '0') -
                      parseFloat(emiHistory.find(e => e.id === fineModal.emiId)?.paid || '0'))
                    ).toFixed(2)}</p>
                    {fineAmount || finePercent ? (
                      <p className="font-medium mt-2 text-red-600">
                        New Fine: ₹{(() => {
                          const emi = emiHistory.find(e => e.id === fineModal.emiId);
                          const remainingDue = (parseFloat(emi?.amount || '0') + parseFloat(emi?.fine || '0') - parseFloat(emi?.paid || '0'));
                          let newFine = parseFloat(fineAmount) || 0;
                          if (finePercent) {
                            newFine += remainingDue * (parseFloat(finePercent) / 100);
                          }
                          return newFine.toFixed(2);
                        })()}
                      </p>
                    ) : null}
                    {paymentAmount ? (
                      <p className="font-medium mt-2 text-green-600">
                        New Payment: ₹{parseFloat(paymentAmount || '0').toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
                  onClick={() => setFineModal({ open: false, emiId: null })}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  onClick={handleSubmitEmiAction}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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