
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/utils";
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const MemberInitSchema = z.object({
    id: z.number().gte(1000000, "ID為7位數字").lte(9999999, "ID為7位數字"),
    name: z.string(),
    govid: z.string(),
    type: z.string(),
    birthday: z.date(),
    email: z.string().email("請輸入有效的電子郵件地址"),
    phone: z.string().length(10, "電話號碼應為10位數字").regex(/^\d+$/, "電話號碼只能包含數字")
})

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

const AddMemberDialog = (props: {
    refetch?: () => void
}) => {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof MemberInitSchema>>({
        resolver: zodResolver(MemberInitSchema),
        defaultValues: {
            type: 'normal',
            birthday: new Date(),
        }
    });

    const addMemberMutation = useMutation({
        mutationFn: (data: z.infer<typeof MemberInitSchema>) => {
            const yyyy = data.birthday.getFullYear();
            const mm = String(data.birthday.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
            const dd = String(data.birthday.getDate()).padStart(2, '0');
            const formatted = `${yyyy}-${mm}-${dd}`;
            return api.post(`/admin/member/add`, { ...data, birthday: formatted });
        },
        onSuccess: (res, data) => {
            if (res.status === 201) {
                toast.success(`Member ${data.name} added into DB successfully`)
            } else {
                toast.info(`Success but not 201`)
            }
            props.refetch?.();
            setOpen(false);
        },
        onError: (err: AxiosError<{ error: string }>) => {
            toast.error(`Error occured: ${err.response?.data.error}`)
            setOpen(false);
        }
    })

    const addMember = (data: z.infer<typeof MemberInitSchema>) => {
        addMemberMutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">新增會員</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>新增會員</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => addMember(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>會員ID</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="2400000" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>名稱</FormLabel>
                                    <FormControl>
                                        <Input placeholder="陳大明" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="govid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>身份證字號/護照號碼</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A000000000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>電話</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0900000000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="helloworld@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row items-start justify-between gap-2">
                            <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => {
                                    const [month, setMonth] = useState<Date | undefined>(field.value);
                                    const [value, setValue] = useState(format(field.value, 'yyyy-MM-dd'));

                                    return (
                                        <FormItem className="flex flex-col flex-2">
                                            <FormLabel>生日</FormLabel>
                                            <div className="relative flex gap-2">
                                                <Input
                                                    id="date"
                                                    value={value}
                                                    placeholder={format(new Date(), 'yyyy-MM-dd')}
                                                    className="bg-background pr-10"
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value)
                                                        setValue(e.target.value);
                                                        if (isValidDate(date)) {
                                                            field.onChange(date);
                                                            setMonth(date)
                                                            form.clearErrors('birthday');
                                                        } else {
                                                            form.setError('birthday', {
                                                                type: 'custom',
                                                                message: 'Invalid date format'
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="date-picker"
                                                            variant="ghost"
                                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                                        >
                                                            <CalendarIcon className="size-3.5" />
                                                            <span className="sr-only">選擇日期</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto overflow-hidden p-0"
                                                        align="end"
                                                        alignOffset={-8}
                                                        sideOffset={10}
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            captionLayout="dropdown"
                                                            month={month}
                                                            onMonthChange={setMonth}
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setValue(format(date!, 'yyyy-MM-dd'));
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>類型</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="member type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="normal">normal</SelectItem>
                                                <SelectItem value="founding">founding</SelectItem>
                                                <SelectItem value="group">group</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button className="w-full" type="submit" disabled={addMemberMutation.isPending}>確定新增</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddMemberDialog;