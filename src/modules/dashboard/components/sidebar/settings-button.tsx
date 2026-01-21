import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const SettingsButton = () => {

    const router = useRouter();
    const onClick = () => {
        router.push("/settings");
    }


    return ( 
        <Button 
            className="bg-transparent hover:bg-transparent hover:text-foreground"
            onClick={onClick}
        >
            <SettingsIcon />
        </Button>
     );
}
 
export default SettingsButton;