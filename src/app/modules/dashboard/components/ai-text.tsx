"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import InputFile from "./input-file";

interface AIItextInteface {
    currentModel: string;
}

const AIText = ({ currentModel } : AIItextInteface) => {
    const [message, setMessage] = useState("");
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isInputFile, setIsInputFile] = useState(false);
    const [inputFileTxt, setInputFileTxt] = useState("");
    

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

        setMessage(finalMessage);

        console.log("Input file present: " + isInputFile);
        console.log("message to AI: " + finalMessage);

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message: finalMessage, model: currentModel }),
        });

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            setResponse((prev) => prev + decoder.decode(value));
        }
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
