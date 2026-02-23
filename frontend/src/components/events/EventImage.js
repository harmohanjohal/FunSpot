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
          
          // Extract potentially meaningful words and phrases from title
          const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"];
          
          // Get all unique words from title excluding common words
          const titleWords = titleLower.split(/\s+/).filter(word => 
            word.length > 3 && !commonWords.includes(word)
          );
          
          // Add event type + each meaningful word as separate search terms
          if (currentCategory && titleWords.length > 0) {
            titleWords.forEach(word => {
              searchTerms.push(currentCategory + " " + word);
            });
          }
          
          // Add first 2-3 meaningful words combined
          if (titleWords.length >= 2) {
            searchTerms.push(titleWords.slice(0, Math.min(3, titleWords.length)).join(" "));
          }
        }
        
        // Always add the event type as a fallback
        if (eventType) {
          searchTerms.push(eventType);
        }
        
        // If there is title but no other search terms, use it
        if (eventTitle && searchTerms.length === 0) {
          const words = eventTitle.split(/\s+/).slice(0, 3).join(" ");
          searchTerms.push(words);
        }
        
        // Remove duplicates and limit number of search terms
        searchTerms = [...new Set(searchTerms)].slice(0, 5);
        
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
        style={{ 
          width, 
          height, 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px'
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }
  
  // Error or no image found
  if (error || !imageUrl) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      >
        <span>{error || 'No image found'}</span>
      </div>
    );
  }
  
  // Display the image
  return (
    <div style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}>
      <img 
        src={imageUrl} 
        alt={`${eventTitle || eventType} event`} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          borderRadius: '8px'
        }} 
      />
    </div>
  );
}

export default EventImage;