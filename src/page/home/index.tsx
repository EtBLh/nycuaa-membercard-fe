import { IdCard } from "lucide-react";
import UploadIconForm from "./UploadIcon";
import ConfirmMemberDataForm from "./ConfirmMemberData";
import DownloadMemberCardForm from "./DownloadMemberCard";
import CardLayout from "@/components/CardLayout";
import { useSelector } from "react-redux";
import { selectStep } from "@/redux/memberHomeSlice";

const Page = () => {
  const step = useSelector(selectStep);

  return (
    <CardLayout
      options
      header={
        <>
          <IdCard/>製作會員證
        </>
      }>
      {
        step === 0 && <UploadIconForm />
      }
      {
        step === 1 && <ConfirmMemberDataForm />
      }
      {
        step === 2 && <DownloadMemberCardForm />
      }
    </CardLayout>
  )
}

export default Page;