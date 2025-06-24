import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from "@tabler/icons-react"
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import * as React from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IMemberData } from "@/lib/types"
import { api } from "@/lib/utils"
import { selectToken } from "@/redux/authSlice"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { IdCard, Mail } from "lucide-react"
import { useSelector } from "react-redux"
import AddMemberDialog from "../../../components/add-member-dialog"
import useMemberDataTableColDef from "./useMemberDataTableColDef"

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

  const token = useSelector(selectToken);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const searchValue = columnFilters.find(f => f.id === 'search')?.value || ''
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })


  const { data, isLoading: loading, refetch } = useQuery({
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
  
  const columns = useMemberDataTableColDef(refetch);

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
            placeholder="Search"
            value={columnFilters.find(colf => colf.id === 'search')?.value as string ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColumnFilters([{ id: 'search', value: e.target?.value ?? '' }])
            }
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <AddMemberDialog refetch={refetch}/>
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
