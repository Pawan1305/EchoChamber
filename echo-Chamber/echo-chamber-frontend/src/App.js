import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components in Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [username, setUsername] = useState('');
  const [interaction, setInteraction] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update profile and fetch recommendations from the backend
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/update-profile', {
        username,
        interaction: { type: 'comment', contentId: interaction },
      });
      
      setUserProfile(response.data);
      setRecommendations(recommendContent(response.data)); // Fetch recommendations based on updated profile
      updateChartData(response.data); // Update chart based on new user interactions
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple recommendation function based on user's persona (e.g., latest comment)
  const recommendContent = (userProfile) => {
    const topic = userProfile.persona.latestComment; // Assume the comment refers to a content topic
    const allContent = [
      { id: '1', topic: 'technology' },
      { id: '2', topic: 'sports' },
      { id: '3', topic: 'music' },
      { id: '4', topic: 'technology' },
    ];
    return allContent.filter(content => content.topic === topic); // Filter content based on topic
  };

  // Update chart data based on user's profile and interactions
  const updateChartData = (userProfile) => {
    // Example logic to get likes count per interaction type (you can expand this logic)
    const likesCountOverTime = userProfile.interactions
      .filter((interaction) => interaction.type === 'like')
      .map((interaction) => interaction.timestamp);

    // For simplicity, this will generate a static data for likes per week (extend this logic)
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']; // You can calculate this dynamically based on interaction timestamps
    const likesPerWeek = [1, 3, 5, 7]; // Example data: replace with dynamically calculated data

    // Update the chart data state with the likes count over time
    setChartData({
      labels: weeks, // Week labels (or based on the actual interaction date range)
      datasets: [
        {
          label: 'Likes Count',
          data: likesPerWeek, // Dynamically calculated likes count
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    });
  };

  // State for the chart data
  const [chartData, setChartData] = useState({
    labels: [], // Dynamic labels for the timeline (weeks/months)
    datasets: [
      {
        label: 'Likes Count',
        data: [], // Dynamic likes count data (over time)
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  });

  return (
    <div>
      <h1>EchoChamber</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your latest interaction (e.g., comment)"
        value={interaction}
        onChange={(e) => setInteraction(e.target.value)}
      />
      <button onClick={handleUpdateProfile} disabled={isLoading}>
        {isLoading ? 'Updating Profile...' : 'Update Profile'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}

      {userProfile && (
        <div>
          <h2>Your Profile</h2>
          <pre>{JSON.stringify(userProfile, null, 2)}</pre>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h2>Recommendations</h2>
          <ul>
            {recommendations.map((item) => (
              <li key={item.id}>{item.topic}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Chart (Updated for dynamic data) */}
      <Line
        key={chartData.labels.length} // Add a unique key to force re-rendering of the chart when the data changes
        data={chartData}
        options={{
          scales: {
            x: {
              type: 'category',
              labels: chartData.labels,
            },
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}

export default App;
