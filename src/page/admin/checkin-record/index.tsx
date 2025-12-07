import AddConferenceDialog from '@/components/add-conference-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IConference } from '@/lib/types';
import { api } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {

    const [selectedConf, setConf] = useState<number | null>(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [newConferenceName, setNewConferenceName] = useState('');

    const { data: conferences, isLoading: conLoading, isSuccess: conSuccess, refetch: refetchConfList } = useQuery({
        queryKey: ['conference all'],
        queryFn: () => api.get<{ conferences: IConference[] }>(`/admin/conferences`),
        select: (res) => res.data.conferences
    })

    const updateConferenceMutation = useMutation({
        mutationFn: (name: string) => api.patch(`/admin/conference/${selectedConf}`, { name }),
        onSuccess: () => {
            toast.success('會議名稱已更新');
            refetchConfList();
            setUpdateDialogOpen(false);
            setNewConferenceName('');
        },
        onError: () => {
            toast.error('更新失敗');
        }
    });

    const deleteConferenceMutation = useMutation({
        mutationFn: () => api.delete(`/admin/conference/${selectedConf}`),
        onSuccess: () => {
            toast.success('會議已刪除');
            refetchConfList();
            setConf(null);
        },
        onError: () => {
            toast.error('刪除失敗');
        }
    });

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
                    <header className='flex items-center gap-2 w-full'>
                        {conLoading && 'loading...'}
                        <AddConferenceDialog refetch={refetchConfList} />
                        <Select onValueChange={(val) => setConf(parseInt(val))} value={selectedConf?.toString()} disabled={conLoading || conferences?.length === 0}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={conferences?.length === 0 ? "No conferences available" : "Select a conference"} />
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

                        <div className='flex-1'/>
                        
                        {/* Update Conference Name Dialog */}
                        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    disabled={selectedConf === null}
                                    onClick={() => {
                                        const currentConf = conferences?.find(c => c.id === selectedConf);
                                        setNewConferenceName(currentConf?.name || '');
                                    }}
                                >
                                    編輯會議名稱
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>編輯會議名稱</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        value={newConferenceName}
                                        onChange={(e) => setNewConferenceName(e.target.value)}
                                        placeholder="會議名稱"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setUpdateDialogOpen(false)}
                                    >
                                        取消
                                    </Button>
                                    <Button 
                                        onClick={() => updateConferenceMutation.mutate(newConferenceName)}
                                        disabled={updateConferenceMutation.isPending}
                                    >
                                        {updateConferenceMutation.isPending ? '更新中...' : '更新'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Conference Button */}
                        <Button 
                            variant="destructive" 
                            disabled={selectedConf === null || deleteConferenceMutation.isPending}
                            onClick={() => {
                                if (confirm('確定要刪除此會議嗎？')) {
                                    deleteConferenceMutation.mutate();
                                }
                            }}
                        >
                            {deleteConferenceMutation.isPending ? '刪除中...' : '刪除會議'}
                        </Button>
                    </header>
                    <main className='w-full'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>會員ID</TableHead>
                                    <TableHead>名稱</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>電話</TableHead>
                                    <TableHead>打卡時間</TableHead>
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
                                                請選擇會議
                                            </TableCell>
                                        </TableRow>
                                )}
                                {selectedConf !== null && members && (
                                    members.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                無打卡記錄
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
