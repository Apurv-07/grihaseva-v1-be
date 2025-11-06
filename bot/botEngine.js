import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import template from "lodash.template";
import { getSession, saveSession, clearSession } from "./sessionStore.js";
import category from "../schema/category.js";
import { createOrder } from "../contollers/orderController.js";

let logic = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function invalidOption(value){
  if(value === 'skip' || value === '' || value === 'no'){
    return true;
  }
}

// Load logic once
export function loadLogic() {
  const filePath = path.join(__dirname, "logicMap.json");
  const text = fs.readFileSync(filePath, "utf8");
  logic = JSON.parse(text);
  console.log("✅ Logic map loaded successfully:", filePath);
  console.log("Negations loaded:", logic.negations);
}

// --- Context-aware negation detection ---
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsNegation(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();

  // Don't treat issue-related sentences as negation
  const issuePatterns = [
    "not working", "doesn't work", "doesnt work", "does not work",
    "won't work", "won't start", "will not work", "not turning",
    "isn't working", "is not working", "leaking", "broken",
    "not switching on", "not switching off", "not functioning"
  ];
  for (const p of issuePatterns) {
    if (lower.includes(p)) return false;
  }

  // Regular negation match
  for (const n of logic.negations) {
    const re = new RegExp(`\\b${escapeRegex(n.toLowerCase())}\\b`, "i");
    if (re.test(lower)) {
      console.log("⚠️ Negation matched:", n);
      return true;
    }
  }
  return false;
}

// Intent detection
function detectIntent(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const [intent, data] of Object.entries(logic.intents)) {
    for (const pattern of data.patterns) {
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(msg)) {
        const slots = {};
        if (data.slots?.includes("service")) slots.service = pattern;
        return { intent, data, slots };
      }
    }
  }
  return { intent: null };
}

// 🚀 Main Bot Function
export async function generateBotResponse(userMessage, sessionId) {
  let session = getSession(sessionId);

  // Step 1: detect intent early
  const detection = detectIntent(userMessage);
  const isFactual = detection.intent && ["company_info", "pricing"].includes(detection.intent);
  const isDifferentIntent =
    detection.intent && session.last_intent && detection.intent !== session.last_intent;

  if (isFactual || isDifferentIntent) {
    clearSession(sessionId);
    session = { slots: {}, last_intent: null, pending_flow: null };
  }

  // Step 2: Handle ongoing flow
  if (session.pending_flow) {
    const flow = logic.flows[session.pending_flow];
    if (!flow) {
      clearSession(sessionId);
      return "Sorry, something went wrong in the conversation flow.";
    }

    // Check for negation mid-flow
    if (containsNegation(userMessage)) {
      clearSession(sessionId);
      return "No problem! Message me anytime when you need assistance.";
    }

    const fieldName = session.pending_flow.replace("ask_", "");
    session.slots[fieldName] = userMessage.trim();
    saveSession(sessionId, session);

    // Confirm booking
    if (flow.end || session.pending_flow === "confirm_booking") {
      try {
        const categoryName = await category.findOne({
          name: { $regex: session.slots.service, $options: "i" }
        });

        console.log("🔍 Matched category for service:", categoryName);

        let payload = {
          name: session.slots.name,
          email: session.slots.email ,
          phone: session.slots.phone,
          issue: session.slots.issue_description,
          category: categoryName ? categoryName._id : null,
          addressLine1: session.slots.address_line1,
          addressLine2: session.slots.address_line2,
          landmark: session.slots.landmark,
          city: session.slots.city,
          pinCode: session.slots.pincode
        };

        if(!invalidOption(session.slots.preferred_delivery_time)){
          payload={...payload, preferredDeliveryTime: session.slots.preferred_delivery_time}
        }
        if(!invalidOption( session.slots.state)){
          payload={...payload, state: session.slots.state}
        }

        const mockReq = { body: payload };
        const mockRes = {
          status: (code) => ({ json: (data) => ({ code, data }) })
        };

        console.log("🧾 Creating order with payload:", payload);
        await createOrder(mockReq, mockRes);
      } catch (err) {
        console.error("⚠️ Order creation failed:", err);
        clearSession(sessionId);
        return "Sorry, there was a technical issue confirming your booking. Please try again later.";
      }

      clearSession(sessionId);
      return "✅ Your booking has been placed successfully! Our technician will call you soon.";
    }

    // Move to next question
    if (flow.next && logic.flows[flow.next]) {
      session.pending_flow = flow.next;
      saveSession(sessionId, session);
      return logic.flows[flow.next].question;
    }

    clearSession(sessionId);
    return "Got your details! We'll reach out soon.";
  }

  // Step 3: handle fresh intent
  if (!detection.intent) {
    return "Sorry, I didn’t understand that. You can ask about services, pricing, or our company.";
  }

  if (containsNegation(userMessage)) {
    clearSession(sessionId);
    return "Okay, I’ll stop for now. Message again when you’re ready.";
  }

  session.last_intent = detection.intent;
  session.slots = { ...session.slots, ...detection.slots };
  session.pending_flow = detection.data.followup || null;
  saveSession(sessionId, session);

  const responses = detection.data.responses;
  const raw = responses[Math.floor(Math.random() * responses.length)];
  const compiled = template(raw);
  return compiled({ ...session.slots });
}
