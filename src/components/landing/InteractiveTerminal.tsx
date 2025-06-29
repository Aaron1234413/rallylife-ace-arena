
import React, { useState, useEffect, useRef } from 'react';

const COMMANDS = {
  help: {
    description: 'Show available commands',
    response: [
      'Available commands:',
      '  help     - Show this help message',
      '  status   - Check game status',
      '  stats    - Display player stats',
      '  connect  - Connect to tennis game',
      '  clear    - Clear screen',
      '  whoami   - Display player info'
    ]
  },
  status: {
    description: 'Check game status',
    response: [
      'TENNIS GAME - STATUS REPORT',
      '▓▓▓▓▓▓▓▓▓▓ 100%',
      'Game Server: ONLINE',
      'Players: 15,293 active',
      'Matches: 2,847 today',
      'Points Pool: 98,456 available',
      'Game Status: READY TO PLAY'
    ]
  },
  stats: {
    description: 'Display statistics',
    response: [
      'GLOBAL TENNIS GAME STATS',
      '========================',
      'Total Matches Played: 1,847,293',
      'Active Players: 15,293',
      'Points Distributed: 2,394,847',
      'Average Match Time: 47 minutes',
      'Top Skill: Serve Power (67%)'
    ]
  },
  connect: {
    description: 'Connect to tennis game',
    response: [
      'Connecting to Tennis Game...',
      'Finding players nearby...',
      '▓▓▓▓▓▓▓▓▓▓ Connected!',
      'Welcome to RAKO Tennis.',
      'Ready to start playing!'
    ]
  },
  whoami: {
    description: 'Display player info',
    response: [
      'Player: Tennis Gamer',
      'Level: Beginner',
      'Access: BASIC',
      'Location: Tennis Game World',
      'Status: READY TO PLAY'
    ]
  }
};

export function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{type: 'command' | 'response', content: string}>>([
    { type: 'response', content: 'TENNIS GAME CONSOLE v2.0' },
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
        { type: 'response', content: 'TENNIS GAME CONSOLE v2.0' },
        { type: 'response', content: 'Console cleared. Type "help" for commands.' },
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
          TENNIS GAME CONSOLE
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
