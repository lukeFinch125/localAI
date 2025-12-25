"use client";

import { getModels, getModelsResponse, setChatModel } from "@/api/modelClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface AISidebarIntereface {
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

const ModelList = ({ currentModel, setCurrentModel}: AISidebarIntereface) => {

    const [modelList, setModelList] = useState<getModelsResponse | null>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadModels() {
            try {
                const data = await getModels();
                setModelList(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        loadModels();
    }, []);

    const updateModel = async (model: string) => {
        try {
            setCurrentModel(model);//use state
            setChatModel(model);//api
        } catch(err) {
            console.error("Failed to update model: ", err);
        }
    }

    return (
        <ul className="flex flex-col gap-2 px-4">
            {modelList?.models.map(model => (
                <Button 
                    key={model}
                    onClick={() => updateModel(model)}
                    className={cn("border-2 border-chart-3 bg-background text-xl text-white", model === currentModel && " text-foreground border-foreground")}
                >
                    {model}
                </Button>
            ))}
            <Button className="border-2 border-chart-3 bg-background">
                <PlusIcon />
            </Button>
        </ul>
    );
};

export default ModelList;
