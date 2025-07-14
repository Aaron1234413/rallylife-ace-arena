import { Routes, Route } from "react-router-dom";
import { PlayMockup } from "./PlayMockup";
import { FeedMockup } from "./FeedMockup";
import { TrainingMockup } from "./TrainingMockup";
import { ClubsMockup } from "./ClubsMockup";
import { ProfileMockup } from "./ProfileMockup";

export function MockupRouter() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Mockup Pages</h1>
      <Routes>
        <Route path="play" element={<PlayMockup />} />
        <Route path="feed" element={<FeedMockup />} />
        <Route path="training" element={<TrainingMockup />} />
        <Route path="clubs" element={<ClubsMockup />} />
        <Route path="profile" element={<ProfileMockup />} />
        <Route path="*" element={<div>Mockup not found</div>} />
      </Routes>
    </div>
  );
}