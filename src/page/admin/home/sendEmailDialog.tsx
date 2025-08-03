import { Badge } from "@/components/ui/badge";
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
import { api } from "@/lib/utils";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Ban, CheckCircle2, IdCard, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type TEmailPreview = {
    id: string;
    name: string;
    permit: boolean;
    email_type: 'update_card' | 'invitation' | 'invalid';
}

const SendEmailDialog = (props: {
    refetch?: () => void
    rowSelection: Record<string, boolean>
}) => {
    const [open, setOpen] = useState(false);

    const { rowSelection } = props;

    // Track status for each member id: idle | loading | success | failed
    const [sendStatus, setSendStatus] = useState<Record<string, "idle" | "loading" | "success" | "failed">>({});

    // Reset status when dialog opens or selection changes
    useEffect(() => {
        if (open) {
            const ids = Object.keys(rowSelection);
            setSendStatus(
                ids.reduce((acc, id) => ({ ...acc, [id]: "idle" }), {})
            );
        }
    }, [open, rowSelection]);

    const sendMemberCardMutation = useMutation({
        mutationFn: (memberIds: string[]) => {
            // Set all selected to loading
            setSendStatus(prev =>
                memberIds.reduce((acc, id) => ({ ...acc, [id]: "loading" }), { ...prev })
            );
            return api.post<{
                successes: { id: string }[];
                errors: { id: string }[];
                skipped: { id: string }[];
            }>(`/admin/send-member-card`, { member_ids: memberIds.map(id => Number(id)) });
        },
        onSuccess: (res) => {
            // Mark successes and failures
            const { successes = [], errors = [], skipped = [] } = res.data;
            const successIds = successes.map((s: any) => s.id);
            const failedIds = [
                ...(errors.map((e: any) => e.id) || []),
                ...(skipped.map((s: any) => s.id) || [])
            ];
            setSendStatus(prev => {
                const updated = { ...prev };
                successIds.forEach(id => { updated[id] = "success"; });
                failedIds.forEach(id => { updated[id] = "failed"; });
                return updated;
            });
        },
        onError: (err: AxiosError<{ error: string }>) => {
            // Mark all as failed
            setSendStatus(prev =>
                Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: "failed" }), {})
            );
            console.error("Error sending member card emails:", err.response?.data?.error || err.message);
        }
    });

    const sendMemberCard = () => {
        sendMemberCardMutation.mutate(Object.keys(rowSelection));
    }

    console.log("Row selection:", rowSelection);

    const previewQuery = useQuery({
        queryKey: ['sendMemberCardPreview', Object.keys(rowSelection)],
        queryFn: () => api.post<TEmailPreview[]>('/admin/send-member-card/preview', { member_ids: Object.keys(rowSelection).map(id => Number(id)) }),
        enabled: open && Object.keys(rowSelection).length > 0
    });

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm" disabled={!rowSelection || !Object.keys(rowSelection).length} variant="outline">
                    <IdCard /> 發送會員證郵件
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>發送會員證郵件</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] w-full rounded-md border my-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名稱</TableHead>
                        <TableHead>是否已付款</TableHead>
                        <TableHead>郵件類型</TableHead>
                        <TableHead>傳送狀態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewQuery.isLoading && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Loading...
                          </TableCell>
                        </TableRow>
                      )}
                      {previewQuery.isSuccess && previewQuery.data.data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No recipients.
                          </TableCell>
                        </TableRow>
                      )}
                      {previewQuery.isSuccess &&
                        previewQuery.data.data.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-muted-foreground px-1.5">
                                {item.permit ? (
                                  <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1" size={16} />
                                ) : (
                                  <Ban className="mr-1" size={16} />
                                )}
                                {item.permit ? "paid" : "unpaid"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.email_type === 'update_card' ? (
                                <Badge variant="secondary" className="text-green-600 px-1.5">
                                  將發送更新後的會員卡
                                </Badge>
                              ) : item.email_type === 'invitation' ? (
                                <Badge variant="secondary" className="text-blue-500 px-1.5">
                                  將發送邀請郵件
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-red-700 px-1.5">
                                  無法發送郵件 ({item.permit ? "" : "未付款"})
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {sendStatus[item.id] === "loading" && (
                                <Badge variant="outline" className="px-1.5 flex items-center gap-1">
                                  <Loader2 className="animate-spin w-4 h-4" />
                                  loading
                                </Badge>
                              )}
                              {sendStatus[item.id] === "success" && (
                                <Badge variant="outline" className="px-1.5 flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Sent
                                </Badge>
                              )}
                              {sendStatus[item.id] === "failed" && (
                                <Badge variant="outline" className="px-1.5 flex items-center gap-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  Failed
                                </Badge>
                              )}
                              {(!sendStatus[item.id] || sendStatus[item.id] === "idle") && (
                                <Badge variant="outline" className="px-1.5 flex items-center gap-1 text-muted-foreground">
                                  Idle
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <DialogFooter>
                    <Button
                      onClick={sendMemberCard}
                      disabled={
                        sendMemberCardMutation.isPending ||
                        !previewQuery.isSuccess ||
                        previewQuery.data.data.length === 0 ||
                        !previewQuery.data.data.every(item => item.permit)
                      }
                    >
                      {sendMemberCardMutation.isPending ? "傳送中..." : "確認發送郵件"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SendEmailDialog;