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
import { IMemberData } from '@/redux/memberDataSlice';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const ConfirmMemberDataForm = (props: { next: () => void }) => {
  const [member, setMember] = useState<IMemberData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await api.get('/member');
        setLoading(false);
        setMember(res.data);
      } catch (err) {
        console.error('Error fetching member data:', err);
      }
    };

    fetchMember();
  }, []);

  const make = async () => {
    try {
      setLoading(true);
      const res = await api.post('/member/pass');
      await new Promise(res => setTimeout(res, 5000))
      setLoading(false);
      if (res.status === 200) {
        props.next();
      } else {
        setLoading(false);
        alert('出錯了 QQ')
      }
    } catch (err) {
      setLoading(false);
      console.error('製作會員證時出錯了，請稍後再試:', err);
    }
  }

  return (
    <Card>
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
          <div className="grid gap-4">
            <div className="flex gap-2">
              <Label className="w-1/4">會員編號</Label>
              <Input value={member.id} readOnly />
            </div>
            <div className="flex gap-2">
              <Label className="w-1/4">姓名</Label>
              <Input value={member.name} readOnly />
            </div>
            <div className="flex gap-2">
              <Label className="w-1/4">身分證號</Label>
              <Input value={member.govid} readOnly />
            </div>
            <div className="flex gap-2">
              <Label className="w-1/4">電子郵件</Label>
              <Input value={member.email} readOnly />
            </div>

            <Button onClick={() => { make() }} disabled={loading}>
              {
                loading ? <Spinner className='text-[black]' size={"small"} /> : "製作會員證！"
              }
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            會員資料載入中...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfirmMemberDataForm;
