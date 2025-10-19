import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  FaHandHoldingHeart, 
  FaTint, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock,
  FaDownload,
  FaCertificate,
  FaStar,
  FaAward,
  FaChartBar,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaFileDownload
} from 'react-icons/fa';

const MyDonationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025');

  const donationData = {
    stats: {
      totalDonations: 8,
      totalLitres: 4.0,
      livesImpacted: 24,
      donationStreak: 3,
      lastDonation: '2025-09-15',
      nextEligible: '2025-10-20'
    },
    donations: [
      {
        id: 1,
        date: '2025-09-15',
        location: 'City Hospital Blood Center',
        address: '456 Hospital Road, Medical District',
        type: 'Whole Blood',
        amount: '500 ml',
        status: 'completed',
        certificateId: 'CERT-2025-001',
        notes: 'Successful donation, no complications',
        recipientInfo: 'Used in emergency surgery',
        donationTime: '10:30 AM'
      },
      {
        id: 2,
        date: '2025-06-10',
        location: 'Mobile Blood Drive',
        address: 'Community Center, 789 Park Ave',
        type: 'Plasma',
        amount: '450 ml',
        status: 'completed',
        certificateId: 'CERT-2025-002',
        notes: 'Excellent donation session',
        recipientInfo: 'Sent to trauma center',
        donationTime: '3:00 PM'
      },
    ],
    typeBreakdown: {
      'Whole Blood': 5,
      'Plasma': 2,
      'Platelets': 1
    },
    monthlyData: [
      { month: 'Jan', count: 0 },
      { month: 'Feb', count: 0 },
      { month: 'Mar', count: 1 },
      { month: 'Apr', count: 0 },
      { month: 'May', count: 0 },
      { month: 'Jun', count: 1 },
      { month: 'Jul', count: 0 },
      { month: 'Aug', count: 0 },
      { month: 'Sep', count: 1 },
      { month: 'Oct', count: 0 }
    ]
  };

  const getTypeColor = (type) => {
    const colors = {
      'Whole Blood': 'bg-red-100 text-red-800 border-red-200',
      'Plasma': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Platelets': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const StatCard = ({ icon: Icon, label, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={color + " rounded-lg p-3"}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const downloadCertificate = (donation) => {
    const doc = new jsPDF();
    
    // Set font sizes and styles
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    
    // Title
    doc.text('BLOOD DONATION CERTIFICATE', 105, 20, { align: 'center' });
    
    // Add decorative line
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Certificate ID
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Certificate ID: ' + donation.certificateId, 105, 35, { align: 'center' });
    
    // Main text
    doc.setFontSize(12);
    doc.text('This is to certify that', 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(donation.location, 105, 60, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('has received a blood donation from a valued donor.', 105, 70, { align: 'center' });
    
    // Donation Details Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Donation Details', 20, 90);
    doc.setLineWidth(0.3);
    doc.line(20, 92, 190, 92);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    let yPos = 102;
    doc.text('Date:', 30, yPos);
    doc.text(donation.date, 100, yPos);
    
    yPos += 8;
    doc.text('Time:', 30, yPos);
    doc.text(donation.donationTime, 100, yPos);
    
    yPos += 8;
    doc.text('Location:', 30, yPos);
    doc.text(donation.location, 100, yPos);
    
    yPos += 8;
    doc.text('Address:', 30, yPos);
    const addressLines = doc.splitTextToSize(donation.address, 80);
    doc.text(addressLines, 100, yPos);
    
    yPos += 8 * addressLines.length;
    doc.text('Type:', 30, yPos);
    doc.text(donation.type, 100, yPos);
    
    yPos += 8;
    doc.text('Amount:', 30, yPos);
    doc.text(donation.amount, 100, yPos);
    
    yPos += 8;
    doc.text('Status:', 30, yPos);
    doc.text('Completed', 100, yPos);
    
    // Impact Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Impact', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const impactLines = doc.splitTextToSize(donation.recipientInfo, 170);
    doc.text(impactLines, 20, yPos);
    
    // Notes Section
    yPos += 8 * impactLines.length + 8;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Notes', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(donation.notes, 170);
    doc.text(notesLines, 20, yPos);
    
    // Footer
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for saving lives!', 105, 260, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Generated on: ' + new Date().toLocaleString(), 105, 270, { align: 'center' });
    
    // Add decorative line at bottom
    doc.setLineWidth(0.5);
    doc.line(20, 275, 190, 275);
    
    // Save the PDF
    doc.save('Certificate-' + donation.certificateId + '.pdf');
  };

  const downloadReport = (donation) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('DONATION REPORT', 105, 20, { align: 'center' });
    
    // Add decorative line
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Report info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Report Generated: ' + new Date().toLocaleString(), 105, 35, { align: 'center' });
    doc.text('Certificate ID: ' + donation.certificateId, 105, 42, { align: 'center' });
    
    let yPos = 55;
    
    // Donor Information Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('DONOR INFORMATION', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Last Donation:', 25, yPos);
    doc.text(donation.date, 80, yPos);
    
    yPos += 7;
    doc.text('Time:', 25, yPos);
    doc.text(donation.donationTime, 80, yPos);
    
    // Donation Details Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('DONATION DETAILS', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Location:', 25, yPos);
    doc.text(donation.location, 80, yPos);
    
    yPos += 7;
    doc.text('Full Address:', 25, yPos);
    const addressLines = doc.splitTextToSize(donation.address, 100);
    doc.text(addressLines, 80, yPos);
    
    yPos += 7 * addressLines.length;
    doc.text('Donation Type:', 25, yPos);
    doc.text(donation.type, 80, yPos);
    
    yPos += 7;
    doc.text('Amount:', 25, yPos);
    doc.text(donation.amount, 80, yPos);
    
    yPos += 7;
    doc.text('Status:', 25, yPos);
    doc.text(donation.status.toUpperCase(), 80, yPos);
    
    // Health Parameters Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('HEALTH PARAMETERS', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('All pre-donation health checks passed', 25, yPos);
    yPos += 7;
    doc.text('Donation completed successfully', 25, yPos);
    yPos += 7;
    doc.text('No complications reported', 25, yPos);
    
    // Impact Information Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('IMPACT INFORMATION', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const impactLines = doc.splitTextToSize(donation.recipientInfo, 170);
    doc.text(impactLines, 25, yPos);
    
    // Medical Notes Section
    yPos += 7 * impactLines.length + 8;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('MEDICAL NOTES', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(donation.notes, 170);
    doc.text(notesLines, 25, yPos);
    
    // Next Donation Eligibility Section
    yPos += 7 * notesLines.length + 8;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('NEXT DONATION ELIGIBILITY', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Based on this ' + donation.type + ' donation, you will be eligible', 25, yPos);
    yPos += 7;
    doc.text('to donate again after the required waiting period:', 25, yPos);
    yPos += 10;
    doc.text('Whole Blood: 56 days (8 weeks)', 30, yPos);
    yPos += 7;
    doc.text('Plasma: 28 days (4 weeks)', 30, yPos);
    yPos += 7;
    doc.text('Platelets: 7 days (1 week)', 30, yPos);
    
    // Thank You Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('THANK YOU', 105, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const thankYouText = [
      'Your generous donation helps save lives.',
      'We appreciate your continued support of our blood donation program.',
      '',
      'For questions or concerns, please contact the donation center where you donated.'
    ];
    
    thankYouText.forEach(line => {
      doc.text(line, 105, yPos, { align: 'center' });
      yPos += 7;
    });
    
    // Add decorative line at bottom
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Save the PDF
    doc.save('Donation-Report-' + donation.certificateId + '.pdf');
  };

  const filteredDonations = activeTab === 'all' 
    ? donationData.donations 
    : donationData.donations.filter(d => d.type === activeTab);

  const maxChartValue = Math.max(...donationData.monthlyData.map(d => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
        <p className="mt-2 text-sm text-gray-600">Track your donation history and impact</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FaHandHoldingHeart}
          label="Total Donations"
          value={donationData.stats.totalDonations}
          subtitle="Since you started"
          color="bg-red-50 text-red-600"
        />
        <StatCard
          icon={FaTint}
          label="Total Donated"
          value={donationData.stats.totalLitres + " L"}
          subtitle="Blood volume"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={FaStar}
          label="Lives Impacted"
          value={donationData.stats.livesImpacted}
          subtitle="Estimated reach"
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          icon={FaAward}
          label="Donation Streak"
          value={donationData.stats.donationStreak + " years"}
          subtitle="Consecutive years"
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Donation Activity Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Donation Activity (2025)</h2>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div className="flex items-end justify-between space-x-2 h-48">
          {donationData.monthlyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center" style={{ height: '180px' }}>
                <div 
                  className={"w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-500 hover:from-red-700 hover:to-red-500 cursor-pointer " + (data.count > 0 ? "" : "opacity-20")}
                  style={{ height: data.count > 0 ? (data.count / maxChartValue * 100) + "%" : "8px" }}
                  title={data.count + " donation(s) in " + data.month}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-2 font-medium">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Type Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(donationData.typeBreakdown).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaTint className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{type}</p>
                  <p className="text-sm text-gray-500">{count} donations</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + 
                (activeTab === 'all' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              All ({donationData.donations.length})
            </button>
            <button
              onClick={() => setActiveTab('Whole Blood')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + 
                (activeTab === 'Whole Blood' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              Whole Blood ({donationData.typeBreakdown['Whole Blood']})
            </button>
            <button
              onClick={() => setActiveTab('Plasma')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + 
                (activeTab === 'Plasma' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              Plasma ({donationData.typeBreakdown['Plasma']})
            </button>
            <button
              onClick={() => setActiveTab('Platelets')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + 
                (activeTab === 'Platelets' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              Platelets ({donationData.typeBreakdown['Platelets']})
            </button>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search donations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <div 
            key={donation.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-red-50 rounded-lg p-3 mr-4">
                      <FaTint className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{donation.location}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaMapMarkerAlt className="mr-2" />
                        {donation.address}
                      </p>
                    </div>
                  </div>
                  <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border " + getTypeColor(donation.type)}>
                    {donation.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      {donation.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center">
                      <FaClock className="mr-2 text-gray-400" />
                      {donation.donationTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">{donation.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      Completed
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Impact</p>
                  <p className="text-sm text-gray-900">{donation.recipientInfo}</p>
                </div>

                <p className="text-sm text-gray-600 italic">"{donation.notes}"</p>
              </div>

              {/* Right Section - Actions */}
              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2 min-w-[200px]">
                <button 
                  onClick={() => downloadCertificate(donation)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <FaCertificate className="mr-2" />
                  Certificate
                </button>
                <button 
                  onClick={() => downloadReport(donation)}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FaFileDownload className="mr-2" />
                  Download Report
                </button>
                <div className="text-xs text-gray-500 text-center mt-2">
                  ID: {donation.certificateId}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDonations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FaHandHoldingHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or start donating!</p>
        </div>
      )}
    </div>
  );
};

export default MyDonationsPage;
