
import './index.css';
import './flags.css';
import './App.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import React, { Suspense} from 'react';
import { Route, Routes } from 'react-router-dom';
import logo from './Styles/logo.jpg';

import MenuBar from './Components/menuBar';
const LazyGrade = React.lazy(() => import('./Components/Grades'));
const LazyHome = React.lazy(() => import('./Components/Home'));
const LazyLogOut = React.lazy(() => import('./Components/LogOut'));
const LazyRegister = React.lazy(() => import('./Components/Register'));
const LazyLogin = React.lazy(() => import('./Components/login'));
const LazyUser = React.lazy(() => import('./Components/Users'));
const LazyUpdateUser = React.lazy(() => import('./Components/UserUpdate'));
const LazyBook = React.lazy(() => import('./Components/Books'));
const LazyTitles = React.lazy(() => import('./Components/Titles'));
const LazyFileView = React.lazy(() => import('./Components/FileView'));
const LazyEnglishCourseSignUp = React.lazy(() => import('./Components/EnglishCourseSignUp'));

function App() {
  return (
    <div className="App">
       <div className="content">
      <img src={logo} alt="logo" className="app-logo" />

      <MenuBar>
      </MenuBar>
      <Routes>
        <Route path='/login' element={<Suspense fallback="loading..."><LazyLogin /></Suspense>} />
        <Route path='/' element={<Suspense fallback="loading..."><LazyHome /></Suspense>} />
        <Route path='/grades' element={<Suspense fallback="loading..."><LazyGrade /></Suspense>} />
        <Route path='/users' element={<Suspense fallback="loading..."><LazyUser /></Suspense>} />
        <Route path='/logout' element={<Suspense fallback="loading..."><LazyLogOut /></Suspense>} />
        <Route path='/register' element={<Suspense fallback="loading..."><LazyRegister /></Suspense>} />
        <Route path='/update' element={<Suspense fallback="loading..."><LazyUpdateUser /></Suspense>} />
        <Route path='/books' element={<Suspense fallback="loading..."><LazyBook /></Suspense>} />
        <Route path="/books/:gradeId" element={<Suspense fallback="loading..."><LazyBook /></Suspense>} />
        <Route path="/titles/:bookId" element={<Suspense fallback="loading..."><LazyTitles /></Suspense>} />
        <Route path="/fileview/:fileId" element={<Suspense fallback="loading..."><LazyFileView /></Suspense>} />
        <Route path="/course" element={<Suspense fallback="loading..."><LazyEnglishCourseSignUp /></Suspense>} />
      </Routes>
      </div>
    </div>
  );
}

export default App;