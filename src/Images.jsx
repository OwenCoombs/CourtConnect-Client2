import React, { useContext, useEffect, useState } from "react";
import { Context } from "./context";
import { getImages, deletePost } from "./api";
import { baseUrl } from "./api";
import Trash from './assets/trash-solid.svg';

const Images = () => {
  const [images, setImages] = useState([]);
  const { auth } = useContext(Context);

  const updateImages = () => {
    getImages(auth)
      .then(response => {
        console.log('GET IMAGES: RESPONSE: ', response.data);
        setImages(response.data);
      })
      .catch(error => console.log('ERROR: ', error));
  };

  useEffect(() => {
    if (auth.accessToken) {
      updateImages();
    }
  }, [auth.accessToken]);

  return (
    <div className="images-container">
      <h1 className="text-center p-4">Your Feed</h1>
      <div className="images-grid">
      {images && images.map(image => {
  console.log('images!!!!',image);
  return (
    <div key={image.id} className="image-post">
      <img 
        src={`${baseUrl}${image.image}`}  
        alt={image.title}
        className="image-post-img"
      />
      <h4 className="image-post-title">{image.title}</h4>
      <p className="text-center">{image.desc}</p>
      <p className="text-center">Uploaded by: {image.uploader_username}</p>
      <img 
        id='trash' 
        src={Trash} 
        onClick={() => {
          deletePost(image.id, auth)
            .then(() => updateImages())
            .catch(error => console.log('Error deleting image: ', error));
        }}
        alt="Delete"
      />
    </div>
  );
})}
      </div>
    </div>
  );
}

export default Images;


