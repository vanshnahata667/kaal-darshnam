import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import Login from '../app/login/page';
import '../app/globals.css';
import '../app/login.css';
import '../app/gallery.css';
createRoot(document.getElementById('root')!).render(location.pathname==='/login'?<Login/>:<Home/>);
