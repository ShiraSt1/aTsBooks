const LogOut =() =>{  
  localStorage.removeItem('loggedInUser');
      return(
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          
          <h3>Logging out...</h3>
         </div>
       );}
    
     export default LogOut;