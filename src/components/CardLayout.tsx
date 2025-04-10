import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button";
import { ChevronDown, Languages, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearToken } from "@/redux/authSlice";

const CardLayout = (props: {
    header?: React.ReactNode
    options?: boolean
    languageSwitch?: boolean
} & React.PropsWithChildren) => {
    const dispatch = useDispatch();

    return <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-between -mb-4 text-[white] px-1 h-[48px]">
                    <div className="flex flex-row items-center justify-start gap-1">
                        {
                            props.header
                        }
                    </div>
                    <div className="flex flex-row items-center justify-start gap-1">
                        {
                            props.options ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size='icon' variant='ghost'>
                                            <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" sideOffset={16} alignOffset={4} >
                                        <DropdownMenuItem onClick={() => dispatch(clearToken())}>
                                            <LogOut />登出
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null
                        }
                        {
                            props.languageSwitch ? (
                                <Button size='icon' variant='ghost'>
                                    <Languages />
                                </Button>
                            ) : null
                        }
                    </div>
                </div>
                {
                    props.children
                }
                <div className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                    <span>國立陽明交通大學校友總會 NYCUAA</span>
                </div>
            </div>
        </div>
    </div>
}

export default CardLayout;