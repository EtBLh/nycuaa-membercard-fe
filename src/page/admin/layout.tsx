import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom";

const Layout = () => (
    <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
            <SiteHeader />
            <Outlet />
        </SidebarInset>
    </SidebarProvider>
)

export default Layout;