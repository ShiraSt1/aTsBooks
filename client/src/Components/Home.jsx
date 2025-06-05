import { useEffect, useState } from 'react';
import home from '../Styles/home.jpg';

const Home = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);

  };
  return (
    <div className="home-container">
      <div className="image-section">
        <img src={home} alt="Centered Image" />
      </div>
      <div className="info-section">

        <div className="contact-section">
          <h2>Contact Us</h2>
          <div className="manager-info">
            <p><strong>Name: </strong>Tami Stern</p>
            <p><strong>Email: </strong>tami@meler.info</p>
            <p><strong>Phone Number: </strong>0527658752</p>
          </div>
          <div className="manager-info">
            <p><strong>Name: </strong>Ayelet Toledano</p>
            <p><strong>Email: </strong>a0533132260@gmail.com</p>
            <p><strong>Phone Number: </strong>0533132260</p>
          </div>
        </div>

        <div className="newsletter-section">
          <h2>Join our Newsletter</h2>
          <p>Subscribe to get the latest updates and news</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            {subscribed ? (
              <div className="thank-you-message">Thank you for subscribing</div>
            ) : (
              <>
                <input type="email" placeholder="Enter your email" required />
                <input type="text" placeholder="Enter your name" required />
                <button type="submit">Subscribe</button>
              </>
            )}
          </form>
        </div>
      </div>

    </div>
  );
};
export default Home;
