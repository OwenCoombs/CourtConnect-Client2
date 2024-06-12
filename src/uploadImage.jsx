import React, { useContext, useState } from 'react';
import { Context } from './context';
import { createImage } from './api';

const UploadImage = ({ updateImages }) => {
    const { auth } = useContext(Context);
    const [image, setImage] = useState(undefined);

    const handleInputChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleClick = () => {
        document.getElementById('file-input').click();
    };

    const submit = () => {
        createImage({ auth, image}).then(response => {
            console.log('UPLOAD IMAGE: RESPONSE:  ', response);
            updateImages();
        });
    };

    return (
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
            <input
                accept="image/*"
                className="file-input"
                id="file-input"
                onChange={handleInputChange}
                style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', opacity: '0', cursor: 'pointer' }}
                type="file"
            />
            <div className="button-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} onClick={handleClick}>
                {image ? (
                    <img
                        src={URL.createObjectURL(image)}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccc', borderRadius: '50%' }}>
                        <span style={{ fontSize: '24px', color: '#fff' }}>+</span>
                    </div>
                )}
            </div>
            {image && (
                <div className="button-group" style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <button className="submit-button" onClick={submit}>

                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadImage;


