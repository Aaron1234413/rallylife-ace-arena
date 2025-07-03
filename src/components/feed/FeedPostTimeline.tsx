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
    <div className="bg-white rounded-xl border border-tennis-green-bg/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header with user info */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-tennis-green-bg/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-tennis-green-bg/20">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback className="bg-tennis-green-medium text-white font-semibold">
              {post.user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-tennis-green-dark text-sm">{post.user.full_name}</h3>
            <div className="flex items-center gap-2 text-xs text-tennis-green-medium">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(post.timestamp), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${postColorClass}`}>
            <PostIcon className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="text-xs capitalize border-tennis-green-bg/30 text-tennis-green-medium">
            {post.type.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-3">
        {/* Title and Special Badges */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-tennis-green-dark text-lg leading-tight">
              {post.content.title || getPostDescription()}
            </h4>
            
            <div className="flex gap-1 flex-shrink-0">
              {post.type === 'level_up' && (
                <Badge className="bg-gradient-to-r from-tennis-yellow-light to-tennis-yellow-accent text-tennis-yellow-dark text-xs font-semibold">
                  🎉 Level Up!
                </Badge>
              )}
              {post.type === 'achievement' && (
                <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-xs font-semibold">
                  🏆 Achievement!
                </Badge>
              )}
            </div>
          </div>
          
          {/* Description or notes */}
          {(post.content.description || post.content.stats.notes) && (
            <p className="text-sm text-tennis-green-medium leading-relaxed">
              {post.content.description || post.content.stats.notes}
            </p>
          )}
        </div>

        {/* Stats and Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {post.content.stats.duration && (
            <div className="flex items-center gap-1.5 bg-tennis-green-bg/10 rounded-lg p-2">
              <Clock className="h-3 w-3 text-tennis-green-accent" />
              <span className="text-tennis-green-dark font-medium">{post.content.stats.duration} min</span>
            </div>
          )}
          
          {post.content.stats.location && (
            <div className="flex items-center gap-1.5 bg-tennis-green-bg/10 rounded-lg p-2">
              <MapPin className="h-3 w-3 text-tennis-green-accent" />
              <span className="text-tennis-green-dark font-medium truncate">{post.content.stats.location}</span>
            </div>
          )}

          {post.content.stats.score && (
            <div className="flex items-center gap-1.5 bg-tennis-green-bg/10 rounded-lg p-2">
              <Trophy className="h-3 w-3 text-tennis-green-accent" />
              <span className="text-tennis-green-dark font-medium">{post.content.stats.score}</span>
            </div>
          )}

          {post.type === 'social_play' && post.content.stats.participant_count && post.content.stats.participant_count > 0 && (
            <div className="flex items-center gap-1.5 bg-tennis-green-bg/10 rounded-lg p-2">
              <Users className="h-3 w-3 text-tennis-green-accent" />
              <span className="text-tennis-green-dark font-medium">{post.content.stats.participant_count} players</span>
            </div>
          )}
        </div>

        {/* Competitive Level and Participants */}
        {(post.content.stats.competitive_level || (post.content.stats.participant_names && post.content.stats.participant_names.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2">
            {post.content.stats.competitive_level && (
              <Badge className={`${competitiveLevelColors[post.content.stats.competitive_level]} text-xs font-medium`}>
                {getCompetitiveLevelText(post.content.stats.competitive_level)}
              </Badge>
            )}

            {post.content.stats.participant_names && post.content.stats.participant_names.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.content.stats.participant_names.slice(0, 2).map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-tennis-green-bg/20 text-tennis-green-dark border-tennis-green-bg/30">
                    {name}
                  </Badge>
                ))}
                {post.content.stats.participant_names.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-tennis-green-bg/20 text-tennis-green-dark border-tennis-green-bg/30">
                    +{post.content.stats.participant_names.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {post.content.stats.mood && (
              <span className="text-lg">{getMoodEmoji(post.content.stats.mood)}</span>
            )}
          </div>
        )}

        {/* Rewards Section */}
        {((post.content.stats.hp !== undefined && post.content.stats.hp !== 0) || (post.content.stats.xp && post.content.stats.xp > 0)) && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-tennis-green-bg/5 to-tennis-yellow-light/5 rounded-lg border border-tennis-green-bg/20">
            {post.content.stats.hp !== undefined && post.content.stats.hp !== 0 && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
                post.content.stats.hp > 0 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <Heart className="h-3 w-3" />
                <span>{post.content.stats.hp > 0 ? '+' : ''}{post.content.stats.hp} HP</span>
              </div>
            )}
            
            {post.content.stats.xp && post.content.stats.xp > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                <Star className="h-3 w-3" />
                <span>+{post.content.stats.xp} XP</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 bg-tennis-green-bg/5 border-t border-tennis-green-bg/10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-1.5 rounded-lg ${
              post.userHasLiked 
                ? 'text-red-500 bg-red-50 border border-red-200' 
                : 'text-tennis-green-dark/70 hover:text-red-500 hover:bg-red-50'
            }`}
            aria-label={post.userHasLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${post.userHasLiked ? 'fill-current scale-110' : ''}`} />
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 text-tennis-green-dark/70 hover:text-blue-500 transition-all duration-200 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-blue-50"
            aria-label={showCommentInput ? 'Hide comment input' : 'Show comment input'}
          >
            <MessageCircle className="w-4 h-4 transition-transform duration-200" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
        </div>

        {/* Comment input */}
        {showCommentInput && (
          <form onSubmit={handleSubmitComment} className="mt-3 flex gap-2 animate-fade-in">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border-tennis-green-bg/30 focus:border-tennis-green-medium bg-white"
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
    </div>
  );
}