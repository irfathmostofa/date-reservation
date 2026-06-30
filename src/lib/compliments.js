const COMPLIMENTS = {
  female: [
    "Knew you'd say yes — you always know a good thing when you see it 🤍",
    "That's the prettiest yes I've seen all week.",
    "Somewhere, a flower just bloomed because of that answer.",
    "You just made today feel a lot softer and sweeter.",
    "Good taste, good heart, great timing.",
    "If charm were a person, it'd be you right now.",
    "That answer? Absolutely glowing-up energy.",
    "Already smiling thinking about seeing you.",
  ],
  male: [
    "Solid pick — confident, decisive, exactly your style.",
    "That's the kind of energy that earns a second date.",
    "Bold choice. Respect.",
    "You just made this a whole lot more exciting.",
    "That's exactly the answer I was hoping for.",
    "Look at you, making great decisions already.",
    "That choice tells me this is going to be a good one.",
    "Already counting down the days because of that.",
  ],
  other: [
    "Knew you'd say yes — great instincts.",
    "That might be the loveliest answer I've gotten all week.",
    "You just made today feel a lot brighter.",
    "Good taste, clearly.",
    "That's exactly the answer I was hoping for.",
    "You're making this very easy to look forward to.",
    "That choice says good things about you.",
    "Already looking forward to seeing you.",
  ],
}

export function getRandomCompliment(gender = 'other') {
  const list = COMPLIMENTS[gender] || COMPLIMENTS.other
  return list[Math.floor(Math.random() * list.length)]
}
