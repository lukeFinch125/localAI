const API_BASE = "http://localhost:8000"

export interface getModelsResponse {
    models: string[];
}

export async function getModels(): Promise<getModelsResponse> {
    const res = await fetch(`${API_BASE}/modelList`);
    if (!res.ok) throw new Error("Failed to fetch models");
    const models = await res.json();
    return { models };
}

export interface promptResponse {
        prompt: string;
        response: string;
}

export async function getResponse(prompt: string): Promise<promptResponse> {
    const res = await fetch(`${API_BASE}/prompt`, {
        method: "POST",
        headers: {
            "Content-type": 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
        }),
    });

    if(!res.ok) {
        throw new Error(`Request failed`);
    }

    return res.json();
}

export async function setChatModel(newModel: string): Promise<chatModel> {
    const res = await fetch(`${API_BASE}/setChatModel`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            chatModel: newModel
        }),
    });

    if(!res.ok) {
        throw new Error("Request failed");
    }

    return res.json();
}

export type chatModel = {
    activeModel: string;
}

export async function getCurrentModel(): Promise<string> {
    const res = await fetch(`${API_BASE}/activeModel`);
    
    if(!res.ok) {
        throw new Error(`Failed to fetch chat model: ${res.status}`);
    }


    const data = (await res.json()) as chatModel;

    console.log(data);
    return data.activeModel;
}

