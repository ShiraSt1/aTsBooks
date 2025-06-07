import { useEffect, useRef, useState } from 'react';
import home from '../Styles/home.jpg';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { getConfig } from '../config';
import { Toast } from 'primereact/toast';

const Home = () => {
  const apiUrl = getConfig().API_URL;
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}api/course/newsLetter`, e.target, {
        // const res = await axios.post(`${process.env.REACT_APP_API_URL}api/course/newsLetter`, e, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      if (res.status === 201 || res.status === 200) {
        setSubscribed(true);
      } else {
        toast.current.show({ severity: 'error', detail: 'There was a problem sending your message.', life: 3000 });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.current.show({ severity: 'error', detail: 'There was a problem sending your message.', life: 3000 });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="home-container">
      <Toast ref={toast} />

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
          {loading && (
            <div className="loading-container">
              <ProgressSpinner style={{ width: '30px', height: '30px' }} />
              <p>Your request is being processed...</p>
            </div>
          )}
          <p>Subscribe to get the latest updates and news</p>
          <form className="newsletter-form" onSubmit={e => handleSubmit(e)}>
            {subscribed ? (
              <div className="thank-you-message">Thank you for subscribing</div>
            ) : (
              <>
                <input name="email" type="email" placeholder="Enter your email" required />
                <input name="name" type="text" placeholder="Enter your name" required />
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
