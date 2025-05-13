import React, { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { setToken, logOut } from '../redux/tokenSlice'
import { useDispatch, useSelector } from 'react-redux';
import UpdateUser from './UserUpdate';
import EnglishCourseSignUp  from './EnglishCourseSignUp'

const MenuBar = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const { token } = useSelector((state) => state.token);
  const { user } = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false); // מצב הצגת התפריט
  const navigate = useNavigate();
  const userMenu = [
    !token ? {
      label: 'Register',
      icon: 'pi pi-user-plus',
      command: () => {
        navigate('./Register');
        setMenuVisible(false);
      }
    } : {
      label: 'Update User',
      icon: 'pi pi-user-edit',
      command: () => {
        setShowUpdateDialog(true)
        setMenuVisible(false);
      }
    },
    {
      label: token ? "LogOut": 'Login',
      icon: 'pi pi-user',
      command: () => {
        if (token) {
          dispatch(logOut())
          navigate('/Home');
        } else {
          navigate('./Login');
        }
      }
    }
  ];

  // הכפתור בצד ימין, עם שם המשתמש, לצד החץ
  const end = (
    <div className="user-container">
         {user?.name || 'User Name'}
      <Button
        icon="pi pi-caret-down"
        className="user-dropdown"
        onClick={() => setMenuVisible(!menuVisible)}
        style={{ marginLeft: '5px', background: 'transparent', border: 'none' }}
      />
      {menuVisible && (
        <div className="dropdown-menu">
          {userMenu.map((item, index) => (
            <div key={index} onClick={item.command}>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const items1 = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => {
        navigate('./Home');
      }
    },
    {
      label: 'Grades',
      icon: 'pi pi-user',
      command: () => {
        navigate('./Grades');
      }
    },
      {
        label: 'Books',
        icon: 'pi pi-user',
        command: () => {
          navigate('./Books');
        }
    },
    {
      label: 'Course',
      icon: 'pi pi-user',
      command: () => {
        navigate('./Course');
      }},
   ]

  const items2 = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => {
        navigate('./Home');
      }
    },
    {
      label: 'Grades',
      icon: 'pi pi-user',
      command: () => {
        navigate('./Grades');
      }
    },
    {
      label: 'Books',
      icon: 'pi pi-user',
      command: () => {
        navigate('./Books');
      }
    },
    {
      label: 'Users',
      icon: 'pi pi-user',
      command: () => {
        navigate('./Users');
      }
    }
  ];

  return (
    <>
      <div className="card-menuBar">
      { 
      user?
      <UpdateUser
          visible={showUpdateDialog}
          onHide={() => setShowUpdateDialog(false)}

          user={user}
        /> :<></>}{
          user?.roles=="Admin" ?
            <Menubar model={items2}
              end={end}
            /> : <Menubar model={items1}
            end={end}
            />}
      </div>
    </>
  )
};

export default MenuBar;