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

// Reusable EditableCell component with placeholder support
function EditableCell({
  row,
  column,
  getValue,
  editing,
  editValue,
  setEditing,
  setEditValue,
  setData,
  data,
  type = "text",
  placeholder = "",
}: {
  row: any
  column: string
  getValue: () => any
  editing: { row: number; column: string } | null
  editValue: string
  setEditing: React.Dispatch<React.SetStateAction<{ row: number; column: string } | null>>
  setEditValue: React.Dispatch<React.SetStateAction<string>>
  setData: React.Dispatch<React.SetStateAction<any[]>>
  data: any[]
  type?: string
  placeholder?: string
}) {
  const value = getValue()
  return editing?.row === row.index && editing?.column === column ? (
    <input
      type={type}
      value={editValue}
      onChange={e => setEditValue(e.target.value)}
      onBlur={() => {
        const newData = [...data]
        newData[row.index][column] = type === "number" ? Number(editValue) : editValue
        setData(newData)
        setEditing(null)
      }}
      autoFocus
      className="border px-2 py-1 rounded w-full"
      placeholder={placeholder}
    />
  ) : (
    <span
      className={`w-full cursor-pointer block min-w-10 min-h-4 ${value === "" ? "text-muted-foreground" : ""}`}
      onClick={() => {
        setEditing({ row: row.index, column })
        setEditValue(value)
      }}
    >
      {value === "" || value === undefined || value === null ? placeholder : value}
    </span>
  )
}

export default function Page() {
    // Sample data for demonstration
    const [data, setData] = React.useState<z.infer<typeof MemberMinimalSchema>[]>([])

    // Track which cell is being edited
    const [editing, setEditing] = React.useState<{ row: number; column: string } | null>(null)
    const [editValue, setEditValue] = React.useState("")

    // useMutation for saving data
    const saveMutation = useMutation({
        mutationFn: async (members: typeof data) => {
            return api.post(`/admin/member/add`, [...members ]);
        },
        onSuccess: () => {
            setData([]);
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
                  <EditableCell
                    row={row}
                    column="id"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    type="number"
                    placeholder="Enter ID"
                  />,
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }: any) => (
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
                            <SelectItem value="founding">founding</SelectItem>
                            <SelectItem value="normal">normal</SelectItem>
                            <SelectItem value="group">group</SelectItem>
                        </SelectContent>
                    </Select>
                ),
            },
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row, getValue }: any) =>
                  <EditableCell
                    row={row}
                    column="name"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    placeholder="陳大明"
                  />,
            },
            {
                accessorKey: "govid",
                header: "Gov ID",
                cell: ({ row, getValue }: any) =>
                  <EditableCell
                    row={row}
                    column="govid"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    placeholder="A000000000"
                  />,
            },
            {
                accessorKey: "birthday",
                header: "Birthday",
                cell: ({ row, getValue }: any) =>
                  <EditableCell
                    row={row}
                    column="birthday"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    type="date"
                    placeholder="2000-01-01"
                  />,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row, getValue }: any) =>
                  <EditableCell
                    row={row}
                    column="email"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    placeholder="hello@example.com"
                  />,
            },
            {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row, getValue }: any) =>
                  <EditableCell
                    row={row}
                    column="phone"
                    getValue={getValue}
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    setData={setData}
                    data={data}
                    placeholder="0912345678"
                  />,
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
                type: "normal",
                birthday: "",
                email: "",
                phone: "",
            },
        ])
    }

    return (
        <div className="p-4 flex flex-col items-end">
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

            <div className="mb-4 flex items-center gap-4 mt-4">
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
