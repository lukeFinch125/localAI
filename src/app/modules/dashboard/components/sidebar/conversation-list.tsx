'use client';

import { conversationSummary, getConversationSummaries } from "@/api/modelClient";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ConversationsList = () => {

    const [conversationSummaryList, setConversationSummaryList] = useState<conversationSummary[] | null>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
            async function loadSummarizes() {
                try {
                    const data = await getConversationSummaries();
                    setConversationSummaryList(data);
                } catch (err) {
                    setError(true);
                } finally {
                    setLoading(false);
                }
            }
            loadSummarizes();
        }, []);

    return ( 
        <ul className="flex flex-col gap-2 px-4">
            {conversationSummaryList?.map(conversation => (
                <Button 
                    key={conversation.conversation_id}
                    onClick={() => {console.log("load this conversation" + conversation.conversation_id)}}
                    className="w-full h-6.25 bg-background text-white px-1 justify-start hover:bg-foreground hover:text-background"
                >
                    <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
                        {conversation.summary}
                    </span>
                </Button>
            ))}
        </ul>
     );
}
 
export default ConversationsList;