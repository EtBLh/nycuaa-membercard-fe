import { ArrowLeft, CircleHelp } from "lucide-react";
// import { useState } from "react";
import CardLayout from "@/components/CardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import stepInstallPass2U from '@/assets/step-installpass2u.png'
import stepEnterNameGovid from '@/assets/step-enternamegovid.jpg'
import stepEnterOTP from '@/assets/step-enterotp.jpg'
import stepUploadIcon from '@/assets/step-uploadicon.jpg'
import stepConfirmDetail from '@/assets/step-confirmdetail.jpg'
import stepAdd2Wallet from '@/assets/step-add2wallet.png'
import stepAndroidDownload from '@/assets/step-download.png'
import stepPass2U from '@/assets/step-pass2u.png'
import stepAppleWallet from '@/assets/step-applewallet.png'
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";


const Page = () => {
    return (
        <CardLayout
            options
            header={
                <>
                    <CircleHelp />常見問題
                </>
            }>
            <Card className="relative">
                <Link to='/home' className='absolute top-2 left-2 w-[36px] h-[36px]'>
                    <Button variant='ghost'>
                        <ArrowLeft />
                    </Button>
                </Link>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl flex flex-row items-center justify-center gap-2">
                        <CircleHelp />常見問題
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="android">
                        <AccordionItem value="ios">
                            <AccordionTrigger>如何製作會員證：IOS用戶</AccordionTrigger>
                            <AccordionContent>
                                <GuideCarousel guide={IOSGuide} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="android">
                            <AccordionTrigger>如何製作會員證：Android用戶</AccordionTrigger>
                            <AccordionContent>
                                <GuideCarousel guide={AndroidGuide} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </CardLayout>
    )
}

const IOSGuide = [
    {
        title: 'Step1: 輸入姓名與身分證號碼',
        img: stepEnterNameGovid,
    },
    {
        title: 'Step2: 輸入OTP驗證碼',
        img: stepEnterOTP,
    },
    {
        title: 'Step3: 上傳大頭照',
        img: stepUploadIcon,
    },
    {
        title: 'Step4: 確認會員資料',
        img: stepConfirmDetail,
    },
    {
        title: 'Step5: 新增會員證到Apple Wallet',
        img: stepAdd2Wallet,
    },
    {
        title: 'Step6: 確認新增',
        img: stepAppleWallet,
    }
]

const AndroidGuide = [
    {
        title: 'Step0: 安裝Pass2U',
        img: stepInstallPass2U,
        description: <a href='https://play.google.com/store/apps/details?id=com.passesalliance.wallet' style={{ textDecoration: 'underline' }}>點此下載Pass2U Wallet應用程式</a>
    },
    {
        title: 'Step1: 輸入姓名與身分證號碼',
        img: stepEnterNameGovid,
    },
    {
        title: 'Step2: 輸入OTP驗證碼',
        img: stepEnterOTP,
    },
    {
        title: 'Step3: 上傳大頭照',
        img: stepUploadIcon,
    },
    {
        title: 'Step4: 確認會員資料',
        img: stepConfirmDetail,
    },
    {
        title: 'Step5: 新增會員證到Pass2U Wallet',
        img: stepAdd2Wallet,
    },
    {
        title: 'Step6: 下載會員證檔案並打開',
        img: stepAndroidDownload,
    },
    {
        title: 'Step7: 新增成功！',
        img: stepPass2U,
    },
]


type TGuide = {
    title: string
    description?: ReactNode
    img: string
}

const GuideCarousel = ({ guide }: { guide: TGuide[] }) => (
    <Carousel className="w-full relative">
        <CarouselContent>
            {
                guide.map((guide, idx) => (
                    <CarouselItem key={idx} className="flex flex-col">
                        <span className="text-lg px-2">
                            {guide.title}
                        </span>
                        <span className="text-sm opacity-[0.7] px-2">
                            {guide.description}
                        </span>
                        <img src={guide.img} alt={guide.title} className="border rounded-lg m-2" />
                    </CarouselItem>
                ))
            }
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-0" />
        <CarouselNext className="absolute top-1/2 right-0" />
    </Carousel>
)

export default Page;