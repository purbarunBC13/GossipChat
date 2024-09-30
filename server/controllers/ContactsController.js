import User from "../models/UserModel.js";

export const searchContacts = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    if (!searchTerm)
      return res.status(400).json({ message: "Please enter a search term" });
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { firstName: { $regex: regex } },
            { lastName: { $regex: regex } },
            { email: { $regex: regex } },
          ],
        },
      ],
    });
    console.log(contacts);
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
