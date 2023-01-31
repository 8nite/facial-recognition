const express = require('express');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// Load the face-api.js models
async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

// Route for checking if a person is smiling
app.post('/check-smile', async (req, res) => {
  // Get the image data from the request body
  const image = req.body.image;

  // Convert the image data to a canvas element
  const imageCanvas = canvas.createCanvas(image.width, image.height);
  const ctx = imageCanvas.getContext('2d');
  const img = new canvas.Image();
  img.src = image.data;
  ctx.drawImage(img, 0, 0, image.width, image.height);

  // Perform face detection and expression recognition
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
  const detections = await faceapi.detectAllFaces(imageCanvas, options).withFaceLandmarks().withFaceExpressions();

  // Check if the face is smiling
  if (detections.length > 0 && detections[0].expressions.smile > 0.5) {
    res.send({ isSmiling: true });
  } else {
    res.send({ isSmiling: false });
  }
});

// Start the Express server
async function startServer() {
  await loadModels();

  const server = app.listen(3000, () => {
    console.log(`Server running on port 3000`);
  });
}

startServer();
