const API_BASE = "http://localhost:8000"

export interface ModelsResponse {
    models: string[];
}

export async function getModels(): Promise<ModelsResponse> {
    const res = await fetch(`${API_BASE}/modelList`);
    if (!res.ok) throw new Error("Failed to fetch models");
    const models = await res.json();
    return { models };
}