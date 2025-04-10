import { IdCard } from "lucide-react";
// import { useState } from "react";
import CardLayout from "@/components/CardLayout";

const Page = () => {
  return (
    <CardLayout
      options
      header={
        <>
          <IdCard/>常見問題
        </>
      }>

    </CardLayout>
  )
}

export default Page;