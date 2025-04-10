import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HomePage from './page/home/index.tsx'
import MemberCardPage from './page/membercard'
import LoginPage from "./page/login";
import HelpPage from "./page/help";
import AdminLoginPage from "./page/admin/login";
import AdminPage from './page/admin/home'
import AdminLayout from "./page/admin/layout"
import AdminCheckInRecordPage from "./page/admin/checkin-record"
import AdminBulkAddPage from "./page/admin/bulk-add"

import CheckInPage from './page/admin/checkin/index'
import ProtectedRoute from "./components/ProtectedRoute";

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
              <Route element={<AdminLayout />}>
                <Route path='home' element={<AdminPage />}/>
                <Route path='checkin-record' element={<AdminCheckInRecordPage />}/>
                <Route path='bulk-add' element={<AdminBulkAddPage />}/>
                <Route path='conference/checkin' element={<CheckInPage />}/>
              </Route>
            </Route>
          </Route>

          
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
