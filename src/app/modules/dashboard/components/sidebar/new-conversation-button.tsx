import { startNewConversation } from "@/api/modelClient";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface newConversationButtonInterface {
    currentConversationID: number;
    setCurrentConversationID: (model: number) => void;
}

const NewConversationButton = ({ currentConversationID, setCurrentConversationID}: newConversationButtonInterface) => {
    const handleClick = async() => {
        const newConversationID = await startNewConversation();
        console.log(newConversationID);
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