import { SettingsIcon } from "lucide-react";
import GaugeBar from "./gauges/Guage-bar";

const TopBar = () => {
    return ( 
        <div className="grid grid-cols-2 bg-secondary-foreground">
            <div className="relative flex border-2 border-foreground bg-background rounded-2xl m-2">
                <div className="flex flex-col p-4">
                    <h1 className="text-2xl">Local AI</h1>
                    <p>Current Model: llama3.1</p>
                </div>
                <SettingsIcon
                    className="absolute top-3 right-3"
                />
            </div>
            <GaugeBar />
        </div>
     );
}
 
export default TopBar;