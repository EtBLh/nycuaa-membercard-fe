import {
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table"
import * as React from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const MemberMinimalSchema = z.object({
    id: z.number(),
    name: z.string(),
    govid: z.string(),
    type: z.string(),
    birthday: z.string(),
    email: z.string(),
    phone: z.string()
})


export default function Page() {
    // Sample data for demonstration
    const [data, setData] = React.useState<z.infer<typeof MemberMinimalSchema>[]>([])

    // Track which cell is being edited
    const [editing, setEditing] = React.useState<{ row: number; column: string } | null>(null)
    const [editValue, setEditValue] = React.useState("")

    // useMutation for saving data
    const saveMutation = useMutation({
        mutationFn: async (members: typeof data) => {
            // Replace with your actual API endpoint
            console.log(members)
            return api.post("/your-endpoint/bulk-save", members)
        },
        onSuccess: () => {
            toast.success("All members saved successfully.")
        },
        onError: (error: AxiosError) => {
            toast.error(error.message || "Save failed")
        },
    })

    // Columns definition
    const columns = React.useMemo(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "id" ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].id = Number(editValue)
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            className="w-full cursor-pointer block min-w-10 min-h-4"
                            onClick={() => {
                                setEditing({ row: row.index, column: "id" })
                                setEditValue(getValue())
                            }}
                        >
                            {getValue()}
                        </span>
                    ),
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row, getValue }: any) => (
                    <Select
                        value={row.original.type || ""}
                        onValueChange={value => {
                            const newData = [...data]
                            newData[row.index].type = value
                            setData(newData)
                        }}
                    >
                        <SelectTrigger className="w-full border px-2 py-1 rounded">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="member">founding</SelectItem>
                            <SelectItem value="admin">normal</SelectItem>
                            <SelectItem value="guest">group</SelectItem>
                        </SelectContent>
                    </Select>
                ),
            },
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "name" ? (
                        <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].name = editValue
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            className="w-full cursor-pointer block min-w-10 min-h-4"
                            onClick={() => {
                                setEditing({ row: row.index, column: "name" })
                                setEditValue(getValue())
                            }}
                        >
                            {getValue()}
                        </span>
                    ),
            },
            {
                accessorKey: "govid",
                header: "Gov ID",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "govid" ? (
                        <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].govid = editValue
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            className="w-full cursor-pointer block min-w-10 min-h-4"
                            onClick={() => {
                                setEditing({ row: row.index, column: "govid" })
                                setEditValue(getValue())
                            }}
                        >
                            {getValue()}
                        </span>
                    ),
            },
            {
                accessorKey: "birthday",
                header: "Birthday",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "birthday" ? (
                        <input
                            type="date"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].birthday = editValue
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            onClick={() => {
                                setEditing({ row: row.index, column: "birthday" })
                                setEditValue(getValue())
                            }}
                            className="w-full cursor-pointer block min-w-10 min-h-4"
                        >
                            {getValue()}
                        </span>
                    ),
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "email" ? (
                        <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].email = editValue
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            onClick={() => {
                                setEditing({ row: row.index, column: "email" })
                                setEditValue(getValue())
                            }}
                            className="w-full cursor-pointer block min-w-10 min-h-4"
                        >
                            {getValue()}
                        </span>
                    ),
            },
            {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row, getValue }: any) =>
                    editing?.row === row.index && editing?.column === "phone" ? (
                        <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => {
                                const newData = [...data]
                                newData[row.index].phone = editValue
                                setData(newData)
                                setEditing(null)
                            }}
                            autoFocus
                            className="border px-2 py-1 rounded w-full"
                        />
                    ) : (
                        <span
                            onClick={() => {
                                setEditing({ row: row.index, column: "phone" })
                                setEditValue(getValue())
                            }}
                            className="w-full cursor-pointer block min-h-4 min-w-10"
                        >
                            {getValue()}
                        </span>
                    ),
            },
        ],
        [data, editing, editValue]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // Helper to get next id
    const getNextId = () => (data.length ? Math.max(...data.map(d => d.id)) + 1 : 1)

    // Add new row handler
    const handleAddRow = () => {
        setData([
            ...data,
            {
                id: getNextId(),
                name: "",
                govid: "",
                type: "",
                birthday: "",
                email: "",
                phone: "",
            },
        ])
    }

    return (
        <div className="p-4">
            <div className="relative flex flex-col gap-4 overflow-auto mt-4">
                <div className="overflow-hidden rounded-lg border">
                    <Table className="table-fixed w-full">
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead
                                            key={header.id}
                                            className="w-1/7 text-center"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell
                                            key={cell.id}
                                            className="w-1/7 align-middle"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <Button
                                        variant="outline"
                                        onClick={handleAddRow}
                                        className="w-full"
                                    >
                                        + Add Row
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    
                </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
                <Button
                    onClick={() => saveMutation.mutate(data)}
                    disabled={saveMutation.isPending}
                >
                    {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
                {saveMutation.isSuccess && (
                    <span className="text-green-600">Saved!</span>
                )}
                {saveMutation.isError && (
                    <span className="text-red-600">
                        {saveMutation.error instanceof AxiosError
                            ? saveMutation.error.message
                            : "Save failed"}
                    </span>
                )}
            </div>
        </div>
    )
}
