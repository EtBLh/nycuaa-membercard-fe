import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import * as React from "react"
import { z } from "zod"

import logo from '@/assets/logo.png'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { SearchInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IMemberData } from "@/lib/types"
import { api } from "@/lib/utils"
import { selectToken } from "@/redux/authSlice"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Ban, IdCard, Mail, Rabbit, User, Users } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { useSelector } from "react-redux"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AxiosError } from "axios"
import AddMemberDialog from "./add-member-dialog"

export const MemberFullSchema = z.object({
  id: z.number(),
  name: z.string(),
  govid: z.string(),
  permit: z.boolean(),
  type: z.string(),
  birthday: z.string(),
  email: z.string(),
  phone: z.string(),
  qrcode: z.string(),
  card_created: z.boolean(),
  icon_uploaded: z.boolean()
})


export function DataTable() {

  const setMemberPaid = useMutation({
    mutationFn: (id: number) => api.post(`/admin/member/${id}/set-paid`, {paid: true}),
    onSuccess: () => {
      alert('success');
      refetchMemberList();
    },
    onError: () => {
      alert('failed D:')
    }
  })

  const columns: ColumnDef<z.infer<typeof MemberFullSchema>>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Member ID",
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'founding' ? 'secondary' : 'outline'}>
          {row.original.type === 'normal' && <User />}
          {row.original.type === 'group' && <Users />}
          {row.original.type === 'founding' && <Rabbit />}
          {
            row.original.type
          }
        </Badge>
      )
    },
    {
      accessorKey: "name",
      header: "Name",
      enableHiding: false,
    },
    {
      accessorKey: "govid",
      header: "Government ID",
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "qrcode",
      header: "QRCode",
      cell: (param) => (
        <HoverCard>
          <HoverCardTrigger>
            <Badge variant='outline'>hover to show</Badge>
          </HoverCardTrigger>
          <HoverCardContent className="flex flex-col w-[200px] items-center">
            <span className="text-sm opacity-[0.8] mb-4 flex justify-center items-center">
              <img src={logo} alt="NYCU logo" width={24} height={24} />
              <span className="ml-1 mr-2">NYCUAA</span>
              <span>{param.row.original.name}</span>
            </span>
            <QRCodeSVG value={param.row.original.qrcode} bgColor="#0f172b" fgColor="#f8fafc" />
            <span className="text-xs opacity-[0.8]">{param.row.original.id}</span>
          </HoverCardContent>
        </HoverCard>
      )
    },
    {
      accessorKey: "permit",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.permit ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <Ban />
          )}
          {
            row.original.permit ? 'paid' : 'unpaid'
          }
        </Badge>
      ),
    },
    {
      accessorKey: "icon_uploaded",
      header: "icon?",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.icon_uploaded ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <Ban />
          )}
          {
            row.original.icon_uploaded ? 'yes' : 'no'
          }
        </Badge>
      ),
    },
    {
      accessorKey: "card_created",
      header: "pass?",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.card_created ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <Ban />
          )}
          {
            row.original.card_created ? 'yes' : 'no'
          }
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({row}) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() =>setMemberPaid.mutate(row.original.id)}>Set as paid</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const token = useSelector(selectToken);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const searchValue = columnFilters.find(f => f.id === 'search')?.value || ''
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data, isLoading: loading, refetch: refetchMemberList } = useQuery({
    queryKey: ['memberlist', token, pagination.pageIndex, pagination.pageSize, searchValue],
    queryFn: () =>
      api.get<{ members: IMemberData[]; total: number }>('/admin/members', {
        params: {
          page: pagination.pageIndex,
          pagesize: pagination.pageSize,
          search: searchValue,
        },
        headers: { Authorization: `Bearer ${token}` },
      }),
    select: res => res.data
  })

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})


  const table = useReactTable({
    data: data?.members ?? [],
    //@ts-ignore
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((data?.total ?? 0) / pagination.pageSize),

    manualFiltering: true,
    manualSorting: true,
  })

  const invitationLetter = useMutation({
    mutationFn: (memberIds: string[]) => api.post(`/admin/send-invitation-letter`, { member_ids: memberIds }),
    onSuccess: (res) => {
      alert('success: ' + JSON.stringify(res.data))
    },
    onError: (err: AxiosError<{error: string}>) => {
      alert('error:'+ err.response?.data.error)
    }
  })

  const sendInvitationLetter = () => {
    invitationLetter.mutate(Object.keys(rowSelection));
  }

  const updateMemberCard = useMutation({
    mutationFn: (memberIds: string[]) => api.post(`/admin/update-member-card`, { member_ids: memberIds }),
    onSuccess: (res) => {
      alert('succcess ' + JSON.stringify(res.data));
    },
    onError: (err: AxiosError<{error: string}>) => {
      alert('error:'+ err.response?.data.error)
    }
  })

  const sendUpdatedMemberCard = () => {
    updateMemberCard.mutate(Object.keys(rowSelection));
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6 flex-wrap lg:flex-nowrap">
        <div className="flex items-center w-full md:w-auto gap-2">
          <SearchInput
            className="md:w-[280px]"
            placeholder="Search by name/govid/member_id"
            value={columnFilters.find(colf => colf.id === 'search')?.value as string ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColumnFilters([{ id: 'search', value: e.target?.value ?? '' }])
            }
          />
          {/* <Select>
            <SelectTrigger>
              <Funnel /><SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">paid</SelectItem>
              <SelectItem value="unpaid">unpaid</SelectItem>
              <SelectItem value="clear">cancel</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <Funnel /><SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="founding">founding</SelectItem>
              <SelectItem value="normal">normal</SelectItem>
              <SelectItem value="group">group</SelectItem>
              <SelectItem value="clear">cancel</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild >
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddMemberDialog refetch={refetchMemberList}/>
          <Tooltip>
            <TooltipContent>Send Updated MemberCard(by email)</TooltipContent>
            <TooltipTrigger>
              <Button size="sm" onClick={sendUpdatedMemberCard}>
                <IdCard />
              </Button>
            </TooltipTrigger>
          </Tooltip>
          <Tooltip>
            <TooltipContent>Send Invitation Letter</TooltipContent>
            <TooltipTrigger>
              <Button size="sm" onClick={sendInvitationLetter}>
                <Mail />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-4">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {
                loading && 'Loading...'
              }
              {table.getRowModel().rows?.length && (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="relative"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
              {
                !loading && !table.getRowModel().rows.length && (
                  (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )
                )
              }
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
