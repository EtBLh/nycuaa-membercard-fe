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
import { MemberFullSchema } from "./memberDataTable"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/utils"
import { useEffect, useRef, useState, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"


type EditableCellProps = {
    memberId: number;
    field: string;
    value: string;
};

const EditableCell: React.FC<EditableCellProps> = ({ field, memberId, value: initialValue }) => {

    const prevValue = useRef(initialValue);

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(prevValue.current);   

    const saveMutation = useMutation({
        mutationFn: (val: string) => api.post(`/admin/member/${memberId}/edit`, {
            [field] : val
        }),
        onSuccess: () => {
            setIsEditing(false); // Exit editing mode on success
            prevValue.current = value; // Update the previous value to the new one
            // queryClient.invalidateQueries([''])
        },
        onError: () => {
            console.error("Failed to save value");
        }
    });
    const handleSave = () => {
        if (value !== prevValue.current) {
            saveMutation.mutate(value);
        } else {
            setIsEditing(false); // Exit editing mode if value is unchanged
        }
    }

    useEffect(() => {
        setValue(prevValue.current);
    }, [prevValue.current]);

    if (isEditing) {
        return (
            <div className="flex items-center jusify-between">
                {saveMutation.isPending && <Spinner className="inline-block w-4 h-4 mr-2" />}
                <input
                    className="border rounded px-2 py-1"
                    value={value}
                    autoFocus
                    onChange={e => setValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            handleSave();
                        }
                        if (e.key === "Escape") {
                            setIsEditing(false);
                            setValue(prevValue.current);
                        }
                    }}
                />
            </div>
            
        );
    }

    return (
        <span
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {saveMutation.isPending && <Spinner className="inline-block w-4 h-4 mr-2" />}
            {value}
        </span>
    );
};

const useMemberDataTableColDef = (refetch: () => void) => {

    const setMemberPaidMutation = useMutation({
        mutationFn: ({id, paid}: {id: number, name: string, paid: boolean}) => api.post(`/admin/member/${id}/set-paid`, { paid }),
        onSuccess: (_, { name, paid }) => {
            toast.success(`Member ${name} set ${paid?'paid':'unpaid'} successfully`);
            refetch();
        },
        onError: (_, { name, paid }) => {
            toast.success(`Member ${name} set ${paid?'paid':'unpaid'} faild`);
            toast.error('failed D:')
        }
    })

    const deleteMemberMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/member/${id}`),
        onSuccess: () => {
            toast.success('Member deleted successfully');
            refetch();
        },
        onError: () => {
            toast.error('Failed to delete member');
        }
    });

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
            width: 60,
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
            width: 80,
            enableHiding: false,
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="name" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "govid",
            header: "Government ID",
            width: 120,
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="govid" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            width: 300,
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="email" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            width: 150,
            cell: ({ getValue, row }) => (
                <EditableCell memberId={row.original.id} field="phone" value={getValue() as string} />
            ),
        },
        {
            accessorKey: "qrcode",
            header: "QRCode",
            cell: (param) => {
                if (!param.row.original.qrcode) {
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
                            <span>{param.row.original.name}</span>
                        </span>
                        <QRCodeSVG value={param.row.original.qrcode} bgColor="#0f172b" fgColor="#f8fafc" />
                        <span className="text-xs opacity-[0.8]">{param.row.original.id}</span>
                    </HoverCardContent>
                </HoverCard>
            }
        },
        {
            accessorKey: "permit",
            header: "is member paid?",
            width: 80,
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
            header: "is icon uploaded?",
            width: 80,
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
            header: "is card sent?",
            width: 80,
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
                        <DropdownMenuItem 
                            onClick={() => {
                                setMemberPaidMutation.mutate({
                                    id: row.original.id, 
                                    name: row.original.name,
                                    paid: !row.original.permit
                                })
                            }}>
                                Set as {row.original.permit ? 'unpaid' : 'paid'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => deleteMemberMutation.mutate(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [])
    return columns;
}

export default useMemberDataTableColDef;