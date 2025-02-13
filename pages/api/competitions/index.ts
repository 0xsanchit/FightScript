import dbConnect from "@/lib/mongodb";
import Competition from "@/models/Competition";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const competitions = await Competition.find({});
    res.status(200).json(competitions);
  } else if (req.method === "POST") {
    const { competitionId, name, description, startDate, endDate } = req.body;

    const newCompetition = new Competition({ competitionId, name, description, startDate, endDate });
    await newCompetition.save();
    res.status(201).json(newCompetition);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 