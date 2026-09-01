import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAccount } from '../api/account.api';
import type { ApiResponse } from '../types/api';
import { useAuth } from '../context/AuthContext';
import './AccountForm.css'

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  };

  const submitData = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginAccount(formData);
      setUser(data.payload);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      let errorMessage = 'Failed to login';
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <div className="form-container">
        <div className="wrapper">
          <div className="title"><span>Welcome to GeoParty</span></div>
          <form onSubmit={submitData}>
            {error && <div className="error">{error}</div>}
            <div className="row">
              <input name="email_or_username" type="text" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.email_or_username} placeholder="Email or Username" required />
            </div>
            <div className="row">
              <input name="password" type="password" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.password} placeholder="Password" required />
            </div>
            {/* <div className="pass"><a href="#">Forgot password?</a></div> */}
            <div className="row button">
              <input type="submit" value={loading ? "Logging in..." : "Login"} />
            </div>
            <div className='link'>Don't have an account? <a href="register">register now</a></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;