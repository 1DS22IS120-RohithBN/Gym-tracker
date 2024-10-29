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
  const [universalDate, setUniversalDate] = useState(0);
  const [attendedCountDay, setAttendedCountDate] = useState(0);
  const [today, setToday] = useState("");
  const [counter, setCounter] = useState(0);
  const [missedDays, setMissedDays] = useState<MissedDays[]>([]);
  const [streakCounter, setStreakCounter] = useState(0);

  useEffect(() => {
    const currentDay = days[day.getDay()];
    setToday(currentDay);

    // Load saved data from local storage
    const savedCounter = localStorage.getItem('counter');
    const savedStreak = localStorage.getItem('streakCounter');
    const savedMissedDays = localStorage.getItem('missedDays');

    if (savedCounter) setCounter(Number(savedCounter));
    if (savedStreak) setStreakCounter(Number(savedStreak));
    if (savedMissedDays) {
      const parsedMissedDays = JSON.parse(savedMissedDays);
      if (Array.isArray(parsedMissedDays)) {
        setMissedDays(parsedMissedDays);
      }
    }
  }, [day]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const updateLocalStorage = () => {
    localStorage.setItem('counter', counter.toString());
    localStorage.setItem('streakCounter', streakCounter.toString());
    localStorage.setItem('missedDays', JSON.stringify(missedDays));
  };

  const handleCounter = (action: string) => {
    const newUniversalDate = day.getDate();
    if (newUniversalDate === universalDate) {
      toast({
        title: "You can't mark the same day twice",
        variant: "destructive"
      });
    } else {
      if (action === 'attended' && counter < getDaysInMonth(day.getMonth(), day.getUTCFullYear())) {
        const newAttendedDate = day.getDate();
        if (newAttendedDate === attendedCountDay) {
          toast({
            title: "You have already been to the gym today!"
          });
        } else {
          setAttendedCountDate(newAttendedDate);
          setUniversalDate(newUniversalDate);
          setCounter(prev => {
            const newCounter = prev + 1;
            updateLocalStorage(); // Update local storage here
            return newCounter;
          });
          setStreakCounter(prev => {
            const newStreak = prev + 1;
            updateLocalStorage(); // Update local storage here
            return newStreak;
          });
        }
      } else if (action === 'attended' && counter >= getDaysInMonth(day.getMonth(), day.getUTCFullYear())) {
        toast({
          title: "You have attended all the days this month"
        });
      } else if (action === 'missed') {
        const isMissedDayExists = missedDays.some(missedDay => missedDay.date === day.toLocaleDateString("en-GB"));

        if (isMissedDayExists) {
          toast({
            title: "You have already marked this day as missed!"
          });
        } else {
          setUniversalDate(newUniversalDate);
          setStreakCounter(0);
          setMissedDays(prev => {
            const newMissedDays = [
              ...prev,
              {
                dayName: today,
                date: day.toLocaleDateString("en-GB"),
              },
            ];
            // Log before updating local storage
            console.log("MD before saving to local storage:", newMissedDays);
            localStorage.setItem('missedDays', JSON.stringify(newMissedDays)); // Save immediately
            return newMissedDays;
          });
          toast({
            title: "You have missed the gym on " + day.toLocaleDateString("en-GB")
          });
        }
      }
    }
  };

  useEffect(() => {
    console.log(missedDays);
  }, [missedDays]);

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-gradient-to-b from-black to-gray-900'>
      <div className='flex flex-col justify-center items-center text-center p-6 m-4 bg-white rounded-2xl shadow-lg w-full max-w-md'>
        <h1 className='text-4xl font-bold text-gray-800 mt-4'>Gym Tracker</h1>
        <div className='text-2xl text-gray-800 mt-5'>{today}</div>
        <div className='flex gap-4 mt-8'>
          <button className='bg-green-500 text-white shadow-md p-2 w-28 rounded-lg hover:bg-green-600 transition duration-200'
            onClick={() => handleCounter("attended")}
          >
            Attended
          </button>
          <button className='bg-red-500 text-white shadow-md p-2 w-28 rounded-lg hover:bg-red-600 transition duration-200'
            onClick={() => handleCounter("missed")}
          >
            Missed
          </button>
        </div>
        <div className='text-4xl text-gray-800 mt-12'>Counter={counter}/{getDaysInMonth(day.getMonth(), day.getUTCFullYear())}</div>
        <div className='text-3xl text-gray-800 mt-12'>Streak Counter 🔥={streakCounter}</div>
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
