import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InputFileInterface {
    setInputFileTxt: (model: string) => void;
    setIsInputFile: (model: boolean) => void;
}

const InputFile = ({ setInputFileTxt, setIsInputFile } : InputFileInterface ) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setInputFileTxt(reader.result as string);
        };
        reader.onerror = () => {
        console.error("Error reading file");
        };

        setIsInputFile(true);
        reader.readAsText(file); // Converts file to text
    };

    return ( 
        <>
            <input type="file" onChange={handleFileChange} accept=".txt"/>
        </>
     );
}
 
export default InputFile;