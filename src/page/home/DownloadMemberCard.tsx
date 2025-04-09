import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { clearToken } from '@/redux/authSlice';
import { RootState } from '@/store';
import { IdCard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

const DownloadMemberCardForm = () => {

    const dispatch = useDispatch();
    const token = useSelector((state:RootState) => state.auth?.token ?? '');

    const logout = () => {
        dispatch(clearToken());
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl flex flex-col items-center justify-center gap-2">
                    <IdCard className='w-[64px] h-[64px]' />
                    <span>會員證製作成功!</span>
                </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-row items-center justify-center gap-2'>
                <Button onClick={logout} disabled={false} variant='outline'>
                    登出
                </Button>
                <a href={`${import.meta.env.VITE_API_HOST}/api/download/member_pass.pkpass?token=${token}`} download>
                    <Button disabled={false}>
                        下載會員證
                    </Button>
                </a>
            </CardContent>
        </Card>
    );
};

export default DownloadMemberCardForm;
