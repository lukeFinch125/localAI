"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AIText from "../components/ai-text";
import AISidebar from "./ai-sidebar";

const DashBoard = () => {
    return (
        <SidebarProvider>
            <AISidebar />
                <SidebarTrigger />
                <div className="bg-black text-white h-screen w-screen p-5">
                    Dashboard
                    <AIText />
                </div>
        </SidebarProvider>
     );
}
 
export default DashBoard;