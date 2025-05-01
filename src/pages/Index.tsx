
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
  Rocket
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-5 flex items-center">
          <span className="text-purple-400 font-bold text-2xl">Remunix</span>
        </div>
        
        <div className="flex-1 px-3">
          <div className="mt-8">
            <NavItem icon={<div className="w-5 h-5 flex items-center justify-center text-white">⌂</div>} text="Dashboard" active />
            <NavItem icon={<Users size={20} />} text="Employees" />
            <NavItem icon={<div className="w-5 h-5 flex items-center justify-center text-white">👤</div>} text="Attendance" />
            <NavItem icon={<Wallet size={20} />} text="Payroll" />
            <NavItem icon={<CreditCard size={20} />} text="Payslip" />
            <NavItem icon={<div className="w-5 h-5 flex items-center justify-center text-white">📅</div>} text="Payroll Calendar" />
            <NavItem icon={<div className="w-5 h-5 flex items-center justify-center text-white">📊</div>} text="Report and Analytics" />
            <NavItem icon={<div className="w-5 h-5 flex items-center justify-center text-white">📝</div>} text="Tax & Compliance" />
          </div>
        </div>
        
        {/* Upgrade section */}
        <div className="mt-auto mb-10">
          <div className="bg-gradient-to-b from-purple-600 to-purple-800 rounded-3xl mx-3 p-6 text-center relative overflow-hidden">
            <div className="absolute right-8 top-8 bg-white rounded-full p-3">
              <Rocket size={20} className="text-purple-600" />
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
          <button className="flex items-center text-gray-400">
            <div className="w-5 h-5 flex items-center justify-center text-gray-400">⚙️</div>
            <span className="ml-3">Settings</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <div className="text-gray-500">Welcome back, John👋</div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
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
              icon={<Users size={24} className="text-white" />}
              iconBg="bg-emerald-500"
              title="Total Employees"
              value="103"
              description="90% of employees are regular staff."
            />
            <StatCard 
              icon={<Wallet size={24} className="text-white" />}
              iconBg="bg-purple-500"
              title="Payroll Processed"
              value="$40,000"
              description="90% payroll completed for this month."
            />
            <StatCard 
              icon={<CreditCard size={24} className="text-white" />}
              iconBg="bg-orange-500"
              title="Pending Pay"
              value="$40,000"
              description="90% of payroll is still pending approval."
            />
            <StatCard 
              icon={<CreditCard size={24} className="text-white" />}
              iconBg="bg-blue-500"
              title="Tax & Deduction"
              value="$6000"
              description="90% of employees have completed tax deductions."
            />
          </div>
          
          <div className="flex gap-6">
            {/* Left column */}
            <div className="flex-1 space-y-6">
              {/* Payroll Expenses */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Payroll Expenses Breakdown</h2>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full border hover:bg-gray-50">
                      <Download size={20} />
                    </button>
                    <button className="p-2 rounded-full border hover:bg-gray-50">
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's a graph of payroll expenses breakdown</p>
                
                {/* Graph placeholder */}
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Chart data popup */}
                    <div className="bg-gray-900 text-white rounded-lg p-4 z-10 w-56">
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                        <span className="text-sm text-gray-300">$2,378.11</span>
                        <span className="ml-auto">Base Salary</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                        <span className="text-sm text-gray-300">$2,378.11</span>
                        <span className="ml-auto">Overtime Pay</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                        <span className="text-sm text-gray-300">$2,378.11</span>
                        <span className="ml-auto">Bonuses</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Graph month labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-gray-500 text-sm">
                    <div>Jan</div>
                    <div>Feb</div>
                    <div>Mar</div>
                    <div>Apr</div>
                    <div>May</div>
                    <div>Jun</div>
                    <div>Jul</div>
                    <div>Aug</div>
                    <div>Sep</div>
                  </div>
                  
                  {/* Chart bars */}
                  <div className="absolute left-0 right-0 bottom-5 top-5 flex items-end justify-between px-2">
                    <div className="w-10 h-1/3 bg-gray-200"></div>
                    <div className="w-10 h-1/4 bg-gray-200"></div>
                    <div className="w-10 h-3/4 bg-gradient-to-t from-purple-400 to-purple-200 rounded-t-lg"></div>
                    <div className="w-10 h-1/2 bg-gray-200"></div>
                    <div className="w-10 h-1/3 bg-gray-200"></div>
                    <div className="w-10 h-1/4 bg-gray-200"></div>
                    <div className="w-10 h-1/5 bg-gray-200"></div>
                    <div className="w-10 h-1/4 bg-gray-200"></div>
                    <div className="w-10 h-1/5 bg-gray-200"></div>
                  </div>
                </div>
              </div>
              
              {/* Payroll Activities */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Payroll Activities</h2>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's are employee payroll information for this month</p>
                
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="pb-3">Employee Name</th>
                      <th className="pb-3">Position</th>
                      <th className="pb-3">Salary Paid</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-400 mr-3 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=58" alt="Wade Warren" className="w-full h-full object-cover" />
                        </div>
                        <span>Wade Warren</span>
                      </td>
                      <td className="py-3">Graphic Designer</td>
                      <td className="py-3">$2,500</td>
                      <td className="py-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-400 mr-3 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=42" alt="John Doe" className="w-full h-full object-cover" />
                        </div>
                        <span>John Doe</span>
                      </td>
                      <td className="py-3">Product Designer</td>
                      <td className="py-3">$4,500</td>
                      <td className="py-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-400 mr-3 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=33" alt="Jane Cooper" className="w-full h-full object-cover" />
                        </div>
                        <span>Jane Cooper</span>
                      </td>
                      <td className="py-3">Snr. UI Designer</td>
                      <td className="py-3">$3,000</td>
                      <td className="py-3">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Right column */}
            <div className="w-96 space-y-6">
              {/* Action buttons */}
              <div className="flex justify-between mb-2">
                <button className="bg-white border rounded-full px-4 py-2 flex items-center text-sm hover:bg-gray-50">
                  <span className="mr-2">+</span> Add New
                </button>
                <button className="bg-white border rounded-full px-4 py-2 flex items-center text-sm hover:bg-gray-50">
                  <span className="mr-2">📄</span> Payslips
                </button>
                <button className="bg-white border rounded-full px-4 py-2 flex items-center text-sm hover:bg-gray-50">
                  <span className="mr-2">📝</span> Log Overtime
                </button>
                <button className="bg-white border rounded-full px-4 py-2 flex items-center text-sm hover:bg-gray-50">
                  <span className="mr-2">📊</span> Payr
                </button>
              </div>
              
              {/* Attendance */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Attendance</h2>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's are attendance list</p>
                
                <div className="flex items-center mb-5">
                  <h3 className="text-lg font-semibold mr-2">Mar 14, 2025</h3>
                  <div className="flex items-center ml-4">
                    <span className="text-purple-600 text-xl font-bold">40</span>
                    <span className="text-gray-600 ml-1">On time</span>
                  </div>
                  <div className="mx-4 text-gray-300">|</div>
                  <div className="flex items-center">
                    <span className="text-orange-500 text-xl font-bold">12</span>
                    <span className="text-gray-600 ml-1">Late</span>
                  </div>
                  <div className="mx-4 text-gray-300">|</div>
                  <div className="flex items-center">
                    <span className="text-red-500 text-xl font-bold">8</span>
                    <span className="text-gray-600 ml-1">Absent</span>
                  </div>
                </div>
                
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600 text-sm">
                      <th className="pb-2">Employee</th>
                      <th className="pb-2">Check In</th>
                      <th className="pb-2">Check Out</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-pink-400 mr-2 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=37" alt="Jane Cooper" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm">Jane</div>
                          <div className="text-xs text-gray-500">Cooper</div>
                        </div>
                      </td>
                      <td className="py-2 text-sm">09:00 AM</td>
                      <td className="py-2 text-sm">06:00 PM</td>
                      <td className="py-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">On Time</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-400 mr-2 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=42" alt="John Doe" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm">John</div>
                          <div className="text-xs text-gray-500">Doe</div>
                        </div>
                      </td>
                      <td className="py-2 text-sm">09:00 AM</td>
                      <td className="py-2 text-sm">06:00 PM</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Late</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 mr-2 flex-shrink-0 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?img=48" alt="Jenny Wilson" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm">Jenny</div>
                          <div className="text-xs text-gray-500">Wilson</div>
                        </div>
                      </td>
                      <td className="py-2 text-sm">09:00 AM</td>
                      <td className="py-2 text-sm">06:00 PM</td>
                      <td className="py-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Absence</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Announcement */}
              <div className="bg-white rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Announcement</h2>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    See More <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">Here's are all announcement</p>
                
                <div className="flex items-center mb-4">
                  <div className="min-w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-center p-2 mr-4">
                    <div>
                      <div className="text-orange-800 font-semibold">Dec</div>
                      <div className="text-orange-800 text-lg font-bold">12</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Payroll Deadline</h4>
                    <p className="text-sm text-gray-600">March Salary Processing by March 25</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-center p-2 mr-4">
                    <div>
                      <div className="text-blue-800 font-semibold">Dec</div>
                      <div className="text-blue-800 text-lg font-bold">12</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Tax Compliance</h4>
                    <p className="text-sm text-gray-600">Submit Employee Tax Forms by April 5</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
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
  return (
    <div 
      className={`flex items-center space-x-3 p-3 my-1 rounded-lg cursor-pointer ${
        active ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};

const StatCard = ({ icon, iconBg, title, value, description }) => {
  return (
    <div className="bg-green-50 rounded-lg p-5 h-full">
      <div className="flex justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
      <div className="mb-1 text-gray-500">{title}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
};

export default Index;
