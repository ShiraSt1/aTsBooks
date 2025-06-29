import { useEffect, useRef, useState } from 'react';
import home from '../Styles/home.jpg';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { getConfig } from '../config';
import { Toast } from 'primereact/toast';
import { Helmet } from 'react-helmet-async';

const Home = () => {

  const apiUrl = getConfig().API_URL;
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    const name = e.target.elements.name.value;
    const email = e.target.elements.email.value;
    const data = { name, email };
    setSubscribed(false);
    try {
      const res = await axios.post(`${apiUrl}api/course/newsLetter`, data, {
        headers: {
          "Content-Type": "application/json",
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
      <Helmet>
        <title>aTsBooks | Home</title>
        <meta name="description" content="Discover the joy of learning English with our wide selection of books and learning materials for kids, teens, and adults. Fun, effective, and engaging!" />
        <meta name="keywords" content="learn English, English books, English for kids, English reading, ESL resources, English workbooks, English learning materials" />
        <meta property="og:title" content="Learn English Through Stories and Books" />
        <meta property="og:description" content="Explore our collection of English books and resources for all levels. Start your English learning journey today!" />
        <meta property="og:type" content="website" />
      </Helmet>
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
