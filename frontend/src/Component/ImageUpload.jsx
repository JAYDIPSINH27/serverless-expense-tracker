import React, { useState } from 'react';

function ImageUpload() {
  const [imageData, setImageData] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        setImageData(event.target.result);
      };
      reader.readAsDataURL(file);

    }
  };

  const uploadImage = async () => {
    if (imageData) {
      console.log(imageData)
      try {
        const response = await fetch('https://2g53ew3x4g.execute-api.us-east-1.amazonaws.com/test/image-upload', {
          method: 'POST',
          body: JSON.stringify({ image: imageData }),
          headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
          }
        });
        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div>
      <h1>Image Uploader</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={uploadImage}>Upload Image</button>
      {imageData && (
        <img src={imageData} alt="Uploaded" style={{ maxWidth: '100%', marginTop: '20px' }} />
      )}
    </div>
  );
}

export default ImageUpload;