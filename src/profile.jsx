import React, { useContext, useState } from 'react';
import { Context } from './context';
import UploadImage from './uploadImage';
import Images from './Images';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { liveProfile } = useContext(Context);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    liveProfile.setProfile((prevProfile) => ({
      ...prevProfile,
      name: newName,
    }));
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    liveProfile.setProfile((prevProfile) => ({
      ...prevProfile,
      email: newEmail,
    }));
  };

  const logout = () => {
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to the login page
    navigate('/');
    // Reload the page
    window.location.reload();
  };

  return (
    <section className="personal-profile">
      <div className="profile-container">
        <div className="profile-avatar">
          <UploadImage />
          <div>
            {isEditing ? (
              <button onClick={handleSaveClick}>Save</button>
            ) : (
              <>
                <button onClick={handleEditClick}>Edit Profile</button>
                <button onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>
        <div className="profile-details">
          <div className="info-section">
            <h6>Information</h6>
            <hr />
            {isEditing ? (
              <div className="info-row">
                <div className="info-item">
                  <input
                    type="text"
                    value={liveProfile.profile.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="info-item">
                  <input
                    type="text"
                    value={liveProfile.profile.email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>
            ) : (
              <div className="info-row">
                <div className="info-item">{liveProfile.profile.name}</div>
                <div className="info-item">{liveProfile.profile.email}</div>
              </div>
            )}
          </div>
          <div className="social-media">
            <h6>Your clips</h6>
            <hr />
            <div className="social-icons"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

