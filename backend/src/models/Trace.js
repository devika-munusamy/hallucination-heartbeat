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
  alertTriggered: {
    type: Boolean,
    default: false,
  }
});

const Trace = mongoose.model('Trace', traceSchema);

export default Trace;
