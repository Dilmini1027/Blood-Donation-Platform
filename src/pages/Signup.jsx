import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'', userId:'', userIdValid:false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const ID_PATTERNS = {
    donor:{prefix:'DNR-', pattern:/^DNR-\d{5}$/},
    patient:{prefix:'PAT-', pattern:/^PAT-\d{5}$/},
    organization:{prefix:'ORG-', pattern:/^ORG-\d{5}$/},
    admin:{prefix:'ADM-', pattern:/^ADM-\d{5}$/}
  };

  const getUserIdFormat = role => role ? `${ID_PATTERNS[role]?.prefix}XXXXX (e.g., ${ID_PATTERNS[role]?.prefix}12345)` : '';
  const validateUserId = (userId, role) => userId && role ? ID_PATTERNS[role]?.pattern.test(userId) || false : false;
  const formatUserId = (value, role) => {
    if(!role || !value) return value;
    const prefix = ID_PATTERNS[role]?.prefix;
    if(!prefix) return value;
    if(!value.startsWith(prefix)) value = prefix + value.replace(/\D/g,'');
    return (prefix + value.slice(prefix.length).replace(/\D/g,'')).slice(0,prefix.length+5);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if(name==='role'){
      setFormData(prev=>({...prev, role:value, userId:'', userIdValid:false}));
      setError('');
    } else if(name==='userId'){
      const formattedValue = formatUserId(value, formData.role);
      setFormData(prev=>({...prev, userId:formattedValue, userIdValid:validateUserId(formattedValue, formData.role)}));
    } else setFormData(prev=>({...prev, [name]:value}));
  };

  const validateForm = () => {
    if(!formData.role){ setError('Please select a role'); return false; }
    if(formData.password!==formData.confirmPassword){ setError('Passwords do not match'); return false; }
    if(formData.password.length<8){ setError('Password must be at least 8 characters long'); return false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)){ setError('Please enter a valid email address'); return false; }
    if(formData.name.trim().length<3){ setError('Name must be at least 3 characters long'); return false; }
    if(!formData.userIdValid){ setError(`Please enter a valid User ID following the format: ${getUserIdFormat(formData.role)}`); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if(!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData)
      });
      const data = await response.json();
      if(response.ok){
        localStorage.setItem('token',data.token);
        localStorage.setItem('user',JSON.stringify(data.user));
        navigate('/');
      } else setError(data.message || 'Registration failed');
    } catch { setError('An error occurred. Please try again later.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Register Here</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {['name','email'].map((field,i)=>(
              <div key={i}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{field==='name'?'Full Name':'Email Address'}</label>
                <input id={field} name={field} type={field==='email'?'email':'text'} required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder={`Enter your ${field}`} value={formData[field]} onChange={handleChange}/>
              </div>
            ))}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select id="role" name="role" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" value={formData.role} onChange={handleChange}>
                <option value="">Select your role</option>
                <option value="donor">Blood Donor</option>
                <option value="patient">Patient</option>
                <option value="organization">Organization</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role && (
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input id="userId" name="userId" type="text" required
                  className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${formData.userId ? (formData.userIdValid?'border-green-500':'border-red-500'):'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                  placeholder={`Format: ${getUserIdFormat(formData.role)}`} value={formData.userId} onChange={handleChange}/>
                <p className="mt-1 text-sm text-gray-500">
                  Please create your ID following the format: {getUserIdFormat(formData.role)}
                  {formData.userId && !formData.userIdValid && <span className="text-red-500 ml-2">Invalid format</span>}
                  {formData.userIdValid && <span className="text-green-500 ml-2">✓ Valid ID</span>}
                </p>
              </div>
            )}

            {['password','confirmPassword'].map((field,i)=>(
              <div className="relative" key={i}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{field==='password'?'Password':'Confirm Password'}</label>
                <input id={field} name={field} type={field==='password'?showPassword? 'text':'password': showConfirmPassword?'text':'password'} required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder={field==='password'?'Create a password':'Confirm your password'} value={formData[field]} onChange={handleChange}/>
                <button type="button" className="absolute bottom-3 right-0 pr-4 flex items-center text-gray-600"
                  onClick={()=>field==='password'?setShowPassword(!showPassword):setShowConfirmPassword(!showConfirmPassword)}>
                  {field==='password'?showPassword?'Hide':'Show':showConfirmPassword?'Hide':'Show'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"/>
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">I agree to the <a href="#" className="font-medium text-red-600 hover:text-red-500">Terms and Conditions</a></label>
          </div>

          <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
            {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-medium text-red-600 hover:text-red-500">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
