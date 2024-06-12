import React, { useContext, useEffect, useState } from "react";
import { Context } from "./context";
import { getImages } from "./api";

const Images = () => {
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

    return (
      <div className="images-container">
        <h1 className="text-center p-4">Your Feed</h1>
        <div className="images-grid">
          {images && images.map(image => (
            <div key={image.id} className="image-post">
              <img 
                src={`http://127.0.0.1:8000${image.image}`}  // Remove the extra slash before image.image
                alt={image.id}
                className="image-post-img"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

export default Images;
