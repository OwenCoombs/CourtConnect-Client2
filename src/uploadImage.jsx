import React, { useContext, useState } from 'react';
import { Context } from './context';
import { createImage } from './api';
import { ToastContainer, toast } from 'react-toastify';


const UploadImage = ({ updateImages }) => {
  const { auth } = useContext(Context);
  const [image, setImage] = useState(undefined);
  const [title, setTitle] = useState('');
  const [desc, seetDesc] = useState('')

  const submit = async () => {
    try {
      console.log('Title value:', title);
      await createImage({ auth, image, title, desc });
      toast.success("Image uploaded")
      console.log('Image uploaded successfully');
      updateImages();
      clearForm();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const clearForm = () => {
    setImage(undefined);
    setTitle('');
    seetDesc('');
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
      <div className="input-group">
        <label className="input-label">Post Descriptions</label>
        <input 
          type="text"
          className="input-field"
          onChange={e => seetDesc(e.target.value)}
          value={desc}
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



