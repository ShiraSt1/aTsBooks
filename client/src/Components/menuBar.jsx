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
    { label: 'Contact Us', icon: 'pi pi-phone', command: () => navigate('/contact') },
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
