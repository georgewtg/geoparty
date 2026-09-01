import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAccount } from "../api/account.api";
import type { ApiResponse } from "../types/api";
import { useAuth } from '../context/AuthContext';
import './AccountForm.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
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
      if (formData.password !== formData.confirm_password) {
        throw new Error('Passwords do not match');
      }
      const data = await registerAccount(formData);
      setUser(data.payload);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      let errorMessage = 'Failed to register account';
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
          <div className="title"><span>Register Account</span></div>
          <form onSubmit={submitData}>
            {error && <div className="error">{error}</div>}
            <div className="row">
              <input name="username" type="text" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.username} placeholder="Username" required />
            </div>
            <div className="row">
              <input name="email" type="email" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.email} placeholder="Email" required />
            </div>
            <div className="row">
              <input name="password" type="password" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.password} placeholder="Password" required />
            </div>
            <div className="row">
              <input name="confirm_password" type="password" onChange={(e) => handleChange(e.target.name, e.target.value)} value={formData.confirm_password} placeholder="Confirm Password" required />
            </div>
            <div className="row button">
              <input type="submit" value={loading ? "Registering..." : "Register"} />
            </div>
            <div className='link'>Already have an account? <a href="login">login now</a></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;