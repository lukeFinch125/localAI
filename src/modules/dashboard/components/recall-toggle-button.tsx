import { getRecallMode, toggleRecallMode } from "@/api/modelClient";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const RecallModeButton = () => {
    const [recallMode, setRecallMode] = useState(false);

    const handleToggle = async() => {
        if(recallMode == true) {
            setRecallMode(false);
        } else {
            setRecallMode(true);
        }
        await toggleRecallMode();
    }

    useEffect(() => {
            const fetchCurrentRecallMode = async () => {
                try {
                    const recallMode = await getRecallMode();
                    setRecallMode(recallMode);
                } catch (error) {
                    console.log("Failed to catch current model: ", error);
                }
            };
    
            fetchCurrentRecallMode();
        }, []);


    if (recallMode) return ( 
        <Button className="flex m-1 bg-green-500 border-2 border-green-950 rounded-sm p-1 text-green-950"
            onClick={handleToggle}
        >
            Recall Mode
            <CheckIcon 
                color="green"
            />
        </Button>
     );

     return (
        <Button className="flex m-1 bg-background border-2 border-foreground rounded-sm p-1 text-foreground"
            onClick={handleToggle}
        >
            Recall Mode
            <XIcon
                color="red"
            />
        </Button>
     )
}
 
export default RecallModeButton;