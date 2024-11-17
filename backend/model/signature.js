const signatureSchema = new mongoose.Schema({
    signature: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Signature = mongoose.model('Signature', signatureSchema);
  