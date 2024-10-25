import Message from "../models/MessegesModel.js";
import { mkdirSync, renameSync } from "fs";
export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("Both users are required");
    }
    const messages = await Message.find({
      $or: [
        {
          sender: user1,
          recipient: user2,
        },
        {
          sender: user2,
          recipient: user1,
        },
      ],
    }).sort({ timestamp: 1 });
    // console.log(messages);
    return res.status(200).send(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    const fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    return res.status(200).send({ filePath: fileName });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
