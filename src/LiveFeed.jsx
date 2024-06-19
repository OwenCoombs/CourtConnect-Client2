import React, { useContext, useEffect, useState } from "react";
import { Context } from "./context";
import { getImages, deletePost } from "./api";
import Like from "./assets/heart-regular.svg"; // Add your like icon import here
import { baseUrl } from "./api"; // Import likeImage function if needed

const LiveFeed = () => {
  const [images, setImages] = useState([]);
  const [likes, setLikes] = useState({}); // State to track likes
  const { auth } = useContext(Context);

  const updateImages = () => {
    getImages({ auth })
      .then(response => {
        console.log('GET IMAGES: RESPONSE: ', response);
        setImages(response.data);
        const initialLikes = {};
        response.data.forEach(image => initialLikes[image.pk] = 0); // Initialize likes
        setLikes(initialLikes);
      })
      .catch(error => console.log('ERROR: ', error));
  };

  useEffect(() => {
    if (auth.accessToken) {
      updateImages();
    }
  }, [auth.accessToken]);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId, { auth });
      updateImages();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLikePost = (postId) => {
    // Simulate liking the post, you may need to implement an API call here
    setLikes(prevLikes => ({
      ...prevLikes,
      [postId]: prevLikes[postId] + 1
    }));
  };

  return (
    <section className="personal-profile">
      <div className="profile-container">
        <div className="profile-details">
          <div className="social-media">
            <h1 className="text-center p-4">Your Feed</h1>
            <hr className="twitter-hr" />
            <div className="images-grid">
              {images && images.map(image => (
                <div key={image.pk} className="twitter-post">
                  <div className="image-container">
                    <img 
                      src={`${baseUrl}${image.image}`}  
                      alt={image.title}
                      className="twitter-image"
                    />
                    {/* Like button */}
                    <div className="like-button" onClick={() => handleLikePost(image.pk)}>
                      <img src={Like} alt="Like" className="like-icon" />
                      <span className="like-count">{likes[image.pk]} likes</span>
                    </div>
                  </div>
                  <h4 className="twitter-post-title"><em>@{image.uploader_username}</em></h4>
                  <h4 className="twitter-post-title"><strong>{image.title}</strong></h4>
                  <p className="twitter-post-description">{image.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveFeed;

