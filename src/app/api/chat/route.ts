import ollama from "ollama";

export async function POST(req: Request) {
    const { message, model } = await req.json();

    const stream = await ollama.chat({
        model: model,
        messages: [{ role: "user", content: message }],
        stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller) {
            for await (const part of stream) {
                controller.enqueue(
                    encoder.encode(part.message?.content || "")
                );
            }
            controller.close();
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}