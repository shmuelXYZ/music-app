import React from 'react';
import TrackCard from './TrackCard';

const TrackList = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track, index) => (
        <TrackCard 
          key={`${track.id}-${index}`} 
          track={track} 
        />
      ))}
    </div>
  );
};

export default TrackList;
