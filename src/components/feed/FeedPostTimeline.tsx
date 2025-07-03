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

  // Fallback descriptions for posts without titles
  const getPostDescription = () => {
    switch (post.type) {
      case 'level_up':
        return 'Level Up!';
      case 'achievement':
        return 'Achievement Unlocked!';
      default:
        return 'Activity Completed';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-tennis-green-bg/30 rounded-xl p-4 sm:p-6 hover:bg-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] shadow-md">
      {/* Header with user info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback className="bg-tennis-green-medium text-white text-xs">
              {post.user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{post.user.full_name}</h3>
          </div>
        </div>
        
        <div className={`p-1.5 rounded-full flex-shrink-0 ${postColorClass}`}>
          <PostIcon className="h-3 w-3" />
        </div>
      </div>

      {/* Activity content */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{post.content.title || getPostDescription()}</h4>
          <Badge variant="outline" className="text-xs capitalize">
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
          <p className="text-xs text-muted-foreground mb-2">
            {post.content.description || post.content.stats.notes}
          </p>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
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
      <div className="flex items-center gap-3">
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
      <div className="flex items-center justify-between border-t pt-3 mt-3">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
              post.userHasLiked 
                ? 'text-red-500' 
                : 'text-tennis-green-dark/70 hover:text-red-500'
            }`}
            aria-label={post.userHasLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${post.userHasLiked ? 'fill-current scale-110' : ''}`} />
            <span className="text-sm">{post.likes}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 text-tennis-green-dark/70 hover:text-blue-500 transition-all duration-200 hover:scale-105"
            aria-label={showCommentInput ? 'Hide comment input' : 'Show comment input'}
          >
            <MessageCircle className="w-4 h-4 transition-transform duration-200" />
            <span className="text-sm">{post.comments}</span>
          </button>
        </div>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2 animate-fade-in">
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
            className="bg-tennis-green-medium hover:bg-tennis-green-dark transition-all duration-200 hover:scale-105"
            aria-label="Submit comment"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}