import CardLayout from '@/components/CardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/utils';
import { clearToken, setToken } from '@/redux/authSlice';
import { RootState } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { IdCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

type LoginFormData = {
  govid: string;
  name: string;
  code: string;
};

export default function LoginPage() {
  const { register, handleSubmit, watch, setValue } = useForm<LoginFormData>();
  const code = watch('code')
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setVerify] = useState(false);
  const [membermail, setMemberMail] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);

  const check_token = useMutation({
    mutationKey: ['check_token', token],
    mutationFn: () => {
      return api.post('/member/check_token')
    },
    onSuccess: (res) => {
      if (res.status === 200) {
        navigate('/home');
      } else {
        dispatch(clearToken())
      }
    },
    onError: () => {
      dispatch(clearToken())
    }
  })
  useEffect(() => {
    if (!token) {
      dispatch(clearToken())
    } else {
      check_token.mutate()
    }
  }, [token])

  const { mutate: onLogin, isPending: loginLoading, error: loginError } = useMutation({
    mutationFn: (data: LoginFormData) => api.post('/login', {
      govid: data.govid,
      name: data.name
    }),
    onSuccess: (res) => {
      if (res.status === 200) {
        setVerify(true);
        setMemberMail(res.data.email)
        setErrorMessage('');
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

  const { mutate: onVerify, isPending: verifyLoading, error: verifyError } = useMutation({
    mutationFn: (data: LoginFormData) => api.post('/otp_verify', {
      govid: data.govid,
      name: data.name,
      code: data.code
    }),
    onSuccess: (res) => {
      if (res.status === 200) {
        dispatch(setToken(res.data.token ?? ''));
        navigate('/home');
      } else {
        setErrorMessage('OTP驗證碼不正確(´ﾟдﾟ`)');
      }
    },
    onError: (err: AxiosError) => {
      if (err.status === 401) {
        setErrorMessage('驗證碼輸入錯誤');
      } else {
        setErrorMessage('哇系統出錯了(´ﾟдﾟ`)');
      }
    }
  })

  const loading = loginLoading || verifyLoading;
  const error = loginError || verifyError;

  return <CardLayout>
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex flex-row items-center justify-center gap-2">
          <IdCard className='w-[32px] h-[32px]' />會員證系統
        </CardTitle>
        <CardDescription>
          {
            isVerifying ? `驗證碼已寄到郵箱 ${membermail}` : '請輸入身分證號碼和姓名以登入'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => isVerifying ? onVerify(data) : onLogin(data))}>
          <div className="grid gap-6">
            {!isVerifying && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">會員姓名</Label>
                  <Input id="name" {...register('name')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="govid">會員身份證號碼</Label>
                  <Input id="govid" {...register('govid')} />
                </div>
              </>
            )}
            {isVerifying && (
              <div className="grid gap-2">
                <div className='flex items-center justify-center pb-2'>
                  <InputOTP maxLength={6} value={code} onChange={code => setValue('code', code)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {
                loading ? <Spinner className='text-[black]' size={"small"} /> : (isVerifying ? '登入' : '取得驗證碼')
              }
            </Button>
            {error && errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
            <div className="text-right text-sm">
              <Link to="/" className="underline underline-offset-4">
                系統管理員按這𥚃！
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </CardLayout>
}
