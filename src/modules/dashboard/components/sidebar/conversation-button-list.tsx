import ManageConversationsButton from "./manage-conversations-button";
import NewConversationButton from "./new-conversation-button";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ConversationButtonListInterface {
    setCurrentConversationID: (model: number) => void;
}

const ConversationButtonList = ({setCurrentConversationID}: ConversationButtonListInterface) => {
    return ( 
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <EllipsisVerticalIcon 
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border-foreground border-2" align="start">
                <DropdownMenuItem
                    className="hover:bg-foreground focus:bg-foreground"
                >
                    <NewConversationButton setCurrentConversationID={setCurrentConversationID}/>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="hover:bg-foreground focus:bg-foreground"
                >
                    <ManageConversationsButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
     );
}
 
export default ConversationButtonList;