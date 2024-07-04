import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import {Dashboard} from "./dashboard/dashboard";
import {LogInPrompt} from "./auth/login";
import {RegisterPrompt} from "./auth/register";
import {Profile} from "./settings/profile";
import {ToastContainer} from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
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
    </React.StrictMode>
);