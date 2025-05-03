import React, { useState } from "react";
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
  Bell
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import RocketSVG from '../assets/rocket.svg';
import PenSVG from '../assets/pen-svgrepo-com.svg';

const statusColors = {
  Active: "bg-[#ecfdf5] text-[#009a66]",
  Inactive: "bg-[#fffaea] text-[#e07000]",
  "New": "bg-[#eff6fe] text-[#135dfc]"
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

const Customers = () => {
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    primaryContact: "",
    alternateContact: "",
    idDocs: [],
    primaryMobileModel: "",
    primaryMobileIMEI: "",
    secondaryMobileModel: "",
    secondaryMobileIMEI: "",
    devicePrice: "",
    emiTenure: "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "Active"
  });
  const [warning, setWarning] = useState("");
  const [emiPaid, setEmiPaid] = useState(null);
  const [emiDate, setEmiDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredCustomers = customerList.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddCustomer(e) {
    e.preventDefault();
    if (isEditMode) {
      // Update existing customer
      const updatedList = customerList.map(c =>
        c === selected ? { ...c, ...form } : c
      );
      setCustomerList(updatedList);
      setSelected({ ...selected, ...form });
    } else {
      // Add new customer
      const newCustomer = {
        ...form,
        email: '',
        phone: form.primaryContact,
        location: '',
        joinDate: form.startDate,
        department: '',
        position: '',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)+1}`,
        presence: 100,
        leave: 0,
        lastLogin: form.startDate,
        loyalty: "New",
        history: [],
      };
      setCustomerList([newCustomer, ...customerList]);
      setSelected(newCustomer);
    }
    setShowAddModal(false);
    setIsEditMode(false);
    setForm({
      name: "",
      primaryContact: "",
      alternateContact: "",
      idDocs: [],
      primaryMobileModel: "",
      primaryMobileIMEI: "",
      secondaryMobileModel: "",
      secondaryMobileIMEI: "",
      devicePrice: "",
      emiTenure: "",
      startDate: new Date().toISOString().slice(0, 10),
      status: "Active"
    });
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
      devicePrice: (selected as any).devicePrice || '',
      emiTenure: (selected as any).emiTenure || '',
      startDate: (selected as any).startDate || selected.joinDate || new Date().toISOString().slice(0, 10),
      status: selected.status || 'Active',
    });
    setIsEditMode(true);
    setShowAddModal(true);
  }

  function handleEmiAction() {
    setEmiPaid(null);
    setEmiDate(new Date().toISOString().slice(0, 10));
    setShowEmiModal(true);
  }

  function handleDeleteCustomer() {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const idx = customerList.indexOf(selected);
      const newList = customerList.filter(c => c !== selected);
      setCustomerList(newList);
      if (newList.length > 0) {
        setSelected(newList[Math.max(0, idx - 1)]);
      } else {
        setSelected(null);
      }
    }
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
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div>
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
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
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
                          devicePrice: "",
                          emiTenure: "",
                          startDate: new Date().toISOString().slice(0, 10),
                          status: "Active"
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
                      <th className="px-2 pb-2 pt-2 font-medium">Email</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Phone</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Join Date</th>
                      <th className="px-2 pb-2 pt-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c, i) => (
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
                        <td className="px-2 py-3 text-sm">{c.email}</td>
                        <td className="px-2 py-3 text-sm">{c.phone}</td>
                        <td className="px-2 py-3 text-sm">{c.joinDate}</td>
                        <td className="px-2 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Profile Card */}
            <div className="w-96">
              {selected ? (
                <div className="bg-white rounded-3xl shadow p-0 border border-gray-200 overflow-hidden">
                  {/* Profile header with gradient */}
                  <div className="h-28 bg-gradient-to-tr from-[#f5e8ff] to-[#c7eaff] flex items-end justify-center">
                    <div className="w-24 h-24 rounded-full bg-white shadow -mb-12 overflow-hidden border-4 border-white">
                      <img src={selected?.avatar} alt={selected?.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="pt-16 pb-6 px-6">
                    {/* 1. Name */}
                    <h3 className="text-xl font-semibold mb-1 text-center">{selected?.name}</h3>
                    {/* 2. Profile */}
                    <div className="text-gray-500 mb-2 text-center">Customer</div>
                    {/* 3. Primary Contact Number */}
                    <div className="flex items-center mb-2 text-gray-600"><Phone size={16} className="mr-2" />{selected && ('primaryContact' in selected) ? (selected as any).primaryContact || selected.phone || '-' : selected?.phone || '-'}</div>
                    {/* 4. Alternate Contact Number */}
                    <div className="flex items-center mb-2 text-gray-600"><Phone size={16} className="mr-2" />{selected && ('alternateContact' in selected) ? (selected as any).alternateContact || '-' : '-'}</div>
                    {/* 5. Primary Mobile Model */}
                    <div className="flex items-center mb-2 text-gray-600"><User size={16} className="mr-2" />{selected && ('primaryMobileModel' in selected) ? (selected as any).primaryMobileModel || '-' : '-'}</div>
                    {/* 6. Primary Mobile IMEI Number */}
                    <div className="flex items-center mb-2 text-gray-600"><User size={16} className="mr-2" />{selected && ('primaryMobileIMEI' in selected) ? (selected as any).primaryMobileIMEI || '-' : '-'}</div>
                    {/* 7. Secondary Mobile Model */}
                    <div className="flex items-center mb-2 text-gray-600"><User size={16} className="mr-2" />{selected && ('secondaryMobileModel' in selected) ? (selected as any).secondaryMobileModel || '-' : '-'}</div>
                    {/* 8. Secondary Mobile IMEI Number */}
                    <div className="flex items-center mb-2 text-gray-600"><User size={16} className="mr-2" />{selected && ('secondaryMobileIMEI' in selected) ? (selected as any).secondaryMobileIMEI || '-' : '-'}</div>
                    {/* 9. Device Price */}
                    <div className="flex items-center mb-2 text-gray-600"><CreditCard size={16} className="mr-2" />{selected && ('devicePrice' in selected) ? ((selected as any).devicePrice ? `₹${(selected as any).devicePrice}` : '-') : '-'}</div>
                    {/* 10. EMI Tenure */}
                    <div className="flex items-center mb-2 text-gray-600"><Clock size={16} className="mr-2" />{selected && ('emiTenure' in selected) ? ((selected as any).emiTenure ? `${(selected as any).emiTenure} months` : '-') : '-'}</div>
                    {/* 11. Monthly EMI */}
                    <div className="flex items-center mb-2 text-gray-600"><TrendingUp size={16} className="mr-2" />{selected && ('devicePrice' in selected && 'emiTenure' in selected && (selected as any).devicePrice && (selected as any).emiTenure) ? `₹${(parseFloat((selected as any).devicePrice)/parseInt((selected as any).emiTenure)).toFixed(2)}` : '-'}</div>
                    {/* 12. Date */}
                    <div className="flex items-center mb-2 text-gray-600"><Clock size={16} className="mr-2" />{selected && ('startDate' in selected) ? (selected as any).startDate || selected.joinDate || '-' : selected?.joinDate || '-'}</div>
                    {/* 13. Status */}
                    <div className="flex items-center mb-4 text-gray-600"><Smile size={16} className="mr-2" /><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selected?.status] || "bg-gray-100 text-gray-600"}`}>{selected?.status}</span></div>
                    {/* 14. View Documents Button */}
                    <button
                      className="w-full py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium mb-4 hover:from-purple-700 hover:to-pink-600 transition"
                      onClick={() => setShowDocsModal(true)}
                    >
                      View Documents
                    </button>
                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                      {/* Edit Button */}
                      <button className="flex-1 flex items-center justify-center bg-white border border-black rounded-full h-12 font-medium text-gray-700 hover:bg-gray-50 transition" title="Edit" onClick={handleEditCustomer}>
                        <img src={PenSVG} alt="Edit" className="h-5 w-5" />
                      </button>
                      {/* EMI Button */}
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-black rounded-full h-12 font-medium text-gray-700 hover:bg-gray-50 transition" title="EMI" onClick={handleEmiAction}>
                        <span className="font-semibold">EMI</span>
                      </button>
                      {/* Delete Button */}
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-black rounded-full h-12 font-medium hover:bg-gray-50 transition" title="Delete" onClick={handleDeleteCustomer}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2h6" /></svg>
                      </button>
                    </div>
                    <details className="rounded-xl border px-4 py-2 cursor-pointer">
                      <summary className="font-medium text-gray-700 flex items-center justify-between cursor-pointer select-none">
                        EMI History <span className="ml-2">▼</span>
                      </summary>
                      <ul className="mt-2">
                        {selected?.history && selected.history.map((h, i) => (
                          <li key={i} className="flex justify-between text-sm py-1">
                            <span>{h.date}</span>
                            <span
                              className={`px-2 rounded-full font-medium
                                ${h.status === 'Paid' ? 'bg-green-100 text-green-700' : ''}
                                ${h.status === 'Unpaid' ? 'bg-red-100 text-red-700' : ''}
                                ${h.status !== 'Paid' && h.status !== 'Unpaid' ? 'bg-gray-100 text-gray-600' : ''}
                              `}
                            >
                              {h.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow p-8 border border-gray-200 flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                  <span className="text-4xl mb-4">👤</span>
                  <span className="text-lg">No customer selected</span>
                  <span className="text-sm mt-2">Select a customer from the table or add a new customer.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form
            className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-4 sm:p-8 flex flex-col gap-4 relative"
            onSubmit={handleAddCustomer}
          >
            <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowAddModal(false)} aria-label="Close">
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
              <input required type="number" min="1" className="border rounded px-3 py-2" placeholder="Device Price (₹)" value={form.devicePrice} onChange={e => setForm(f => ({ ...f, devicePrice: e.target.value }))} />
              <input required type="number" min="1" className="border rounded px-3 py-2" placeholder="EMI Tenure (Months)" value={form.emiTenure} onChange={e => setForm(f => ({ ...f, emiTenure: e.target.value }))} />
              <input readOnly className="border rounded px-3 py-2 bg-gray-100" placeholder="Monthly EMI Amount (₹)" value={form.devicePrice && form.emiTenure ? (parseFloat(form.devicePrice)/parseInt(form.emiTenure)).toFixed(2) : ''} />
              <input required type="date" className="border rounded px-3 py-2" placeholder="Start Date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              <select required className="border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="">Select EMI Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="flex gap-2 mt-2 col-span-2">
              <button type="submit" className="flex-1 py-2 rounded bg-primary text-white hover:bg-purple-700">Add Customer</button>
            </div>
          </form>
        </div>
      )}
      {/* View Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
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
        </div>
      )}
      {/* EMI Modal */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowEmiModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-lg font-semibold mb-4">EMI Payment</h3>
            <div className="mb-4 text-gray-700 text-base">Is the EMI paid for <span className="font-semibold">{selected?.name}</span>?</div>
            <div className="flex gap-4 mb-4">
              <button
                className={`flex-1 py-2 rounded-full border ${emiPaid === true ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300'} font-medium transition`}
                onClick={() => {
                  // Add to EMI history as Paid and close modal
                  const updatedHistory = [
                    { date: emiDate, status: 'Paid' },
                    ...(selected?.history || [])
                  ];
                  const updatedCustomer = { ...selected, history: updatedHistory };
                  setSelected(updatedCustomer);
                  setCustomerList(customerList.map(c => c === selected ? updatedCustomer : c));
                  setShowEmiModal(false);
                }}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 rounded-full border ${emiPaid === false ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300'} font-medium transition`}
                onClick={() => {
                  // Add to EMI history as Unpaid and close modal
                  const updatedHistory = [
                    { date: emiDate, status: 'Unpaid' },
                    ...(selected?.history || [])
                  ];
                  const updatedCustomer = { ...selected, history: updatedHistory };
                  setSelected(updatedCustomer);
                  setCustomerList(customerList.map(c => c === selected ? updatedCustomer : c));
                  setShowEmiModal(false);
                }}
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
        </div>
      )}
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

export default Customers;