import { mongoose } from '../db/connection.js';

const tradingFormSchema = new mongoose.Schema({
  terminalSymbol: {
    type: String,
    required: true,
  },
  optionType: {
    type: String,
    required: true,
  },
  dynamicExpiry: {
    type: String,
    required: true,
  },
  dynamicStrike: {
    type: String,
    required: true,
  },
  qtyType: {
    type: String,
    required: true,
  },
  prodType: {
    type: String,
    required: true,
  },
  entryOrder: {
    type: String,
    required: true,
    enum: ['SLL', 'market', 'option2'] // Add other valid options if needed
  },
  exitOrder: {
    type: String,
    required: true,
  },
  strategy: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: function() {
      return this.entryOrder === 'SLL';
    }
  },
  triggerPrice: {
    type: Number,
    required: function() {
      return this.entryOrder === 'SLL';
    }
  },
  priceBufferType: {
    type: String,
    required: function() {
      return this.entryOrder === 'market';
    },
    enum: ['fixed', 'percent']
  },
  priceBuffer: {
    type: Number,
    required: function() {
      return this.entryOrder === 'market';
    }
  },
}, {
  timestamps: true
});

// Custom validation
tradingFormSchema.pre('validate', function(next) {
  if (this.entryOrder === 'market' && !this.priceBufferType) {
    this.invalidate('priceBufferType', 'Price Buffer Type is required when Entry Order is market');
  }
  if (this.entryOrder === 'market' && this.priceBufferType === 'Fixed' && !this.priceBuffer) {
    this.invalidate('priceBuffer', 'Price Buffer is required when Entry Order is market and Price Buffer Type is Fixed');
  }
  next();
});

const TradingForm = mongoose.model('TradingForm', tradingFormSchema);

export default TradingForm;