import dbConnect from "@/lib/mongodb";
import Score from "@/models/Score";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const scores = await Score.find({}).populate("userId").populate("competitionId");
    res.status(200).json(scores);
  } else if (req.method === "POST") {
    const { userId, competitionId, score } = req.body;

    const newScore = new Score({ userId, competitionId, score });
    await newScore.save();
    res.status(201).json(newScore);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 