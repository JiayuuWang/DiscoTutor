import { ChatProvider } from '@/store/chat';
import { ChatContainer } from '@/components/ChatContainer';

export default function Home() {
  return (
    <ChatProvider>
      <ChatContainer />
    </ChatProvider>
  );
}