import React, { useState, useEffect } from 'react';
import { getEventImage } from '../../api/imageService';

// Component to display event images using our backend API with enhanced precision
function EventImage({ eventType, eventTitle, width = "100%", height = "150px" }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      // Skip API call if no event info
      if (!eventType && !eventTitle) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Enhanced search term generation
        let searchTerms = [];

        // 1. Process the event title to extract key terms
        if (eventTitle) {
          const titleLower = eventTitle.toLowerCase();

          // Define specific categories and their related keywords
          const categoryKeywords = {
            'sports': ['football', 'soccer', 'basketball', 'baseball', 'hockey', 'tennis',
              'golf', 'cricket', 'rugby', 'volleyball', 'swimming', 'boxing',
              'match', 'game', 'tournament', 'championship', 'league', 'cup'],
            'concert': ['music', 'band', 'singer', 'live', 'performance', 'rock', 'pop',
              'jazz', 'classical', 'rap', 'hip hop', 'orchestra', 'symphony',
              'concert', 'festival', 'tour'],
            'theater': ['play', 'musical', 'comedy', 'drama', 'broadway', 'stage', 'act',
              'ballet', 'dance', 'performance', 'show', 'opera', 'theater'],
            'conference': ['meeting', 'convention', 'symposium', 'seminar', 'workshop',
              'lecture', 'talk', 'presentation', 'panel', 'summit', 'forum'],
            'exhibition': ['art', 'gallery', 'museum', 'display', 'showcase', 'exhibit',
              'installation', 'collection', 'showing', 'expo', 'fair'],
            'food': ['dinner', 'lunch', 'breakfast', 'brunch', 'tasting', 'cuisine',
              'cooking', 'culinary', 'gourmet', 'wine', 'beer', 'festival']
          };

          // Common sports and teams for better matching
          const sportsKeywords = {
            'football': ['premier league', 'world cup', 'uefa', 'fifa', 'manchester', 'arsenal',
              'liverpool', 'chelsea', 'tottenham', 'nfl', 'soccer'],
            'basketball': ['nba', 'ncaa', 'lakers', 'warriors', 'bulls', 'celtics'],
            'baseball': ['mlb', 'yankees', 'red sox', 'dodgers', 'cubs'],
            'hockey': ['nhl', 'stanley cup', 'maple leafs', 'blackhawks', 'bruins']
          };

          // Check for specific sports teams or leagues in title
          let sportType = '';
          for (const [sport, terms] of Object.entries(sportsKeywords)) {
            for (const term of terms) {
              if (titleLower.includes(term)) {
                sportType = sport;
                searchTerms.push(sport + " " + term);
                break;
              }
            }
            if (sportType) break;
          }

          // Find category-specific keywords in title
          const currentCategory = eventType ? eventType.toLowerCase() : '';

          // If there is a matching category, check for its specific keywords
          if (currentCategory && categoryKeywords[currentCategory]) {
            for (const keyword of categoryKeywords[currentCategory]) {
              if (titleLower.includes(keyword)) {
                // Add category + keyword as a search term
                searchTerms.push(currentCategory + " " + keyword);
              }
            }
          }

          // Check for vs pattern in sports events
          if (titleLower.includes(' vs ') || titleLower.includes(' versus ')) {
            // Extract team names from "Team A vs Team B" pattern
            const vsPattern = / vs | versus /;
            const teamParts = titleLower.split(vsPattern);

            if (teamParts.length >= 2) {
              const team1 = teamParts[0].trim().split(' ').pop(); // Last word of first part
              const team2 = teamParts[1].trim().split(' ')[0];    // First word of second part

              if (currentCategory) {
                searchTerms.push(currentCategory + " " + team1 + " " + team2);
                searchTerms.push(currentCategory + " " + team1);
                searchTerms.push(currentCategory + " " + team2);
              } else {
                searchTerms.push(team1 + " " + team2 + " match");
                searchTerms.push(team1 + " " + team2);
              }
            }
          }

          // Clean up the title by removing location info (e.g., " - London")
          let cleanTitle = titleLower;
          if (cleanTitle.includes(' - ')) {
            cleanTitle = cleanTitle.split(' - ')[0];
          }

          // Extract potentially meaningful words and phrases from title
          const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "live", "tour"];
          const titleWords = cleanTitle.split(/\s+/).filter(word =>
            word.length >= 3 && !commonWords.includes(word)
          ).map(word => word.replace(/[^a-z0-9]/g, '')); // remove punctuation

          // PRIORITY 1: Specific Extracted Patterns (Sports VS, particular bands/sports)
          // (Already added above if they matched)

          // PRIORITY 2: First 2-3 meaningful words combined (e.g. "coldplay music")
          if (titleWords.length >= 2) {
            searchTerms.push(titleWords.slice(0, Math.min(3, titleWords.length)).join(" "));
          }
          if (titleWords.length >= 1) {
            searchTerms.push(titleWords[0]); // e.g., "coldplay"
          }

          // PRIORITY 3: Category + most important keyword (e.g. "concert coldplay")
          if (currentCategory && titleWords.length > 0) {
            searchTerms.push(currentCategory + " " + titleWords[0]);

            // Add category + second keyword if available
            if (titleWords.length > 1) {
              searchTerms.push(currentCategory + " " + titleWords[1]);
            }
          }

          // PRIORITY 4: Full clean title fallback
          searchTerms.push(cleanTitle);
        }

        // PRIORITY 5: Just the event type
        if (eventType) {
          searchTerms.push(eventType);
        }

        // Remove duplicates and clean up
        searchTerms = [...new Set(searchTerms)].filter(term => term && term.trim().length > 0).slice(0, 6);

        console.log("Search terms for image:", searchTerms);

        // Try each search term until an image is found
        let imageFound = false;

        for (const term of searchTerms) {
          // Skip empty terms
          if (!term.trim()) continue;

          const response = await getEventImage(term);

          if (response.success && response.imageUrl) {
            setImageUrl(response.imageUrl);
            imageFound = true;
            break;
          }
        }

        // If no image found with any term
        if (!imageFound) {
          setError('No suitable image found');
          setImageUrl(null);
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to load image');
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [eventType, eventTitle]);

  // Loading state
  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg animate-pulse"
        style={{ width, height }}
      >
        <span className="text-gray-400 font-medium text-sm">Loading...</span>
      </div>
    );
  }

  // Error or no image found
  if (error || !imageUrl) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 text-sm p-4 text-center border border-dashed border-gray-200"
        style={{ width, height }}
      >
        <span>{error || 'No image found'}</span>
      </div>
    );
  }

  // Display the image
  return (
    <div className="w-full h-full relative overflow-hidden rounded-t-xl">
      <img
        src={imageUrl}
        alt={`${eventTitle || eventType} event`}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
    </div>
  );
}

export default EventImage;