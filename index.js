const express = require('express');
const axios = require('axios');

const app = express();

async function fetchFypDataWithRetry(retries = 2) {
  try {
    const options = {
      method: 'GET',
      url: 'https://tiktok-unauthorized-api-scraper-no-watermark-analytics-feed.p.rapidapi.com/api/fyp', // Hypothetical endpoint
      headers: {
        'X-RapidAPI-Key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
        'X-RapidAPI-Host': 'tiktok-unauthorized-api-scraper-no-watermark-analytics-feed.p.rapidapi.com'
      },
      params: {
        amount_of_posts: 200
      }
    };

    const response = await axios.request(options);
    const posts = response.data.posts.map(post => {
      const playLinks = post.play_links;
      if (playLinks.length > 0) {
        return playLinks[0];
      } else {
        return null;
      }
    });

    return posts.filter(post => post !== null);
  } catch (error) {
    console.error(error);
    if (retries > 0) {
      console.log(`Retrying... (${retries} retries left)`);
      return fetchFypDataWithRetry(retries - 1);
    } else {
      throw new Error('Max retries exceeded');
    }
  }
}

app.get('/', (req, res) => {
  res.send('tiktok fyp');
});

app.get('/fyp', async (req, res) => {
  try {
    let posts = await fetchFypDataWithRetry();
    if (!posts || posts.length === 0) {
      posts = await fetchFypDataWithRetry();
    }

    res.json({
      source: 'FYP',
      posts: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
