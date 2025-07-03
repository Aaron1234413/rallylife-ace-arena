import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Clock, 
  MapPin, 
  Star, 
  Trophy,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  getPostTypeIcon, 
  getPostTypeColor, 
  getCompetitiveLevelText,
  competitiveLevelColors,
  getMoodEmoji 
} from '@/utils/feedPostIcons';

interface FeedPostTimelineProps {
  post: {
    id: string;
    type: 'level_up' | 'match_result' | 'achievement' | 'activity' | 'social_play' | 'training' | 'lesson';
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
      };
    };
    likes: number;
    comments: number;
    userHasLiked: boolean;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => Promise<string | null>;
}

export function FeedPostTimeline({ post, onLike, onComment }: FeedPostTimelineProps) {
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

  const PostIcon = getPostTypeIcon(post.type);
  const postColorClass = getPostTypeColor(post.type);

  // Get post description based on type
  const getPostDescription = () => {
    switch (post.type) {
      case 'social_play':
        const sessionType = post.content.stats.session_type || 'session';
        return `Completed a social ${sessionType} session`;
      case 'level_up':
        return 'Leveled up!';
      case 'match_result':
        return post.content.stats.opponent_name 
          ? `Match vs ${post.content.stats.opponent_name}`
          : 'Completed a match';
      case 'achievement':
        return 'Unlocked an achievement!';
      case 'training':
        return 'Training session completed';
      case 'lesson':
        return 'Lesson completed';
      default:
        return post.content.title || 'Activity completed';
    }
  };

  return (
    <div className="border border-tennis-green-bg/30 rounded-lg p-4 hover:bg-tennis-green-subtle/50 transition-colors bg-white/95 backdrop-blur-sm shadow-sm">
      {/* Header with user info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback className="bg-tennis-green-medium text-white text-sm">
              {post.user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-tennis-green-dark truncate">{post.user.full_name}</h3>
            <p className="text-sm text-tennis-green-dark/70">{getPostDescription()}</p>
          </div>
        </div>
        
        <div className={`p-2 rounded-full flex-shrink-0 ${postColorClass}`}>
          <PostIcon className="h-4 w-4" />
        </div>
      </div>

      {/* Activity content */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-tennis-green-dark">{post.content.title || getPostDescription()}</h4>
          <Badge variant="outline" className="text-xs capitalize text-tennis-green-medium border-tennis-green-bg/50">
            {post.type.replace('_', ' ')}
          </Badge>
          
          {/* Special handling for level up and achievements */}
          {post.type === 'level_up' && (
            <Badge className="bg-tennis-yellow-light text-tennis-yellow-dark text-xs">
              🎉 Level Up!
            </Badge>
          )}
          {post.type === 'achievement' && (
            <Badge className="bg-orange-100 text-orange-800 text-xs">
              🏆 Achievement!
            </Badge>
          )}
        </div>
        
        {/* Description or notes */}
        {(post.content.description || post.content.stats.notes) && (
          <p className="text-sm text-tennis-green-dark/70 mb-2">
            {post.content.description || post.content.stats.notes}
          </p>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-tennis-green-dark/60 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="whitespace-nowrap">{format(new Date(post.timestamp), 'MMM d, HH:mm')}</span>
        </div>
        
        {post.content.stats.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.content.stats.duration} min</span>
          </div>
        )}
        
        {post.content.stats.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{post.content.stats.location}</span>
          </div>
        )}

        {/* Score for matches */}
        {post.content.stats.score && (
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>{post.content.stats.score}</span>
          </div>
        )}

        {/* Social play specific info */}
        {post.type === 'social_play' && (
          <>
            {post.content.stats.participant_count && post.content.stats.participant_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{post.content.stats.participant_count} players</span>
              </div>
            )}
            {post.content.stats.mood && (
              <span className="text-sm">{getMoodEmoji(post.content.stats.mood)}</span>
            )}
          </>
        )}
      </div>

      {/* Badges and competitive level */}
      <div className="flex items-center gap-2 mb-3">
        {post.content.stats.competitive_level && (
          <Badge className={`${competitiveLevelColors[post.content.stats.competitive_level]} text-xs`}>
            {getCompetitiveLevelText(post.content.stats.competitive_level)}
          </Badge>
        )}

        {/* Participant names for social play */}
        {post.content.stats.participant_names && post.content.stats.participant_names.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.content.stats.participant_names.slice(0, 3).map((name, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-tennis-green-bg/20 text-tennis-green-dark">
                {name}
              </Badge>
            ))}
            {post.content.stats.participant_names.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-tennis-green-bg/20 text-tennis-green-dark">
                +{post.content.stats.participant_names.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Rewards display */}
      <div className="flex items-center gap-3 mb-4">
        {post.content.stats.hp !== undefined && post.content.stats.hp !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${
            post.content.stats.hp > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <Heart className="h-3 w-3" />
            <span>{post.content.stats.hp > 0 ? '+' : ''}{post.content.stats.hp} HP</span>
          </div>
        )}
        
        {post.content.stats.xp && post.content.stats.xp > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <Star className="h-3 w-3" />
            <span>+{post.content.stats.xp} XP</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-tennis-green-bg/20 pt-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              post.userHasLiked 
                ? 'text-red-500' 
                : 'text-tennis-green-dark/70 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.userHasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 text-tennis-green-dark/70 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments}</span>
          </button>
        </div>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2">
          <Input
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border-tennis-green-bg/30 focus:border-tennis-green-medium"
            disabled={isSubmittingComment}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!commentContent.trim() || isSubmittingComment}
            className="bg-tennis-green-medium hover:bg-tennis-green-dark"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}