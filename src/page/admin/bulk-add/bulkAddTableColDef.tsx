import {
    IconCircleCheckFilled,
    IconDotsVertical
} from "@tabler/icons-react"
import {
    ColumnDef
} from "@tanstack/react-table"
import { z } from "zod"

import logo from '@/assets/logo.png'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Ban, Rabbit, User, Users } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/utils"
import { useEffect, useRef, useState, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"


export const MemberFullSchema = z.object({
  id: z.number(),
  name: z.string(),
  govid: z.string(),
  type: z.string(),
  birthday: z.string(),
  email: z.string(),
  phone: z.string(),
})

const useColDef = () => {

    const columns: ColumnDef<z.infer<typeof MemberFullSchema>>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "Member ID",
            enableHiding: false,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant={row.original.type === 'founding' ? 'secondary' : 'outline'}>
                    {row.original.type === 'normal' && <User />}
                    {row.original.type === 'group' && <Users />}
                    {row.original.type === 'founding' && <Rabbit />}
                    {
                        row.original.type
                    }
                </Badge>
            )
        },
        {
            accessorKey: "name",
            header: "Name",
            enableHiding: false,
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="name" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "govid",
            header: "Government ID",
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="govid" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="email" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="phone" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "qrcode",
            header: "QRCode",
            cell: (param) => (
                <HoverCard>
                    <HoverCardTrigger>
                        <Badge variant='outline'>hover to show</Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-col w-[200px] items-center">
                        <span className="text-sm opacity-[0.8] mb-4 flex justify-center items-center">
                            <img src={logo} alt="NYCU logo" width={24} height={24} />
                            <span className="ml-1 mr-2">NYCUAA</span>
                            <span>{param.row.original.name}</span>
                        </span>
                        <QRCodeSVG value={param.row.original.qrcode} bgColor="#0f172b" fgColor="#f8fafc" />
                        <span className="text-xs opacity-[0.8]">{param.row.original.id}</span>
                    </HoverCardContent>
                </HoverCard>
            )
        },
        {
            accessorKey: "permit",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.permit ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                    ) : (
                        <Ban />
                    )}
                    {
                        row.original.permit ? 'paid' : 'unpaid'
                    }
                </Badge>
            ),
        },
        {
            accessorKey: "icon_uploaded",
            header: "icon?",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.icon_uploaded ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                    ) : (
                        <Ban />
                    )}
                    {
                        row.original.icon_uploaded ? 'yes' : 'no'
                    }
                </Badge>
            ),
        },
        {
            accessorKey: "card_created",
            header: "pass?",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.card_created ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                    ) : (
                        <Ban />
                    )}
                    {
                        row.original.card_created ? 'yes' : 'no'
                    }
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMemberPaid.mutate(row.original.id)}>Set as paid</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [])
    return columns;
}

export default useColDef;