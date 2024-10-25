import { mongoose } from '../db/connection.js';

const tradingFormSchema = new mongoose.Schema({
  terminalSymbol: {
    type: String,
    required: true,
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
    enum: ['fixed', 'explorer']
  },
  // New fields for fixed
  quantity: {
    type: Number,
    required: function() {
      return this.qtyType == 'fixed';
    },
    min: [1, 'Quantity must be at least 1'],
    set: function(value) {
      
      if ((this?.qtyType == 'fixed' || this?._update?.qtyType == 'fixed') && value) {
        return value;
      }
      return undefined;
    }
  },
  // New fields for explorer
  exposure: {
    type: Number,
    required: function() {
      return this.qtyType === 'explorer';
    },
    min: [1, 'Exposure must be at least 1'],
    set: function(value) {
      if ((this.qtyType === 'explorer' || this?._update?.qtyType === 'explorer') && value) {
        return value;
      }
      return undefined;
    }
  },
  roundLotSize: {
    type: Number,
    required: function() {
      return this.qtyType === 'explorer';
    },
    min: [1, 'Round lot size must be at least 1'],
    set: function(value) {
      if ((this.qtyType === 'explorer' || this?._update?.qtyType === 'explorer') && value) {
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
    enum: ['SLL', 'market', 'option2']
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
  if (this.qtyType === 'fixed') {
    this.exposure = undefined;
    this.roundLotSize = undefined;
  } else if (this.qtyType === 'explorer') {
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
  if (this.qtyType === 'fixed') {
    if (!this.quantity) {
      errors.quantity = 'Quantity is required for fixed';
    }
  } else if (this.qtyType === 'explorer') {
    if (!this.exposure) {
      errors.exposure = 'Exposure is required for explorer';
    }
    if (!this.roundLotSize) {
      errors.roundLotSize = 'Round lot size is required for explorer';
    }
  }

  return errors;
};

const TradingForm = mongoose.model('TradingForm', tradingFormSchema);

export default TradingForm;