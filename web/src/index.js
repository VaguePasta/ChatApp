import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import Dashboard from "./dashboard/dashboard";
import {LogInPrompt} from "./auth/login";
import {RegisterPrompt} from "./auth/register";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                    <Route path="login" element={<LogInPrompt />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="register" element={<RegisterPrompt/>}/>
                    <Route path="*" element={<Navigate to="/login" replace />}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);