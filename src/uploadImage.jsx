import React, { useContext, useState } from 'react';
import { Context } from './context'; // Adjust the import if necessary
import { createImage } from './api'; // Adjust the import if necessary


 const UploadImage = ({ updateImages }) => {
  const { auth } = useContext(Context);
  const [image, setImage] = useState(undefined);
  const [title, setTitle] = useState('');

  const submit = async () => {
    try {
      await createImage({ auth, image, title });
      console.log('Image uploaded successfully');
      updateImages(); // Call the function to update images after successful upload
      clearForm(); // Clear form fields after successful upload
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const clearForm = () => {
    setImage(undefined);
    setTitle('');
  };

  return (
    <div className="upload-container">
      <label htmlFor="file-input" className="upload-button">
        +
        <input 
          id="file-input"
          accept="image/*" 
          className="file-input"
          onChange={e => setImage(e.target.files[0])}
          type="file" 
        />
      </label>
      <div className="upload-title">Upload Post</div>
      <div className="input-group">
        <label className="input-label">Post Title</label>
        <input 
          type="text"
          className="input-field"
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
      </div>
      <div className="button-group">
        <button className="submit-button" onClick={submit}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadImage;



  


