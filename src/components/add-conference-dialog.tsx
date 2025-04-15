
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
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

export const ConferenceSchema = z.object({
    name: z.string(),
    date: z.date(),
})

const AddConferenceDialog = (props: {
    refetch?: () => void
}) => {
    const [open, setOpen] = useState(false);


    const form = useForm<z.infer<typeof ConferenceSchema>>({
        resolver: zodResolver(ConferenceSchema),
        defaultValues: {
        }
    });

    const addMember = useMutation({
        mutationFn: (data: z.infer<typeof ConferenceSchema>) => {
            const yyyy = data.date.getFullYear();
            const mm = String(data.date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
            const dd = String(data.date.getDate()).padStart(2, '0');
            const formatted = `${yyyy}-${mm}-${dd}`;
            return api.post(`/admin/conference`, { ...data, date: formatted });
        },
        onSuccess: (res, data) => {
            if (res.status === 201) {
                toast.success(`Conference ${data.name} added into DB successfully`)
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

    return (
        <Dialog open={open} onOpenChange={val => setOpen(val)}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">Add New Conference</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Conference</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => addMember.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conference Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col flex-1">
                                    <FormLabel>Date</FormLabel>
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
                        <div className="flex flex-row justify-end">
                            <Button type="submit" disabled={addMember.isPending}>Submit</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddConferenceDialog;