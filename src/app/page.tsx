'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface MissedDays {
  dayName: string;
  date: string;
}

const days: { [key: number]: string } = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const Page = () => {
  const { toast } = useToast();
  const day = useMemo(() => new Date(), []);
  const [todayString, setTodayString] = useState("");

  const [counter, setCounter] = useState(0);
  const [missedDays, setMissedDays] = useState<MissedDays[]>([]);
  const [streakCounter, setStreakCounter] = useState(0);

  useEffect(() => {
    // Set today's date in a specific format
    const todayDate = day.toLocaleDateString("en-GB");
    setTodayString(todayDate);

    // Load saved data from local storage
    const savedCounter = localStorage.getItem('counter');
    const savedStreak = localStorage.getItem('streakCounter');
    console.log("saved streak",savedStreak)
    const savedMissedDays = localStorage.getItem('missedDays');
    const lastActionDate = localStorage.getItem('lastActionDate');

    if (savedCounter) setCounter(Number(savedCounter));
    if (savedStreak) setStreakCounter(Number(savedStreak));
    if (savedMissedDays) {
      const parsedMissedDays = JSON.parse(savedMissedDays);
      if (Array.isArray(parsedMissedDays)) {
        setMissedDays(parsedMissedDays);
      }
    }

    // Check if today is the last action date
    if (lastActionDate === todayDate) {
      // Prevent further actions today
      toast({
        title: "You can't mark the same day twice",
        variant: "destructive"
      });
    }
  }, [day, toast]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  useEffect(() => {
    // Save counter to localStorage whenever it changes
    localStorage.setItem('counter', counter.toString());
  }, [counter]);

  useEffect(() => {
    localStorage.setItem('streakCounter', streakCounter.toString());
  }, [streakCounter]);

  const updateLocalStorage = (newMissedDays: MissedDays[]) => {
    localStorage.setItem('missedDays', JSON.stringify(newMissedDays));
    localStorage.setItem('lastActionDate', todayString); // Store today's date
  };

  const handleCounter = (action: string) => {
    if (localStorage.getItem('lastActionDate') === todayString) {
      toast({
        title: "You can't mark the same day twice",
        variant: "destructive"
      });
      return;
    }

    if (action === 'attended' && counter < getDaysInMonth(day.getMonth(), day.getUTCFullYear())) {
      setCounter(prev => {
        const newCounter = prev + 1;
        updateLocalStorage(missedDays);
        return newCounter;
      });
      setStreakCounter(prev => {
        const newStreak = prev + 1; // Increment streak
        localStorage.setItem('streakCounter', newStreak.toString()); // Save immediately
        return newStreak;
      });
      updateLocalStorage(missedDays);
    } else if (action === 'missed') {
      const isMissedDayExists = missedDays.some(missedDay => missedDay.date === todayString);
      if (!isMissedDayExists) {
        const newMissedDays = [
          ...missedDays,
          {
            dayName: days[day.getDay()],
            date: todayString,
          },
        ];
        setMissedDays(newMissedDays);
        updateLocalStorage(newMissedDays);
        localStorage.setItem('streakCounter', '0');
        setStreakCounter(0); // Reset streak on missed day
        toast({
          title: "You have missed the gym on " + todayString
        });
      } else {
        toast({
          title: "You have already marked this day as missed!"
        });
      }
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-gradient-to-b from-black to-gray-900 p-4'>
      <div className='flex flex-col justify-center items-center text-center p-6 bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mt-4'>Gym Tracker</h1>
        <div className='text-xl text-gray-800 mt-5'>{days[day.getDay()]}</div>
        <div className='flex flex-col sm:flex-row gap-4 mt-8'>
          <button className='bg-green-500 text-white shadow-md p-2 w-full sm:w-28 rounded-lg hover:bg-green-600 transition duration-200'
            onClick={() => handleCounter("attended")}
          >
            Attended
          </button>
          <button className='bg-red-500 text-white shadow-md p-2 w-full sm:w-28 rounded-lg hover:bg-red-600 transition duration-200'
            onClick={() => handleCounter("missed")}
          >
            Missed
          </button>
        </div>
        <div className='text-2xl text-gray-800 mt-12'>Counter={counter}/{getDaysInMonth(day.getMonth(), day.getUTCFullYear())}</div>
        <div className='text-xl text-gray-800 mt-12'>Streak Counter 🔥={streakCounter}</div>
        <Table className='mt-10 w-full bg-gray-100 rounded-lg shadow-md overflow-hidden'>
          <TableCaption>All of your missed days:</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 p-4 bg-gray-200 text-left">Day</TableHead>
              <TableHead className='w-1/2 p-4 bg-gray-200 text-left'>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missedDays.map((missedDay, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium p-4 border-b">{missedDay.dayName}</TableCell>
                <TableCell className="p-4 border-b">{missedDay.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
