import React, { useState } from 'react';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCheckCircle, FaHourglass,
  FaTimesCircle, FaPlus, FaSearch, FaTimes
} from 'react-icons/fa';

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({ location: '', date: '', time: '', donationType: 'whole-blood', notes: '' });

  const appointments = {
    upcoming: [
      { id: 1, date: '2025-10-25', time: '10:00 AM', location: 'Central Blood Bank', address: '123 Main Street, City Center', type: 'Whole Blood', status: 'confirmed' },
      { id: 2, date: '2025-11-15', time: '2:30 PM', location: 'City Hospital Blood Center', address: '456 Hospital Road, Medical District', type: 'Plasma', status: 'pending' }
    ],
    past: [
      { id: 3, date: '2025-09-15', time: '11:00 AM', location: 'City Hospital', address: '456 Hospital Road, Medical District', type: 'Whole Blood', status: 'completed' },
      { id: 4, date: '2025-06-10', time: '3:00 PM', location: 'Mobile Blood Drive', address: 'Community Center, 789 Park Ave', type: 'Plasma', status: 'completed' },
      { id: 5, date: '2025-03-20', time: '9:30 AM', location: 'Central Blood Bank', address: '123 Main Street, City Center', type: 'Whole Blood', status: 'completed' }
    ]
  };

  const bloodBanks = [
    { id: 1, name: 'Central Blood Bank', address: '123 Main Street, City Center' },
    { id: 2, name: 'City Hospital Blood Center', address: '456 Hospital Road, Medical District' },
    { id: 3, name: 'Community Blood Drive', address: '789 Park Avenue, Downtown' },
    { id: 4, name: 'Regional Medical Center', address: '321 Health Plaza, North District' }
  ];

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

  const handleInputChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Appointment scheduled:', formData);
    alert('Appointment scheduled successfully!');
    setShowScheduleForm(false);
    setFormData({ location: '', date: '', time: '', donationType: 'whole-blood', notes: '' });
  };

  const getStatusBadge = status => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    const icons = {
      confirmed: <FaCheckCircle className="mr-1" />,
      pending: <FaHourglass className="mr-1" />,
      completed: <FaCheckCircle className="mr-1" />,
      cancelled: <FaTimesCircle className="mr-1" />
    };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>{icons[status]}{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your blood donation appointments</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search appointments..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
        <button onClick={() => setShowScheduleForm(true)} className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">
          <FaPlus className="mr-2" /> Schedule Appointment
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('upcoming')} className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'upcoming' ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Upcoming ({appointments.upcoming.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'past' ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Past ({appointments.past.length})
          </button>
        </nav>
      </div>

      <div className="space-y-4">
        {appointments[activeTab].map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{a.location}</h3>
                    <p className="text-sm text-gray-500 flex items-center"><FaMapMarkerAlt className="mr-2" />{a.address}</p>
                  </div>
                  <div className="ml-4">{getStatusBadge(a.status)}</div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-600"><FaCalendarAlt className="mr-2 text-gray-400" /><span>{a.date}</span></div>
                  <div className="flex items-center text-gray-600"><FaClock className="mr-2 text-gray-400" /><span>{a.time}</span></div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-xs font-medium">{a.type}</div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-2">
                {(a.status === 'upcoming' || a.status === 'pending' || a.status === 'confirmed') ? (
                  <>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">View Details</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Reschedule</button>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Cancel</button>
                  </>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">View Details</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {appointments[activeTab].length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} appointments</h3>
          <p className="text-sm text-gray-500 mb-6">{activeTab === 'upcoming' ? "You don't have any scheduled appointments yet." : "You don't have any past appointments."}</p>
          {activeTab === 'upcoming' && (
            <button onClick={() => setShowScheduleForm(true)} className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <FaPlus className="mr-2" /> Schedule Your First Appointment
            </button>
          )}
        </div>
      )}

      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Schedule Appointment</h2>
                <p className="text-sm text-gray-600 mt-1">Book your blood donation appointment</p>
              </div>
              <button onClick={() => setShowScheduleForm(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Blood Bank <span className="text-red-600">*</span></label>
                <select name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                  <option value="">Choose a location...</option>
                  {bloodBanks.map(b => <option key={b.id} value={b.name}>{b.name} - {b.address}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select name="time" value={formData.time} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                      <option value="">Select time...</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Donation Type <span className="text-red-600">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['whole-blood', 'plasma', 'platelets'].map(type => (
                    <label key={type} className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.donationType === type ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}>
                      <input type="radio" name="donationType" value={type} checked={formData.donationType === type} onChange={handleInputChange} className="mr-3 text-red-600 focus:ring-red-500" />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{type.replace('-', ' ')}</p>
                        <p className="text-xs text-gray-500">{type === 'whole-blood' ? 'Standard donation' : type === 'plasma' ? 'Plasma only' : 'Platelet donation'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Any special requirements or health conditions..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"></textarea>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Before You Donate:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Drink plenty of water before your appointment</li>
                  <li>• Eat a healthy meal 2-3 hours before donation</li>
                  <li>• Bring a valid ID and donation card (if you have one)</li>
                  <li>• Get adequate sleep the night before</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setShowScheduleForm(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm">Confirm Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
