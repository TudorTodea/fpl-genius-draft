import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Moon, Sun, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFPLStore } from '@/store/fplStore';

export function AppHeader() {
  const [isDark, setIsDark] = useState(false);
  const { 
    currentGameweek, 
    currentSeason, 
    searchQuery,
    setCurrentGameweek,
    setCurrentSeason,
    setSearchQuery 
  } = useFPLStore();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-card border-b backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                FPL Assistant
              </h1>
              <p className="text-xs text-muted-foreground">Player Recommender</p>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Gameweek Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">GW</span>
              <Select value={currentGameweek.toString()} onValueChange={(value) => setCurrentGameweek(parseInt(value))}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
                    <SelectItem key={gw} value={gw.toString()}>
                      {gw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Season Toggle */}
            <Select value={currentSeason} onValueChange={setCurrentSeason}>
              <SelectTrigger className="w-24 h-9 hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24/25">24/25</SelectItem>
                <SelectItem value="23/24">23/24</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 md:w-64 h-9"
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 hover-glow"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}