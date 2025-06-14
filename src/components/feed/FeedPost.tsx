
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Trophy, Target } from 'lucide-react';
import { format } from 'date-fns';

interface FeedPostProps {
  post: {
    id: string;
    type: 'level_up' | 'match_result' | 'achievement' | 'activity';
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    timestamp: string;
    content: any;
    likes: number;
    comments: number;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onChallenge: (userId: string) => void;
}

export function FeedPost({ post, onLike, onComment, onChallenge }: FeedPostProps) {
  const renderPostContent = () => {
    switch (post.type) {
      case 'level_up':
        return (
          <div className="bg-green-500 rounded-lg p-6 text-center text-white mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-yellow-300 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                <span className="text-yellow-800 font-bold text-sm">🎾</span>
              </div>
            </div>
            <div className="bg-green-400 rounded px-4 py-2 inline-block">
              <span className="font-bold text-lg">LEVEL {post.content.level}</span>
            </div>
          </div>
        );

      case 'match_result':
        return (
          <div className="bg-green-100 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 mr-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="20" cy="50" r="15" fill="#4ade80" />
                    <path d="M35 45 L50 35 L65 45 L50 55 Z" fill="#16a34a" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#16a34a" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-700">
                    {post.content.score}
                  </div>
                  <div className="text-sm text-green-600">
                    {post.content.aces} aces • {post.content.winners} winners
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'achievement':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center border-4 border-green-500">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg">
                <div className="text-lg font-bold">ACHIEVEMENT</div>
                <div className="text-xl font-bold">UNLOCKED</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPostDescription = () => {
    switch (post.type) {
      case 'level_up':
        return `Advanced to level ${post.content.level}`;
      case 'match_result':
        return 'Match Result!';
      case 'achievement':
        return `Unlocked the "${post.content.name}" badge!`;
      default:
        return post.content.description || '';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback className="bg-green-500 text-white">
                {post.user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{post.user.full_name}</h3>
              <p className="text-gray-600">{getPostDescription()}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <span className="text-xl">⋯</span>
          </button>
        </div>

        {renderPostContent()}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{post.likes}</span>
            </button>
            
            <button 
              onClick={() => onComment(post.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
          </div>

          <Button 
            onClick={() => onChallenge(post.user.id)}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
