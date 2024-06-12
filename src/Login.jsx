import React, { useContext, useState } from "react";
import { Context } from "./context";
import { fetchUser, getToken } from "./api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const { auth, liveProfile } = useContext(Context); // Ensure correct destructuring
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submit = async () => {
    setError(''); // Clear previous errors
    try {
      const token = await getToken({ setAccessToken: auth.setAccessToken, username, password });
      console.log('Token:', token); // Check token value

      await fetchUser({ token, liveProfile, auth });
      console.log('Navigating to profile page');
      navigate('/profilepage');
    } catch (error) {
      console.error('Error during login:', error);
      setError('Invalid login, please try again');
    }
  };

  return (
    <>
      <div className="container">
        <div className="login-container">
          <h1 className="login-heading">Login</h1>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <div className="form-group">
            <button className="btn-submit" onClick={submit}>
              Submit
            </button>
          </div>

          {/* Display error message */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <Link to='/createnewuser'>Don't have an account? Sign up here</Link>
        </div>
      </div>
    </>
  );
}

export default Login;

