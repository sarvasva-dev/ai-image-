import { useEffect, useState } from "react";

import API from "../api";

export default function HistoryGallery() {

  const [images, setImages] = useState([]);

  useEffect(() => {

    API.get("/history").then((res) => {

      setImages(res.data);

    });

  }, []);

  return (

    <div>

      <h3>History</h3>

      {images.map((img) => (

        <img
          key={img.id}
          src={`http://localhost:8000/${img.path}`}
          width="150"
        />

      ))}

    </div>

  );

}