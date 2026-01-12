"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import InputFile from "./input-file";
import { Console } from "console";
import { getConversationLog, getResponse } from "@/api/modelClient";
import { ChevronUp, PlusIcon } from "lucide-react";
import { ConversationLog } from "@/api/modelClient";
import { stringify } from "querystring";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIItextInteface {
    currentModel: string;
    currentConversationID: number;
    setCurrentConversationID: (conversationID: number) => void;
}

const AIText = ({ currentModel, currentConversationID, setCurrentConversationID } : AIItextInteface) => {
    const [prompt, setPrompt] = useState("");
    const [isInputFile, setIsInputFile] = useState(false);
    const [inputFileTxt, setInputFileTxt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [conversationLog, setConversationLog] = useState<ConversationLog>({
        messages: [],
    });
    
    const handleSubmit = async () => {
        try {
            setLoading(true)
            const data = await getResponse(prompt);
            setCurrentConversationID(data.conversationID)

            const updatedLog = await getConversationLog(data.conversationID);
            setConversationLog(updatedLog);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentConversationID == null) return;

        async function loadConversationLog() {
            try {
                const data = await getConversationLog(currentConversationID);
                setConversationLog(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        loadConversationLog();
    }, [currentConversationID]);

    if(currentConversationID == null) {
        return (
            <div className="flex flex-col h-full justify-center items-center">
                <div className="h-[35%] w-[80%] flex flex-col items-center gap-8">
                    <h1 className="text-2xl">What are you working on?</h1>
                    <div className="px-2 border border-white rounded-xl flex w-full max-w-[70%] h-12 items-center">
                        <Button className="bg-secondary-foreground">
                            <PlusIcon/>
                        </Button>
                        <Input 
                            placeholder="ask anything"
                            className="border-0"
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                        />
                        <Button 
                            className="bg-foreground w-10"
                            onClick={handleSubmit}
                        >
                            <ChevronUp className="text-background size-8"/>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Scrollable area: takes all remaining space */}
            <ScrollArea className="flex-1 overflow-auto p-4">
                <div className="flex flex-col gap-4">
                {conversationLog?.messages.map((message) => (
                    <div key={message.response} className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <div className="border border-foreground p-1 rounded-sm">
                        {message.prompt}
                        </div>
                    </div>
                    <div className="text-white">{message.response}</div>
                    </div>
                ))}
                </div>
            </ScrollArea>

            {/* Input area: fixed height */}
            <div className="flex flex-col gap-2 p-4" style={{ height: "25%" }}>
                <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Prompt"
                className="border-2 border-foreground"
                />
                <InputFile setInputFileTxt={setInputFileTxt} setIsInputFile={setIsInputFile} />
                <Button onClick={handleSubmit}>Submit</Button>
            </div>
        </div>
    );
};

export default AIText;