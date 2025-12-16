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

const AISidebar = () => {
    return ( 
        <Sidebar>
            <SidebarContent>
              <SidebarGroupLabel>AI Models</SidebarGroupLabel>
              <SidebarGroup />
                <ModelList />
              <SidebarGroup />
            </SidebarContent>
        </Sidebar>
     );
}

export default AISidebar;