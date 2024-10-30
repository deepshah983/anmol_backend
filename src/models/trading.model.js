import { mongoose } from '../db/connection.js';

const tradingFormSchema = new mongoose.Schema({
  terminalSymbol: {
    type: String,
    required: true,
  },
  sharePrice: {
    type: Number
  },
  hasExpiry: {
    type: Boolean,
    default: true
  },
  hasStrike: {
    type: Boolean,
    default: true
  },
  optionType: {
    type: String,
    required: true,
  },
  dynamicExpiry: {
    type: String,
    required: function() {
      return this.hasExpiry === true;
    }
  },
  dynamicStrike: {
    type: String,
    required: function() {
      return this.hasStrike === true;
    }
  },
  qtyType: {
    type: String,
    required: true,
    enum: ['sl', 'exposure']
  },
  // New fields for sl
  quantity: {
    type: Number,
    required: function() {
      return this.qtyType == 'sl';
    },
    min: [1, 'Quantity must be at least 1'],
    set: function(value) {
      
      if ((this?.qtyType == 'sl' || this?._update?.qtyType == 'sl') && value) {
        return value;
      }
      return undefined;
    }
  },
  // New fields for exposure
  exposure: {
    type: Number,
    required: function() {
      return this.qtyType === 'exposure';
    },
    min: [1, 'Exposure must be at least 1'],
    set: function(value) {
      if ((this.qtyType === 'exposure' || this?._update?.qtyType === 'exposure') && value) {
        return value;
      }
      return undefined;
    }
  },
  roundLotSize: {
    type: Number,
    required: function() {
      return this.qtyType === 'exposure';
    },
    min: [1, 'Round lot size must be at least 1'],
    set: function(value) {
      if ((this.qtyType === 'exposure' || this?._update?.qtyType === 'exposure') && value) {
        return value;
      }
      return undefined;
    }
  },
  prodType: {
    type: String,
    required: true,
  },
  entryOrder: {
    type: String,
    required: true,
    enum: ['SLL', 'MARKET']
  },
  exitOrder: {
    type: String,
    required: true,
  },
  strategy: {
    type: String,
    required: true,
  },
  exchange: {
    type: {},
    required: false
  },
  tickSize: {
      type: {},
      required: false
  },
  instrumentType: {
      type: {},
      required: false
  },
  lotSize: {
      type: {},
      required: false
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
}, {
  timestamps: true
});

// Custom validation
tradingFormSchema.pre('validate', function(next) {

  // Clear fields that aren't required based on flags
  if (this.hasExpiry === false) {
    this.dynamicExpiry = undefined;
  }
  if (this.hasStrike === false) {
    this.dynamicStrike = undefined;
  }

  // Clear quantity fields based on qtyType
  if (this.qtyType === 'sl') {
    this.exposure = undefined;
    this.roundLotSize = undefined;
  } else if (this.qtyType === 'exposure') {
    this.quantity = undefined;
  }

  next();
});

// Add a method to validate the form data before saving
tradingFormSchema.methods.validateForm = function() {
  const errors = {};

  // Only validate dynamicExpiry if hasExpiry is true
  if (this.hasExpiry && !this.dynamicExpiry) {
    errors.dynamicExpiry = 'Expiry is required';
  }

  // Only validate dynamicStrike if hasStrike is true
  if (this.hasStrike && !this.dynamicStrike) {
    errors.dynamicStrike = 'Strike is required';
  }

  // Validate quantity fields based on qtyType
  if (this.qtyType === 'sl') {
    if (!this.quantity) {
      errors.quantity = 'Quantity is required for Stop Loss';
    }
  } else if (this.qtyType === 'exposure') {
    if (!this.exposure) {
      errors.exposure = 'Exposure is required for exposure';
    }
    if (!this.roundLotSize) {
      errors.roundLotSize = 'Round lot size is required for exposure';
    }
  }

  return errors;
};

const TradingForm = mongoose.model('TradingForm', tradingFormSchema);

export default TradingForm;