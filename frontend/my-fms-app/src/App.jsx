import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Login  , Home } from './components'
import {Toaster} from "react-hot-toast";
import ProtectedRoute from "./shared/ProtectedRoute.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import PublicRoute from "./shared/PublicRoute.jsx";
import {PublicClientApplication} from "@azure/msal-browser";
import {msalConfig} from "@/Utils/msalAuthConfig.js";
import {MsalProvider} from "@azure/msal-react";
const router = createBrowserRouter([
  {path : "/" , element :<PublicRoute><Login/></PublicRoute> },
  {path : "/home" , element : <ProtectedRoute><Home/></ProtectedRoute>}
])

const msalConstant = new PublicClientApplication(msalConfig);

function App() {

  return (
    <>
        <MsalProvider instance={msalConstant}>
            <AuthProvider>
                <RouterProvider router={router}></RouterProvider>
                <Toaster/>
            </AuthProvider>
        </MsalProvider>

    </>
  )
}

export default App
