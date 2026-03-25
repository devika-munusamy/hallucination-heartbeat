import express from 'express';
import Trace from '../models/Trace.js';

const router = express.Router();

router.post('/ingest', async (req, res) => {
  try {
    const { prompt, response, context, model, tokenUsage, latency } = req.body;

    // 1. Save initial trace
    const newTrace = new Trace({ prompt, response, context, model, tokenUsage, latency });
    const savedTrace = await newTrace.save();

    // 2. Asynchronously call AI Service for hallucination score
    processScoreAsync(savedTrace._id, prompt, response, context, model);

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

router.patch('/traces/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const updated = await Trace.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Trace not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

async function processScoreAsync(traceId, prompt, response, context, model) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    const reqBody = { prompt, response };
    if (context) reqBody.context = context;

    const aiRes = await fetch(`${aiServiceUrl}/api/v1/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      const updateData = {
        hallucinationScore: data.hallucination_score,
        confidence:         data.confidence,
        scoringMethod:      data.method,
        explanation:        data.explanation,
        sentenceAnalysis:   data.sentence_analysis || [],
      };

      if (data.hallucination_score > 70) {
        updateData.alertTriggered = true;
        updateData.status = 'open';
        console.warn(`[ALERT] Hallucination detected for trace ${traceId}: Score ${data.hallucination_score} (${data.method})`);

        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 *Guardrail Alert Triggered*\n*Model:* ${model} (Trace ID: ${traceId})\n*Score:* ${data.hallucination_score}%\n*Reason:* ${data.explanation}`
            })
          }).catch(e => console.error('Failed to dispatch webhook:', e.message));
        }
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
