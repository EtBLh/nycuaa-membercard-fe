import CardLayout from '@/components/CardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/utils';
import { setToken } from '@/redux/authSlice';
import { logout, RootState } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { IdCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

type LoginFormData = {
  account: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);

  const check_token = useMutation({
    mutationKey: ['check_token', token],
    mutationFn: () => {
      return api.post('/admin/check_token')
    },
    onSuccess: (res) => {
      if (res.status === 200) {
        navigate('/admin/home');
      } else {
        dispatch(logout())
      }
    },
    onError: () => {
      dispatch(logout())
    }
  })
  useEffect(() => {
    if (!token) {
      dispatch(logout())
    } else {
      check_token.mutate()
    }
  }, [token])

  const { mutate: onLogin, isPending: loading, error } = useMutation({
    mutationFn: (data: LoginFormData) => api.post('/admin/login', data),
    onSuccess: (res) => {
      if (res.status === 200) {
        dispatch(setToken(res.data.token))
      } else {
        setErrorMessage('資料庫查無此人(´ﾟдﾟ`)');
      }
    },
    onError: (err: AxiosError) => {
      if (err.status === 404) {
        setErrorMessage('資料庫查無此人(´ﾟдﾟ`)');
      } else {
        setErrorMessage('系統出錯了(´ﾟдﾟ`)');
      }
    }
  })

  return <CardLayout>
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex flex-col items-center justify-center gap-2">
          <IdCard className='w-[48px] h-[48px]' />Member Card System Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onLogin(data))}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <Input id="account" {...register('account')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type='password' {...register('password')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {
                loading ? <Spinner className='text-[black]' size={"small"} /> : 'Login'
              }
            </Button>
            {error && errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  </CardLayout>
}
