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

export const MemberTypeBadge = ({ type }: { type: string }) => {
    <Badge variant={type === 'founding' ? 'secondary' : 'outline'}>
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

export const PaidStatusBadge = ({ permit }: { permit: boolean }) => {
    return <Badge variant="outline" className="text-muted-foreground px-1.5">
        {permit ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
            <Ban />
        )}
        {
            permit ? 'paid' : 'unpaid'
        }
    </Badge>
}