import { Message } from "./chat";
import { IndustryMode } from "@/components/ModeSelector";

export interface Conversation {
  id: string;
  title: string;
  mode: IndustryMode;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

const STORAGE_KEY = "cardinal-gpt-conversations";

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveConversation(conversation: Conversation) {
  const conversations = loadConversations();
  const index = conversations.findIndex((c) => c.id === conversation.id);
  if (index >= 0) {
    conversations[index] = { ...conversations[index], ...conversation };
  } else {
    conversations.unshift(conversation);
  }
  const trimmed = conversations.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteConversation(id: string) {
  const conversations = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function togglePin(id: string) {
  const conversations = loadConversations();
  const conv = conversations.find((c) => c.id === id);
  if (conv) {
    conv.pinned = !conv.pinned;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }
}

export function exportConversation(conv: Conversation): string {
  let md = `# ${conv.title}\n\n`;
  md += `**Mode:** ${conv.mode}\n`;
  md += `**Date:** ${new Date(conv.createdAt).toLocaleDateString()}\n\n---\n\n`;
  for (const msg of conv.messages) {
    const label = msg.role === "user" ? "👤 You" : "🤖 Cardinal GPT";
    md += `### ${label}\n\n${msg.content}\n\n---\n\n`;
  }
  return md;
}

export function generateTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Conversation";
  const text = firstUser.content.slice(0, 60);
  return text.length < firstUser.content.length ? text + "..." : text;
}
