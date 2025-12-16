"use server"

import ollama from 'ollama'

interface responseInterface {
    message: string,
}

export const getResponse = async({ message } : responseInterface) => {
    const response = await ollama.chat({
        model: "llama2",
        messages:[{
            role: 'user',
            content: message,
        }]
    })

    console.log(response.message.content)
    return response.message.content;
}