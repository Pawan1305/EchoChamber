const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors());  // Enable CORS for all routes

// Middleware to parse JSON
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/echoChamber', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Define User Profile schema
const UserProfileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  persona: { type: Object, default: {} },  // Dynamically evolving persona data
  interactions: [{
    type: { type: String, required: true },  // Interaction type: 'comment', 'like', etc.
    contentId: { type: String, required: true },  // ID of the content the interaction is on
    timestamp: { type: Date, required: true }  // Timestamp of the interaction
  }]
});

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

// Endpoint to update user profile
app.post('/update-profile', async (req, res) => {
  try {
    const { username, interaction } = req.body;

    // Validate incoming request data
    if (!username || !interaction || !interaction.type || !interaction.contentId) {
      return res.status(400).send({ error: 'Invalid request data' });
    }

    // Log incoming data to check if the frontend is sending the request correctly
    console.log('Received data:', req.body);

    // Find the user profile in the database
    let userProfile = await UserProfile.findOne({ username });

    if (!userProfile) {
      userProfile = new UserProfile({ username, persona: {}, interactions: [] });
    }

    // Update the persona and interaction history
    userProfile.persona = updatePersona(userProfile.persona, interaction);  // Update persona based on interaction

    // Add the new interaction to the interactions array
    userProfile.interactions.push({
      type: interaction.type,
      contentId: interaction.contentId,
      timestamp: new Date()
    });

    // Save the updated profile
    await userProfile.save();
    
    // Send the updated profile back to the frontend
    res.status(200).send(userProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Function to simulate persona evolution based on interaction type
function updatePersona(persona, interaction) {
  // Depending on the interaction type, evolve the persona dynamically
  if (interaction.type === 'comment') {
    // Update persona with the latest comment contentId (could be the actual comment content)
    persona.latestComment = interaction.contentId;
  } else if (interaction.type === 'like') {
    // Track how many 'likes' a user has given
    persona.likesCount = (persona.likesCount || 0) + 1;
  } else if (interaction.type === 'share') {
    // Track shared content
    persona.sharedContent = (persona.sharedContent || []).concat(interaction.contentId);
  }

  return persona;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
