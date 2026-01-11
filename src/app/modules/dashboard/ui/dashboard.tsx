"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AIText from "../components/ai-text";
import AISidebar from "../components/sidebar/ai-sidebar";
import { useEffect, useState } from "react";
import { conversationID, getConversationID, getCurrentModel } from "@/api/modelClient";
import ControlBar from "../components/gauges/Guage-bar";
import TopBar from "../components/top-bar";

const DashBoard = () => {

    const [currentModel, setCurrentModel] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [currentConversationID, setCurrentConversationID] = useState<conversationID>(0)

    useEffect(() => {
        const fetchCurrentModel = async () => {
            try {
                const model = await getCurrentModel();
                const conversationID = await getConversationID();
                setCurrentModel(model);
                setCurrentConversationID(conversationID);
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
                currentConversationID={currentConversationID}
                setCurrentConversationID={setCurrentConversationID}
            />
                <SidebarTrigger />
                <div className="flex flex-col min-h-screen w-full bg-secondary-foreground">
                    <TopBar />
                        <AIText 
                            currentModel={currentModel}
                            currentConversationID={currentConversationID}
                            setCurrentConversationID={setCurrentConversationID}
                        />
                </div>
        </SidebarProvider>
     );
}
 
export default DashBoard;