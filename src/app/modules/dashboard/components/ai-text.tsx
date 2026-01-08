"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import InputFile from "./input-file";
import { Console } from "console";
import { getConversationLog, getResponse } from "@/api/modelClient";
import { ChevronUp, PlusIcon } from "lucide-react";
import { ConversationLog } from "@/api/modelClient";

interface AIItextInteface {
    currentModel: string;
    currentConversationID: number;
    setCurrentConversationID: (conversationID: number) => void;
}

const AIText = ({ currentModel, currentConversationID, setCurrentConversationID } : AIItextInteface) => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isInputFile, setIsInputFile] = useState(false);
    const [inputFileTxt, setInputFileTxt] = useState("");
    const [loading, setLoading] = useState(false);
    const [inConversation, setInConversation] = useState(false);
    const [conversationLog, setConversationLog] = useState<ConversationLog>();
    
    const handleSubmit = async () => {
        try {
            if (!inConversation) {
                setInConversation(true);
            }
            setLoading(true)
            const data = await getResponse(prompt);
            setResponse(data.response);
            setCurrentConversationID(data.conversationID)
        } catch (err) {
            console.log(err);
            setResponse("Error fetching response");
        } finally {
            const messages = await getConversationLog(currentConversationID);
            setConversationLog(messages);
            console.log(conversationLog)
            setLoading(false);
        }
    };

    if(!inConversation) {
        return (
            <div className="flex flex-col justify-center items-center h-[70%] w-full border-white border">
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
        <div className="grid h-full grid-rows-[75%_25%] p-8 gap-4">
            <div className="border border-white ">
                <p>{response}</p>
            </div>
            <div className="border border-white flex flex-col gap-2 p-4 h-full w-full">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Prompt"
                    className="border-2 border-foreground"
                />
                <InputFile setInputFileTxt={setInputFileTxt} setIsInputFile={setIsInputFile}/>
                <Button onClick={handleSubmit}>Submit</Button>
            </div>
        </div>
    );
};

export default AIText;
