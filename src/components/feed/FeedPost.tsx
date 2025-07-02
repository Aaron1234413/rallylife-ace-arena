
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Trophy, Target, Send, Users, Clock, Star, MapPin, Zap, Coins, Swords } from 'lucide-react';
import { format } from 'date-fns';

interface FeedPostProps {
  post: {
    id: string;
    type: 'level_up' | 'match_result' | 'achievement' | 'activity' | 'social_play' | 'training' | 'lesson' | 'challenge_sent' | 'challenge_accepted' | 'challenge_completed';
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    timestamp: string;
    content: {
      title: string;
      description?: string;
      stats: {
        xp?: number;
        hp?: number;
        score?: string;
        duration?: number;
        opponent_name?: string;
        location?: string;
        // Social play specific stats
        session_type?: 'singles' | 'doubles';
        competitive_level?: 'low' | 'medium' | 'high';
        participant_count?: number;
        participant_names?: string[];
        mood?: string;
        notes?: string;
        // Challenge specific stats
        stakes_tokens?: number;
        stakes_premium_tokens?: number;
        challenge_type?: 'match' | 'social_play';
        winner_name?: string;
        challenger_name?: string;
        challenged_name?: string;
      };
    };
    likes: number;
    comments: number;
    userHasLiked: boolean;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => Promise<string | null>;
  onChallenge: (userId: string) => void;
}

export function FeedPost({ post, onLike, onComment, onChallenge }: FeedPostProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const result = await onComment(post.id, commentContent);
    if (result) {
      setCommentContent('');
      setShowCommentInput(false);
    }
    setIsSubmittingComment(false);
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      'great': '😄',
      'good': '😊',
      'relaxed': '😌',
      'strong': '💪',
      'energized': '🔥',
      'exhausted': '😓',
      'focused': '🤔',
      'determined': '😤'
    };
    return moodMap[mood] || '';
  };

  const getCompetitiveLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Chill';
      case 'medium': return 'Fun';
      case 'high': return 'Competitive';
      default: return level;
    }
  };

  const getCompetitiveLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPostContent = () => {
    switch (post.type) {
      case 'social_play':
        return (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-4 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-purple-900">Social Play Session</div>
                  <div className="text-sm text-purple-700">
                    {post.content.stats.session_type === 'singles' ? 'Singles' : 'Doubles'} • 
                    {post.content.stats.competitive_level && ` ${getCompetitiveLevelText(post.content.stats.competitive_level)}`}
                  </div>
                </div>
              </div>
              {post.content.stats.mood && (
                <div className="text-2xl">
                  {getMoodEmoji(post.content.stats.mood)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              {post.content.stats.duration && (
                <div className="flex items-center gap-2 text-purple-700">
                  <Clock className="w-4 h-4" />
                  <span>{post.content.stats.duration} minutes</span>
                </div>
              )}
              {post.content.stats.participant_count && (
                <div className="flex items-center gap-2 text-purple-700">
                  <Users className="w-4 h-4" />
                  <span>{post.content.stats.participant_count} players</span>
                </div>
              )}
              {post.content.stats.location && (
                <div className="flex items-center gap-2 text-purple-700">
                  <MapPin className="w-4 h-4" />
                  <span>{post.content.stats.location}</span>
                </div>
              )}
              {post.content.stats.score && (
                <div className="flex items-center gap-2 text-purple-700">
                  <Trophy className="w-4 h-4" />
                  <span>{post.content.stats.score}</span>
                </div>
              )}
            </div>

            {post.content.stats.participant_names && post.content.stats.participant_names.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-purple-600 mb-2">Played with:</div>
                <div className="flex flex-wrap gap-1">
                  {post.content.stats.participant_names.map((name, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              {post.content.stats.competitive_level && (
                <Badge className={`${getCompetitiveLevelColor(post.content.stats.competitive_level)} border-0 text-xs`}>
                  {getCompetitiveLevelText(post.content.stats.competitive_level)}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white text-xs">
                Social Play
              </Badge>
            </div>

            {post.content.stats.notes && (
              <div className="bg-white/60 rounded p-3 text-sm text-gray-700 italic">
                "{post.content.stats.notes}"
              </div>
            )}
          </div>
        );

      case 'level_up':
        return (
          <div className="bg-green-500 rounded-lg p-6 text-center text-white mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-yellow-300 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                <span className="text-yellow-800 font-bold text-sm">🎾</span>
              </div>
            </div>
            <div className="bg-green-400 rounded px-4 py-2 inline-block">
              <span className="font-bold text-lg">LEVEL UP!</span>
            </div>
            {post.content.stats.xp && (
              <p className="mt-2 text-sm">+{post.content.stats.xp} XP earned</p>
            )}
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
                    {post.content.stats.score || 'Match Completed'}
                  </div>
                  {post.content.stats.opponent_name && (
                    <div className="text-sm text-green-600">
                      vs {post.content.stats.opponent_name}
                    </div>
                  )}
                  {post.content.stats.duration && (
                    <div className="text-sm text-green-600">
                      {post.content.stats.duration} minutes
                    </div>
                  )}
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

      case 'challenge_sent':
        return (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 mb-4 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-orange-900">Challenge Sent!</div>
                  <div className="text-sm text-orange-700">
                    {post.content.stats.challenge_type === 'match' ? 'Tennis Match' : 'Social Play'} Challenge
                  </div>
                </div>
              </div>
              <div className="text-2xl">⚔️</div>
            </div>

            {(post.content.stats.stakes_tokens && post.content.stats.stakes_tokens > 0) || 
             (post.content.stats.stakes_premium_tokens && post.content.stats.stakes_premium_tokens > 0) ? (
              <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Challenge Stakes</span>
                </div>
                <div className="space-y-1">
                  {post.content.stats.stakes_tokens && post.content.stats.stakes_tokens > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span>{post.content.stats.stakes_tokens} Tokens</span>
                    </div>
                  )}
                  {post.content.stats.stakes_premium_tokens && post.content.stats.stakes_premium_tokens > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <Coins className="h-3 w-3 text-purple-500" />
                      <span>{post.content.stats.stakes_premium_tokens} Premium Tokens</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="text-sm text-orange-700 italic">
              "{post.content.stats.challenger_name} challenged {post.content.stats.challenged_name} to a duel!"
            </div>
          </div>
        );

      case 'challenge_accepted':
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green-900">Challenge Accepted!</div>
                  <div className="text-sm text-green-700">The battle begins</div>
                </div>
              </div>
              <div className="text-2xl">🔥</div>
            </div>

            <div className="text-sm text-green-700 italic">
              "{post.content.stats.challenged_name} accepted the challenge. Let the games begin!"
            </div>
          </div>
        );

      case 'challenge_completed':
        return (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-4 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-purple-900">Challenge Complete!</div>
                  <div className="text-sm text-purple-700">Victory achieved</div>
                </div>
              </div>
              <div className="text-2xl">👑</div>
            </div>

            {(post.content.stats.stakes_tokens && post.content.stats.stakes_tokens > 0) || 
             (post.content.stats.stakes_premium_tokens && post.content.stats.stakes_premium_tokens > 0) ? (
              <div className="bg-purple-100 border border-purple-300 rounded p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Prize Awarded</span>
                </div>
                <div className="space-y-1">
                  {post.content.stats.stakes_tokens && post.content.stats.stakes_tokens > 0 && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span>{post.content.stats.stakes_tokens} Tokens</span>
                    </div>
                  )}
                  {post.content.stats.stakes_premium_tokens && post.content.stats.stakes_premium_tokens > 0 && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Coins className="h-3 w-3 text-purple-500" />
                      <span>{post.content.stats.stakes_premium_tokens} Premium Tokens</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="text-sm text-purple-700 italic">
              "🎉 {post.content.stats.winner_name} emerged victorious in this epic challenge!"
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              {post.content.stats.location && (
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {post.content.stats.location}
                </span>
              )}
              {post.content.stats.duration && (
                <span>{post.content.stats.duration} min</span>
              )}
            </div>
            {post.content.description && (
              <p className="text-gray-700">{post.content.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              {post.content.stats.xp && post.content.stats.xp > 0 && (
                <Badge variant="secondary" className="text-yellow-600">
                  +{post.content.stats.xp} XP
                </Badge>
              )}
              {post.content.stats.hp && post.content.stats.hp !== 0 && (
                <Badge 
                  variant="secondary" 
                  className={post.content.stats.hp >  0 ? 'text-green-600' : 'text-red-600'}
                >
                  {post.content.stats.hp > 0 ? '+' : ''}{post.content.stats.hp} HP
                </Badge>
              )}
            </div>
          </div>
        );
    }
  };

  const getPostDescription = () => {
    switch (post.type) {
      case 'social_play':
        return `Completed a social ${post.content.stats.session_type} session`;
      case 'level_up':
        return 'Leveled up!';
      case 'match_result':
        return 'Completed a match';
      case 'achievement':
        return 'Unlocked an achievement!';
      case 'challenge_sent':
        return 'Sent a challenge!';
      case 'challenge_accepted':
        return 'Accepted a challenge!';
      case 'challenge_completed':
        return 'Completed a challenge!';
      default:
        return post.content.title;
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
              <p className="text-xs text-gray-500">
                {format(new Date(post.timestamp), 'MMM d, HH:mm')}
              </p>
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
              className={`flex items-center gap-2 transition-colors ${
                post.userHasLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.userHasLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
            
            <button 
              onClick={() => setShowCommentInput(!showCommentInput)}
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

        {showCommentInput && (
          <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
              disabled={isSubmittingComment}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!commentContent.trim() || isSubmittingComment}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
