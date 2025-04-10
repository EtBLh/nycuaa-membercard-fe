import { IdCard } from "lucide-react";
import UploadIconForm from "./UploadIcon";
import { useState } from "react";
import ConfirmMemberDataForm from "./ConfirmMemberData";
import DownloadMemberCardForm from "./DownloadMemberCard";
import CardLayout from "@/components/CardLayout";

const Page = () => {
  const [step, setStep] = useState(0);
  return (
    <CardLayout
      options
      header={
        <>
          <IdCard/>製作會員證
        </>
      }>
      {
        step === 0 && <UploadIconForm 
          next={() => setStep(prev => prev + 1)} 
        />
      }
      {
        step === 1 && <ConfirmMemberDataForm 
          next={() => setStep(prev => prev + 1)} 
          back={() => setStep(prev => prev - 1)}
        />
      }
      {
        step === 2 && <DownloadMemberCardForm />
      }
    </CardLayout>
  )
}

export default Page;