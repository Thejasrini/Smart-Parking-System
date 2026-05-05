const Parking = require('../models/Parking');
const { getPeakHours } = require('./demandPrediction');

// ✅ Simple rule-based chatbot
const handleChat = async (message) => {
  const msg = message.toLowerCase().trim();

  // ── Greetings ─────────────────────────────────────────
  if (msg.includes('hello') || msg.includes('hi')) {
    return { reply: '👋 Hello! I can help you find parking. Try asking: "Find cheap parking" or "Best time to park"' };
  }

  // ── Cheapest Parking ──────────────────────────────────
  if (msg.includes('cheap') || msg.includes('low price') || msg.includes('affordable')) {
    const parkings = await Parking.find({ isApproved: true })
      .sort({ price: 1 })  // lowest price first
      .limit(3);

    if (parkings.length === 0) {
      return { reply: '😔 No parkings available right now.' };
    }

    const list = parkings.map(p =>
      `🅿️ ${p.name} - ₹${p.price}/hr (${p.availableSlots} slots left)`
    ).join('\n');

    return { reply: `💰 Cheapest options:\n${list}` };
  }

  // ── Available Parking ─────────────────────────────────
  if (msg.includes('available') || msg.includes('free') || msg.includes('open')) {
    const parkings = await Parking.find({
      isApproved: true,
      availableSlots: { $gt: 0 }  // more than 0 slots
    }).limit(3);

    if (parkings.length === 0) {
      return { reply: '😔 No parkings available right now. Try again later!' };
    }

    const list = parkings.map(p =>
      `🅿️ ${p.name} - ${p.availableSlots} slots at ₹${p.price}/hr`
    ).join('\n');

    return { reply: `✅ Available Parkings:\n${list}` };
  }

  // ── Best Time ─────────────────────────────────────────
  if (msg.includes('best time') || msg.includes('when') || msg.includes('peak')) {
    return {
      reply: '⏰ Generally, parking is least busy between 11 AM - 1 PM and after 8 PM. Avoid 9-11 AM and 5-7 PM (rush hours)!'
    };
  }

  // ── Price Query ───────────────────────────────────────
  if (msg.includes('price') || msg.includes('cost') || msg.includes('rate')) {
    const parkings = await Parking.find({ isApproved: true })
      .select('name price');

    const list = parkings.map(p =>
      `🅿️ ${p.name} → ₹${p.price}/hr`
    ).join('\n');

    return { reply: `📋 Parking Prices:\n${list}` };
  }

  // ── Help ──────────────────────────────────────────────
  if (msg.includes('help')) {
    return {
      reply: `🤖 I can help you with:
- "Find cheap parking"
- "Show available parking"
- "Best time to park"
- "Show prices"
- "How many slots"`
    };
  }

  // ── Slots ─────────────────────────────────────────────
  if (msg.includes('slot') || msg.includes('space')) {
    const parkings = await Parking.find({ isApproved: true })
      .select('name availableSlots totalSlots');

    const list = parkings.map(p =>
      `🅿️ ${p.name} → ${p.availableSlots}/${p.totalSlots} slots free`
    ).join('\n');

    return { reply: `🔢 Slot Availability:\n${list}` };
  }

  // ── Default ───────────────────────────────────────────
  return {
    reply: "🤔 I didn't understand that. Try: 'Find cheap parking' or type 'help' to see what I can do!"
  };
};

module.exports = { handleChat };