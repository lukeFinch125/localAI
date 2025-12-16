"use client";

import { getResponse } from '@/app/api/chat/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const AIText = () => {

    const [ message, setMessage ] = useState("");
    const [response, setResponse] = useState("");

    const HandlesetMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    const handleSubmit = async() => {
        if (!message) {
            console.log("No message");
            return;
        }

        const res = await getResponse({ message });
        setResponse(res);
    }

    return ( 
        <div className='flex flex-col gap-2 p-4'>
            <Input type="search" placeholder="prompt" onChange={HandlesetMessage}/>
            <Button type="submit" onClick={handleSubmit}>Submit</Button>
            <p>{response}</p>
        </div>
     );
}
 
export default AIText;