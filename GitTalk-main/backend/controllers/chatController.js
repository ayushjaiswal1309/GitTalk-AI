const mongoose = require('mongoose');
const axios = require('axios'); // Import Axios
const ChatHistory = require('../models/chat'); // Import ChatHistory Model

const PYTHON_API_URL = 'http://127.0.0.1:8000'; // FastAPI URL (Use 127.0.0.1 to avoid IPv6 issues)

// Save a new message AND get AI response
const saveMessage = async (req, res) => {
  try {
    console.log("Saving Message for:", req.user?.id, "Repo:", req.body.repoId);
    const { userQuery, referencedFiles, repoId } = req.body;
    // repoId is passed in body now, safe from URL slash issues.

    // 1. Call Python AI to get the answer
    let botAnswer = "I'm sorry, I couldn't process that.";
    let botSources = [];
    try {
      const response = await axios.post(`${PYTHON_API_URL}/chat`, {
        repo_id: repoId,
        query: userQuery
      });
      botAnswer = response.data.answer;
      botSources = response.data.sources || [];
    } catch (aiError) {
      console.error("AI Service Error:", aiError.message);
      botAnswer = "Error connecting to AI service. Please ensure Python server is running.";
    }

    // 2. Save everything to MongoDB (Node Backend)
    const newMessage = await ChatHistory.create({
      userId: req.user.id,
      repoId,
      userQuery,
      botAnswer,
      referencedFiles: botSources // Save actual sources from AI
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("saveMessage Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const repoId = req.query.repoId;
    console.log("Fetching History for:", userId, "Repo:", repoId);

    const chats = await ChatHistory.find({ userId, repoId }).sort({ createdAt: 1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error("getChatHistory Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get list of repos user has chatted in, sorted by most recent
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching User Chats for:", userId);

    // Use aggregation to group by repoId and find the latest message date
    // Note: ensure userId is converted to ObjectId for aggregation
    const objectId = new mongoose.Types.ObjectId(userId);

    const distinctRepos = await ChatHistory.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: "$repoId",
          lastMessageAt: { $max: "$createdAt" }
        }
      },
      { $sort: { lastMessageAt: -1 } } // Sort descending (newest first)
    ]);

    // Map to expected format
    const chats = distinctRepos.map(repo => ({
      repoName: repo._id,
      lastUpdated: repo.lastMessageAt // Optional: send this if frontend wants to show time
    }));

    res.status(200).json(chats);
  } catch (error) {
    console.error("getUserChats Error:", error);
    res.status(500).json({ error: error.message });
  }
}

// Ingest a repository (Proxy to Python)
const ingestRepo = async (req, res) => {
  try {
    const { repoUrl, branch } = req.body;
    console.log(`Ingesting Repo: ${repoUrl} Branch: ${branch}`);

    // Call Python Service
    // Note: Python expects { repo_url, branch }
    const response = await axios.post(`${PYTHON_API_URL}/ingest`, {
      repo_url: repoUrl,
      branch: branch
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("ingestRepo Error:", error.message);
    if (error.response) {
      console.error("Python Error:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "Failed to ingest repository" });
  }
};

module.exports = { saveMessage, getChatHistory, getUserChats, ingestRepo };