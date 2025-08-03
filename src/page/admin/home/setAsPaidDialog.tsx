import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IMemberData } from "@/lib/types";
import { api } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { TicketCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaidStatusBadge } from "./Badges";

type TMemberPreview = {
    id: string;
    name: string;
}

const SetAsPaidDialog = (props: {
    refetch?: () => void
    rowSelection: Record<string, boolean>
}) => {
    const [open, setOpen] = useState(false);
    const { rowSelection, refetch } = props;

    const setMemberPaidMutation = useMutation({
        mutationFn: (memberIds: string[]) => {
            return api.post(`/admin/member/${memberIds.join(',')}/set-paid`, { paid: true });
        },
        onSuccess: () => {
            toast.success(`會員已成功設置為已付款`);
            refetch?.();
            setOpen(false);
        },
        onError: (err: AxiosError<{ error: string }>) => {
            toast.error(`設置會員付款狀態失敗`);
            console.error("Error setting member as paid:", err.response?.data?.error || err.message);
        }
    });

    const setMembersPaid = () => {
        setMemberPaidMutation.mutate(Object.keys(rowSelection));
    }

    const previewQuery = useQuery({
        queryKey: ['memberlist', Object.keys(rowSelection)],
        queryFn: () => api.get<{ members: IMemberData[]; total: number }>('/admin/members', {
            params: {
                ids: Object.keys(rowSelection).join(',')
            }
        }),
        enabled: open && Object.keys(rowSelection).length > 0,
        select: res => res.data.members
    });

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm" disabled={!rowSelection || !Object.keys(rowSelection).length} variant="outline">
                    <TicketCheck />設置會員為已付款
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>確認設置以下會員為已付款?</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] w-full rounded-md border my-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>名稱</TableHead>
                                <TableHead>付費狀態</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {previewQuery.isLoading && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}
                            {previewQuery.isSuccess && previewQuery.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        No members selected.
                                    </TableCell>
                                </TableRow>
                            )}
                            {previewQuery.isSuccess &&
                                previewQuery.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <PaidStatusBadge permit={item.permit} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <Button
                        onClick={setMembersPaid}
                        disabled={
                            setMemberPaidMutation.isPending ||
                            !previewQuery.isSuccess ||
                            previewQuery.data.length === 0
                        }
                    >
                        {setMemberPaidMutation.isPending ? "處理中..." : "確認"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SetAsPaidDialog;
