const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const data = req.body;
      await kv.set('portfolioData', JSON.stringify(data));
      res.status(200).send('Data saved successfully!');
    } catch (error) {
      res.status(500).send('Error saving data: ' + error.message);
    }
  } else if (req.method === 'GET') {
    try {
      const data = await kv.get('portfolioData');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).send('Error fetching data: ' + error.message);
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};