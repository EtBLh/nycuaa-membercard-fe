import * as React from "react"
import { z } from "zod"
// @ts-ignore
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

export const MemberMinimalSchema = z.object({
    id: z.number(),
    name: z.string(),
    govid: z.string(),
    type: z.string(),
    birthday: z.string(),
    email: z.string(),
    phone: z.string()
})

const COLUMN_OPTIONS = ["id", "name", "govid", "type", "birthday", "email", "phone"]
const REQUIRED_COLUMNS = ["id", "name", "govid", "birthday", "email", "phone"]

export default function Page() {
    // State for CSV file upload
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [csvData, setCsvData] = React.useState<string[][]>([])
    const [columnMapping, setColumnMapping] = React.useState<Record<string, number>>({})
    const [showMappingDialog, setShowMappingDialog] = React.useState(false)
    const [csvHeaders, setCsvHeaders] = React.useState<string[]>([])
    const [rowTypes, setRowTypes] = React.useState<Record<number, string>>({})

    // useMutation for saving data
    const saveMutation = useMutation({
        mutationFn: async (members: z.infer<typeof MemberMinimalSchema>[]) => {
            return api.post(`/admin/member/add`, members)
        },
        onSuccess: () => {
            setCsvData([])
            setColumnMapping({})
            setCsvHeaders([])
            setRowTypes({})
            setShowMappingDialog(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
            toast.success("所有會員導入成功。")
        },
        onError: (error: AxiosError) => {
            toast.error(error.message || "導入失敗")
        },
    })

    // Handle CSV file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results: any) => {
                if (results.data.length > 0) {
                    const data = results.data as string[][]
                    setCsvHeaders(data[0])
                    setCsvData(data.slice(1))
                    setShowMappingDialog(true)
                    // Initialize mapping with index positions, skip 'type' column
                    const initialMapping: Record<string, number> = {}
                    COLUMN_OPTIONS.forEach(col => {
                        if (col === "type") return // Skip type column
                        const headerIndex = data[0].findIndex(h => h.toLowerCase().includes(col.toLowerCase()))
                        if (headerIndex !== -1) {
                            initialMapping[col] = headerIndex
                        }
                    })
                    setColumnMapping(initialMapping)
                    // Initialize all rows with 'normal' as default type
                    const initialRowTypes: Record<number, string> = {}
                    data.slice(1).forEach((_, index) => {
                        initialRowTypes[index] = "normal"
                    })
                    setRowTypes(initialRowTypes)
                } else {
                    toast.error("CSV 文件為空")
                }
            },
            error: (error: any) => {
                toast.error(`解析 CSV 出錯: ${error.message}`)
            },
        })
    }

    // Handle column mapping change
    const handleMappingChange = (column: string, headerIndex: number) => {
        setColumnMapping(prev => ({
            ...prev,
            [column]: headerIndex
        }))
    }

    // Prepare data for submission
    const getMappedData = (): z.infer<typeof MemberMinimalSchema>[] => {
        return csvData.map((row, rowIndex) => {
            const mappedRow: any = {}
            Object.entries(columnMapping).forEach(([column, headerIndex]) => {
                const value = row[headerIndex]
                if (column === "id") {
                    mappedRow[column] = parseInt(value) || rowIndex
                } else {
                    mappedRow[column] = value || ""
                }
            })
            // Use the type from rowTypes
            mappedRow.type = rowTypes[rowIndex] || "normal"
            return mappedRow
        })
    }

    // Handle confirm
    const handleConfirm = () => {
        const mappedData = getMappedData()
        saveMutation.mutate(mappedData)
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">從 CSV 導入會員</h1>
                <p className="text-muted-foreground">上傳 CSV 文件批量導入會員</p>
            </div>

            {/* File Upload Button */}
            <div className="flex gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="default"
                >
                    上傳 CSV 文件
                </Button>
            </div>

            {/* Column Mapping Dialog */}
            <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
                <DialogContent className="w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-[90vw]">
                    <DialogHeader>
                        <DialogTitle>CSV Column Mapping</DialogTitle>
                        <DialogDescription>
                            選擇您的 CSV 中的哪一列對應於每個會員屬性
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-4 h-[70vh]">
                        {/* Column Mapping Selectors - Left Side */}
                        <div className="w-36 flex-shrink-0 space-y-3 overflow-y-auto pr-2">
                            {COLUMN_OPTIONS.filter(col => col !== "type").map(column => (
                                <div key={column} className="space-y-2 mb-2">
                                    <label className="text-sm font-medium capitalize mb-1 block">{column}</label>
                                    <Select
                                        value={columnMapping[column]?.toString() || "-1"}
                                        onValueChange={value => {
                                            if (value === "-1") {
                                                const newMapping = { ...columnMapping }
                                                delete newMapping[column]
                                                setColumnMapping(newMapping)
                                            } else {
                                                handleMappingChange(column, parseInt(value))
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="text-xs w-full">
                                            <SelectValue placeholder={`Select`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="-1">None</SelectItem>
                                            {csvHeaders.map((header, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {header}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        {/* Preview Table - Right Side */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-sm font-semibold mb-2">預覽</h3>
                            <div className="overflow-x-auto overflow-y-auto border rounded-lg flex-1">
                                <Table>
                                    <TableHeader className="bg-muted sticky top-0 z-10">
                                        <TableRow>
                                            {COLUMN_OPTIONS.map(column => (
                                                <TableHead key={column} className="text-center capitalize text-xs">
                                                    {column}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {csvData.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {COLUMN_OPTIONS.map(column => {
                                                    if (column === "type") {
                                                        return (
                                                            <TableCell key={`${rowIndex}-${column}`} className="text-center">
                                                                <Select
                                                                    value={rowTypes[rowIndex] || "normal"}
                                                                    onValueChange={value => {
                                                                        setRowTypes(prev => ({
                                                                            ...prev,
                                                                            [rowIndex]: value
                                                                        }))
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="w-full text-xs h-8">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="normal">normal</SelectItem>
                                                                        <SelectItem value="founding">founding</SelectItem>
                                                                        <SelectItem value="group">group</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                        )
                                                    }
                                                    const headerIndex = columnMapping[column]
                                                    const value = headerIndex !== undefined ? row[headerIndex] : ""
                                                    return (
                                                        <TableCell key={`${rowIndex}-${column}`} className="text-center text-xs">
                                                            {value || "-"}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={saveMutation.isPending || !REQUIRED_COLUMNS.every(col => col in columnMapping)}
                        >
                            {saveMutation.isPending ? "導入中..." : "確認並導入"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
