import { useEffect } from 'react';
import home from '../Styles/home.jpg';
import { getConfig } from './config';

const Home = () => {
  const apiUrl = getConfig().API_URL;

  useEffect(() => {
    console.log("API URL:", apiUrl);
  }, [])

  return (
    <div className="home-container">
      <div className="image-section">
        <img src={home} alt="Centered Image" />
      </div>
      <div className="info-section">
        <h2>:Contact Us</h2>
        <div className="manager-info">
          <p><strong>Name: </strong>Tami Stern</p>
          <p><strong>Email: </strong>tami@meler.info</p>
          {/* <p><strong>Email:</strong> <a href="mailto:tami@meler.info">tami@meler.info</a></p> */}
          <p><strong>Phone Number: </strong>0527658752</p>
        </div>
        <div className="manager-info">
          <p><strong>Name: </strong>Ayelet Toledano</p>
          <p><strong>Email: </strong>a0533132260@gmail.com</p>
          <p><strong>Phone Number: </strong>0533132260</p>
        </div>
      </div>
    </div>
  );
};

export default Home;