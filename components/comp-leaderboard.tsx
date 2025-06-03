"use client"

import React, { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, ArrowUpDown } from "lucide-react"

export interface LeaderboardEntry {
  rank: number
  name: string
  wins: number
  losses: number
  draws: number
}

interface LeaderboardComponentProps {
  entries: LeaderboardEntry[];
}

const LeaderboardEntryRow: React.FC<{ entry: LeaderboardEntry }> = React.memo(({ entry }) => (
  <TableRow key={entry.rank} className={entry.rank <= 3 ? "bg-accent/50" : ""}>
    <TableCell className="font-medium">
      {entry.rank <= 3 ? (
        <span className="flex items-center gap-2">
          {entry.rank}
          <Trophy className={`h-4 w-4 ${
            entry.rank === 1 ? "text-yellow-500" :
            entry.rank === 2 ? "text-gray-400" :
            "text-amber-600"
          }`} />
        </span>
      ) : (
        entry.rank
      )}
    </TableCell>
    <TableCell>{entry.name}</TableCell>
    <TableCell>{entry.owner}</TableCell>
    <TableCell>{entry.wins}</TableCell>
    <TableCell>{entry.draws}</TableCell>
    <TableCell>{entry.losses}</TableCell>
  </TableRow>
));

const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({ entries }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof LeaderboardEntry; direction: 'asc' | 'desc' }>({
    key: 'rank',
    direction: 'asc',
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedData, setSortedData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setSortedData(entries);
  }, [entries]);

  const handleSort = (key: keyof LeaderboardEntry) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sorted = [...sortedData].sort((a, b) =>
      direction === 'asc' ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1)
    );

    setSortedData(sorted);
  };

  const filteredData = sortedData.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" size="sm" onClick={() => handleSort('rank')}>
                  Rank
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('owner')}>
                  Owner
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('wins')}>
                  Wins
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('draws')}>
                  Draws
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('losses')}>
                  Losses
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map(entry => (
              <LeaderboardEntryRow key={entry.rank} entry={entry} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

LeaderboardComponent.displayName = 'Leaderboard';
export default LeaderboardComponent;
