import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const users = await User.find({});
    res.status(200).json(users);
  } else if (req.method === "POST") {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 