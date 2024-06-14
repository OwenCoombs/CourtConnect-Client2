import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context";
import { getImages } from "./api";
import UploadImage from "./uploadImage";
import axios from "axios";
import { baseUrl } from "./api";
import { deletePost } from "./api";
import Logo from './assets/medialogo.svg'
import Trash from './assets/trash-solid.svg'

const Images = () => {
  const [images, setImages] = useState([]);
  const { auth } = useContext(AuthContext);

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

  return (
    <div className="images-container">
      <h1 className="text-center p-4">Your Feed</h1>
      <div className="images-grid">
        {images && images.map(image => (
          <div key={image.pk} className="image-post">
            <img 
              src={`http://127.0.0.1:8000/${image.image}`}  
              alt={image.title}
              className="image-post-img"
            />
            <h4 className="image-post-title">{image.title}</h4>
            <p className="text-center">{image.description}</p>
            <img id='trash' src={Trash} onClick={() => {
            deletePost(image.id, { auth })
            .then(() => updateImages())
            .catch(error => console.log('Error deleting image: ', error));
            }}></img>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Images;
