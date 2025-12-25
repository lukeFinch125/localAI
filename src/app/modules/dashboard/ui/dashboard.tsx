"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AIText from "../components/ai-text";
import AISidebar from "../components/ai-sidebar";
import { useEffect, useState } from "react";
import { getCurrentModel } from "@/api/modelClient";
import ControlBar from "../components/gauges/Guage-bar";
import TopBar from "../components/top-bar";

const DashBoard = () => {

    const [currentModel, setCurrentModel] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentModel = async () => {
            try {
                const model = await getCurrentModel();
                console.log("FetchCurrentModel: " + model);
                setCurrentModel(model);
            } catch (error) {
                console.log("Failed to catch current model: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentModel();
    }, []);


    return (
        <SidebarProvider>
            <AISidebar 
                currentModel={currentModel}
                setCurrentModel={setCurrentModel}
            />
                <div className="flex flex-col w-full bg-background">
                    <TopBar />
                        <AIText 
                            currentModel={currentModel}
                        />
                </div>
        </SidebarProvider>
     );
}
 
export default DashBoard;