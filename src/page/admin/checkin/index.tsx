import { IConference } from '@/lib/types';
import { api } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleCheck } from 'lucide-react';
import CheckInStep1 from '@/assets/checkin-step1.png'
import CheckInStep2 from '@/assets/checkin-step2.png'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { QRCodeSVG } from 'qrcode.react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

const Page = () => {

    const [selectedConf, setConf] = useState<number | null>(null);
    const [memberName, setMemberName] = useState<string>('');

    const onScan = (result: IDetectedBarcode[]) => {
        if (selectedConf === null) {
            alert('select a conference first');
            return;
        }
        submitCheckinRecord(result[0].rawValue)
    }

    const { data: conferences, isLoading } = useQuery({
        queryKey: ['conference'],
        queryFn: () => api.get<{ conferences: IConference[] }>(`/admin/conferences?today=1`),
        select: (res) => res.data.conferences
    })
    useEffect(() => {
        if (!selectedConf && conferences && conferences.length > 0) {
            setConf(conferences[0].id);
        }
    }, [conferences])

    const { mutate: submitCheckinRecord } = useMutation({
        mutationFn: (qrcode: string) => api.post(`/admin/conference/${selectedConf}/check-in`, { qrcode }),
        onSuccess: (res) => {
            if (res.status === 200) {
                toast.success('打卡成功!', {
                    description: '歡迎學長學姐蒞會員大會!'
                })
            } else if (res.status === 202) {
                toast.success('已打卡')
            }
        },
        onError: (err: AxiosError) => {
            toast.error('打卡失敗', {
                //@ts-ignore
                description: err.response?.data?.message || '請稍後再試'
            });

        }
    })

    const { mutate: submitManualCheckin } = useMutation({
        mutationFn: (name: string) => api.post(`/admin/conference/${selectedConf}/check-in`, { name }),
        onSuccess: (res) => {
            if (res.status === 200) {
                toast.success('打卡成功!', {
                    description: '歡迎學長學姐蒞會員大會!'
                })
            } else if (res.status === 202) {
                toast.success('已打卡')
            }
            setMemberName('')
        },
        onError: (err: AxiosError) => {
            toast.error('打卡失敗', {
                //@ts-ignore
                description: err.response?.data?.message || '請稍後再試'
            });
        }
    })

    console.log('selectedConf', selectedConf);

    if (isLoading) {
        return <>loading...</>
    }

    return <main className='flex items-center justify-center h-full py-4 pl-4'>

        <Card className='flex-4 h-full relative'>
            <CardHeader>
                <CardDescription>
                    國立陽明交通大學校友總會
                </CardDescription>
                <CardTitle className='text-2xl'>
                    會員大會打卡系統
                </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 grid-rows-1 gap-2 gap-y-3'>
                <div className='p-1'>
                    <span className='text-sm'>Step 1. 打開Apple Wallet</span>
                    <img src={CheckInStep1} alt="open apple wallet / pass2u" className='rounded-md border mt-2' />
                </div>
                <div className='p-1'>
                    <span className='text-sm'>Step 2. 握描會員證內的QRcode</span>
                    <img src={CheckInStep2} alt="open apple wallet / pass2u" className='rounded-md border mt-2' />
                </div>
                <div className='col-span-2 p-1'>
                    <span className='text-sm'>Step 3. 打卡成功！</span>
                    <Alert className='mt-2 shadow'>
                        <CircleCheck className="h-4 w-4 color-green-500" />
                        <AlertTitle>打卡成功！</AlertTitle>
                        <AlertDescription>
                            歡迎學長學姐蒞會員大會!
                        </AlertDescription>
                    </Alert>
                </div>
                <div>
                </div>
            </CardContent>
            <CardFooter className='w-full flex items-end justify-end'>
                <HoverCard>
                    <HoverCardContent className='w-[300px] h-[360px]'>
                        <div className='flex flex-col items-center justify-center'>
                            <span className='mb-2'>掃描以下QRcode以製作會員證</span>
                            <QRCodeSVG value='https://membercard.nycuaa.org' bgColor="#0f172b" fgColor="#f8fafc" size={240} />
                            <span className='text-sm opacity-[0.8] mt-1'>https://membercard.nycuaa.org</span>
                        </div>
                    </HoverCardContent>
                    <HoverCardTrigger>
                        <span className='text-lg' style={{ textDecoration: 'underline' }}>我要製作會員證！</span>
                    </HoverCardTrigger>
                </HoverCard>
            </CardFooter>
        </Card>
        <section className='flex items-center justify-center flex-5 relative'>
            <div className='w-[520px] p-[36px] aspect-square items-end'>
                <Select onValueChange={(val) => setConf(parseInt(val))} value={selectedConf?.toString()}>
                    <SelectTrigger className="w-[180px] mb-2">
                        <SelectValue placeholder="Select a conference" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            conferences?.map(con => (
                                <SelectItem value={con.id.toString()}>
                                    {con.name}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <Scanner
                    onScan={onScan}
                    scanDelay={500}
                    onError={(err) => { console.error(err) }}
                    allowMultiple
                    styles={{
                        container: {
                            transform: 'scaleX(-1)',
                            border: 'none',
                            background: 'transparent'
                        },
                        video: {
                            border: 'none',
                            borderRadius: '1rem'
                        },
                        finderBorder: 100
                    }}
                />
                <div className='flex gap-2 mt-4'>
                    <Input
                        placeholder='輸入會員姓名'
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && memberName.trim()) {
                                submitManualCheckin(memberName)
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            if (memberName.trim()) {
                                submitManualCheckin(memberName)
                            }
                        }}
                        disabled={!memberName.trim()}
                    >
                        打卡
                    </Button>
                </div>
            </div>
        </section>
    </main>
}

export default Page;