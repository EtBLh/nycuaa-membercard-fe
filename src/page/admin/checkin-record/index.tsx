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
import { Card, CardContent } from '@/components/ui/card';
import AddConferenceDialog from '@/components/add-conference-dialog';

export default function Page() {

    const [selectedConf, setConf] = useState<number | null>(null);

    const { data: conferences, isLoading: conLoading, isSuccess: conSuccess, refetch: refetchConfList } = useQuery({
        queryKey: ['conference all'],
        queryFn: () => api.get<{ conferences: IConference[] }>(`/admin/conferences`),
        select: (res) => res.data.conferences
    })

    const { data: members, isLoading } = useQuery({
        queryKey: ['conference record', selectedConf],
        queryFn: () => api.get<{ members: IMemberData[] }>(`/admin/conference/${selectedConf}/check-in-record`),
        select: (res) => res.data.members,
        enabled: conSuccess && selectedConf !== null
    })

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                    <header className='flex items-center gap-2'>
                        {
                            conLoading && 'loading...'
                        }
                        {
                            conferences && (
                                <Select onValueChange={(val) => setConf(parseInt(val))} value={selectedConf?.toString()}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Conference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            conferences?.map(con => (
                                                <SelectItem
                                                    value={con.id.toString()}
                                                    onClick={() => setConf(con.id)}
                                                >
                                                    {con.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            )
                        }
                        <AddConferenceDialog refetch={refetchConfList}/>
                    </header>
                    <main className='flex flex-wrap gap-2'>
                        {
                            isLoading && 'loading...'
                        }
                        {
                            selectedConf === null ? 'select a conference first' : null
                        }
                        {
                            selectedConf !== null && members && members.map(mem => (
                                <Card>
                                    <CardContent className='flex flex-col'>
                                        <span className='text-sm opacity-[0.8]'>{mem.id}</span>
                                        <span className='text-lg'>{mem.name}</span>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </main>
                </div>
            </div>
        </div>
    )
}
