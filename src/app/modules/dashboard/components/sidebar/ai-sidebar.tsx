"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import ModelList from "./ai-models-list";
import ConversationsList from "./conversation-list";

interface AISidebarIntereface {
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

const AISidebar = ({ currentModel, setCurrentModel}: AISidebarIntereface) => {
    return (
        <Sidebar>
            <SidebarContent
             className="bg-background gap-0 py-4"
            >
              <SidebarGroupLabel
                className="text-foreground text-2xl px-5 flex flex-col"
              ><p>Downloaded Models</p>
              <span className="border border-foreground w-full"/>
              </SidebarGroupLabel>
              <SidebarGroup />
                <ModelList 
                  currentModel={currentModel}
                  setCurrentModel={setCurrentModel}
                />
              <SidebarGroup />
              <SidebarGroupLabel
                className="text-foreground text-2xl px-5 flex flex-col"
              ><p>Conversations</p>
              <span className="border border-foreground w-full"/>
              </SidebarGroupLabel>
              <SidebarGroup />
                <ConversationsList />
              <SidebarGroup />
            </SidebarContent>
        </Sidebar>
     );
}

export default AISidebar;