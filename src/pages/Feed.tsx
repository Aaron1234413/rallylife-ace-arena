
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';
import { FeedPost } from '@/components/feed/FeedPost';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { useFeedData } from '@/hooks/useFeedData';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Feed() {
  const [filter, setFilter] = useState<string>('all');
  const { feedPosts, loading, handleLike, handleComment, handleChallenge, refreshFeed } = useFeedData();
  const location = useLocation();

  // Refresh feed when navigating to this page or when location changes
  useEffect(() => {
    if (location.pathname === '/feed') {
      refreshFeed();
    }
  }, [location.pathname, refreshFeed]);

  const filteredPosts = feedPosts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'achievements') return post.type === 'achievement';
    if (filter === 'matches') return post.type === 'match_result';
    if (filter === 'level_ups') return post.type === 'level_up';
    if (filter === 'social_play') return post.type === 'social_play';
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="h-6 w-12 bg-gray-200 rounded" />
                    <div className="h-6 w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <FeedHeader 
        filter={filter} 
        onFilterChange={setFilter}
      />

      {/* Info alert about automatic posting */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Your activities automatically appear in your feed when you complete sessions, matches, or training.
        </AlertDescription>
      </Alert>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No activities to display yet. Start playing to see your feed come to life!'
                : `No ${filter} posts found. Try adjusting your filter or log some activities.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-0">
            {filteredPosts.map(post => (
              <FeedPost
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onChallenge={handleChallenge}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
