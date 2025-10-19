import React, { useState } from "react";
import {
  FaUser, FaBell, FaLock, FaShieldAlt, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaTint, FaCalendar, FaSave, FaEye, FaEyeSlash
} from "react-icons/fa";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "John Doe", email: "johndoe@email.com", phone: "+1 234 567 8900",
    dateOfBirth: "1995-06-15", bloodType: "O+", address: "123 Main Street",
    city: "New York", state: "NY", zipCode: "10001",
    emergencyContact: "Jane Doe", emergencyPhone: "+1 234 567 8901"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsNotifications: true, appointmentReminders: true,
    donationReminders: true, healthUpdates: false, newsletters: true, eventNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "friends", showDonationHistory: true, showAchievements: true,
    allowMessages: true, dataSharing: false
  });

  const handleProfileChange = e => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handleNotificationChange = key => setNotifications({ ...notifications, [key]: !notifications[key] });
  const handlePrivacyChange = (key, value) => setPrivacy({ ...privacy, [key]: value });
  const handleSaveProfile = () => alert("Profile updated successfully!");
  const handleSaveNotifications = () => alert("Notification preferences saved!");
  const handleSavePrivacy = () => alert("Privacy settings saved!");
  const handleChangePassword = e => { e.preventDefault(); alert("Password changed successfully!"); };

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "security", label: "Security", icon: FaLock },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            <tab.icon className="text-lg" /><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            <button onClick={handleSaveProfile} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <FaSave className="mr-2" /> Save Changes
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Full Name", name: "fullName", icon: <FaUser /> },
              { label: "Email Address", name: "email", icon: <FaEnvelope /> },
              { label: "Phone Number", name: "phone", icon: <FaPhone /> },
              { label: "Date of Birth", name: "dateOfBirth", icon: <FaCalendar />, type: "date" }
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">{f.icon}</div>
                  <input type={f.type || "text"} name={f.name} value={profileData[f.name]}
                    onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <div className="relative">
                <FaTint className="absolute left-3 top-3 text-gray-400" />
                <select name="bloodType" value={profileData.bloodType} onChange={handleProfileChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500">
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            {[
              { label: "Street Address", name: "address", icon: <FaMapMarkerAlt /> },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "Zip Code", name: "zipCode" },
              { label: "Emergency Contact Name", name: "emergencyContact" },
              { label: "Emergency Contact Phone", name: "emergencyPhone", icon: <FaPhone /> }
            ].map((f, i) => (
              <div key={i} className={f.name === "address" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                <div className="relative">
                  {f.icon && <div className="absolute left-3 top-3 text-gray-400">{f.icon}</div>}
                  <input type="text" name={f.name} value={profileData[f.name]}
                    onChange={handleProfileChange}
                    className={`w-full ${f.icon ? "pl-10" : "px-4"} pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
            <button onClick={handleSaveNotifications} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <FaSave className="mr-2" /> Save Changes
            </button>
          </div>
          {Object.entries({
            emailNotifications: "Email Notifications",
            smsNotifications: "SMS Notifications",
            appointmentReminders: "Appointment Reminders",
            donationReminders: "Donation Reminders",
            healthUpdates: "Health Updates",
            newsletters: "Newsletters",
            eventNotifications: "Event Notifications"
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{label}</h3>
                <p className="text-sm text-gray-600">
                  {label.includes("Email") ? "Receive notifications via email"
                    : label.includes("SMS") ? "Receive notifications via text"
                    : label.includes("Appointment") ? "Get reminders for upcoming appointments"
                    : label.includes("Donation") ? "Remind me when I am eligible to donate again"
                    : label.includes("Health") ? "Receive health tips and updates"
                    : label.includes("Newsletter") ? "Subscribe to our monthly newsletter"
                    : "Get notified about blood donation events"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications[key]}
                  onChange={() => handleNotificationChange(key)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
          <form onSubmit={handleChangePassword} className="mb-8 space-y-4">
            {[
              { label: "Current Password", show: showPassword, set: setShowPassword },
              { label: "New Password", show: showNewPassword, set: setShowNewPassword },
              { label: "Confirm New Password", show: showConfirmPassword, set: setShowConfirmPassword }
            ].map((p, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{p.label}</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-gray-400" />
                  <input type={p.show ? "text" : "password"} placeholder={`Enter ${p.label.toLowerCase()}`}
                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                  <button type="button" onClick={() => p.set(!p.show)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {p.show ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Update Password</button>
          </form>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><h4 className="font-medium text-gray-800">Enable 2FA</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p></div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Enable</button>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Sessions</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Windows PC - Chrome</h4>
                <p className="text-sm text-gray-600">New York, USA - Current session</p>
                <p className="text-xs text-gray-500">Last active: Just now</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Privacy Settings</h2>
            <button onClick={handleSavePrivacy} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <FaSave className="mr-2" /> Save Changes
            </button>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Profile Visibility</h3>
              {["public","friends","private"].map(v=>(
                <label key={v} className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="profileVisibility" value={v}
                    checked={privacy.profileVisibility===v}
                    onChange={e=>handlePrivacyChange("profileVisibility",e.target.value)}
                    className="text-red-600 focus:ring-red-500" />
                  <span className="text-gray-700 capitalize">{v}</span>
                </label>
              ))}
            </div>
            {[
              { key:"showDonationHistory", label:"Show Donation History", desc:"Allow others to see your donation history" },
              { key:"showAchievements", label:"Show Achievements", desc:"Display your achievements and badges" },
              { key:"allowMessages", label:"Allow Messages", desc:"Let other users send you messages" },
              { key:"dataSharing", label:"Data Sharing", desc:"Share anonymized data for research purposes" }
            ].map(p=>(
              <div key={p.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div><h3 className="font-semibold text-gray-800">{p.label}</h3><p className="text-sm text-gray-600">{p.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={privacy[p.key]}
                    onChange={()=>handlePrivacyChange(p.key,!privacy[p.key])}
                    className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Management</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">Permanently delete your account. This action cannot be undone.</p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
