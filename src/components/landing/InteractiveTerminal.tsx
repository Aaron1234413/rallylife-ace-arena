
import React, { useState, useEffect, useRef } from 'react';

const COMMANDS = {
  help: {
    description: 'Show available commands',
    response: [
      'Available commands:',
      '  help     - Show this help message',
      '  status   - Check system status',
      '  stats    - Display player statistics',
      '  connect  - Connect to tennis network',
      '  clear    - Clear terminal',
      '  whoami   - Display user info'
    ]
  },
  status: {
    description: 'Check system status',
    response: [
      'TENNIS PROTOCOL - STATUS REPORT',
      '▓▓▓▓▓▓▓▓▓▓ 100%',
      'Network: ONLINE',
      'Players: 15,293 active',
      'Matches: 2,847 today',
      'XP Pool: 98,456 available',
      'System: OPERATIONAL'
    ]
  },
  stats: {
    description: 'Display statistics',
    response: [
      'GLOBAL TENNIS STATISTICS',
      '========================',
      'Total Matches Played: 1,847,293',
      'Active Players: 15,293',
      'XP Distributed: 2,394,847',
      'Average Match Duration: 47 minutes',
      'Top Skill: Serve Accuracy (67%)'
    ]
  },
  connect: {
    description: 'Connect to tennis network',
    response: [
      'Connecting to Tennis Network...',
      'Establishing secure connection...',
      '▓▓▓▓▓▓▓▓▓▓ Connected!',
      'Welcome to the Tennis Protocol.',
      'Ready for match coordination.'
    ]
  },
  whoami: {
    description: 'Display user info',
    response: [
      'User: Tennis Player',
      'Clearance: Level 1',
      'Access: BASIC',
      'Location: Tennis Network',
      'Status: READY FOR PLAY'
    ]
  }
};

export function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{type: 'command' | 'response', content: string}>>([
    { type: 'response', content: 'TENNIS PROTOCOL TERMINAL v2.0' },
    { type: 'response', content: 'Type "help" for available commands.' },
    { type: 'response', content: '' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    // Add command to history
    setHistory(prev => [...prev, { type: 'command', content: `> ${command}` }]);
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (cmd === 'clear') {
      setHistory([
        { type: 'response', content: 'TENNIS PROTOCOL TERMINAL v2.0' },
        { type: 'response', content: 'Terminal cleared. Type "help" for commands.' },
        { type: 'response', content: '' }
      ]);
    } else if (COMMANDS[cmd as keyof typeof COMMANDS]) {
      const responses = COMMANDS[cmd as keyof typeof COMMANDS].response;
      for (let i = 0; i < responses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setHistory(prev => [...prev, { type: 'response', content: responses[i] }]);
      }
    } else if (cmd) {
      setHistory(prev => [...prev, { type: 'response', content: `Command not found: ${cmd}` }]);
      setHistory(prev => [...prev, { type: 'response', content: 'Type "help" for available commands.' }]);
    }

    setHistory(prev => [...prev, { type: 'response', content: '' }]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="bg-black border border-tennis-green-primary/30 rounded font-mono text-sm h-80 flex flex-col cursor-text"
      onClick={handleTerminalClick}
    >
      {/* Terminal Header */}
      <div className="bg-tennis-green-primary/10 border-b border-tennis-green-primary/30 px-3 py-2 flex items-center justify-between">
        <span className="text-tennis-green-primary text-xs font-orbitron tracking-wider">
          TENNIS PROTOCOL TERMINAL
        </span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-tennis-green-primary/30"
      >
        {history.map((entry, index) => (
          <div key={index} className={`${entry.type === 'command' ? 'text-tennis-yellow' : 'text-tennis-green-light'} mb-1`}>
            {entry.content}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-tennis-green-primary mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-transparent text-tennis-yellow outline-none"
            placeholder={isTyping ? "Processing..." : "Enter command..."}
          />
          {isTyping && (
            <div className="ml-2 text-tennis-green-primary animate-pulse">▓</div>
          )}
        </form>
      </div>
    </div>
  );
}
