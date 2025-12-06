import {
    IconCircleCheckFilled
} from "@tabler/icons-react"

import logo from '@/assets/logo.png'
import { Badge } from "@/components/ui/badge"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Ban, Rabbit, User, Users } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { api } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export const MemberTypeBadge = ({ type }: { type: string }) => {
    return <Badge variant={type === 'founding' ? 'secondary' : 'outline'}>
        {type === 'normal' && <User />}
        {type === 'group' && <Users />}
        {type === 'founding' && <Rabbit />}
        {
            type
        }
    </Badge>
}

export const QRCodeBadge = ({ qrcode, id, name }: { qrcode?: string, id: number, name: string }) => {
    if (!qrcode) {
        return <Badge variant='outline' className="bg-red-900">no qrcode</Badge>
    }
    return <HoverCard>
        <HoverCardTrigger>
            <Badge variant='outline'>hover to show</Badge>
        </HoverCardTrigger>
        <HoverCardContent className="flex flex-col w-[200px] items-center">
            <span className="text-sm opacity-[0.8] mb-4 flex justify-center items-center">
                <img src={logo} alt="NYCU logo" width={24} height={24} />
                <span className="ml-1 mr-2">NYCUAA</span>
                <span>{name}</span>
            </span>
            <QRCodeSVG value={qrcode} bgColor="#0f172b" fgColor="#f8fafc" />
            <span className="text-xs opacity-[0.8]">{id}</span>
        </HoverCardContent>
    </HoverCard>
}

export const PaidStatusBadge = ({ permit, id }: { permit: boolean, id?: number | string }) => {
    const [isOpen, setIsOpen] = useState(false)
    
    const permitRecordQuery = useQuery({
        queryKey: ['permitRecord', id],
        queryFn: () => api.get<{ year: number[] }>(`/admin/member/${id}/permit_record`),
        enabled: isOpen && !!id,
        select: (res) => res.data.year
    })

    return <HoverCard open={isOpen} onOpenChange={setIsOpen}>
        <HoverCardTrigger asChild>
            <Badge variant="outline" className="text-muted-foreground px-1.5 cursor-pointer">
                {permit ? (
                    <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                ) : (
                    <Ban />
                )}
                {
                    permit ? 'paid' : 'unpaid'
                }
            </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold">付費紀錄</h4>
                {permitRecordQuery.isLoading && (
                    <p className="text-xs text-muted-foreground">載入中...</p>
                )}
                {permitRecordQuery.isSuccess && permitRecordQuery.data.length === 0 && (
                    <p className="text-xs text-muted-foreground">無付費紀錄</p>
                )}
                {permitRecordQuery.isSuccess && permitRecordQuery.data.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {permitRecordQuery.data.map((year) => (
                            <Badge key={year} variant="secondary" className="text-xs">
                                {year}
                            </Badge>
                        ))}
                    </div>
                )}
                {permitRecordQuery.isError && (
                    <p className="text-xs text-red-500">載入失敗</p>
                )}
            </div>
        </HoverCardContent>
    </HoverCard>
}