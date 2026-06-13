import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId } from "../lib/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersFOrSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      //1.Keep only the messages I sent or received
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receivedId: loggedInUserId }],
        },
      },
      //2.collapse them into 1 row per chat partner, noting our latest message time.
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receivedId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      //3.most recent convo at the top.
      { $sort: { lastMessageAt: -1 } },
      //4.Lookup each partners userprofile,comes back as an array.
      { $lookup: { from: "users", localField: "_id", as: "user" } },
      //5.Pull the profile out of the array and make it the document,
      { $replaceRoot: { newRoot: { $first: "user" } } },
      //6.Hide the private clerkId from the result
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const my_Id = req.user._id;

    const messages = Message.find({
      $or: [
        { senderId: my_Id, receivedId: userToChatId },
        { senderId: userToChatId, receivedId: my_Id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendMessages(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let videoUrl;
    let imageUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ message: "Media upload is not cnfigured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    //only send the message realtime if the user is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessages", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
