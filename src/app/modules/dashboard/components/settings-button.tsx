import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";

const SettingsButton = () => {

    const onClick = () => {
        console.log("Button Clicked");
    }


    return ( 
        <Button 
            className="absolute top-1 right-1 bg-transparent hover:bg-transparent hover:text-foreground"
            onClick={onClick}
        >
            <SettingsIcon />
        </Button>
     );
}
 
export default SettingsButton;