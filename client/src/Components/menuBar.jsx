// import React, { Suspense, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Menubar } from 'primereact/menubar';
// import { Button } from 'primereact/button';
// import { setToken, logOut } from '../redux/tokenSlice'
// import { useDispatch, useSelector } from 'react-redux';
// import UpdateUser from './UserUpdate';
// import EnglishCourseSignUp  from './EnglishCourseSignUp'

// const MenuBar = () => {
//   const [showUpdateDialog, setShowUpdateDialog] = useState(false);
//   const { token } = useSelector((state) => state.token);
//   const { user } = useSelector((state) => state.token);
//   const dispatch = useDispatch();
//   const [menuVisible, setMenuVisible] = useState(false); // מצב הצגת התפריט
//   const navigate = useNavigate();
  
//   const userMenu = [
//     !token ? {
//       label: 'Register',
//       icon: 'pi pi-user-plus',
//       command: () => {
//         navigate('/register');
//         setMenuVisible(false);
//       }
//     } : {
//       label: 'Update User',
//       icon: 'pi pi-user-edit',
//       command: () => {
//         setShowUpdateDialog(true)
//         setMenuVisible(false);
//       }
//     },
//     {
//       label: token ? "LogOut": 'Login',
//       icon: 'pi pi-user',
//       command: () => {
//         if (token) {
//           dispatch(logOut())
//           navigate('/');
//         } else {
//           navigate('/login');
//         }
//       }
//     }
//   ];

//   // הכפתור בצד ימין, עם שם המשתמש, לצד החץ
//   const end = (
//     <div className="user-container">
//          {user?.name || 'User Name'}
//       <Button
//         icon="pi pi-caret-down"
//         className="user-dropdown"
//         onClick={() => setMenuVisible(!menuVisible)}
//         style={{ marginLeft: '5px', background: 'transparent', border: 'none' }}
//       />
//       {menuVisible && (
//         <div className="dropdown-menu">
//           {userMenu.map((item, index) => (
//             <div key={index} onClick={item.command}>
//               <span>{item.label}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const items1 = [
//     {
//       label: 'Home',
//       icon: 'pi pi-home',
//       command: () => {
//         navigate('/');
//       }
//     },
//     {
//       label: 'Grades',
//       // icon: 'pi pi-user',
//       command: () => {
//         navigate('./grades');
//       }
//     },
//       {
//         label: 'Books',
//         icon: 'pi pi-book',
//         command: () => {
//           navigate('/books');
//         }
//     },
//     {
//       label: 'Contact Us',
//       icon: 'pi pi-phone',
//       command: () => {
//         navigate('/course');
//       }},
//    ]

//   const items2 = [
//     {
//       label: 'Home',
//       icon: 'pi pi-home',
//       command: () => {
//         navigate('/');
//       }
//     },
//     {
//       label: 'Grades',
//       // icon: 'pi pi-user',
//       command: () => {
//         navigate('/grades');
//       }
//     },
//     {
//       label: 'Books',
//       icon: 'pi pi-book',
//       command: () => {
//         navigate('/books');
//       }
//     },
//     {
//       label: 'Users',
//       icon: 'pi pi-users',
//       command: () => {
//         navigate('/users');
//       }
//     }
//   ];

//   return (
//     <>
//       <div className="card-menuBar">
//       { 
//       user?
//       <UpdateUser
//           visible={showUpdateDialog}
//           onHide={() => setShowUpdateDialog(false)}
//           user={user}
//         /> :<></>}{
//           user?.roles=="Admin" ?
//             <Menubar model={items2}
//               end={end}
//             /> : <Menubar model={items1}
//             end={end}
//             />}
//       </div>
//     </>
//   )
// };

// export default MenuBar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { logOut } from '../redux/tokenSlice';
import { useDispatch, useSelector } from 'react-redux';
import UpdateUser from './UserUpdate';

const MenuBar = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const { token, user } = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/');
  };

  const authButtons = (
    <div className="auth-buttons">
      {token ? (
        <>
          <span className="user-name">{user?.name}</span>
          <Button
            label="Update"
            icon="pi pi-user-edit"
            className="p-button-text slim-button custom-button"
            onClick={() => setShowUpdateDialog(true)}
          />
          <Button
            label="Log-Out"
            icon="pi pi-sign-out"
            className="p-button-text slim-button custom-button"
            onClick={handleLogout}
          />
        </>
      ) : (
        <>
          <Button
            label="Register"
            icon="pi pi-user-plus"
            className="p-button-text slim-button custom-button"
            onClick={() => navigate('/register')}
          />
          <Button
            label="Log-In"
            icon="pi pi-sign-in"
            className="p-button-text slim-button custom-button"
            onClick={() => navigate('/login')}
          />
        </>
      )}
    </div>
  );

  const commonItems = [
    { label: 'Home', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'Grades', command: () => navigate('/grades') },
    { label: 'Books', icon: 'pi pi-book', command: () => navigate('/books') },
  ];

  const adminItems = [
    ...commonItems,
    { label: 'Users', icon: 'pi pi-users', command: () => navigate('/users') },
  ];

  const regularItems = [
    ...commonItems,
    { label: 'Contact Us', icon: 'pi pi-phone', command: () => navigate('/course') },
  ];

  return (
    <>
      <div className="card-menuBar">
        {user && (
          <UpdateUser
            visible={showUpdateDialog}
            onHide={() => setShowUpdateDialog(false)}
            user={user}
          />
        )}
        <Menubar
          model={user?.roles === 'Admin' ? adminItems : regularItems}
          end={authButtons}
        />
      </div>
    </>
  );
};

export default MenuBar;
