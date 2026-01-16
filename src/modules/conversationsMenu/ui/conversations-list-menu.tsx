import AllConversationsList from "./all-conversations-list";

const ConversationsListMenu = () => {
    return ( 
        <div className="w-full flex flex-col justify-center items-center py-3">
            <div className="text-2xl rounded-sm border-2 border-foreground p-2">
                <h6>
                    Manage Conversations
                </h6>
            </div>
            <AllConversationsList />
        </div>
     );
}
 
export default ConversationsListMenu;