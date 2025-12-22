"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AIText from "../components/ai-text";
import AISidebar from "../components/ai-sidebar";
import { useState } from "react";

const DashBoard = () => {

    const [currentModel, setCurrentModel] = useState("llama2:latest");

    return (
        <SidebarProvider>
            <AISidebar 
                currentModel={currentModel}
                setCurrentModel={setCurrentModel}
            />
                <SidebarTrigger />
                <div className="bg-black text-white h-screen w-screen p-5">
                    Dashboard
                    <AIText 
                        currentModel={currentModel}
                    />
                </div>
        </SidebarProvider>
     );
}
 
export default DashBoard;