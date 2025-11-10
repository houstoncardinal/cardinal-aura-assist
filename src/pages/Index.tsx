import { ChatLayout } from "@/components/ChatLayout";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <ChatLayout>
      {({ mode, toolPrompt }) => <ChatInterface mode={mode} toolPrompt={toolPrompt} />}
    </ChatLayout>
  );
};

export default Index;
