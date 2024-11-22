// server.js

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc'); 

const app = express();
const port = process.env.PORT || 5000; // Changed from 6000 to 5000

app.use(cors({
  origin: [
    'https://www.artofsymbolism.com', 
    'https://artofsymbolism.com'
  ], // Allow GitHub Pages and both custom domain versions
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Clarifai stub with your PAT
const stub = ClarifaiStub.grpc();

// Use your PAT from the .env file
const metadata = new grpc.Metadata();
metadata.set('authorization', `Key ${process.env.CLARIFAI_PAT}`);

// Your Clarifai User ID, App ID, and Workflow ID
const USER_ID = 'uyz5o6vvjv5o';
const APP_ID = 'Image-Analysis-App';
const WORKFLOW_ID = 'analysis';

// Endpoint to handle image analysis
app.post('/analyze-image', (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    res.status(400).json({ error: 'No image data provided.' });
    return;
  }

  stub.PostWorkflowResults(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      workflow_id: WORKFLOW_ID,
      inputs: [
        {
          data: {
            image: { base64: base64Image },
            text: { raw: "From a conspiracist's perspective, analyze the image as if uncovering hidden or esoteric symbols, meanings, and potential connections to secret societies or rituals. Focus on the interpretation without preamble or disclaimers." } // Add your custom prompt here
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Image analysis failed.', details: err.message });
        return;
      }
  
      if (response.status.code !== 10000) {
        console.error(
          'Failed status:',
          response.status.description,
          '\n',
          response.status.details
        );
        res.status(500).json({
          error: 'Image analysis failed.',
          details: response.status.description + ' - ' + response.status.details,
        });
        return;
      }
  
      // Extract the text output from the workflow response
      const outputs = response.results[0].outputs;
      let outputText = '';
      for (const output of outputs) {
        if (output.data && output.data.text) {
          outputText = output.data.text.raw;
          break;
        }
      }
  
      if (outputText) {
        res.json({ result: outputText });
      } else {
        res.json({ result: 'No text output found.' });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
