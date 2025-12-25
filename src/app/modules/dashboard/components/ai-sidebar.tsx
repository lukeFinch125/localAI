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

interface AISidebarIntereface {
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

const AISidebar = ({ currentModel, setCurrentModel}: AISidebarIntereface) => {
    return ( 
        <Sidebar>
            <SidebarContent
             className="bg-background"
            >
              <SidebarGroupLabel>AI Models</SidebarGroupLabel>
              <SidebarGroup />
                <ModelList 
                  currentModel={currentModel}
                  setCurrentModel={setCurrentModel}
                />
              <SidebarGroup />
            </SidebarContent>
        </Sidebar>
     );
}

export default AISidebar;