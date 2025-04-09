import React from "react";

const CardLayout = (props: {
    header?: React.ReactNode
} & React.PropsWithChildren) => {
    return <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-start gap-1 text-[white] -mb-4 px-2">
                    {
                        props.header
                    }
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