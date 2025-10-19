import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  FaHeartbeat, FaWeight, FaTint, FaThermometerHalf, FaPlus, FaEdit, FaDownload,
  FaChartLine, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';

const MetricCard = ({ icon: Icon, label, value, unit, status, trend }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="bg-red-50 rounded-lg p-3"><Icon className="h-6 w-6 text-red-600" /></div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
        </div>
      </div>
      {status === 'normal' && <FaCheckCircle className="h-6 w-6 text-green-500" />}
    </div>
    {trend && <div className="flex items-center text-xs text-gray-500"><FaChartLine className="mr-1" />{trend}</div>}
  </div>
);

const HealthRecordsPage = () => {
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({ date:'', bloodPressure:'', heartRate:'', hemoglobin:'', weight:'', temperature:'', notes:'' });

  const healthData = {
    currentMetrics: { bloodPressure:'120/80', heartRate:'72', hemoglobin:'14.5', weight:'75', temperature:'98.6', lastUpdated:'2025-10-15' },
    history: [
      { id:1,date:'2025-10-15',bloodPressure:'120/80',heartRate:'72',hemoglobin:'14.5',weight:'75',notes:'Normal checkup before donation',status:'normal' },
      { id:2,date:'2025-09-15',bloodPressure:'118/78',heartRate:'70',hemoglobin:'14.8',weight:'74',notes:'Pre-donation screening',status:'normal' },
      { id:3,date:'2025-08-10',bloodPressure:'125/82',heartRate:'75',hemoglobin:'14.2',weight:'75',notes:'Routine health check',status:'normal' },
      { id:4,date:'2025-07-05',bloodPressure:'122/79',heartRate:'73',hemoglobin:'14.6',weight:'74',notes:'Post-donation follow-up',status:'normal' }
    ],
    trends: { hemoglobin:[14.2,14.6,14.8,14.5], bloodPressure:[125,122,118,120], weight:[75,74,74,75], months:['Jul','Aug','Sep','Oct'] },
    eligibilityChecks: [
      { criteria:'Age (18-65 years)', status:'pass', value:'28 years' },
      { criteria:'Weight (≥50 kg)', status:'pass', value:'75 kg' },
      { criteria:'Hemoglobin (≥12.5 g/dL)', status:'pass', value:'14.5 g/dL' },
      { criteria:'Blood Pressure (Normal)', status:'pass', value:'120/80' },
      { criteria:'No recent illness', status:'pass', value:'Healthy' },
      { criteria:'Last donation (≥56 days ago)', status:'pass', value:'65 days' }
    ]
  };

  const handleInputChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    console.log('New health record:', formData);
    setShowAddRecordModal(false);
    setFormData({ date:'', bloodPressure:'', heartRate:'', hemoglobin:'', weight:'', temperature:'', notes:'' });
  };

  const exportHealthRecords = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setFont(undefined,'bold'); doc.text('HEALTH RECORDS REPORT',105,20,{align:'center'});
    doc.setLineWidth(0.5); doc.line(20,25,190,25);
    doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.text('Report Generated: '+new Date().toLocaleString(),105,35,{align:'center'});
    let y=50;
    const { currentMetrics, history, eligibilityChecks } = healthData;

    doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.text('CURRENT HEALTH METRICS',20,y); doc.line(20,y+2,190,y+2); y+=12; doc.setFontSize(11);
    Object.entries(currentMetrics).forEach(([key,val]) => { doc.text(`${key.replace(/([A-Z])/g, ' $1')}: ${val}${key==='temperature'?' °F':''}${key==='bloodPressure'?' mmHg':''}${key==='heartRate'?' bpm':''}${key==='hemoglobin'?' g/dL':''}${key==='weight'?' kg':''}`,25,y); y+=8; });

    y+=12; doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.text('HEALTH HISTORY',20,y); doc.line(20,y+2,190,y+2); y+=12; doc.setFontSize(11);
    history.forEach((r,i)=>{
      if(y>250){ doc.addPage(); y=20; }
      doc.setFont(undefined,'bold'); doc.text(`Record ${i+1} - ${r.date}`,25,y); y+=7; doc.setFont(undefined,'normal');
      ['bloodPressure','heartRate','hemoglobin','weight','status','notes'].forEach(f=>{ if(r[f]){ doc.text(`${f.charAt(0).toUpperCase()+f.slice(1).replace(/([A-Z])/g,' $1')}: ${r[f]}`,30,y); y+=6; } }); y+=8;
    });

    if(y>230){ doc.addPage(); y=20; } y+=10; doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.text('DONATION ELIGIBILITY',20,y); doc.line(20,y+2,190,y+2); y+=12; doc.setFontSize(11); doc.setFont(undefined,'normal');
    eligibilityChecks.forEach(c=>{ doc.text(`• ${c.criteria}: ${c.status.toUpperCase()}`,25,y); y+=7; });
    doc.setFontSize(9); doc.setFont(undefined,'italic'); doc.text('This is an automated health records report.',105,280,{align:'center'});
    doc.text('For medical advice, please consult with a healthcare professional.',105,285,{align:'center'});
    doc.save('Health-Records-Report-'+new Date().toISOString().split('T')[0]+'.pdf');
  };

  const tabs = ['overview','history','eligibility'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage your health metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button onClick={exportHealthRecords} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <FaDownload className="mr-2" /> Export
          </button>
          <button onClick={()=>setShowAddRecordModal(true)} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm">
            <FaPlus className="mr-2" /> Add Record
          </button>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 flex space-x-8">
        {tabs.map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab===tab?"border-red-600 text-red-600":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab==='overview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FaCalendarAlt className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Last Updated</p>
                <p className="text-xs text-blue-700">{healthData.currentMetrics.lastUpdated}</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Update Now</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard icon={FaTint} label="Blood Pressure" value={healthData.currentMetrics.bloodPressure} unit="mmHg" status="normal" trend="Within normal range" />
            <MetricCard icon={FaHeartbeat} label="Heart Rate" value={healthData.currentMetrics.heartRate} unit="bpm" status="normal" trend="Stable" />
            <MetricCard icon={FaTint} label="Hemoglobin" value={healthData.currentMetrics.hemoglobin} unit="g/dL" status="normal" trend="Optimal level" />
            <MetricCard icon={FaWeight} label="Weight" value={healthData.currentMetrics.weight} unit="kg" status="normal" trend="Stable" />
            <MetricCard icon={FaThermometerHalf} label="Temperature" value={healthData.currentMetrics.temperature} unit="°F" status="normal" trend="Normal" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Health Trends (Last 4 Months)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['hemoglobin','bloodPressure','weight'].map((metric,i)=>(
                <div key={metric}>
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    {metric==='hemoglobin'?'Hemoglobin (g/dL)':metric==='bloodPressure'?'Blood Pressure (Systolic)':'Weight (kg)'}
                  </p>
                  <div className="flex items-end justify-between space-x-2 h-32">
                    {healthData.trends[metric].map((v,index)=>(
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-end justify-center h-full">
                          <div className={`w-full rounded-t-lg transition-all ${metric==='hemoglobin'?'bg-gradient-to-t from-red-600 to-red-400 hover:from-red-700 hover:to-red-500':metric==='bloodPressure'?'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500':'bg-gradient-to-t from-green-600 to-green-400 hover:from-green-700 hover:to-green-500'}`} style={{height:`${metric==='hemoglobin'?v/15:v==='bloodPressure'?v/140:v/80*100}%`}} title={v}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{healthData.trends.months[index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab==='history' && (
        <div className="space-y-4">
          {healthData.history.map(record=>(
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center"><FaCalendarAlt className="text-gray-400 mr-2" /><span className="text-lg font-semibold text-gray-900">{record.date}</span></div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><FaCheckCircle className="mr-1" />Normal</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    {['bloodPressure','heartRate','hemoglobin','weight'].map(f=>(
                      <div key={f}><p className="text-xs text-gray-500">{f==='bloodPressure'?'Blood Pressure':f==='heartRate'?'Heart Rate':f.charAt(0).toUpperCase()+f.slice(1)}</p><p className="text-sm font-semibold text-gray-900">{record[f]}{f==='bloodPressure'?' mmHg':f==='heartRate'?' bpm':f==='hemoglobin'?' g/dL':' kg'}</p></div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 italic">"{record.notes}"</p>
                </div>
                <div className="mt-4 lg:mt-0 lg:ml-6 flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><FaEdit className="inline mr-1"/>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab==='eligibility' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start">
            <FaCheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0"/>
            <div><h3 className="text-lg font-semibold text-green-900 mb-1">You are eligible to donate!</h3><p className="text-sm text-green-700">All health criteria met. You can schedule your next donation.</p></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            {healthData.eligibilityChecks.map((check,i)=>(
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  {check.status==='pass'?<FaCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"/>:<FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0"/>}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{check.criteria}</p>
                    <p className="text-sm text-gray-600">Your value: {check.value}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${check.status==='pass'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>
                  {check.status==='pass'?'Pass':'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddRecordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Add Health Record</h3>
              <button onClick={()=>setShowAddRecordModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {label:'Date',name:'date',type:'date',required:true},
                {label:'Blood Pressure (mmHg)',name:'bloodPressure',type:'text',placeholder:'e.g., 120/80',required:true},
                {label:'Heart Rate (bpm)',name:'heartRate',type:'number',placeholder:'e.g., 72',required:true},
                {label:'Hemoglobin (g/dL)',name:'hemoglobin',type:'number',step:'0.1',placeholder:'e.g., 14.5',required:true},
                {label:'Weight (kg)',name:'weight',type:'number',step:'0.1',placeholder:'e.g., 75',required:true},
                {label:'Temperature (°F)',name:'temperature',type:'number',step:'0.1',placeholder:'e.g., 98.6'}
              ].map(field=>(
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <input {...field} name={field.name} value={formData[field.name]} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"/>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Any additional notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"/>
              </div>
              <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                <button type="button" onClick={()=>setShowAddRecordModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordsPage;
