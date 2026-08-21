// Port of fetch_youtube_videos from the Python prototype. Requires a free
// YouTube Data API v3 key. Returns [] if no key is set or the request
// fails, rather than throwing -- optional enrichment, never worth
// crashing the page over.

export interface YoutubeVideo {
  title: string;
  channel: string;
  url: string;
  thumbnail: string | null;
}

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function fetchYoutubeVideos(query: string, limit = 3): Promise<YoutubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(limit),
      order: "relevance",
      key: apiKey,
    });
    const resp = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`, {
      next: { revalidate: 1800 },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = (data.items || []).slice(0, limit);

    return items
      .map(
        (item: {
          id?: { videoId?: string };
          snippet?: { title?: string; channelTitle?: string; thumbnails?: { medium?: { url?: string }; default?: { url?: string } } };
        }) => {
          const videoId = item.id?.videoId;
          if (!videoId) return null;
          const snippet = item.snippet || {};
          const thumbnail = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || null;
          return {
            title: snippet.title || "",
            channel: snippet.channelTitle || "",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail,
          };
        }
      )
      .filter((v: YoutubeVideo | null): v is YoutubeVideo => v !== null);
  } catch {
    return [];
  }
}
