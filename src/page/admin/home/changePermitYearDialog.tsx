import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useState } from "react";

const ChangePermitYearDialog = (props: {
    refetch?: () => void
    permitYear: number | undefined
    setPermitYear: (year: number) => void
}) => {
    const [open, setOpen] = useState(false);
    const { refetch, permitYear, setPermitYear } = props;
    const [tempYear, setTempYear] = useState<number>(permitYear ?? new Date().getFullYear());

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>査詢會員付款狀態之年度</DialogTitle>
                </DialogHeader>
                
                <div className="flex items-center gap-3 my-4">
                    <label className="text-sm font-medium">付款年度:</label>
                    <Input
                        type="number"
                        value={tempYear}
                        onChange={(e) => setTempYear(parseInt(e.target.value))}
                        min={2000}
                        max={new Date().getFullYear() + 10}
                        className="w-24"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        取消
                    </Button>
                    <Button
                        onClick={() => {
                            setPermitYear(tempYear);
                            setOpen(false);
                            refetch && refetch();
                        }}
                        disabled={false}
                    >
                    確認更新
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ChangePermitYearDialog;
