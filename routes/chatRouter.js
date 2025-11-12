import { Router } from "express";
import chatModel from "../schema/chats.js";
import { generateBotResponse } from "../bot/botEngine.js";
const chatRouter = Router();
chatRouter.get("/", (req, res) => {
  res.send("Chat route is working");
});

chatRouter.get("/:name", async (req, res) => {
  const name=req.params.name;
  try {
    const chats = await chatModel.find({ name, closed: { $ne: true } });
    return res.status(200).json({ success: true, chats });
  }catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
})
chatRouter.post("/send", async (req, res) => {
  const { name, conversationId, showAll } = req.body;
  let {message}=req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if(!message){
    message="skip";
  }

  try {
    // 🧠 Step 1: Find chat (only open ones)
    let chat;
    if (conversationId) {
      chat = await chatModel.findById(conversationId);
    } else {
      chat = await chatModel.findOne({ name, closed: { $ne: true } });
    }

    // 🧠 Step 2: If not found, create a new one
    if (!chat) chat = new chatModel({ name, conversation: [], closed: false });

    // 🧠 Step 3: If `showAll` is true, just send back history (no new bot reply)
    if (showAll) {
      const history = chat.conversation || [];
      return res.json({
        success: true,
        botReply: history.length
          ? "Welcome back! Here's your previous conversation 👇"
          : "Hello! Let's start fresh.",
        conversationId: chat._id,
        showAll: history,
      });
    }

    // 🧠 Step 4: Save user message
    chat.conversation.push({ sender: name, message });

    // 🧠 Step 5: Generate bot reply (using existing logic)
    const sessionId = chat._id?.toString() || name;
    const botReply = await generateBotResponse(message, sessionId);

    // Push bot message
    chat.conversation.push({ sender: "bot", message: botReply });

    // 🧠 Step 6: Check if session was cleared (booking completed, etc.)
    // If so, mark chat as closed
    if (botReply.includes("✅ Your booking has been placed successfully")) {
      chat.closed = true;
    }

    // 🧠 Step 7: Save the chat
    await chat.save();

    // 🧠 Step 8: Respond normally
    res.json({
      success: true,
      botReply,
      conversationId: chat._id,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


export default chatRouter;