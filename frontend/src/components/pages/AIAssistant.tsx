import { useState } from 'react';
import { useAskAI } from '../../hooks/useKnowledge';
import './AIAssistant.css';

interface AIAssistantProps {
  user: any;
  onClose: () => void;
}

interface ChatTurn {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant({ user, onClose }: AIAssistantProps) {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const ask = useAskAI();

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    const turnId = Date.now();
    setTurns((prev) => [...prev, { id: turnId, role: 'user', content: trimmed }]);
    setQuestion('');
    try {
      const response: any = await ask.mutateAsync(trimmed);
      const answer = response?.data?.answer || response?.answer || 'No response from assistant.';
      setTurns((prev) => [
        ...prev,
        { id: turnId + 1, role: 'assistant', content: answer }
      ]);
    } catch (error: any) {
      setTurns((prev) => [
        ...prev,
        {
          id: turnId + 1,
          role: 'assistant',
          content: `Assistant unavailable: ${error?.message || 'unknown error'}`
        }
      ]);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div>
          <h3>NISO AI Assistant</h3>
          <p>Ask about procedures, safety, operational policy.</p>
        </div>
        <button onClick={onClose} className="btn-close" type="button">✕</button>
      </div>

      <div className="ai-transcript">
        {turns.length === 0 ? (
          <div className="ai-empty">
            Try: "What is the SLA threshold for variance?" or "Procedure for breaker trip on 132kV."
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className={`ai-turn role-${turn.role}`}>
              <div className="ai-turn-label">
                {turn.role === 'user' ? user?.fullName || 'You' : 'NISO AI'}
              </div>
              <div className="ai-turn-content">{turn.content}</div>
            </div>
          ))
        )}
        {ask.isLoading && (
          <div className="ai-turn role-assistant">
            <div className="ai-turn-label">NISO AI</div>
            <div className="ai-turn-content ai-thinking">Thinking…</div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="ai-input-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question…"
          disabled={ask.isLoading}
        />
        <button type="submit" disabled={!question.trim() || ask.isLoading} className="btn-primary">
          {ask.isLoading ? 'Thinking…' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
