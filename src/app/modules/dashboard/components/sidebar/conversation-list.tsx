import { Button } from "@/components/ui/button";

const ConversationsList = () => {
    return ( 
        <ul className="flex flex-col gap-2 px-4">
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                Python coding help
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                capital of france
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                linear algebra matrix...
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                tailwind css help
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                fornite best skins
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                benefits of creatine...
            </Button>
            <Button className="border-2 justify-start border-chart-3 bg-background text-xl text-white">
                view more...
            </Button>
        </ul>
     );
}
 
export default ConversationsList;