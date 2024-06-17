import React, { useContext, useEffect, useState } from "react";
import { Context } from "./context";
import { getImages, deletePost } from "./api";
import Trash from './assets/trash-solid.svg';
import { baseUrl } from "./api";


const LiveFeed = () => {
  const [images, setImages] = useState([]);
  const { auth } = useContext(Context);

  const updateImages = () => {
    getImages({ auth })
      .then(response => {
        console.log('GET IMAGES: RESPONSE: ', response);
        setImages(response.data);
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
                      src={`${baseUrl}/${image.image}`}  
                      alt={image.title}
                      className="twitter-image"
                    />
                  </div>
                  <h4 className="twitter-post-title">{image.title}</h4>
                  <p className="twitter-post-description">{image.description}</p>
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
