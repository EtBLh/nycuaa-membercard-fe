import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HomePage from './page/home/index.tsx'
import MemberCardPage from './page/membercard'
import AdminPage from './page/admin'
import CheckInPage from './page/checkIn'
import LoginPage from "./page/login";
import AdminLoginPage from "./page/admin/login";
import HelpPage from "./page/help";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

function App() {

  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/login" />}/>
          <Route path='login' element={<LoginPage />}/>

          <Route element={<ProtectedRoute />}>
            <Route path='home' element={<HomePage />}/>
            <Route path='check-in' element={<CheckInPage />}/>
            <Route path='membercard' element={<MemberCardPage />}/>
            <Route path='help' element={<HelpPage />}/>
          </Route>

          <Route path='admin'>
            <Route path='login' element={<AdminLoginPage />}/>

            <Route element={<ProtectedRoute isAdmin/>}>
              <Route index element={<AdminPage />}/>
            </Route>
          </Route>

          
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
