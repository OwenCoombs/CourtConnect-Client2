import React, { useContext, useState, useEffect } from 'react';
import { Context } from './context';
import UploadImage from './uploadImage';
import { useNavigate } from 'react-router-dom';
import { baseUrl, getUserPosts, deletePost } from './api';
import Like from './assets/heart-regular.svg'; // Add a like icon


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPostActions, setShowPostActions] = useState(null); // State to manage showing post actions dropdown
  const { auth, liveProfile } = useContext(Context);
  const [userPosts, setUserPosts] = useState([]);
  const [likes, setLikes] = useState({}); // State to track likes
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
      const initialLikes = {};
      posts.forEach(post => initialLikes[post.id] = 0); // Initialize likes
      setLikes(initialLikes);
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

  const handleLikePost = (postId) => {
    setLikes(prevLikes => ({
      ...prevLikes,
      [postId]: prevLikes[postId] + 1
    }));
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
    localStorage.setItem('profileName', newName);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    liveProfile.setProfile((prevProfile) => ({
      ...prevProfile,
      email: newEmail,
    }));
    localStorage.setItem('profileEmail', newEmail);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
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

  const handleTogglePostActions = (postId) => {
    if (showPostActions === postId) {
      setShowPostActions(null);
    } else {
      setShowPostActions(postId);
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
                      src={`${baseUrl}${post.image}`}  
                      alt={post.title}
                      className="twitter-image"
                    />
                    <div className="post-actions">
                      <button className="btn-modern post-actions-btn" onClick={() => handleTogglePostActions(post.id)}>...</button>
                      {showPostActions === post.id && (
                        <div className="post-actions-dropdown">
                          <button className="btn-modern delete-post-btn" onClick={() => handleDeletePost(post.id)}>Delete</button>
                          {/* Add more actions as needed */}
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="twitter-post-title"><em>@{post.uploader_username}</em></h4>
                  <h4 className="twitter-post-title"><strong>{post.title}</strong></h4>
                  <p className="twitter-post-description">{post.desc}</p>
                  <div className="like-button" onClick={() => handleLikePost(post.id)}>
                    <img src={Like} alt="Like" className="like-icon" />
                    <span className="like-count">{likes[post.id]} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

