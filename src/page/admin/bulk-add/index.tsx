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
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { X } from "lucide-react"

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
    const [invalidNames, setInvalidNames] = React.useState<Set<string>>(new Set())
    const [invalidIds, setInvalidIds] = React.useState<Set<number>>(new Set())
    const [internalInvalidNames, setInternalInvalidNames] = React.useState<Set<string>>(new Set())
    const [internalInvalidIds, setInternalInvalidIds] = React.useState<Set<number>>(new Set())

    // Compute current invalid rows based on all invalid names and ids
    const currentInvalidRows = React.useMemo(() => {
        const nameIndex = columnMapping['name']
        const idIndex = columnMapping['id']
        const invalid = new Set<number>()

        csvData.forEach((row, rowIndex) => {
            let isInvalid = false

            if (nameIndex !== undefined) {
                const name = row[nameIndex]
                if (name && (invalidNames.has(name) || internalInvalidNames.has(name))) {
                    isInvalid = true
                }
            }

            if (idIndex !== undefined) {
                const id = parseInt(row[idIndex])
                if (!isNaN(id) && (invalidIds.has(id) || internalInvalidIds.has(id))) {
                    isInvalid = true
                }
            }

            if (isInvalid) {
                invalid.add(rowIndex)
            }
        })

        return invalid
    }, [csvData, columnMapping, invalidNames, invalidIds, internalInvalidNames, internalInvalidIds])

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
            setInvalidNames(new Set())
            setInvalidIds(new Set())
            setInternalInvalidNames(new Set())
            setInternalInvalidIds(new Set())
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

    // Mutation for checking duplicates
    const checkDuplicatesMutation = useMutation({
        mutationFn: async (data: { names: string[], ids: number[] }) => {
            const responses = await Promise.all([
                api.post<{ invalid: string[] }>('/admin/member/check-duplicate/name', { names: data.names }),
                api.post<{ invalid: number[] }>('/admin/member/check-duplicate/id', { ids: data.ids })
            ])
            return {
                invalidNames: responses[0].data.invalid,
                invalidIds: responses[1].data.invalid
            }
        },
        onSuccess: (result) => {
            setInvalidNames(new Set(result.invalidNames))
            setInvalidIds(new Set(result.invalidIds))
            
            if (result.invalidNames.length > 0 || result.invalidIds.length > 0) {
                const count = result.invalidNames.length + result.invalidIds.length
                toast.error(`發現 ${count} 個在資料庫中重複的會員`)
            }
        },
        onError: () => {
            toast.error("檢查重複會員失敗")
        }
    })

    // Check for duplicates within CSV data itself
    const checkInternalDuplicates = (data: string[][], mapping: Record<string, number>) => {
        const nameIndex = mapping['name']
        const idIndex = mapping['id']
        const internalInvalidNames = new Set<string>()
        const internalInvalidIds = new Set<number>()

        if (nameIndex !== undefined || idIndex !== undefined) {
            const seenNames = new Set<string>()
            const seenIds = new Set<number>()

            data.forEach((row) => {
                if (nameIndex !== undefined) {
                    const name = row[nameIndex]
                    if (name && seenNames.has(name)) {
                        internalInvalidNames.add(name)
                    }
                    if (name) seenNames.add(name)
                }

                if (idIndex !== undefined) {
                    const id = parseInt(row[idIndex])
                    if (!isNaN(id) && seenIds.has(id)) {
                        internalInvalidIds.add(id)
                    }
                    if (!isNaN(id)) seenIds.add(id)
                }
            })
        }

        return { internalInvalidNames, internalInvalidIds }
    }

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

                    // Check for internal duplicates after mapping
                    const { internalInvalidNames, internalInvalidIds } = checkInternalDuplicates(data.slice(1), initialMapping)
                    setInternalInvalidNames(internalInvalidNames)
                    setInternalInvalidIds(internalInvalidIds)

                    // Check against database if both name and id are mapped
                    if (initialMapping['name'] !== undefined && initialMapping['id'] !== undefined) {
                        const names: string[] = []
                        const ids: number[] = []

                        data.slice(1).forEach(row => {
                            const name = row[initialMapping['name']]
                            const id = parseInt(row[initialMapping['id']])
                            if (name) names.push(name)
                            if (!isNaN(id)) ids.push(id)
                        })

                        checkDuplicatesMutation.mutate({ names, ids })
                    }
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
        setColumnMapping(prev => {
            const updated = {
                ...prev,
                [column]: headerIndex
            }
            
            // Check for internal duplicates first
            const { internalInvalidNames, internalInvalidIds } = checkInternalDuplicates(csvData, updated)
            setInternalInvalidNames(internalInvalidNames)
            setInternalInvalidIds(internalInvalidIds)

            // Check for duplicates when both name and id columns are mapped
            if (updated['name'] !== undefined && updated['id'] !== undefined) {
                const names: string[] = []
                const ids: number[] = []
                
                csvData.forEach(row => {
                    const name = row[updated['name']]
                    const id = parseInt(row[updated['id']])
                    if (name) names.push(name)
                    if (!isNaN(id)) ids.push(id)
                })
                
                checkDuplicatesMutation.mutate({ names, ids })
            }
            
            return updated
        })
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
                                            <TableHead className="text-center text-xs">狀態</TableHead>
                                            <TableHead className="text-center text-xs"></TableHead>
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
                                                <TableCell className="text-center">
                                                    {currentInvalidRows.has(rowIndex) ? (
                                                        <Badge variant="destructive">重複</Badge>
                                                    ) : (
                                                        <Badge variant="outline">有效</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updatedData = csvData.filter((_, i) => i !== rowIndex)
                                                            setCsvData(updatedData)
                                                            setRowTypes(prev => {
                                                                const updated = { ...prev }
                                                                delete updated[rowIndex]
                                                                return updated
                                                            })
                                                            
                                                            // Re-check internal duplicates after deletion
                                                            const { internalInvalidNames, internalInvalidIds } = checkInternalDuplicates(updatedData, columnMapping)
                                                            setInternalInvalidNames(internalInvalidNames)
                                                            setInternalInvalidIds(internalInvalidIds)
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
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
                            disabled={saveMutation.isPending || !REQUIRED_COLUMNS.every(col => col in columnMapping) || currentInvalidRows.size > 0}
                        >
                            {saveMutation.isPending ? "導入中..." : "確認並導入"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
