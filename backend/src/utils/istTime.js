// Calculates current Indian Standard Time (IST, UTC+5:30) and the active meal slot.
// Schedule:
// - Breakfast: 00:00 to 11:00 (12:00 AM to 11:00 AM IST)
// - Lunch: 11:30 to 15:59 (11:30 AM to 3:59 PM IST) [11:00-11:30 seamlessly maps to Lunch]
// - Evening & Snacks: 16:00 to 18:00 (4:00 PM to 6:00 PM IST)
// - Dinner: 18:01 to 24:00 (6:01 PM to 12:00 AM IST)

export function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 5.5);
}

export function getCurrentMealTime(date = getISTDate()) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} IST`;

  if (totalMinutes <= 11 * 60) {
    return {
      meal: "Breakfast",
      slug: "breakfast",
      timing: "00:00 - 11:00",
      description: "Morning Breakfast (12:00 AM - 11:00 AM IST)",
      descriptionTa: "காலை உணவு (12:00 AM - 11:00 AM IST)",
      time: timeString,
      hours,
      minutes,
      is_breakfast: true,
    };
  } else if (totalMinutes < 16 * 60) {
    return {
      meal: "Lunch",
      slug: "lunch",
      timing: "11:30 - 15:59",
      description: "Afternoon Lunch (11:30 AM - 3:59 PM IST)",
      descriptionTa: "மதிய உணவு (11:30 AM - 3:59 PM IST)",
      time: timeString,
      hours,
      minutes,
      is_lunch: true,
    };
  } else if (totalMinutes <= 18 * 60) {
    return {
      meal: "Evening Snacks",
      slug: "evening-snacks",
      timing: "16:00 - 18:00",
      description: "Evening & Snacks (4:00 PM - 6:00 PM IST)",
      descriptionTa: "மாலை சிற்றுண்டி (4:00 PM - 6:00 PM IST)",
      time: timeString,
      hours,
      minutes,
      is_evening_snacks: true,
    };
  } else {
    return {
      meal: "Dinner",
      slug: "dinner",
      timing: "18:01 - 24:00",
      description: "Dinner (6:01 PM - 12:00 AM IST)",
      descriptionTa: "இரவு உணவு (6:01 PM - 12:00 AM IST)",
      time: timeString,
      hours,
      minutes,
      is_dinner: true,
    };
  }
}
