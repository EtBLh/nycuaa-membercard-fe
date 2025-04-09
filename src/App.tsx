import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HomePage from './page/home/index.tsx'
import MemberCardPage from './page/membercard'
import AdminPage from './page/admin'
import CheckInPage from './page/checkIn'
import LoginPage from "./page/login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

function App() {

  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/login" />}/>
          <Route path='admin' element={<AdminPage />}/>
          <Route path='login' element={<LoginPage />}/>

          <Route element={<ProtectedRoute />}>
            <Route path='home' element={<HomePage />}/>
            <Route path='check-in' element={<CheckInPage />}/>
            <Route path='membercard' element={<MemberCardPage />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
