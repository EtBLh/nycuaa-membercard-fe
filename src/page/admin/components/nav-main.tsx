import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ScanQrCode, UsersIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"


const memberBtns = [
  {
    title: 'All Member',
    icon: UsersIcon,
    to: '/admin/home'
  },
  {
    title: 'Bulk Add',
    icon: UsersIcon,
    to: '/admin/bulk-add'
  },
]

const checkInBtns = [
  {
    title: 'Check-in',
    icon: ScanQrCode,
    to: '/admin/conference/checkin'
  },
  {
    title: 'Check-in record',
    icon: ScanQrCode,
    to: '/admin/checkin-record'
  },
]

export const navs = [...checkInBtns, ...memberBtns];

const NavFactory = (btn: {
  title: string,
  icon: any,
  to: string
}) => {
  const location = useLocation();
  return (
    <Link to={btn.to}>
      <SidebarMenuItem key={btn.title}>
        <SidebarMenuButton
          tooltip={btn.title}
          className={
            location.pathname.startsWith(btn.to)
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              : undefined
          }
        >
          <btn.icon /> {btn.title}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}

export function NavMain() {

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarGroupLabel>Member Data</SidebarGroupLabel>
          {
            memberBtns.map(NavFactory)
          }
          <SidebarGroupLabel>Member Conference</SidebarGroupLabel>
          {
            checkInBtns.map(NavFactory)
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
