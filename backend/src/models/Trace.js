import mongoose from 'mongoose';

const traceSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  tokenUsage: {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
  },
  latency: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  hallucinationScore: {
    type: Number,
    default: null,
  },
  confidence: {
    type: Number,
    default: null,
  },
  scoringMethod: {
    type: String,
    default: null,
  },
  explanation: {
    type: String,
    default: null,
  },
  sentenceAnalysis: [{
    text: String,
    similarity: Number,
    isHallucination: Boolean
  }],
  alertTriggered: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['open', 'resolved', 'ignored'],
    default: 'open',
  }
});

const Trace = mongoose.model('Trace', traceSchema);

export default Trace;
