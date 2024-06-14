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
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const updateImages = async () => {
    await fetchUserPosts();
  };

  return (
    <section className="personal-profile">
      <div className="profile-container">
        <div className="profile-avatar">
          <UploadImage updateImages={updateImages} />
          <div>
            {isEditing ? (
              <button className="twitter-btn save-btn" onClick={handleSaveClick}>Save</button>
            ) : (
              <>
                <button className="twitter-btn edit-btn" onClick={handleEditClick}>Edit Profile</button>
                <button className="twitter-btn logout-btn" onClick={logout}>Logout</button>
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
                  <input
                    type="text"
                    value={liveProfile.profile.name}
                    onChange={handleNameChange}
                    className="twitter-input"
                  />
                </div>
                <div className="info-item">
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
