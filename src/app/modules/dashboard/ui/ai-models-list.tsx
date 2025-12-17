"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AISidebarIntereface {
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

const ModelList = ({ currentModel, setCurrentModel}: AISidebarIntereface) => {
    const [models, setModels] = useState<string[]>([]);


    return (
        <ul className="flex flex-col gap-2 p-4">
            {models.map(model => (
                <Button 
                    key={model}
                    onClick={
                        () => setCurrentModel(model)}
                    className={cn("border-2 border-white", model === currentModel && "border-green-500")}
                >
                    {model}
                </Button>
            ))}
        </ul>
    );
};

export default ModelList;
