"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AIText = () => {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async () => {
        setResponse("");

        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message }),
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
        <div className="flex flex-col gap-2 p-4">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Prompt"
            />
            <Button onClick={handleSubmit}>Submit</Button>
            <p>{response}</p>
        </div>
    );
};

export default AIText;
