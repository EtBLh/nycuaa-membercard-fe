import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ScanQrCode, Scroll, ScrollText, UserPlus, UsersIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const memberBtns = [
  {
    title: '會員列表',
    icon: UsersIcon,
    to: '/admin/home'
  },
  {
    title: '批量新增',
    icon: UserPlus,
    to: '/admin/bulk-add'
  },
]

const checkInBtns = [
  {
    title: '會議打卡',
    icon: ScanQrCode,
    to: '/admin/conference/checkin'
  },
  {
    title: '會議總覽',
    icon: ScrollText,
    to: '/admin/checkin-record'
  },
]

const logBtns = [
  {
    title: '系統日誌',
    icon: Scroll,
    to: '/admin/logs'
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
          <SidebarGroupLabel>會員資料管理</SidebarGroupLabel>
          {
            memberBtns.map(NavFactory)
          }
          <SidebarGroupLabel>會議打卡</SidebarGroupLabel>
          {
            checkInBtns.map(NavFactory)
          }
          <SidebarGroupLabel>系統日誌</SidebarGroupLabel>
          {
            logBtns.map(NavFactory)
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
