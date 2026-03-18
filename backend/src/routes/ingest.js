import express from 'express';
import Trace from '../models/Trace.js';

const router = express.Router();

router.post('/ingest', async (req, res) => {
  try {
    const { prompt, response, model, tokenUsage, latency } = req.body;

    // 1. Save initial trace
    const newTrace = new Trace({
      prompt,
      response,
      model,
      tokenUsage,
      latency,
    });

    const savedTrace = await newTrace.save();

    // 2. Asynchronously call AI Service for hallucination score
    // In production, this might be a queue or a direct fetch call
    processScoreAsync(savedTrace._id, prompt, response);

    res.status(201).json({ success: true, traceId: savedTrace._id });
  } catch (error) {
    console.error('Error ingesting trace:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/traces', async (req, res) => {
  try {
    const traces = await Trace.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ success: true, data: traces });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

async function processScoreAsync(traceId, prompt, response) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // Call the Python FastAPI service
    const aiRes = await fetch(`${aiServiceUrl}/api/v1/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, response }),
    });

    if (aiRes.ok) {
      const data = await aiRes.json();

      const updateData = {
        hallucinationScore: data.hallucination_score,
        confidence:         data.confidence,
        scoringMethod:      data.method,
        explanation:        data.explanation,
      };

      // Alert threshold: score > 70
      if (data.hallucination_score > 70) {
        updateData.alertTriggered = true;
        console.warn(`[ALERT] Hallucination detected for trace ${traceId}: Score ${data.hallucination_score} (${data.method})`);
      }

      await Trace.findByIdAndUpdate(traceId, updateData);
    } else {
      console.error('AI Service returned non-200:', aiRes.status);
    }
  } catch (err) {
    console.error('Failed to process AI score:', err.message);
  }
}

export default router;
