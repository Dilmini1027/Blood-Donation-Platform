import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome, FaCalendarAlt, FaUserCircle, FaBell,
  FaHeartbeat, FaCog, FaHandHoldingHeart
} from "react-icons/fa";
import AppointmentsPage from "../components/AppointmentsPage";
import HealthRecordsPage from "../components/HealthRecordsPage";
import MyDonationsPage from "../components/MyDonationsPage";
import SettingsPage from "../components/SettingsPage";


const DonorDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const donorData = {
    profile: { name: "John Doe", bloodType: "O+", lastDonation: "2025-09-15", nextEligibleDate: "2025-10-20", status: "Active", donationsCount: 8 },
    appointments: [{ id: 1, date: "2025-10-25", time: "10:00 AM", location: "Central Blood Bank" }],
    recentDonations: [
      { id: 1, date: "2025-09-15", location: "City Hospital", type: "Whole Blood" },
      { id: 2, date: "2025-06-10", location: "Mobile Drive", type: "Plasma" }
    ],
    healthMetrics: { hemoglobin: "14.5 g/dL", pressure: "120/80", weight: "75 kg", lastCheckup: "2025-09-15" },
    notifications: [
      { id: 1, message: "Upcoming appointment on Oct 25", unread: true },
      { id: 2, message: "You are eligible to donate again", unread: true }
    ]
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "appointments", label: "Appointments", icon: FaCalendarAlt },
    { id: "donations", label: "My Donations", icon: FaHandHoldingHeart },
    { id: "health", label: "Health Records", icon: FaHeartbeat },
    { id: "settings", label: "Settings", icon: FaCog }
  ];

  const statsCards = [
    { id: 1, label: "Total Donations", value: donorData.profile.donationsCount, icon: FaHandHoldingHeart, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "Next Eligible Date", value: donorData.profile.nextEligibleDate, icon: FaCalendarAlt, color: "text-green-600", bg: "bg-green-50" },
    { id: 3, label: "Blood Type", value: donorData.profile.bloodType, icon: FaHeartbeat, color: "text-red-600", bg: "bg-red-50" },
    { id: 4, label: "Health Status", value: donorData.profile.status, icon: FaHeartbeat, color: "text-purple-600", bg: "bg-purple-50" }
  ];

  const Card = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 flex items-center">
      <div className={`${bg} rounded-lg p-3`}><Icon className={`h-6 w-6 ${color}`} /></div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );

  const handleProfileMenuClick = (item) => {
    setShowProfileMenu(false);
    if (item === "Edit Profile" || item === "Settings") {
      setActivePage("settings");
    }
  };

  const handleLogout = () => {
    // Clear any stored user data (localStorage, sessionStorage, etc.)
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    // Navigate to login page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
          <div className="flex items-center">
            <FaHandHoldingHeart className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Blood Donor</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-600 hover:text-gray-900">
                <FaBell className="h-6 w-6" />
                {donorData.notifications.some(n => n.unread) && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                  <h3 className="px-4 py-2 border-b font-semibold text-sm">Notifications</h3>
                  <div className="max-h-96 overflow-y-auto">
                    {donorData.notifications.map(n => (
                      <p key={n.id} className="px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">{n.message}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <FaUserCircle className="h-8 w-8" />
                <span className="text-sm font-medium">{donorData.profile.name}</span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {["Edit Profile", "Settings"].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleProfileMenuClick(item)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {item}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
          <nav className="mt-5 px-3 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActivePage(id)}
                className={`flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-lg ${activePage === id ? "bg-red-50 text-red-600" : "text-gray-900 hover:bg-gray-50"}`}>
                <Icon className={`mr-3 h-5 w-5 ${activePage === id ? "text-red-600" : "text-gray-500"}`} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {donorData.profile.name}!</h1>
              <p className="text-sm text-gray-600 mb-8">Next donation eligibility: {donorData.profile.nextEligibleDate}</p>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsCards.map((card) => <Card key={card.id} {...card} />)}
              </div>

              {/* Main Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Section title="Upcoming Appointments">
                  {donorData.appointments.length ? donorData.appointments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-2">
                      <div><p className="font-medium text-blue-900">{a.location}</p><p className="text-sm text-blue-700">{a.date} at {a.time}</p></div>
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-800">View</button>
                    </div>
                  )) : <p className="text-gray-500">No upcoming appointments</p>}
                  <button className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                    <FaCalendarAlt className="mr-2" /> Schedule New Appointment
                  </button>
                </Section>

                <Section title="Health Metrics">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(donorData.healthMetrics).map(([key, val]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{val}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Recent Donations">
                  {donorData.recentDonations.map(d => (
                    <div key={d.id} className="flex justify-between p-4 bg-gray-50 rounded-lg mb-2">
                      <div><p className="font-medium">{d.location}</p><p className="text-sm text-gray-500">{d.date} - {d.type}</p></div>
                      <button className="text-red-600 text-sm font-medium hover:text-red-800">View</button>
                    </div>
                  ))}
                </Section>
              </div>
            </div>
          )}

          {activePage === 'appointments' && <AppointmentsPage />}
          
          {activePage === 'donations' && <MyDonationsPage />}
          
          {activePage === 'health' && <HealthRecordsPage />}
          
          
          
          {activePage === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <SettingsPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
