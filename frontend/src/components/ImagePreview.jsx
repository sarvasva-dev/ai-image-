const ImagePreview = ({ image }) => {
  if (!image) return null;

  return (
    <div className="image-preview">
      <img src={`http://127.0.0.1:8000${image}`} alt="Generated" />
    </div>
  );
};

export default ImagePreview;