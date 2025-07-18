import axios from 'axios';

// יצירת אינסטנס של axios (זה בדיוק כמו axios, אבל אפשר להוסיף לו הגדרות גלובליות)
const api = axios.create({
  baseURL: "http://localhost:3001/", 
});

// כאן אנחנו מוסיפים interceptor - קוד שרץ אוטומטית כשיש תגובת שגיאה
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 429) {
        if (api.toast?.current) {
          api.toast.current.show({
            severity: 'warn',
            summary: 'הגבלת קצב',
            detail: 'You have sent too many requests. Please try again later.',
            life: 4000,
          });
        } else {
          alert('You have sent too many requests. Please try again later.');
        }
      }
      return Promise.reject(error);
    }
  );
  
export default api;
