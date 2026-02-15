import { ChatLayout } from "@/components/ChatLayout";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <ChatLayout>
      {({ mode, toolPrompt, messages, setMessages, onMessagesChange }) => (
        <ChatInterface
          mode={mode}
          toolPrompt={toolPrompt}
          messages={messages}
          setMessages={setMessages}
          onMessagesChange={onMessagesChange}
        />
      )}
    </ChatLayout>
  );
};

export default Index;
