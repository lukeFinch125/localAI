"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import InputFile from "./input/input-file";
import { Console } from "console";
import { branchConversation, getConversationLog, getResponse, removeLastMessageInConversation } from "@/api/modelClient";
import { ChevronUp, CopyIcon, PencilIcon, PlusIcon, RotateCcwIcon, SplitIcon, ThumbsDownIcon } from "lucide-react";
import { ConversationLog } from "@/api/modelClient";
import { stringify } from "querystring";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown"

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
    const [reloadTrigger, setReloadTrigger] = useState(0);
    
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

    const handleCopy = async(message: string) => {
        try {
            await window.navigator.clipboard.writeText(message);
        } catch (err) {
            console.error(
                "unable to copy to clipboard"
            );
        }
    }

    const handleEdit = (message: string) => {
        setPrompt(message);
        setReloadTrigger(prev => prev + 1);
    }

     const handleBranchConversation = async(prompt: string, response: string) => {
        await branchConversation(prompt, response);
        setReloadTrigger(prev => prev + 1);
    }

     const handleDeleteResponse = async() => {
        const result = await removeLastMessageInConversation();
        setReloadTrigger(prev => prev + 1);
    }

     const handleRedo = (response: string) => {
        console.log("redo response: \n" + response);
    }

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
    }, [currentConversationID, reloadTrigger]);

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
        <ScrollArea className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-5">
                {conversationLog?.messages.map((message, index) => {
                    const isLast =
                        index === conversationLog.messages.length - 1;

                    return (
                        <div
                            key={index}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex justify-end">
                                <div className="flex flex-col">
                                    <div className="whitespace-pre-wrap py-1 px-2 border border-foreground rounded-sm">
                                        {message.prompt}
                                    </div>

                                    {isLast && (
                                        <div className="flex justify-end p-1 gap-2">
                                            <Button
                                                onClick={() =>
                                                    handleCopy(message.prompt)
                                                }
                                                className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                            >
                                                <CopyIcon />
                                            </Button>
                                            <Button
                                                className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                                onClick={() =>
                                                    handleEdit(message.prompt)
                                                }
                                            >
                                                <PencilIcon />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="border-2 border-white rounded-sm py-1 px-2 text-white prose prose-invert max-w-none whitespace-pre-wrap">
                                    <ReactMarkdown>
                                        {message.response}
                                    </ReactMarkdown>
                                </div>

                                {isLast && (
                                    <div>
                                        <Button
                                            className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                            onClick={() =>
                                                handleCopy(message.response)
                                            }
                                        >
                                            <CopyIcon />
                                        </Button>
                                        <Button
                                            className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                            onClick={() =>
                                                handleRedo(message.response)
                                            }
                                        >
                                            <RotateCcwIcon />
                                        </Button>
                                        <Button
                                            className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                            onClick={() =>
                                                handleBranchConversation(
                                                    message.prompt,
                                                    message.response
                                                )
                                            }
                                        >
                                            <SplitIcon />
                                        </Button>
                                        <Button
                                            className="bg-transparent hover:bg-transparent text-white hover:text-foreground"
                                            onClick={() =>
                                                handleDeleteResponse()
                                            }
                                        >
                                            <ThumbsDownIcon />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>

        <div className="flex flex-col gap-2 p-4" style={{ height: "25%" }}>
            <Textarea
                value={prompt}
                onChange={(e) => {
                    setPrompt(e.target.value);

                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(
                        el.scrollHeight,
                        200
                    )}px`;
                }}
                placeholder="Prompt"
                className="border-2 border-foreground resize-none overflow-auto"
                style={{ maxHeight: "200px" }}
            />
            <InputFile
                setInputFileTxt={setInputFileTxt}
                setIsInputFile={setIsInputFile}
            />
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    </div>
    );
};

export default AIText;