import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";
import { useRef, useState } from "react";
import { Message } from "../types/message";

const ChatbotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: 'Hi! I\'m your AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are a helpful emergency assistant app AI. Keep responses short and helpful.',
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const reply = data?.content?.[0]?.text || 'Sorry, I could not respond.';
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.chatPanel}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderIcon}>💬</Text>
        <Text style={styles.chatHeaderTitle}>AI Assistant</Text>
        <View style={styles.onlineDot} />
      </View>

      <ScrollView
        ref={flatRef as any}
        style={styles.chatMessages}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => (flatRef.current as any)?.scrollToEnd({ animated: true })}
      >
        {messages.map((item) => (
          <View key={item.id} style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {item.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.bubbleAI}>
            <Text style={styles.bubbleTextAI}>Typing…</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything…"
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatbotPanel