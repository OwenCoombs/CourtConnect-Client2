import React, { useState } from "react";
import { createUser } from './api';
import Header from "./Header";
import { useNavigate } from "react-router-dom";



const CreateNewUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    try {
        await createUser({ username, password, firstName, lastName });
        navigate('/login');
    } catch (error) {
        // Handle error if createUser fails
        console.error('Failed to create user:', error);
        // You can display an error message to the user or take appropriate action
    }
};

  return (
    <>
    <div className="container">
      <div className="form-container">
        <h1 className="form-heading">Create New User</h1>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            id="username"
            className="form-input"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            className="form-input"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name:</label>
          <input
            type="text"
            id="firstName"
            className="form-input"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name:</label>
          <input
            type="text"
            id="lastName"
            className="form-input"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
          />
        </div>

        <div className="form-group">
          <button className="btn-submit" onClick={() => submit()}>Submit</button>
        </div>
      </div>
    </div>
    </>
  );
}

export default CreateNewUser;