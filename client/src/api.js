import axios from 'axios';

// יצירת אינסטנס של axios (זה בדיוק כמו axios, אבל אפשר להוסיף לו הגדרות גלובליות)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/', 
});
console.log('API Base URL:', import.meta.env.VITE_API_URL || '/');
console.log('API Base URL:', api.defaults.baseURL);
let isToastVisible = false;
// כאן אנחנו מוסיפים interceptor - קוד שרץ אוטומטית כשיש תגובת שגיאה
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 429) {
        if (api.toast?.current && !isToastVisible) {
          isToastVisible = true; // Prevent multiple toasts
          api.toast.current.show({
            severity: 'warn',
            summary: 'Warning',
            detail: 'You have sent too many requests. Please try again later.',
            life: 2000,
          });
            setTimeout(() => {
                isToastVisible = false; // Reset after 2 seconds
            }, 2000);
        } else {
            if(!isToastVisible) {
                isToastVisible = true; // Prevent multiple alerts
                alert('You have sent too many requests. Please try again later.');
                setTimeout(() => {
                    isToastVisible = false; // Reset after 2 seconds
                }, 2000);
            }
        }
      }
      return Promise.reject(error);
    }
  );
  
export default api;
