let config = null;

export const loadConfig = async () => {
  const res = await fetch('/config.json');
  config = await res.json();
};

export const getConfig = () => config;
// "API_URL": "http://localhost:3001/"
// "API_URL": "https://atsbooks.onrender.com/"