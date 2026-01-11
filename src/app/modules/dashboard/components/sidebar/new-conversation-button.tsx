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
        <Button
            onClick={handleClick}
        >
            <PlusIcon />
        </Button>
     );
}
 
export default NewConversationButton;