import GaugeBar from "../gauges/Guage-bar";
import RecallModeButton from "../recall-toggle-button";
import SettingsButton from "./settings-button";

interface topBarInterface {
    currentModel: string
}

const TopBar = ({ currentModel }: topBarInterface) => {
    return ( 
        <div className="grid grid-cols-2 bg-secondary-foreground">
            <div className="flex gap-2 border-2 border-foreground bg-background rounded-2xl m-2">
                <div className="flex flex-col p-4">
                    <h1 className="text-2xl">Local AI</h1>
                    <p>Current Model: {currentModel}</p>
                </div>
                <div className="w-[40%] flex flex-col items-end justify-between">
                    <SettingsButton />
                    <RecallModeButton />
                </div>
            </div>
            <GaugeBar />
        </div>
     );
}
 
export default TopBar;