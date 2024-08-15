import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import {Dashboard} from "./dashboard/dashboard";
import {LogInPrompt} from "./auth/login";
import {RegisterPrompt} from "./auth/register";
import {Profile} from "./settings/profile";
import {ToastContainer} from "react-toastify";
import {BrowserView, MobileView} from "react-device-detect";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <body>
        <BrowserView>
            <BrowserRouter>
                <Routes>
                        <Route path="login" element={<LogInPrompt />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="register" element={<RegisterPrompt/>}/>
                        <Route path="profile" element={<Profile/>}/>
                        <Route path="*" element={<Navigate to="/login" replace />}/>
                </Routes>
                <ToastContainer autoClose={3500} limit={5}/>
            </BrowserRouter>
        </BrowserView>
        <MobileView>
            <div>This web application is not supported on mobile devices.</div>
        </MobileView>
    </body>
);