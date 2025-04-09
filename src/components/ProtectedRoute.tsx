import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { api } from '@/lib/utils';
import { clearToken } from '@/redux/authSlice';

export default function ProtectedRoute() {
  const token = useSelector((state: RootState) => state.auth?.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
        api.post('/member/check_token', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status !== 200) {
            dispatch(clearToken())
            navigate('/login');
          }
        })
        .catch((err) => {
          if (err.status !== 200) {
            dispatch(clearToken())
            navigate('/login');
          }
        })
    }
  }, [token, navigate]);

  return <Outlet />;
}
