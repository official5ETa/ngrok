import ngrok from '@ngrok/ngrok';
import axios from 'axios';



const localPort = parseInt(process.env.PORT);
if (isNaN(localPort)) throw new Error('no port specified. set using env: PORT');

const authtoken = process.env.NGROK_AUTHTOKEN;
if (!authtoken) throw new Error('no authtoken specified. set using env: NGROK_AUTHTOKEN');

const apiKey = process.env.NGROK_API_KEY;
if (!apiKey) throw new Error('no api key specified. set using env: NGROK_API_KEY');

const interval = isNaN(parseInt(process.env.INTERVAL)) ? 6e4 : parseInt(process.env.INTERVAL);



for (const event of ['SIGINT', 'SIGTERM', 'exit'])
  process.on(event, async () => {
    await listener?.close();
    process.exit(0);
  });



/** @type {ngrok.Listener} */
let listener;

while (true) {
  try {
    const response = await axios.get('https://api.ngrok.com/endpoints', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Ngrok-Version': '2'
      }
    });
    if (response.status === 200 && !response.data['endpoints'].some(endpoint => endpoint['public_url'] === listener?.url())) {
      await listener?.close();
      listener = await ngrok.forward({
        authtoken,
        proto: 'tcp',
        addr: localPort
      });
      console.log(`Ngrok TCP tunnel from local port ${localPort} established at: ${listener.url()}`);
    }
  }
  catch (err) {
    console.error('Error in ngrok monitoring loop:', err);
  }
  await new Promise(resolve => setTimeout(() => resolve(), interval));
}