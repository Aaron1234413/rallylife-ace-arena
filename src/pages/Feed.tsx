
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';
import { FeedPost } from '@/components/feed/FeedPost';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { useFeedData } from '@/hooks/useFeedData';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Feed() {
  const [filter, setFilter] = useState<string>('all');
  const { feedPosts, loading, handleLike, handleComment, handleChallenge } = useFeedData();

  const filteredPosts = feedPosts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'achievements') return post.type === 'achievement';
    if (filter === 'matches') return post.type === 'match_result';
    if (filter === 'level_ups') return post.type === 'level_up';
    if (filter === 'social_play') return post.type === 'social_play';
    if (filter === 'sessions') return ['training', 'lesson'].includes(post.type);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-neutral-100 via-tennis-neutral-50 to-white">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          <div className="text-center mb-6 sm:mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
              <span className="text-xl">📱</span>
            </div>
            <h1 className="orbitron-heading text-display sm:text-hero text-tennis-neutral-800 tracking-tight">
              Activity Feed
            </h1>
            <p className="poppins-body text-body-lg text-tennis-neutral-600">
              Stay connected with your tennis community
            </p>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/95 backdrop-blur-sm border-tennis-neutral-200 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-tennis-neutral-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-5 bg-tennis-neutral-200 rounded mb-2" />
                      <div className="h-4 bg-tennis-neutral-100 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="h-20 bg-tennis-neutral-100 rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="h-6 w-12 bg-tennis-neutral-100 rounded" />
                      <div className="h-6 w-12 bg-tennis-neutral-100 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-neutral-100 via-tennis-neutral-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header - Strategic neutral colors */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">📱</span>
          </div>
          <h1 className="orbitron-heading text-display sm:text-hero text-tennis-neutral-800 tracking-tight">
            Activity Feed
          </h1>
          <p className="poppins-body text-body-lg text-tennis-neutral-600">
            Stay connected with your tennis community
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-tennis-neutral-200 p-6 space-y-6">
          <FeedHeader 
            filter={filter} 
            onFilterChange={setFilter}
          />

          {/* Info alert - Blue for informational content */}
          <Alert className="border-tennis-info bg-tennis-info-light">
            <Info className="h-4 w-4 text-tennis-info" />
            <AlertDescription className="poppins-body text-body text-tennis-info">
              Your activities automatically appear in your feed when you complete sessions, matches, or training.
            </AlertDescription>
          </Alert>

          {filteredPosts.length === 0 ? (
            <Card className="bg-tennis-neutral-100 border-tennis-neutral-200">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-tennis-neutral-500 mb-4" />
                <h3 className="orbitron-heading text-heading-md mb-2 text-tennis-neutral-800">
                  No posts found
                </h3>
                <p className="poppins-body text-body text-tennis-neutral-600">
                  {filter === 'all' 
                    ? 'No activities to display yet. Start playing to see your feed come to life!'
                    : `No ${filter} posts found. Try adjusting your filter or log some activities.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 pr-4">
                {filteredPosts.map(post => (
                  <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-tennis-neutral-200 hover:shadow-md transition-shadow">
                    <FeedPost
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onChallenge={handleChallenge}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
