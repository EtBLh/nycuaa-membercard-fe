
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
import { api, cn } from "@/lib/utils";
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"
import { AxiosError } from "axios";

export const MemberInitSchema = z.object({
    id: z.string(),
    name: z.string(),
    govid: z.string(),
    type: z.string(),
    birthday: z.date(),
    email: z.string(),
    phone: z.string(),
})

const AddMemberDialog = (props: {
    refetch?: () => void
}) => {
    const [open, setOpen] = useState(false);
    

    const form = useForm<z.infer<typeof MemberInitSchema>>({
        resolver: zodResolver(MemberInitSchema),
        defaultValues: {
            type: 'normal'
        }
    });

    const addMember = useMutation({
        mutationFn: (data:  z.infer<typeof MemberInitSchema>) => {
            const yyyy = data.birthday.getFullYear();
            const mm = String(data.birthday.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
            const dd = String(data.birthday.getDate()).padStart(2, '0');
            const formatted = `${yyyy}-${mm}-${dd}`;
            return api.post(`/admin/member/add`, {...data, birthday: formatted});
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
        onError: (err: AxiosError<{error: string}>) => {
            toast.error(`Error occured: ${err.response?.data.error}`)
            setOpen(false);
        }
    })

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">Add New Member</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => addMember.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="2400000" {...field} />
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
                                    <FormLabel>Name</FormLabel>
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
                                    <FormLabel>Government ID</FormLabel>
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
                                    <FormLabel>Phone</FormLabel>
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
                                    <FormLabel>Email Address</FormLabel>
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
                                render={({ field }) => (
                                    <FormItem className="flex flex-col flex-2">
                                        <FormLabel>Date of birth</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Type</FormLabel>
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
                            <Button className="w-full" type="submit" disabled={addMember.isPending}>Submit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddMemberDialog;