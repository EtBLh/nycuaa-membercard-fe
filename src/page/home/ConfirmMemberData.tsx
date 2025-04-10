import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from '@/lib/utils';
import { nextStep, prevStep } from '@/redux/memberHomeSlice';
import { RootState } from '@/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, Info } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ConfirmMemberDataForm = () => {
  const token = useSelector<RootState>(state => state.auth?.token);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const { data: member, isLoading: memberLoading, isError: memberError } = useQuery({
    queryKey: ['memberdata', token],
    queryFn: () => api.get('/member'),
    select: res => res.data
  })

  const { mutate: make, isPending: makeLoading, isError: makeError } = useMutation({
    mutationFn: async () => {
      const res = await api.post('/member/pass');
      await new Promise(res => setTimeout(res, 3000))
      return res;
    },
    onSuccess: (res) => {
      if (res.status === 200) dispatch(nextStep())
      else {
        setErrorMessage('出錯了 QQ')
      }
    },
    onError: (err: AxiosError) => {
      if (err.status === 403) {
        setErrorMessage('會員尚未繳費QQ')
      }
    }
  })

  const loading = memberLoading || makeLoading;

  return (
    <Card className='relative'>
      <Button onClick={() => dispatch(prevStep())} variant='ghost' className='absolute top-2 left-2 w-[36px] h-[36px]'>
        <ArrowLeft />
      </Button>
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex flex-row items-center justify-center gap-2">
          Step 2: 確認會員資料
        </CardTitle>
        <CardDescription>

          <TooltipProvider>

            <Tooltip>
              請確認以下資訊無誤，如有錯誤請聯繫校友總會

              <TooltipTrigger asChild>
                <Info className='inline-block w-[16px] h-[16px] ml-1' />
              </TooltipTrigger>

              <TooltipContent>
                <p>電子郵箱: email@nycuaa.org</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {member ? (
          <div className="grid gap-x-2 gap-y-4 grid-cols-[1fr_3fr] ">
            <Label>姓名</Label>
            <Input value={member.name} readOnly />
            <Label>身分證號</Label>
            <Input value={member.govid} readOnly />
            <Label>電子郵件</Label>
            <Input value={member.email} readOnly />
            <Label>繳費狀態</Label>
            <Badge className='my-1' variant={member.permit ? undefined : 'destructive'}>
              {
                member.permit ? '已繳費！' : '系統暫無繳費紀錄'
              }
            </Badge>

            <Button className='col-span-2' onClick={() => { make() }} disabled={loading}>
              {
                loading ? <Spinner className='text-[black]' size={"small"} /> : "製作會員證！"
              }
            </Button>
            {makeError && errorMessage && <p className="text-sm text-destructive text-center col-span-2">{errorMessage}</p>}
          </div>
        ) : null}
        {
          memberLoading ? (
            <div className="text-center text-muted-foreground">
              會員資料載入中...
            </div>
          ) : null}
        {
          memberError ? (
            <div className="text-center text-muted-foreground">
              會員資料載入出錯了QAQ
            </div>
          ) : null
        }
      </CardContent>
    </Card>
  );
};

export default ConfirmMemberDataForm;
