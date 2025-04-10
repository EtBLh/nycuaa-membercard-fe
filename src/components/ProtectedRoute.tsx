import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { api } from '@/lib/utils';
import { logout } from '@/store';

export default function ProtectedRoute(props: { isAdmin?: boolean }) {
  const token = useSelector((state: RootState) => state.auth?.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginUrl = props.isAdmin ? '/admin/login' : 'login';

  React.useEffect(() => {
    if (!token) {
      navigate(loginUrl);
    } else {
      const apiUrl = props.isAdmin ? '/admin/check_token' : '/member/check_token';
      api.post(apiUrl, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            dispatch(logout())
            navigate(loginUrl);
          }
        })
        .catch((err) => {
          if (err.status !== 200) {
            dispatch(logout())
            navigate(loginUrl);
          }
        })
    }
  }, [token, navigate]);

  return <Outlet />;
}
