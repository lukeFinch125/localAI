"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import InputFile from "./input-file";
import { Console } from "console";
import { getResponse } from "@/api/modelClient";

interface AIItextInteface {
    currentModel: string;
}

const AIText = ({ currentModel } : AIItextInteface) => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isInputFile, setIsInputFile] = useState(false);
    const [inputFileTxt, setInputFileTxt] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async () => {
        try {
            setLoading(true)

            const data = await getResponse(prompt);
            console.log(data);
            setResponse(data.response);
        } catch (err) {
            console.log(err);
            setResponse("Error fetching response");
        } finally {
            setLoading(false);
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
