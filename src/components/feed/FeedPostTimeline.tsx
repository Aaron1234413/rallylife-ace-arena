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

  // Smart title generation - remove redundant words
  const getCleanTitle = () => {
    const originalTitle = post.content.title;
    if (!originalTitle) return getPostDescription();
    
    // Remove redundant activity type words
    const cleanTitle = originalTitle
      .replace(/^(Singles|Doubles)\s+(Match|Training|Session)\s+/i, '')
      .replace(/^(Social|Training|Lesson)\s+(Session|Play)\s+/i, '')
      .replace(/\bvs\s+/i, 'vs ');
    
    return cleanTitle || getPostDescription();
  };

  // Handle long names with truncation
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-tennis-green-bg/20 overflow-hidden">
      {/* Clean Header */}
      <div className="flex items-center justify-between p-5 border-b border-tennis-green-bg/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-12 h-12 ring-2 ring-tennis-green-bg/20">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback className="bg-tennis-green-medium text-white font-semibold text-sm">
              {post.user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-tennis-green-dark text-base truncate">
              {truncateName(post.user.full_name, 25)}
            </h3>
            <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{format(new Date(post.timestamp), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        </div>
        
        <div className={`p-2.5 rounded-lg ${postColorClass} flex-shrink-0`}>
          <PostIcon className="h-5 w-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Clean Title */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-bold text-tennis-green-dark text-xl sm:text-2xl leading-tight flex-1">
              {getCleanTitle()}
            </h4>
            
            {/* Achievement Badges */}
            {(post.type === 'level_up' || post.type === 'achievement') && (
              <div className="flex-shrink-0">
                {post.type === 'level_up' && (
                  <Badge className="bg-gradient-to-r from-tennis-yellow-light to-tennis-yellow-accent text-tennis-yellow-dark text-sm font-semibold px-3 py-1">
                    🎉 Level Up!
                  </Badge>
                )}
                {post.type === 'achievement' && (
                  <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-sm font-semibold px-3 py-1">
                    🏆 Achievement!
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Optional Description */}
          {post.content.description && !post.content.description.toLowerCase().includes(post.content.title?.toLowerCase() || '') && (
            <p className="text-base text-tennis-green-medium leading-relaxed">
              {post.content.description}
            </p>
          )}
        </div>

        {/* Essential Metadata - Clean 2-column grid */}
        <div className="grid grid-cols-2 gap-3">
          {post.content.stats.duration && (
            <div className="flex items-center gap-3 bg-tennis-green-bg/10 rounded-lg p-3">
              <Clock className="h-4 w-4 text-tennis-green-accent flex-shrink-0" />
              <span className="text-tennis-green-dark font-medium">{post.content.stats.duration} min</span>
            </div>
          )}
          
          {post.content.stats.location && (
            <div className="flex items-center gap-3 bg-tennis-green-bg/10 rounded-lg p-3">
              <MapPin className="h-4 w-4 text-tennis-green-accent flex-shrink-0" />
              <span className="text-tennis-green-dark font-medium truncate">{post.content.stats.location}</span>
            </div>
          )}
          
          {post.content.stats.score && (
            <div className="flex items-center gap-3 bg-tennis-green-bg/10 rounded-lg p-3 col-span-2">
              <Trophy className="h-4 w-4 text-tennis-green-accent flex-shrink-0" />
              <span className="text-tennis-green-dark font-medium">{post.content.stats.score}</span>
            </div>
          )}
        </div>

        {/* Prominent Rewards */}
        {((post.content.stats.hp !== undefined && post.content.stats.hp !== 0) || (post.content.stats.xp && post.content.stats.xp > 0)) && (
          <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-tennis-green-bg/10 to-tennis-yellow-light/10 rounded-xl border border-tennis-green-bg/20">
            {post.content.stats.hp !== undefined && post.content.stats.hp !== 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                post.content.stats.hp > 0 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <Heart className="h-4 w-4" />
                <span className="text-sm">{post.content.stats.hp > 0 ? '+' : ''}{post.content.stats.hp} HP</span>
              </div>
            )}
            
            {post.content.stats.xp && post.content.stats.xp > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                <Star className="h-4 w-4" />
                <span className="text-sm">+{post.content.stats.xp} XP</span>
              </div>
            )}
          </div>
        )}

        {/* Optional: Mood for social play */}
        {post.content.stats.mood && (
          <div className="text-center">
            <span className="text-2xl">{getMoodEmoji(post.content.stats.mood)}</span>
          </div>
        )}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="px-5 py-4 bg-tennis-green-bg/5 border-t border-tennis-green-bg/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-3 transition-all duration-200 hover:scale-105 px-4 py-2.5 rounded-lg flex-1 justify-center ${
              post.userHasLiked 
                ? 'text-red-500 bg-red-50 border border-red-200' 
                : 'text-tennis-green-dark/70 hover:text-red-500 hover:bg-red-50 border border-tennis-green-bg/20'
            }`}
            aria-label={post.userHasLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-5 h-5 transition-transform duration-200 ${post.userHasLiked ? 'fill-current scale-110' : ''}`} />
            <span className="font-medium">{post.likes}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-3 text-tennis-green-dark/70 hover:text-blue-500 transition-all duration-200 hover:scale-105 px-4 py-2.5 rounded-lg hover:bg-blue-50 border border-tennis-green-bg/20 flex-1 justify-center"
            aria-label={showCommentInput ? 'Hide comment input' : 'Show comment input'}
          >
            <MessageCircle className="w-5 h-5 transition-transform duration-200" />
            <span className="font-medium">{post.comments}</span>
          </button>
        </div>

        {/* Comment input */}
        {showCommentInput && (
          <form onSubmit={handleSubmitComment} className="mt-4 flex gap-3">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border-tennis-green-bg/30 focus:border-tennis-green-medium bg-white h-11"
              disabled={isSubmittingComment}
            />
            <Button 
              type="submit" 
              size="default"
              disabled={!commentContent.trim() || isSubmittingComment}
              className="bg-tennis-green-medium hover:bg-tennis-green-dark transition-all duration-200 hover:scale-105 px-6"
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