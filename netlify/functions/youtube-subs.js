exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const { channelHandle } = event.queryStringParameters || {};

    if (!channelHandle) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Channel handle is required' })
      };
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelHandle)}&key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Channel not found' })
      };
    }

    const channelId = searchData.items[0].id.channelId;

    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${API_KEY}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    if (!statsData.items || statsData.items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Channel data not found' })
      };
    }

    const channel = statsData.items[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subscribers: parseInt(channel.statistics.subscriberCount),
        thumbnail: channel.snippet.thumbnails.high.url,
        channelTitle: channel.snippet.title
      })
    };

  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch channel data', details: error.message })
    };
  }
};
