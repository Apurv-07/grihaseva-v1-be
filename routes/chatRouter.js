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
  const { name, message, conversationId } = req.body;
  if (!name || !message)
    return res.status(400).json({ error: "Name and message required" });

  try {
    let chat;
    if (conversationId) {
      chat = await chatModel.findById(conversationId);
    } else {
      chat = await chatModel.findOne({ name, closed: { $ne: true } });
    }

    if (!chat) chat = new chatModel({ name, conversation: [] });

    // Save user message locally (not to DB yet)
    chat.conversation.push({ sender: name, message });

    // ✅ Await the async bot reply
    const sessionId = chat._id?.toString() || name; // fallback if new
    const botReply = await generateBotResponse(message, sessionId);

    let botResponse;
    let shouldClose = false;

    // Handle both string and object replies
    if (typeof botResult === "string") {
      botReply = botResult;
    } else if (typeof botResult === "object") {
      botReply = botResult.text || botResult.message || "";
      shouldClose = !!botResult.close;
    }

    // Push bot message
    chat.conversation.push({ sender: "bot", message: botReply });
    if (shouldClose) {
      chat.closed = true;
    }
    // ✅ Save both together, once, after awaiting botReply
    await chat.save();

    res.json({ success: true, botReply, conversationId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default chatRouter;