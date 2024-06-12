// ProfilePage.js
import React, { useContext, useState } from 'react';
import { Context } from './context';
import UploadImage from './uploadImage';
import Images from './Images';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false); // State to track editing mode
  const { liveProfile } = useContext(Context);

  const handleEditClick = () => {
    setIsEditing(true); // Set editing mode to true when edit button is clicked
  };

  const handleSaveClick = () => {
    // Save changes and exit editing mode
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

  return (
    <section className="personal-profile">
      <div className="profile-container">
        <div className="profile-avatar">
          <UploadImage />
          <div>
            {isEditing ? (
              <button onClick={handleSaveClick}>Save</button>
            ) : (
              <button onClick={handleEditClick}>Edit Profile</button>
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

