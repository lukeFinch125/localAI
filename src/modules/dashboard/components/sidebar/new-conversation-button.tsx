import { startNewConversation } from "@/api/modelClient";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface newConversationButtonInterface {
    setCurrentConversationID: (model: number) => void;
}

const NewConversationButton = ({ setCurrentConversationID }: newConversationButtonInterface) => {
    const handleClick = async() => {
        const newConversationID = await startNewConversation();
        setCurrentConversationID(newConversationID);
    }
    return ( 
        <div className="flex flex-col items-start justify-between w-full">
            <Button
                onClick={handleClick}
                className="p-0 border-0 bg-transparent hover:bg-foreground text-foreground hover:text-background"
            >
                <h6>New Conversation</h6>
                <PlusIcon 
                    size={16}
                    className="text-foreground"
                />
            </Button>
        </div>
     );
}
 
export default NewConversationButton;