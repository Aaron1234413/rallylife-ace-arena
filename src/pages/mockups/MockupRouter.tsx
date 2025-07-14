import { Routes, Route } from "react-router-dom";
import { PlayMockup } from "./PlayMockup";
import { FeedMockup } from "./FeedMockup";
import { TrainingMockup } from "./TrainingMockup";
import { ClubsMockup } from "./ClubsMockup";
import { ProfileMockup } from "./ProfileMockup";

export function MockupRouter() {
  return (
    <Routes>
      <Route path="/mockup/play" element={<PlayMockup />} />
      <Route path="/mockup/feed" element={<FeedMockup />} />
      <Route path="/mockup/training" element={<TrainingMockup />} />
      <Route path="/mockup/clubs" element={<ClubsMockup />} />
      <Route path="/mockup/profile" element={<ProfileMockup />} />
    </Routes>
  );
}