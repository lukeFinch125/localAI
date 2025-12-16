import ollama from "ollama";

export async function GET() {
    const models = await ollama.list();
    return Response.json(models.models.map((m) => m.name));
}
