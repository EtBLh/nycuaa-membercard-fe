import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { api } from '@/lib/utils';
import { logout } from '@/store';
import { RootState } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { IdCard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';

const DownloadMemberCardForm = () => {

    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth?.token ?? '');

    const { data: member } = useQuery({
        queryKey: ['memberdata', token],
        queryFn: () => api.get('/member'),
        select: res => res.data
    })

    if (!token) return;

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl flex flex-col items-center justify-center gap-2">
                    <IdCard className='w-[64px] h-[64px]' />
                    <span>會員證製作成功!</span>
                </CardTitle>
                <CardDescription>
                    會員證已寄到 {member?.email ? member.email : 'loading...'}
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col w-full'>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Button onClick={() => dispatch(logout())} disabled={false} variant='outline'>
                        登出
                    </Button>
                    <a href={`${import.meta.env.VITE_API_HOST}/api/download/member_pass.pkpass?token=${token}`} download>
                        <Button disabled={false}>
                            {
                                isMobile ? '新增會員證到錢包' : '下載會員證'
                            }
                        </Button>
                    </a>
                </div>
                <Link to='/help' className='text-sm self-end mt-4 -mb-2' style={{textDecoration: 'underline'}}>無法加入到錢包？</Link>
            </CardContent>
        </Card>
    );
};

export default DownloadMemberCardForm;
