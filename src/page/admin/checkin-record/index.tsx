import { IConference, IMemberData } from '@/lib/types';
import { api } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';
import AddConferenceDialog from '@/components/add-conference-dialog';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"

export default function Page() {

    const [selectedConf, setConf] = useState<number | null>(null);

    const { data: conferences, isLoading: conLoading, isSuccess: conSuccess, refetch: refetchConfList } = useQuery({
        queryKey: ['conference all'],
        queryFn: () => api.get<{ conferences: IConference[] }>(`/admin/conferences`),
        select: (res) => res.data.conferences
    })

    const { data: members, isLoading } = useQuery({
        queryKey: ['conference record', selectedConf],
        queryFn: () => api.get<{
            email: string;
            member_id: string;
            name: string;
            phone: string;
            time: number | null;
        }[]>(`/admin/conference/${selectedConf}/check-in-record`),
        select: (res) => res.data,
        enabled: conSuccess && selectedConf !== null
    })

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                    <header className='flex items-center gap-2 justify-between w-full'>
                        {conLoading && 'loading...'}
                        {conferences && (
                            <Select onValueChange={(val) => setConf(parseInt(val))} value={selectedConf?.toString()}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Conference" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conferences?.map(con => (
                                        <SelectItem
                                            key={con.id}
                                            value={con.id.toString()}
                                            onClick={() => setConf(con.id)}
                                        >
                                            {con.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <AddConferenceDialog refetch={refetchConfList} />
                    </header>
                    <main className='w-full'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Check-in Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                )}
                                {selectedConf === null && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                Select a conference to view check-in records.
                                            </TableCell>
                                        </TableRow>
                                )}
                                {selectedConf !== null && members && (
                                    members.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No check-in records.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        members.map(mem => (
                                        <TableRow key={mem.member_id}>
                                            <TableCell>{mem.member_id}</TableCell>
                                            <TableCell>{mem.name}</TableCell>
                                            <TableCell>{mem.email}</TableCell>
                                            <TableCell>{mem.phone}</TableCell>
                                            <TableCell>
                                                {mem.time
                                                    ? new Date(mem.time * 1000).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </main>
                </div>
            </div>
        </div>
    )
}
