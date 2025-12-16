"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import InputFile from "./input-file";

interface AIItextInteface {
    currentModel: string;
}

const AIText = ({ currentModel } : AIItextInteface) => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isInputFile, setIsInputFile] = useState(false);
    const [inputFileTxt, setInputFileTxt] = useState("");
    
    type ChatMessage = { role: "user" | "assistant"; content: string};

    const convoRef = useRef<ChatMessage[]>([]);
    

    const handleSubmit = async () => {

        setResponse("");

        let finalMessage = "";

        if (isInputFile) {
            finalMessage =
                "Here is an input file txt to help you answer my upcoming question:\n\n" +
                inputFileTxt +
                "\n\nThat is the end of the article. Here is my question:\n" +
                prompt;
        } else {
            finalMessage = prompt;
        }

        convoRef.current.push({ role: "user", content: finalMessage });

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ messages: convoRef.current, model: currentModel }),
        });

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            setResponse((prev) => prev + decoder.decode(value));
        }

        convoRef.current.push({ role: "assistant", content: response});
    };

    return (
        <div className="flex flex-col gap-2 p-4 border-2">
            <h4>Current Model: {currentModel}</h4>
            <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Prompt"
            />
            <InputFile setInputFileTxt={setInputFileTxt} setIsInputFile={setIsInputFile}/>
            <Button onClick={handleSubmit}>Submit</Button>
            <p>{response}</p>
        </div>
    );
};

export default AIText;
