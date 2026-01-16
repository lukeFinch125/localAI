import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";

const ManageConversationsButton = () => {
    return ( 
        <div className="flex flex-col items-start justify-between w-full">
            <Button
                className="bg-background text-foreground hover:text-background hover:bg-foreground"
            >
                Manage Conversations
                <EllipsisVerticalIcon 
                    size={16}
                    className="text-foreground"
                />
            </Button>
        </div>
     );
}
 
export default ManageConversationsButton;