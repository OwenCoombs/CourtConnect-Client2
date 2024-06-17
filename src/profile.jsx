import React, { useContext, useState, useEffect } from 'react';
import { Context } from './context';
import UploadImage from './uploadImage';
import { useNavigate } from 'react-router-dom';
import { baseUrl, getUserPosts, deletePost } from './api';
import Trash from './assets/trash-solid.svg';


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { auth, liveProfile } = useContext(Context);
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.accessToken) {
      fetchUserPosts();
    }
    loadProfileFromLocalStorage();
  }, [auth.accessToken]);

  const fetchUserPosts = async () => {
    try {
      const posts = await getUserPosts(auth.accessToken);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId, { auth });
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    saveProfileToLocalStorage();
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    liveProfile.setProfile((prevProfile) => ({
      ...prevProfile,
      name: newName,
    }));
    localStorage.setItem('profileName', newName);  // Save name to local storage
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    liveProfile.setProfile((prevProfile) => ({
      ...prevProfile,
      email: newEmail,
    }));
    localStorage.setItem('profileEmail', newEmail);  // Save email to local storage
  };

  const logout = () => {
    localStorage.removeItem('accessToken');  // Remove only the access token
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const updateImages = async () => {
    await fetchUserPosts();
  };

  const saveProfileToLocalStorage = () => {
    localStorage.setItem('profileName', liveProfile.profile.name);
    localStorage.setItem('profileEmail', liveProfile.profile.email);
  };

  const loadProfileFromLocalStorage = () => {
    const name = localStorage.getItem('profileName');
    const email = localStorage.getItem('profileEmail');
    if (name || email) {
      liveProfile.setProfile((prevProfile) => ({
        ...prevProfile,
        name: name || prevProfile.name,
        email: email || prevProfile.email,
      }));
    }
  };

  return (
    <section className="personal-profile">
      <div className="profile-container">
        <div className="profile-avatar">
          <UploadImage updateImages={updateImages} />
          <div>
            {isEditing ? (
              <button className="btn-modern save-btn" onClick={handleSaveClick}>Save</button>
            ) : (
              <>
                <button className="btn-modern edit-btn" onClick={handleEditClick}>Edit Profile</button>
                <button className="btn-modern logout-btn" onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>
        <div className="profile-details">
          <div className="info-section">
            <h6 className="info-header">Information</h6>
            <hr className="twitter-hr" />
            {isEditing ? (
              <div className="info-row">
                <div className="info-item">
                  <h6>Your Name: </h6>
                  <input 
                    type="text"
                    value={liveProfile.profile.name}
                    onChange={handleNameChange}
                    className="twitter-input"
                  />
                </div>
                <div className="info-item">
                  <h6>Your Email: </h6>
                  <input
                    type="text"
                    value={liveProfile.profile.email}
                    onChange={handleEmailChange}
                    className="twitter-input"
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
            <h6 className="info-header">Your posts</h6>
            <hr className="twitter-hr" />
            <div className="images-grid">
              {userPosts.map(post => (
                <div key={post.id} className="twitter-post">
                  <div className="image-container">
                    <img
                      src={`${baseUrl}/${post.image}`}  
                      alt={post.title}
                      className="twitter-image"
                    />
                    <img 
                      className="twitter-trash-icon"
                      src={Trash}
                      alt="Delete" 
                      onClick={() => handleDeletePost(post.id)}
                    />
                  </div>
                  <h4 className="twitter-post-title">{post.title}</h4>
                  <p className="twitter-post-description">{post.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
